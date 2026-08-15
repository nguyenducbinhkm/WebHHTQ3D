from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Comment, Movie
# (Giả định bạn đã có hàm lấy thông tin user đang đăng nhập từ token)
# from utils.security import get_current_user 

router = APIRouter(prefix="/api/movies", tags=["Comments"])

# 1. API lấy danh sách bình luận của một phim (Ai cũng xem được)
@router.get("/{movie_id}/comments")
def get_movie_comments(movie_id: int, db: Session = Depends(get_db)):
    comments = db.query(Comment).filter(Comment.movie_id == movie_id).order_by(Comment.created_at.desc()).all()
    return [
        {
            "id": c.id,
            "content": c.content,
            "created_at": c.created_at,
            "username": c.user.username if c.user else "Ẩn danh"
        } for c in comments
    ]

# 2. API đăng bình luận mới (Bắt buộc phải đăng nhập)
@router.post("/{movie_id}/comments")
def create_comment(movie_id: int, content: str, db: Session = Depends(get_db)):
    # Kiểm tra xem phim có tồn tại không
    movie = db.query(Movie).filter(Movie.id == movie_id).first()
    if not movie:
        raise HTTPException(status_code=404, detail="Không tìm thấy phim này!")
    
    # Giả sử bạn lấy được user_id từ token đăng nhập (Ví dụ tạm gán user_id = 1)
    # Sau khi có hệ thống Auth, bạn thay thế bằng: current_user.id
    current_user_id = 1 

    new_comment = Comment(
        content=content,
        user_id=current_user_id,
        movie_id=movie_id
    )
    
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    
    return {"message": "Bình luận thành công!", "comment_id": new_comment.id}