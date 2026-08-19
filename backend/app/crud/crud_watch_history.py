from sqlalchemy.orm import Session
from sqlalchemy.dialects.postgresql import insert
from datetime import datetime, timezone, timedelta
from app.model.models import WatchHistory, Movie
from app.schemas.watch_history import WatchHistoryCreate

def save_or_update_watch_history_db(db: Session, user_id: int, payload: WatchHistoryCreate):
    """Ghi nhận hoặc cập nhật lịch sử xem phim (Upsert)"""
    current_time = datetime.now(timezone.utc)
    
    stmt = insert(WatchHistory).values(
        user_id=user_id,
        movie_id=payload.movie_id,
        episode_number=payload.episode_number,
        updated_at=current_time
    )
    
    stmt = stmt.on_conflict_do_update(
        constraint='uq_user_movie',
        set_={
            'episode_number': payload.episode_number,
            'updated_at': current_time
        }
    )
    
    db.execute(stmt)
    db.commit()
    return {"message": "Cập nhật lịch sử thành công"}

def get_recent_watch_history_db(db: Session, user_id: int, days: int = 7):
    """Lấy danh sách lịch sử xem trong vòng X ngày gần nhất kèm thông tin phim"""
    time_threshold = datetime.now(timezone.utc) - timedelta(days=days)
    
    results = db.query(WatchHistory, Movie).join(
        Movie, WatchHistory.movie_id == Movie.id
    ).filter(
        WatchHistory.user_id == user_id,
        WatchHistory.updated_at >= time_threshold
    ).order_by(WatchHistory.updated_at.desc()).all()
    
    return results