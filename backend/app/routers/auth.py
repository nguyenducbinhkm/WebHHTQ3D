from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.user import UserCreate, UserLogin, Token
from app.core.security import verify_password, create_access_token
from app.crud import crud_auth  # <--- Đã đổi thành crud_auth

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

# Quản lí đăng ký
@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    if crud_auth.get_user_by_username(db, user_data.username):
        raise HTTPException(status_code=400, detail="Tên đăng nhập này đã được sử dụng!")
    
    if crud_auth.get_user_by_email(db, user_data.email):
        raise HTTPException(status_code=400, detail="Email này đã được đăng ký!")

    new_user = crud_auth.create_user(db, user_data)
    return {"message": "Đăng ký thành công!", "username": new_user.username}

# Quản lí đăng nhập
@router.post("/login")
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = crud_auth.get_user_by_username(db, user_data.username)
    
    if not user or not verify_password(user_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Tên đăng nhập hoặc mật khẩu không chính xác!",
        )

    access_token = create_access_token(data={"sub": user.username, "id": user.id, "role": user.role})
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "id": user.id, 
        "username": user.username,
        "avatar": user.avatar_url if user.avatar_url else ""
    }