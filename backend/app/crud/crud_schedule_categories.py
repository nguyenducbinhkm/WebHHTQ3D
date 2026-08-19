from sqlalchemy.orm import Session
from sqlalchemy import text
from app.model.models import Category

def get_movies_by_schedule_db(db: Session, day: str):
    """Lấy danh sách phim theo ngày trong tuần kèm số tập hiện tại"""
    query = text("""
        SELECT 
            m.id, 
            m.title, 
            m.slug, 
            m.poster_url, 
            m.backdrop_url, 
            m.status, 
            m.views_count, 
            m.release_day,
            m.total_ep,
            (SELECT COUNT(*) FROM episodes e WHERE e.movie_id = m.id) AS current_ep
        FROM movies m
        WHERE m.release_day = :day
    """)
    return db.execute(query, {"day": day}).mappings().all()

def get_all_categories_db(db: Session):
    """Lấy toàn bộ danh sách thể loại cho Admin"""
    return db.query(Category).all()