from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.crud import crud_categories

# Khởi tạo router cho categories với tiền tố chung
router = APIRouter(prefix="/api/categories", tags=["Categories"])

# 1. API lấy toàn bộ danh sách thể loại (phục vụ menu dropdown trên Header)
@router.get("", summary="Lấy danh sách tất cả thể loại phim")
def get_all_categories(db: Session = Depends(get_db)):
    try:
        categories = crud_categories.get_all_categories_db(db)
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
        category = crud_categories.get_category_by_slug_db(db, category_slug)
        if not category:
            raise HTTPException(status_code=404, detail="Không tìm thấy thể loại này!")
        
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
                    "release_day": getattr(m, 'release_day', None),
                    "status": m.status
                } for m in category.movies
            ]
        }
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))