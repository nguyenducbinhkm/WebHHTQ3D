from datetime import datetime, timedelta
from jose import jwt
import bcrypt

SECRET_KEY = "super_secret_key_moview_3d_donghua_2026"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

def hash_password(password: str) -> str:
    # Cắt ngắn mật khẩu tối đa 72 bytes để tuyệt đối không bao giờ dính lỗi bcrypt
    if len(password.encode('utf-8')) > 72:
        password = password[:72]
    
    # Mã hóa mật khẩu bằng bcrypt thuần
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    if len(plain_password.encode('utf-8')) > 72:
        plain_password = plain_password[:72]
        
    return bcrypt.checkpw(
        plain_password.encode('utf-8'), 
        hashed_password.encode('utf-8')
    )

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt