import os
import shutil
from typing import Optional, List
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from services.supabase_service import upload_file_to_supabase
from tasks.movie_tasks import process_video_hls
from database import SessionLocal
from models import Movie, Category, Episode

# Khởi tạo router cho module quản lý phim admin
router = APIRouter(prefix="/api/admin/movies", tags=["Admin Movies"])

# Hàm phụ thuộc lấy DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 1. TẠO PHIM MỚI
@router.post("", summary="1. Tạo Phim Mới (Poster, Backdrop, Mô tả, Thể loại, Lịch phát)")
async def create_movie(
    title: str = Form(..., description="Tên phim tiếng Việt có dấu"),
    slug: str = Form(..., description="Slug phim không dấu, viết liền"),
    description: str = Form("", description="Mô tả phim"),
    release_day: str = Form("tue", description="Lịch phát sóng: mon, tue, wed, thu, fri, sat, sun"),
    category_ids: str = Form(
        "1,6", 
        description="DANH SÁCH THỂ LOẠI HIỆN CÓ TRONG DB:\n"
                    "1: Cổ Trang | 2: Đô Thị | 3: Hài Hước | 4: Hiện Đại | "
                    "5: Kiếm Hiệp | 6: Tiên Hiệp | 7: Trùng Sinh | 8: Tu Tiên | 9: Xuyên Không\n"
                    "-> Nhập các ID cách nhau bằng dấu phẩy (Ví dụ: 1,6)"
    ),
    poster_file: UploadFile = File(..., description="Ảnh Poster dọc"),
    backdrop_file: Optional[UploadFile] = File(None, description="Ảnh Banner ngang"),
    db: Session = Depends(get_db)
):
    try:
        # Kiểm tra bắt buộc file poster
        if not poster_file or not poster_file.filename:
            raise HTTPException(status_code=400, detail="Bắt buộc phải tải lên file ảnh Poster!")

        # 1. Upload Poster lên Supabase
        poster_bytes = await poster_file.read()
        poster_ext = poster_file.filename.split('.')[-1] if '.' in poster_file.filename else 'jpg'
        poster_path = f"{slug}/{slug}_poster.{poster_ext}"
        
        raw_poster_url = upload_file_to_supabase(
            file_bytes=poster_bytes,
            file_name=poster_path,
            bucket_name="movies",
            content_type=poster_file.content_type
        )
        
        poster_url = str(raw_poster_url) if raw_poster_url else None
        if not poster_url:
            raise HTTPException(status_code=500, detail="Lỗi: Không thể lấy được Public URL của Poster từ Supabase!")

        # 2. Upload Backdrop (nếu có)
        backdrop_url = None
        if backdrop_file and backdrop_file.filename:
            backdrop_bytes = await backdrop_file.read()
            bd_ext = backdrop_file.filename.split('.')[-1] if '.' in backdrop_file.filename else 'jpg'
            backdrop_path = f"{slug}/{slug}_bd.{bd_ext}"
            
            raw_bd_url = upload_file_to_supabase(
                file_bytes=backdrop_bytes,
                file_name=backdrop_path,
                bucket_name="movies",
                content_type=backdrop_file.content_type
            )
            backdrop_url = str(raw_bd_url) if raw_bd_url else None

        # 3. Tạo bản ghi phim mới trong Database
        new_movie = Movie(
            title=title,
            slug=slug,
            description=description,
            poster_url=poster_url,
            backdrop_url=backdrop_url,
            release_day=release_day,
            status="ongoing"
        )
        
        # Đưa vào session và flush trước để lấy ID instance cho quan hệ Many-to-Many
        db.add(new_movie)
        db.flush() 

        # 4. Gắn thể loại qua bảng trung gian
        if category_ids:
            cat_ids = [int(cid.strip()) for cid in category_ids.split(",") if cid.strip().isdigit()]
            print(f"👉 Danh sách category IDs đã lọc: {cat_ids}")
            categories = db.query(Category).filter(Category.id.in_(cat_ids)).all()
            print(f"👉 Danh sách Categories tìm thấy trong DB: {categories}")
            new_movie.categories = categories

        db.commit()
        db.refresh(new_movie)

        return {
            "message": f"Tạo thành công phim mới: '{title}'!",
            "movie_id": new_movie.id,
            "slug": slug,
            "release_day": release_day,
            "poster_url": poster_url,
            "backdrop_url": backdrop_url
        }
    except Exception as e:
        db.rollback()
        print(f"❌ [LỖI CREATE MOVIE]: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Lỗi xử lý server: {str(e)}")


# 2. THÊM TẬP PHIM (Tối ưu nhận file lớn bằng cách ghi stream tạm và đẩy sang Celery)
@router.post("/{movie_slug}/episodes", summary="2. Thêm Tập Phim Cho Phim Đã Có")
async def add_episode(
    movie_slug: str,
    episode_slug: str = Form(..., description="Slug của tập không dấu (Ví dụ: tap1, tap2...)"),
    video_file: UploadFile = File(..., description="File video .mp4 gốc"),
    db: Session = Depends(get_db)
):
    try:
        # Kiểm tra xem phim có tồn tại trong database không
        movie = db.query(Movie).filter(Movie.slug == movie_slug).first()
        if not movie:
            raise HTTPException(status_code=404, detail=f"Không tìm thấy phim với slug: '{movie_slug}'")

        # Tạo thư mục tạm local nếu chưa có để lưu file streaming tránh tràn RAM
        temp_dir = os.path.join("temp", movie_slug)
        os.makedirs(temp_dir, exist_ok=True)
        
        temp_file_path = os.path.join(temp_dir, f"{episode_slug}.mp4")

        # Đọc và ghi file theo từng khối (chunk) nhỏ để chống tràn RAM khi gặp video 1GB+
        with open(temp_file_path, "wb") as buffer:
            while chunk := await video_file.read(1024 * 1024):  # Đọc từng 1MB một
                buffer.write(chunk)

        # Kích hoạt Celery task xử lý cắt HLS, upload lên Supabase và lưu Database ở dưới nền
        process_video_hls.delay(
            input_file_path=temp_file_path,
            movie_slug=movie_slug,
            episode_slug=episode_slug
        )

        return {
            "message": f"Đã tiếp nhận file video cho tập '{episode_slug}'. Celery đang xử lý cắt HLS và lưu trữ ngầm!",
            "target_hls_path": f"movies/{movie_slug}/{episode_slug}"
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"❌ [LỖI ADD EPISODE]: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# 3. CẬP NHẬT TRẠNG THÁI VÀ TỔNG SỐ TẬP PHIM
@router.patch("/{movie_id}", summary="3. Cập nhật Trạng thái và Tổng số tập phim")
async def update_movie_status_and_total(
    movie_id: str,
    payload: dict,
    db: Session = Depends(get_db)
):
    try:
        # Tìm phim theo id (nếu là số) hoặc theo slug (nếu là chuỗi)
        movie = None
        if movie_id.isdigit():
            movie = db.query(Movie).filter(Movie.id == int(movie_id)).first()
        
        if not movie:
            movie = db.query(Movie).filter(Movie.slug == movie_id).first()

        if not movie:
            raise HTTPException(status_code=404, detail=f"Không tìm thấy phim với ID/Slug: '{movie_id}'")

        # Lấy dữ liệu từ payload gửi lên từ trang Admin Frontend
        new_status = payload.get("status")
        new_total_ep = payload.get("total_ep")

        # Cập nhật giá trị
        if new_status is not None:
            movie.status = new_status
        
        if new_total_ep is not None:
            movie.total_ep = int(new_total_ep)

        db.commit()
        db.refresh(movie)

        return {
            "message": f"Cập nhật thành công phim '{movie.title}'!",
            "status": movie.status,
            "total_ep": movie.total_ep
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        db.rollback()
        print(f"❌ [LỖI UPDATE MOVIE]: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))