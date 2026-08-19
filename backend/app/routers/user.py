from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session
from app.core.database import get_db
import app.model.models as models
from app.core.security import get_current_user  # Hàm lấy user hiện tại từ token của bạn
from app.crud import crud_user
import os

router = APIRouter(prefix="/api/user", tags=["User"])

@router.post("/update-avatar")
async def update_avatar(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # 1. Kiểm tra định dạng file ảnh
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="Chỉ chấp nhận file hình ảnh!")

        file_bytes = await file.read()
        
        # 2. Tạo tên file duy nhất tránh trùng lặp
        file_ext = file.filename.split(".")[-1]
        file_name = f"avatar_{current_user.id}_{int(os.urandom(4).hex())}.{file_ext}"
        
        # 3. Sử dụng Supabase Client để upload vào Bucket
        from supabase import create_client
        SUPABASE_URL = os.getenv("SUPABASE_URL")
        SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_KEY")
        
        if not SUPABASE_URL or not SUPABASE_KEY:
            raise HTTPException(status_code=500, detail="Chưa cấu hình Supabase credentials ở server!")

        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

        # Upload file lên Supabase Storage bucket 'avatars'
        response = supabase.storage.from_("avatars").upload(
            file_name, 
            file_bytes, 
            {"content-type": file.content_type, "upsert": "true"}
        )

        # 4. Lấy Public URL của ảnh
        public_url_res = supabase.storage.from_("avatars").get_public_url(file_name)
        
        # Xử lý kết quả trả về của Supabase tuỳ phiên bản thư viện (thường là string hoặc dict)
        avatar_url = public_url_res if isinstance(public_url_res, str) else public_url_res.get("publicUrl")

        if not avatar_url:
            raise HTTPException(status_code=500, detail="Không thể tạo đường dẫn công khai cho ảnh!")

        # 5. Cập nhật vào cột avatar_url trong bảng users thông qua CRUD
        updated_user = crud_user.update_user_avatar_db(db, current_user, avatar_url)

        return {
            "message": "Cập nhật ảnh đại diện thành công!",
            "user": {
                "id": updated_user.id,
                "username": updated_user.username,
                "email": updated_user.email,
                "avatar_url": updated_user.avatar_url,
                "role": updated_user.role
            }
        }

    except Exception as e:
        print(f"Lỗi upload avatar: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Lỗi server: {str(e)}")