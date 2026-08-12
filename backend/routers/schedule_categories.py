from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
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
    # Lọc các phim có release_day khớp với ngày client yêu cầu (mon, tue, wed,...)
    movies = db.query(Movie).filter(Movie.release_day == day).all()
    return movies

# API 2: Lấy toàn bộ danh sách thể loại (Phục vụ phần Admin click chọn thể loại)
@router.get("/api/categories")
def get_all_categories(db: Session = Depends(get_db)):
    categories = db.query(Category).all()
    return categories