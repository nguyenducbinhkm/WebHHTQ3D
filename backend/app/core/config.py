from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Cấu hình Database
    DATABASE_URL: str
    DB_HOST: str
    DB_PORT: int
    DB_USER: str
    DB_PASSWORD: str
    DB_NAME: str

    # Cấu hình Supabase
    SUPABASE_URL: str
    SUPABASE_KEY: str

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore" 

# Khởi tạo instance dùng chung
settings = Settings()