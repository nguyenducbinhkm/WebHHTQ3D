import json
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.crud import crud_movies
from app.redis import redis_client

router = APIRouter(prefix="/api/movies", tags=["Movies"])

CACHE_EXPIRE = 1800  # 30 phút

@router.get("/ranking")
def get_ranking_movies(db: Session = Depends(get_db)):
    cache_key = "movies:ranking"
    try:
        cached_data = redis_client.get(cache_key)
        if cached_data:
            return json.loads(cached_data)

        result = crud_movies.get_ranking_movies_db(db)
        redis_client.setex(cache_key, CACHE_EXPIRE, json.dumps(result, default=str))
        return result
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status/completed")
def get_completed_movies(db: Session = Depends(get_db)):
    cache_key = "movies:completed_v2"  # <-- Đổi thành v2 ở đây để clear cache cũ
    try:
        cached_data = redis_client.get(cache_key)
        if cached_data:
            return json.loads(cached_data)
        
        result = crud_movies.get_completed_movies_db(db)
        redis_client.setex(cache_key, CACHE_EXPIRE, json.dumps(result, default=str))
        return result
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/top-hot")
def get_top_hot_movies(db: Session = Depends(get_db)):
    cache_key = "movies:top_hot_v3"  
    try:
        cached_data = redis_client.get(cache_key)
        if cached_data:
            return json.loads(cached_data)
        
        result = crud_movies.get_top_hot_movies_db(db)
        redis_client.setex(cache_key, CACHE_EXPIRE, json.dumps(result, default=str))
        return result
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/schedule/{day}")
def get_movies_by_schedule(day: str, db: Session = Depends(get_db)):
    cache_key = f"movies:schedule:{day}"
    try:
        cached_data = redis_client.get(cache_key)
        if cached_data:
            return json.loads(cached_data)

        result = crud_movies.get_movies_by_schedule_db(db, day)
        redis_client.setex(cache_key, CACHE_EXPIRE, json.dumps(result, default=str))
        return result
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

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
    # Gọi trực tiếp từ DB để đảm bảo dữ liệu tập phim, video, link không bị lỗi cấu trúc
    movie_data = crud_movies.get_movie_detail_db(db, slug)
    if not movie_data:
        raise HTTPException(status_code=404, detail="Phim không tồn tại")
    return movie_data