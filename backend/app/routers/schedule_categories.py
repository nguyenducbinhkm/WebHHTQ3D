from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.crud import crud_schedule_categories

router = APIRouter(prefix="/api", tags=["Schedule & Categories"])

# 1. API Lấy danh sách phim theo ngày trong tuần (Phục vụ Lịch Phim)
@router.get("/movies/schedule/{day}")
def get_movies_by_schedule(day: str, db: Session = Depends(get_db)):
    return crud_schedule_categories.get_movies_by_schedule_db(db, day)

# 2. API Lấy toàn bộ danh sách thể loại (Phục vụ phần Admin click chọn thể loại)
@router.get("/categories")
def get_all_categories(db: Session = Depends(get_db)):
    return crud_schedule_categories.get_all_categories_db(db)