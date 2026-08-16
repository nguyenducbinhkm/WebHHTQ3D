import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

# Load file .env nếu chạy local
load_dotenv()

# Ưu tiên lấy DATABASE_URL từ môi trường (Render/Supabase)
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    # Chỉ fallback về MySQL local khi không có DATABASE_URL (dùng cho môi trường phát triển)
    print("WARNING: DATABASE_URL not found, falling back to MySQL local.")
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = os.getenv("DB_PORT", "3306")
    DB_USER = os.getenv("DB_USER", "root")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "")
    DB_NAME = os.getenv("DB_NAME", "movie_3ddonghua")
    DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Tạo engine. 
# LƯU Ý: Nếu URL là postgresql (Supabase), SQLAlchemy tự nhận diện.
# Nếu là MySQL, nó sẽ dùng pymysql.
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()