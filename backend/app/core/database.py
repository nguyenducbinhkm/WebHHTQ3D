from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings  # Import trực tiếp settings từ config.py

# Lấy thẳng DATABASE_URL từ settings (Pydantic đã tự lo việc đọc file .env)
DATABASE_URL = settings.DATABASE_URL

# Tạo engine kết nối (SQLAlchemy tự nhận diện PostgreSQL hay MySQL dựa vào URL)
engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Hàmdependency để lấy session database cho các API routers
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()