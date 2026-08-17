from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import User
from schemas import UserCreate, UserLogin, Token
from security import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == user_data.username).first():
        raise HTTPException(status_code=400, detail="Tên đăng nhập này đã được sử dụng!")
    
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="Email này đã được đăng ký!")

    new_user = User(
        username=user_data.username,
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        role="user"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "Đăng ký thành công!", "username": new_user.username}

@router.post("/login") # Bỏ response_model=Token cứng nhắc để có thể trả về thêm id và avatar
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == user_data.username).first()
    
    if not user or not verify_password(user_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Tên đăng nhập hoặc mật khẩu không chính xác!",
        )

    # Đưa thêm id (kiểu số nguyên) vào data của token
    access_token = create_access_token(data={"sub": user.username, "id": user.id, "role": user.role})
    
    # Trả về đầy đủ access_token, id và avatar để frontend nhận được ngay lập tức
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "id": user.id,          # <--- Trả về ID thật dạng số của user
        "username": user.username,
        "avatar": getattr(user, "avatar", "") # Trả về avatar nếu model User có trường này
    }