import os
from dotenv import load_dotenv

from app.routers import admin_movies, auth, comments, user, watch_history, movies, categories, schedule_categories

load_dotenv()

print(f"DEBUG: Connecting to {os.getenv('DB_NAME')} at {os.getenv('DB_HOST')}")
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import get_db


app = FastAPI(title="Movie 3D Donghua API")

# Cấu hình CORS linh hoạt cho cả Local và Production (Vercel)
DEFAULT_ORIGINS = "https://web-hhtq-3-d.vercel.app,http://localhost:5173,http://localhost:3000"
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", DEFAULT_ORIGINS)
origins = [origin.strip() for origin in allowed_origins_env.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ĐĂNG KÝ CÁC ROUTER VÀO ỨNG DỤNG
app.include_router(admin_movies.router)
app.include_router(auth.router)
app.include_router(categories.router)
app.include_router(comments.router)
app.include_router(schedule_categories.router)
app.include_router(user.router)
app.include_router(watch_history.router)
app.include_router(movies.router)

@app.get("/")
def home():
    return {"message": "API Xem Phim 3D Đang Hoạt Động!"}


