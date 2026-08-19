from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from pydantic import BaseModel
from typing import Optional
from app.core.security import get_current_user
from app.crud import crud_comments

router = APIRouter(prefix="/api", tags=["Comments"])

# Pydantic schema để nhận dữ liệu JSON từ Frontend
class CommentCreate(BaseModel):
    content: str
    parent_id: Optional[int] = None

# Hàm định dạng cấu trúc trả về kèm avatar và replies
def format_comment(c):
    return {
        "id": c.id,
        "content": c.content,
        "created_at": c.created_at,
        "username": c.user.username if c.user else "Ẩn danh",
        "avatar_url": c.user.avatar_url if c.user else "",
        "parent_id": c.parent_id,
        "likes_count": getattr(c, "likes_count", 0), 
        "replies": [
            {
                "id": r.id,
                "content": r.content,
                "created_at": r.created_at,
                "username": r.user.username if r.user else "Ẩn danh",
                "avatar_url": r.user.avatar_url if r.user else "",
                "parent_id": r.parent_id,
                "likes_count": getattr(r, "likes_count", 0)
            } for r in sorted(c.replies, key=lambda x: x.created_at)
        ] if hasattr(c, "replies") else []
    }

# 1. API lấy danh sách bình luận
@router.get("/movies/{movie_id}/comments")
def get_movie_comments(
    movie_id: int, 
    page: int = Query(1, ge=1), 
    limit: int = Query(5, ge=1, le=50), 
    db: Session = Depends(get_db)
):
    skip = (page - 1) * limit
    comments, total = crud_comments.get_comments_by_movie_id(db, movie_id, skip, limit)
    
    formatted_comments = [format_comment(c) for c in comments]
    
    return {
        "comments": formatted_comments,
        "total": total,
        "page": page,
        "total_pages": (total + limit - 1) // limit if total > 0 else 1
    }

# 2. API đăng bình luận mới hoặc trả lời bình luận
@router.post("/movies/{movie_id}/comments")
def create_comment(
    movie_id: int, 
    payload: CommentCreate, 
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    # Kiểm tra phim có tồn tại không
    movie = crud_comments.get_movie_by_id(db, movie_id)
    if not movie:
        raise HTTPException(status_code=404, detail="Không tìm thấy phim này!")
    
    # Kiểm tra bình luận cha nếu có
    if payload.parent_id:
        parent_comment = crud_comments.get_comment_by_id(db, payload.parent_id)
        if not parent_comment:
            raise HTTPException(status_code=404, detail="Bình luận gốc không tồn tại!")

    new_comment = crud_comments.create_comment_db(
        db=db,
        movie_id=movie_id,
        user_id=current_user.id,
        content=payload.content,
        parent_id=payload.parent_id
    )
    
    return {"message": "Bình luận thành công!", "comment_id": new_comment.id}

# 3. API Thả tym cho bình luận
@router.post("/comments/{comment_id}/like")
def like_comment(comment_id: int, db: Session = Depends(get_db)):
    comment = crud_comments.like_comment_db(db, comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="Không tìm thấy bình luận!")
    
    return {"message": "Thả tym thành công!", "likes_count": comment.likes_count}