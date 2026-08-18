from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy.dialects.postgresql import insert
from datetime import datetime, timedelta, timezone

from database import get_db
from models import WatchHistory, Movie
from schemas import WatchHistoryCreate

router = APIRouter(prefix="/api/watch-history", tags=["Watch History"])

# 1. API Ghi nhận hoặc Cập nhật lịch sử xem (Upsert)
@router.post("/", summary="Ghi nhận hoặc cập nhật lịch sử xem phim")
def save_watch_history(
    payload: WatchHistoryCreate,
    db: Session = Depends(get_db)
):
    user_id = 1  # Tạm gán user_id = 1, sau này tích hợp token lấy user thực tế sau
    
    stmt = insert(WatchHistory).values(
        user_id=user_id,
        movie_id=payload.movie_id,
        episode_number=payload.episode_number,
        updated_at=datetime.now(timezone.utc)
    )
    
    # Nếu đã tồn tại cặp (user_id, movie_id) thì cập nhật lại tập phim và thời gian
    stmt = stmt.on_conflict_do_update(
        constraint='uq_user_movie',
        set_={
            'episode_number': payload.episode_number,
            'updated_at': datetime.now(timezone.utc)
        }
    )
    
    db.execute(stmt)
    db.commit()
    return {"message": "Cập nhật lịch sử thành công"}

# 2. API Lấy danh sách lịch sử xem trong vòng 7 ngày (Kèm thông tin phim và poster)
@router.get("/", summary="Lấy danh sách phim đã xem trong 7 ngày")
def get_watch_history(db: Session = Depends(get_db)):
    user_id = 1 
    seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)
    
    # Truy vấn lấy lịch sử kết hợp thông tin phim để hiển thị poster/title bên giao diện
    results = db.query(WatchHistory, Movie).join(Movie, WatchHistory.movie_id == Movie.id).filter(
        WatchHistory.user_id == user_id,
        WatchHistory.updated_at >= seven_days_ago
    ).order_by(WatchHistory.updated_at.desc()).all()
    
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