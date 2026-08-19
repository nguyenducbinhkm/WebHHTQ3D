import os
import shutil
from app.tasks.celery_app import celery_app
from app.services.ffmpeg_service import convert_to_hls
from app.services.supabase_service import upload_folder_to_supabase
from app.core.database import SessionLocal
from app.model.models import Episode, Movie

@celery_app.task
def process_video_hls(input_file_path: str, movie_slug: str, episode_slug: str):
    # Sử dụng đường dẫn thư mục tạm chứa file video gốc được ghi từ API router
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    # Thư mục chứa riêng cho tập phim này
    temp_dir = os.path.dirname(input_file_path)
    hls_output_dir = os.path.join(temp_dir, "hls")
    
    os.makedirs(hls_output_dir, exist_ok=True)

    db = SessionLocal()
    try:
        # 1. Kiểm tra xem file video cục bộ có tồn tại không
        if not os.path.exists(input_file_path):
            raise FileNotFoundError(f"Không tìm thấy file video gốc tại đường dẫn: {input_file_path}")

        print(f"🎬 [Celery] Bắt đầu xử lý file video cục bộ: {input_file_path}")

        # 2. Chuyển đổi HLS bằng FFmpeg (tạo ra file playlist.m3u8 và các file phân đoạn .ts)
        print("⚙️ [Celery] Đang chạy FFmpeg để cắt HLS...")
        convert_to_hls(input_file_path, hls_output_dir)

        # 3. Upload toàn bộ thư mục HLS lên Supabase Storage
        destination_path = f"{movie_slug}/{episode_slug}"
        print(f"☁️ [Celery] Đang upload thư mục HLS lên bucket 'movies/{destination_path}'...")
        
        upload_folder_to_supabase(
            local_folder_path=hls_output_dir,
            bucket_name="movies",
            destination_path=destination_path
        )
        print(f"✅ [Celery] Thành công! Đã upload HLS lên: movies/{destination_path}")

        # 4. Kiểm tra phim trong Database, nếu chưa có thì tự động tạo mới luôn!
        movie = db.query(Movie).filter(Movie.slug == movie_slug).first()
        if not movie:
            print(f"⚠️ [Celery] Không tìm thấy phim '{movie_slug}', hệ thống đang tự động tạo mới...")
            formatted_title = movie_slug.replace("-", " ").title()
            
            movie = Movie(
                title=formatted_title,
                slug=movie_slug,
                description=f"Bộ phim {formatted_title} cập nhật bản HLS chất lượng cao.",
                status="ongoing"
            )
            db.add(movie)
            db.commit()
            db.refresh(movie)
            print(f"✨ [Celery] Đã tự động tạo thành công phim mới với ID: {movie.id}")

        # 5. Lưu thông tin tập phim vào Database MySQL với đường dẫn file playlist.m3u8 chính xác
        m3u8_url = f"https://fhdbpwxujmrxuebfnfzd.supabase.co/storage/v1/object/public/movies/{destination_path}/playlist.m3u8"
        
        existing_episodes_count = db.query(Episode).filter(Episode.movie_id == movie.id).count()
        episode_number = existing_episodes_count + 1

        new_episode = Episode(
            movie_id=movie.id,
            episode_number=episode_number,
            title=f"Tập {episode_number}",
            m3u8_url=m3u8_url
        )
        db.add(new_episode)
        db.commit()
        print(f"💾 [Celery] Đã lưu thành công Tập {episode_number} vào Database cho phim: {movie_slug}")

    except Exception as e:
        db.rollback()
        print(f"❌ [Celery Error]: {str(e)}")
        raise e
    finally:
        db.close()
        # Dọn dẹp sạch sẽ thư mục tạm (xóa cả file mp4 1GB gốc và thư mục hls vừa cắt xong để giải phóng ổ cứng)
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir, ignore_errors=True)
            print(f"🧹 [Celery] Đã dọn dẹp xong thư mục tạm: {temp_dir}")