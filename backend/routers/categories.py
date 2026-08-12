from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Category

# Khởi tạo router cho categories
router = APIRouter(prefix="/api/categories", tags=["Categories"])

# Hàm phụ thuộc lấy DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 1. API lấy toàn bộ danh sách thể loại (phục vụ menu dropdown trên Header)
@router.get("", summary="Lấy danh sách tất cả thể loại phim")
def get_all_categories(db: Session = Depends(get_db)):
    try:
        categories = db.query(Category).all()
        return [
            {
                "id": cat.id,
                "name": cat.name,
                "slug": cat.slug
            } for cat in categories
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 2. API lấy chi tiết thể loại và danh sách phim thuộc thể loại đó (phục vụ trang CategoryPage)
@router.get("/{category_slug}", summary="Lấy danh sách phim theo slug thể loại")
def get_movies_by_category(category_slug: str, db: Session = Depends(get_db)):
    try:
        # Tìm thể loại dựa vào slug trên URL (ví dụ: 'co-trang')
        category = db.query(Category).filter(Category.slug == category_slug).first()
        if not category:
            raise HTTPException(status_code=404, detail="Không tìm thấy thể loại này!")
        
        # Trả về thông tin kèm danh sách phim thông qua quan hệ Many-to-Many
        return {
            "id": category.id,
            "name": category.name,
            "slug": category.slug,
            "movies": [
                {
                    "id": m.id,
                    "title": m.title,
                    "slug": m.slug,
                    "poster_url": m.poster_url,
                    "backdrop_url": m.backdrop_url,
                    "release_day": m.release_day,
                    "status": m.status
                } for m in category.movies
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))