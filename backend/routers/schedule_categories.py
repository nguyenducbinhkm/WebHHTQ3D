from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text # <--- Nhớ import thêm text từ sqlalchemy
from database import SessionLocal
from models import Movie, Category

router = APIRouter(tags=["Schedule & Categories"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# API 1: Lấy danh sách phim theo ngày trong tuần (Phục vụ Lịch Phim)
@router.get("/api/movies/schedule/{day}")
def get_movies_by_schedule(day: str, db: Session = Depends(get_db)):
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

# API 2: Lấy toàn bộ danh sách thể loại (Phục vụ phần Admin click chọn thể loại)
@router.get("/api/categories")
def get_all_categories(db: Session = Depends(get_db)):
    categories = db.query(Category).all()
    return categories