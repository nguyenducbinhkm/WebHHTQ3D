import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.crud import crud_categories
from app.redis import redis_client  # <-- Import redis_client từ file redis.py

# Khởi tạo router cho categories với tiền tố chung
router = APIRouter(prefix="/api/categories", tags=["Categories"])

# Thời gian sống của cache (ví dụ: 1 giờ = 3600 giây)
CACHE_EXPIRE = 3600

# 1. API lấy toàn bộ danh sách thể loại (phục vụ menu dropdown trên Header)
@router.get("", summary="Lấy danh sách tất cả thể loại phim")
def get_all_categories(db: Session = Depends(get_db)):
    cache_key = "all_categories"
    
    try:
        # Kiểm tra xem dữ liệu đã có trong Redis chưa
        cached_data = redis_client.get(cache_key)
        if cached_data:
            return json.loads(cached_data)

        # Nếu chưa có, truy vấn database
        categories = crud_categories.get_all_categories_db(db)
        result = [
            {
                "id": cat.id,
                "name": cat.name,
                "slug": cat.slug
            } for cat in categories
        ]
        
        # Lưu kết quả vào Redis để dùng cho các lần gọi sau
        redis_client.setex(cache_key, CACHE_EXPIRE, json.dumps(result))
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 2. API lấy chi tiết thể loại và danh sách phim thuộc thể loại đó (phục vụ trang CategoryPage)
@router.get("/{category_slug}", summary="Lấy danh sách phim theo slug thể loại")
def get_movies_by_category(category_slug: str, db: Session = Depends(get_db)):
    cache_key = f"category_slug:{category_slug}"
    
    try:
        # Kiểm tra cache theo từng slug thể loại
        cached_data = redis_client.get(cache_key)
        if cached_data:
            return json.loads(cached_data)

        category = crud_categories.get_category_by_slug_db(db, category_slug)
        if not category:
            raise HTTPException(status_code=404, detail="Không tìm thấy thể loại này!")
        
        result = {
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
        
        # Lưu cache cho thể loại này
        redis_client.setex(cache_key, CACHE_EXPIRE, json.dumps(result))
        
        return result
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))