from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.watch_history import WatchHistoryCreate
from app.crud import crud_watch_history

router = APIRouter(prefix="/api/watch-history", tags=["Watch History"])

# 1. API Ghi nhận hoặc Cập nhật lịch sử xem (Upsert)
@router.post("/", summary="Ghi nhận hoặc cập nhật lịch sử xem phim")
def save_watch_history(
    payload: WatchHistoryCreate,
    db: Session = Depends(get_db)
):
    user_id = 1  # Tạm gán user_id = 1, sau này tích hợp token lấy user thực tế sau
    return crud_watch_history.save_or_update_watch_history_db(db, user_id, payload)

# 2. API Lấy danh sách lịch sử xem trong vòng 7 ngày (Kèm thông tin phim và poster)
@router.get("/", summary="Lấy danh sách phim đã xem trong 7 ngày")
def get_watch_history(db: Session = Depends(get_db)):
    user_id = 1 
    results = crud_watch_history.get_recent_watch_history_db(db, user_id, days=7)
    
    response_data = []
    for history, movie in results:
        response_data.append({
            "id": history.id,
            "movie_id": movie.id,
            "episode_number": history.episode_number,
            "updated_at": history.updated_at,
            "movie": {
                "id": movie.id,
                "title": movie.title,
                "slug": movie.slug,
                "poster_url": movie.poster_url,
                "backdrop_url": movie.backdrop_url
            }
        })
        
    return response_data