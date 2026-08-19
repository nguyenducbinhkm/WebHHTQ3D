from sqlalchemy.orm import Session
from app.model.models import User
from app.schemas.user import UserCreate
from app.core.security import hash_password

def get_user_by_username(db: Session, username: str):
    """Tìm kiếm user theo tên đăng nhập"""
    return db.query(User).filter(User.username == username).first()

def get_user_by_email(db: Session, email: str):
    """Tìm kiếm user theo email"""
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, user_data: UserCreate):
    """Tạo mới một tài khoản người dùng vào database"""
    new_user = User(
        username=user_data.username,
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        role="user"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

def update_user_avatar_db(db: Session, user: User, avatar_url: str):
    """Cập nhật đường dẫn ảnh đại diện mới cho user"""
    user.avatar_url = avatar_url
    db.commit()
    db.refresh(user)
    return user