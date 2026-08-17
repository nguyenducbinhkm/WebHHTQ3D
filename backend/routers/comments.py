from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from models import Comment, Movie
from pydantic import BaseModel
from typing import Optional
# Giả sử bạn đã có hàm lấy thông tin user từ token thực tế của dự án:
from security import get_current_user

router = APIRouter(prefix="/api", tags=["Comments"])

# Pydantic schema để nhận dữ liệu JSON từ Frontend cho an toàn và chuẩn chỉnh
class CommentCreate(BaseModel):
    content: str
    parent_id: Optional[int] = None

# Hàm đệ quy hoặc xử lý phụ để gom nhóm các câu trả lời con (replies)
def format_comment(c):
    return {
        "id": c.id,
        "content": c.content,
        "created_at": c.created_at,
        "username": c.user.username if c.user else "Ẩn danh",
        "parent_id": c.parent_id,
        "likes_count": getattr(c, "likes_count", 0), # Tránh lỗi nếu db chưa có cột này
        "replies": [
            {
                "id": r.id,
                "content": r.content,
                "created_at": r.created_at,
                "username": r.user.username if r.user else "Ẩn danh",
                "parent_id": r.parent_id,
                "likes_count": getattr(r, "likes_count", 0)
            } for r in sorted(c.replies, key=lambda x: x.created_at)
        ] if hasattr(c, "replies") else []
    }

# 1. API lấy danh sách bình luận (Có phân trang & gom nhóm trả lời)
@router.get("/movies/{movie_id}/comments")
def get_movie_comments(
    movie_id: int, 
    page: int = Query(1, ge=1), 
    limit: int = Query(5, ge=1, le=50), 
    db: Session = Depends(get_db)
):
    skip = (page - 1) * limit
    
    # Chỉ lấy các bình luận gốc (parent_id IS NULL) để phân trang cho mượt
    query = db.query(Comment).filter(Comment.movie_id == movie_id, Comment.parent_id == None)
    total = query.count()
    
    comments = query.order_by(Comment.created_at.desc()).offset(skip).limit(limit).all()
    
    formatted_comments = [format_comment(c) for c in comments]
    
    return {
        "comments": formatted_comments,
        "total": total,
        "page": page,
        "total_pages": (total + limit - 1) // limit if total > 0 else 1
    }

# 2. API đăng bình luận mới hoặc trả lời bình luận (Bắt buộc đăng nhập)
@router.post("/movies/{movie_id}/comments")
def create_comment(
    movie_id: int, 
    payload: CommentCreate, 
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    # Kiểm tra phim có tồn tại không
    movie = db.query(Movie).filter(Movie.id == movie_id).first()
    if not movie:
        raise HTTPException(status_code=404, detail="Không tìm thấy phim này!")
    
    # Nếu có truyền parent_id (đây là trả lời bình luận), kiểm tra xem bình luận cha có tồn tại không
    if payload.parent_id:
        parent_comment = db.query(Comment).filter(Comment.id == payload.parent_id).first()
        if not parent_comment:
            raise HTTPException(status_code=404, detail="Bình luận gốc không tồn tại!")

    new_comment = Comment(
        content=payload.content,
        user_id=current_user.id, # Lấy ID thật từ token đăng nhập
        movie_id=movie_id,
        parent_id=payload.parent_id,
        likes_count=0
    )
    
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    
    return {"message": "Bình luận thành công!", "comment_id": new_comment.id}

# 3. API Thả tym / Bỏ tym cho bình luận
@router.post("/comments/{comment_id}/like")
def like_comment(comment_id: int, db: Session = Depends(get_db)):
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Không tìm thấy bình luận!")
    
    # Tăng số lượt tym lên 1 (hoặc bạn có thể tối ưu thêm bảng CommentLike riêng nếu muốn giới hạn 1 user 1 tym)
    if not hasattr(comment, "likes_count") or comment.likes_count is None:
        comment.likes_count = 0
    
    comment.likes_count += 1
    db.commit()
    db.refresh(comment)
    
    return {"message": "Thả tym thành công!", "likes_count": comment.likes_count}