from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.crud import crud_movies

# Khởi tạo router với tiền tố chung cho các API phim
router = APIRouter(prefix="/api/movies", tags=["Movies"])

@router.get("/ranking")
def get_ranking_movies(db: Session = Depends(get_db)):
    return crud_movies.get_ranking_movies_db(db)

@router.get("/status/completed")
def get_completed_movies(db: Session = Depends(get_db)):
    return crud_movies.get_completed_movies_db(db)

@router.get("/top-hot")
def get_top_hot_movies(db: Session = Depends(get_db)):
    return crud_movies.get_top_hot_movies_db(db)

@router.get("/schedule/{day}")
def get_movies_by_schedule(day: str, db: Session = Depends(get_db)):
    return crud_movies.get_movies_by_schedule_db(db, day)

@router.get("/search")
def search_movies(q: str = Query("", description="Từ khóa tìm kiếm"), db: Session = Depends(get_db)):
    if not q or not q.strip():
        return []
    search_pattern = f"%{q.strip().lower()}%"
    return crud_movies.search_movies_db(db, search_pattern)

@router.get("")
def get_movies(db: Session = Depends(get_db)):
    return crud_movies.get_all_movies_with_categories_db(db)

@router.get("/{slug}")
def get_movie_detail(slug: str, db: Session = Depends(get_db)):
    movie_data = crud_movies.get_movie_detail_db(db, slug)
    if not movie_data:
        raise HTTPException(status_code=404, detail="Phim không tồn tại")
    return movie_data