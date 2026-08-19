import os
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.model.models import Movie, Category
from app.services.supabase_service import upload_file_to_supabase
from app.tasks.movie_tasks import process_video_hls

def get_movies_by_query_db(db: Session, q: Optional[str] = None):
    """Lấy danh sách và tìm kiếm phim theo từ khóa tiêu đề hoặc slug"""
    query = db.query(Movie)
    if q:
        keyword = f"%{q.strip()}%"
        query = query.filter(or_(Movie.title.ilike(keyword), Movie.slug.ilike(keyword)))
    return query.all()

def find_movie_by_id_or_slug(db: Session, identifier: str | int):
    """Tìm phim linh hoạt bằng ID (số) hoặc Slug (chuỗi)"""
    movie = None
    if str(identifier).isdigit():
        movie = db.query(Movie).filter(Movie.id == int(identifier)).first()
    if not movie:
        movie = db.query(Movie).filter(Movie.slug == str(identifier)).first()
    return movie

async def create_movie_db(db: Session, title: str, slug: str, description: str, release_day: str, category_ids: str, poster_file, backdrop_file):
    """Xử lý upload ảnh và tạo mới bản ghi phim"""
    if not poster_file or not poster_file.filename:
        raise ValueError("Bắt buộc phải tải lên file ảnh Poster!")

    # 1. Upload Poster lên Supabase
    poster_bytes = await poster_file.read()
    poster_ext = poster_file.filename.split('.')[-1] if '.' in poster_file.filename else 'jpg'
    poster_path = f"{slug}/{slug}_poster.{poster_ext}"
    
    raw_poster_url = upload_file_to_supabase(
        file_bytes=poster_bytes,
        file_name=poster_path,
        bucket_name="movies",
        content_type=poster_file.content_type
    )
    
    poster_url = str(raw_poster_url) if raw_poster_url else None
    if not poster_url:
        raise RuntimeError("Lỗi: Không thể lấy được Public URL của Poster từ Supabase!")

    # 2. Upload Backdrop (nếu có)
    backdrop_url = None
    if backdrop_file and backdrop_file.filename:
        backdrop_bytes = await backdrop_file.read()
        bd_ext = backdrop_file.filename.split('.')[-1] if '.' in backdrop_file.filename else 'jpg'
        backdrop_path = f"{slug}/{slug}_bd.{bd_ext}"
        
        raw_bd_url = upload_file_to_supabase(
            file_bytes=backdrop_bytes,
            file_name=backdrop_path,
            bucket_name="movies",
            content_type=backdrop_file.content_type
        )
        backdrop_url = str(raw_bd_url) if raw_bd_url else None

    # 3. Tạo bản ghi phim mới trong Database
    new_movie = Movie(
        title=title,
        slug=slug,
        description=description,
        poster_url=poster_url,
        backdrop_url=backdrop_url,
        release_day=release_day,
        status="ongoing"
    )
    
    db.add(new_movie)
    db.flush() 

    # 4. Gắn thể loại qua bảng trung gian
    if category_ids:
        cat_ids = [int(cid.strip()) for cid in category_ids.split(",") if cid.strip().isdigit()]
        categories = db.query(Category).filter(Category.id.in_(cat_ids)).all()
        new_movie.categories = categories

    db.commit()
    db.refresh(new_movie)
    return new_movie

async def update_movie_images_db(db: Session, slug: str, poster_file, backdrop_file):
    """Cập nhật riêng Poster và Backdrop theo slug"""
    movie = find_movie_by_id_or_slug(db, slug)
    if not movie:
        return None

    if poster_file and poster_file.filename:
        poster_bytes = await poster_file.read()
        poster_ext = poster_file.filename.split('.')[-1] if '.' in poster_file.filename else 'jpg'
        poster_path = f"{slug}/{slug}_poster.{poster_ext}"
        
        raw_poster_url = upload_file_to_supabase(
            file_bytes=poster_bytes, file_name=poster_path, bucket_name="movies", content_type=poster_file.content_type
        )
        if raw_poster_url:
            movie.poster_url = str(raw_poster_url)

    if backdrop_file and backdrop_file.filename:
        backdrop_bytes = await backdrop_file.read()
        bd_ext = backdrop_file.filename.split('.')[-1] if '.' in backdrop_file.filename else 'jpg'
        backdrop_path = f"{slug}/{slug}_bd.{bd_ext}"
        
        raw_bd_url = upload_file_to_supabase(
            file_bytes=backdrop_bytes, file_name=backdrop_path, bucket_name="movies", content_type=backdrop_file.content_type
        )
        if raw_bd_url:
            movie.backdrop_url = str(raw_bd_url)

    db.commit()
    db.refresh(movie)
    return movie

async def save_video_and_dispatch_task(movie_slug: str, episode_slug: str, video_file):
    """Lưu tạm file video và kích hoạt Celery Task cắt HLS"""
    temp_dir = os.path.join("temp", movie_slug)
    os.makedirs(temp_dir, exist_ok=True)
    temp_file_path = os.path.join(temp_dir, f"{episode_slug}.mp4")

    with open(temp_file_path, "wb") as buffer:
        while chunk := await video_file.read(1024 * 1024):
            buffer.write(chunk)

    process_video_hls.delay(
        input_file_path=temp_file_path,
        movie_slug=movie_slug,
        episode_slug=episode_slug
    )

def set_banner_movies_db(db: Session, movie_ids: list):
    """Cập nhật danh sách 5 phim lên banner"""
    processed_ids = [int(i) for i in movie_ids if i is not None]
    db.query(Movie).update({Movie.is_banner: False}, synchronize_session=False)
    if processed_ids:
        db.query(Movie).filter(Movie.id.in_(processed_ids)).update({Movie.is_banner: True}, synchronize_session=False)
    db.commit()

def set_ranking_order_db(db: Session, movie_ids: list):
    """Cập nhật thứ tự bảng xếp hạng"""
    db.query(Movie).update({Movie.ranking_order: None}, synchronize_session=False)
    for index, m_id in enumerate(movie_ids):
        if m_id is not None:
            movie = find_movie_by_id_or_slug(db, m_id)
            if movie:
                movie.ranking_order = index + 1
    db.commit()