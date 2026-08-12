import os
import mimetypes
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

# Đảm bảo đăng ký thêm mimetypes cho file .m3u8 và .ts
mimetypes.add_type("application/vnd.apple.mpegurl", ".m3u8")
mimetypes.add_type("video/mp2t", ".ts")

# Khởi tạo Supabase client nếu đã có cấu hình trong file .env
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY) if SUPABASE_URL and SUPABASE_KEY else None

def upload_file_to_supabase(file_bytes: bytes, file_name: str, bucket_name: str, content_type: str = None) -> str:
    """
    Upload một file đơn (ảnh poster, backdrop hoặc video gốc) lên Supabase Storage 
    và trả về Public URL công khai.
    """
    if not supabase:
        raise Exception("Chưa cấu hình SUPABASE_URL hoặc SUPABASE_KEY trong file .env")
    
    if not content_type:
        content_type, _ = mimetypes.guess_type(file_name)
        if not content_type:
            content_type = "application/octet-stream"

    supabase.storage.from_(bucket_name).upload(
        path=file_name,
        file=file_bytes,
        file_options={"x-upsert": "true", "content-type": content_type}
    )
    
    # Sửa cách gọi get_public_url chuẩn theo cú pháp mới của supabase-py
    res = supabase.storage.from_(bucket_name.strip()).get_public_url(file_name)
    return res


def upload_folder_to_supabase(local_folder_path: str, bucket_name: str = "movies", destination_path: str = "") -> list:
    """
    Upload toàn bộ thư mục chứa các phân đoạn HLS (.m3u8 & .ts sau khi Celery cắt video) 
    lên Supabase Storage với content-type chính xác.
    """
    if not supabase:
        print(" [Warning] Chưa cấu hình Supabase Client")
        return []

    uploaded_urls = []
    for root, _, files in os.walk(local_folder_path):
        for file in files:
            file_path = os.path.join(root, file)
            rel_path = os.path.relpath(file_path, local_folder_path).replace("\\", "/")
            storage_path = f"{destination_path}/{rel_path}".strip("/")
            
            # Đoán content type, ưu tiên chuẩn cho m3u8 và ts
            c_type, _ = mimetypes.guess_type(file_path)
            if file.endswith('.m3u8'):
                c_type = "application/vnd.apple.mpegurl"
            elif file.endswith('.ts'):
                c_type = "video/mp2t"
            else:
                c_type = c_type or "application/octet-stream"

            with open(file_path, 'rb') as f:
                supabase.storage.from_(bucket_name).upload(
                    path=storage_path,
                    file=f,
                    file_options={"x-upsert": "true", "content-type": c_type}
                )
            
            public_url = supabase.storage.from_(bucket_name).get_public_url(storage_path)
            uploaded_urls.append(public_url)
            
    return uploaded_urls