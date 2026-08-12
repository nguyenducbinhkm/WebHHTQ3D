import os
import shutil
import requests
from tasks.celery_app import celery_app
from services.ffmpeg_service import convert_to_hls
from services.supabase_service import upload_folder_to_supabase
from database import SessionLocal
from models import Episode, Movie

@celery_app.task
def process_video_hls(raw_video_url: str, movie_slug: str, episode_slug: str):
    # Sử dụng đường dẫn tuyệt đối dựa trên vị trí của file hiện tại để tránh lỗi mất đường dẫn khi Celery chạy ngầm
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    temp_dir = os.path.join(base_dir, "temp", movie_slug, episode_slug)
    
    # Đảm bảo thư mục temp được tạo trước khi lưu file
    os.makedirs(temp_dir, exist_ok=True)
    
    raw_mp4_path = os.path.join(temp_dir, "raw.mp4")
    hls_output_dir = os.path.join(temp_dir, "hls")
    
    os.makedirs(hls_output_dir, exist_ok=True)

    db = SessionLocal()
    try:
        # 1. Tải file mp4 gốc từ Supabase Storage về local
        print(f" [Celery] Downloading raw video: {raw_video_url}")
        response = requests.get(raw_video_url, stream=True)
        response.raise_for_status() 

        with open(raw_mp4_path, "wb") as f:
            for chunk in response.iter_content(chunk_size=1024 * 1024):
                if chunk:
                    f.write(chunk)

        # 2. Chuyển đổi HLS bằng FFmpeg (tạo ra file playlist.m3u8 và các file .ts)
        print(" [Celery] Converting to HLS...")
        convert_to_hls(raw_mp4_path, hls_output_dir)

        # 3. Upload lên Supabase thư mục HLS
        destination_path = f"{movie_slug}/{episode_slug}"
        print(f" [Celery] Uploading HLS to bucket 'movies/{destination_path}'...")
        
        upload_folder_to_supabase(
            local_folder_path=hls_output_dir,
            bucket_name="movies",
            destination_path=destination_path
        )
        print(f" [Celery] Done! HLS uploaded to: movies/{destination_path}")

        # 4. Kiểm tra phim trong Database, nếu chưa có thì tự động tạo mới luôn!
        movie = db.query(Movie).filter(Movie.slug == movie_slug).first()
        if not movie:
            print(f" [Celery] Không tìm thấy phim '{movie_slug}', hệ thống đang tự động tạo mới...")
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
            print(f" [Celery] Đã tự động tạo thành công phim mới với ID: {movie.id}")

        # 5. Lưu thông tin tập phim vào Database MySQL với đúng tên file playlist.m3u8
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
        print(f" [Celery] Successfully saved Episode {episode_number} to Database for movie: {movie_slug}")

    except Exception as e:
        db.rollback()
        print(f" [Celery Error] {str(e)}")
        raise e
    finally:
        db.close()
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir, ignore_errors=True)