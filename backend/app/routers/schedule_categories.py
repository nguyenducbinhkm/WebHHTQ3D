import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.crud import crud_schedule_categories
from app.redis import redis_client

router = APIRouter(prefix="/api", tags=["Schedule & Categories"])

CACHE_EXPIRE = 3600

# Hàm helper này cực kỳ quan trọng để đảm bảo dữ liệu trả về giống y hệt DB
def serialize_movie(movie):
    """Chuyển đổi một object movie sang dictionary thuần"""
    return {
        "id": movie.id,
        "title": movie.title,
        "slug": movie.slug,
        "poster_url": movie.poster_url, # Đảm bảo tên trường này khớp với DB của bạn
        "category": [c.name for c in movie.categories] if hasattr(movie, 'categories') else [],
        # Thêm các trường khác nếu cần
    }

@router.get("/movies/schedule/{day}")
def get_movies_by_schedule(day: str, db: Session = Depends(get_db)):
    cache_key = f"schedule:{day}"
    cached_data = redis_client.get(cache_key)
    
    if cached_data:
        return json.loads(cached_data)

    # Lấy dữ liệu từ DB
    movies = crud_schedule_categories.get_movies_by_schedule_db(db, day)
    
    # CHUYỂN ĐỔI SANG DICT TRƯỚC KHI CACHE
    # Nếu crud trả về list các model, ta map chúng sang dict
    if isinstance(movies, list):
        result = [serialize_movie(m) for m in movies]
    else:
        result = movies # Hoặc xử lý nếu kết quả là dict đơn lẻ

    redis_client.setex(cache_key, CACHE_EXPIRE, json.dumps(result))
    return result

@router.get("/categories")
def get_all_categories(db: Session = Depends(get_db)):
    cache_key = "all_categories"
    cached_data = redis_client.get(cache_key)
    
    if cached_data:
        return json.loads(cached_data)

    categories = crud_schedule_categories.get_all_categories_db(db)
    # Tương tự, nếu cần chuyển đổi object category sang dict thì làm ở đây
    result = [ {"id": c.id, "name": c.name} for c in categories]
    
    redis_client.setex(cache_key, CACHE_EXPIRE, json.dumps(result))
    return result