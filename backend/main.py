import os
from dotenv import load_dotenv

load_dotenv()

print(f"DEBUG: Connecting to {os.getenv('DB_NAME')} at {os.getenv('DB_HOST')}")
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db

# IMPORT CÁC ROUTER (admin_movies, auth, comments)
from routers import admin_movies, auth, comments

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
app.include_router(comments.router)  # <--- ĐÃ THÊM ROUTER COMMENTS TẠI ĐÂY

@app.get("/")
def home():
    return {"message": "API Xem Phim 3D Đang Hoạt Động!"}

# ==================== THỂ LOẠI (CATEGORIES) ====================

@app.get("/api/categories")
def get_categories(db: Session = Depends(get_db)):
    query = text("SELECT id, name, slug FROM categories")
    return db.execute(query).mappings().all()

@app.get("/api/categories/{category_slug}")
def get_movies_by_category_slug(category_slug: str, db: Session = Depends(get_db)):
    cat_query = text("SELECT id, name, slug FROM categories WHERE slug = :slug")
    category = db.execute(cat_query, {"slug": category_slug}).mappings().first()
    
    if not category:
        raise HTTPException(status_code=404, detail="Không tìm thấy thể loại này!")
    
    movies_query = text("""
        SELECT m.id, m.title, m.slug, m.poster_url, m.backdrop_url, m.status, m.views_count
        FROM movies m
        JOIN movie_categories mc ON m.id = mc.movie_id
        WHERE mc.category_id = :category_id
    """)
    movies = db.execute(movies_query, {"category_id": category["id"]}).mappings().all()
    
    return {
        "id": category["id"],
        "name": category["name"],
        "slug": category["slug"],
        "movies": movies
    }

# ==================== PHIM (MOVIES) ====================
# QUAN TRỌNG: Các route tĩnh (top-hot, schedule, search) PHẢI ĐẶT TRƯỚC route động /{slug}

# 1. API Lấy Top Phim Hot
@app.get("/api/movies/top-hot")
def get_top_hot_movies(db: Session = Depends(get_db)):
    query = text("""
        SELECT m.id, m.title, m.slug, m.poster_url, m.backdrop_url, m.views_count
        FROM movies m
        ORDER BY m.views_count DESC
        LIMIT 10
    """)
    return db.execute(query).mappings().all()

# 2. API Lấy danh sách phim theo lịch phát sóng
@app.get("/api/movies/schedule/{day}")
def get_movies_by_schedule(day: str, db: Session = Depends(get_db)):
    query = text("""
        SELECT m.id, m.title, m.slug, m.poster_url, m.backdrop_url, m.status, m.views_count, m.release_day
        FROM movies m
        WHERE m.release_day = :day
    """)
    return db.execute(query, {"day": day}).mappings().all()

# 3. API Tìm kiếm phim
@app.get("/api/movies/search")
def search_movies(q: str = Query("", description="Từ khóa tìm kiếm"), db: Session = Depends(get_db)):
    if not q or not q.strip():
        return []
    
    search_pattern = f"%{q.strip().lower()}%"
    
    query = text("""
        SELECT m.id, m.title, m.slug, m.poster_url, m.backdrop_url, m.status, m.views_count
        FROM movies m
        WHERE LOWER(m.title) LIKE :q OR LOWER(m.slug) LIKE :q
        ORDER BY m.views_count DESC
        LIMIT 10
    """)
    return db.execute(query, {"q": search_pattern}).mappings().all()

# 4. API Lấy danh sách tất cả phim
@app.get("/api/movies")
def get_movies(db: Session = Depends(get_db)):
    movies_query = text("""
        SELECT 
            m.id, 
            m.title, 
            m.slug, 
            m.description, 
            m.poster_url, 
            m.backdrop_url, 
            m.status, 
            m.views_count,
            m.total_ep,
            m.is_banner,  -- <--- BỔ SUNG TRƯỜNG NÀY VÀO ĐÂY
            (SELECT COUNT(*) FROM episodes e WHERE e.movie_id = m.id) AS current_ep
        FROM movies m
        ORDER BY m.created_at DESC
    """)
    movies = db.execute(movies_query).mappings().all()

    result = []
    for movie in movies:
        movie_dict = dict(movie)
        
        cats_query = text("""
            SELECT c.id, c.name, c.slug
            FROM categories c
            JOIN movie_categories mc ON c.id = mc.category_id
            WHERE mc.movie_id = :movie_id
        """)
        categories = db.execute(cats_query, {"movie_id": movie_dict["id"]}).mappings().all()
        
        movie_dict["categories"] = [dict(cat) for cat in categories]
        result.append(movie_dict)

    return result

# 5. API Lấy chi tiết 1 bộ phim theo slug (ĐẶT Ở CUỐI CÙNG)
@app.get("/api/movies/{slug}")
def get_movie_detail(slug: str, db: Session = Depends(get_db)):
    movie_query = text("""
        SELECT m.id, m.title, m.slug, m.description, m.poster_url, m.backdrop_url, m.status, m.views_count, m.release_day, m.rating, m.vote_count
        FROM movies m
        WHERE m.slug = :slug
    """)
    movie = db.execute(movie_query, {"slug": slug}).mappings().first()
    
    if not movie:
        raise HTTPException(status_code=404, detail="Phim không tồn tại")

    episodes_query = text("""
        SELECT id, episode_number, title, m3u8_url
        FROM episodes
        WHERE movie_id = :movie_id
        ORDER BY episode_number ASC
    """)
    episodes = db.execute(episodes_query, {"movie_id": movie["id"]}).mappings().all()

    categories_query = text("""
        SELECT c.id, c.name, c.slug
        FROM categories c
        JOIN movie_categories mc ON c.id = mc.category_id
        WHERE mc.movie_id = :movie_id
    """)
    categories = db.execute(categories_query, {"movie_id": movie["id"]}).mappings().all()

    return {
        "movie_info": movie,
        "episodes": episodes,
        "categories": categories
    }