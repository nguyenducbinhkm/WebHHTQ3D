from sqlalchemy.orm import Session, joinedload
from app.model.models import Comment, Movie
from app.schemas.user import UserCreate # Hoặc schema tương ứng

def get_comments_by_movie_id(db: Session, movie_id: int, skip: int, limit: int):
    """Lấy danh sách bình luận gốc kèm theo replies và user tương ứng (có phân trang)"""
    query = (
        db.query(Comment)
        .options(
            joinedload(Comment.user),
            joinedload(Comment.replies).joinedload(Comment.user)
        )
        .filter(Comment.movie_id == movie_id, Comment.parent_id == None)
    )
    total = query.count()
    comments = query.order_by(Comment.created_at.desc()).offset(skip).limit(limit).all()
    return comments, total

def get_movie_by_id(db: Session, movie_id: int):
    """Kiểm tra phim có tồn tại không"""
    return db.query(Movie).filter(Movie.id == movie_id).first()

def get_comment_by_id(db: Session, comment_id: int):
    """Tìm bình luận theo ID (dùng cho kiểm tra bình luận cha/phản hồi)"""
    return db.query(Comment).filter(Comment.id == comment_id).first()

def create_comment_db(db: Session, movie_id: int, user_id: int, content: str, parent_id: int = None):
    """Tạo mới bình luận hoặc phản hồi"""
    new_comment = Comment(
        content=content,
        user_id=user_id,
        movie_id=movie_id,
        parent_id=parent_id,
        likes_count=0
    )
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    return new_comment

def like_comment_db(db: Session, comment_id: int):
    """Tăng số lượt tym cho bình luận"""
    comment = get_comment_by_id(db, comment_id)
    if not comment:
        return None
    
    if not hasattr(comment, "likes_count") or comment.likes_count is None:
        comment.likes_count = 0
    
    comment.likes_count += 1
    db.commit()
    db.refresh(comment)
    return comment