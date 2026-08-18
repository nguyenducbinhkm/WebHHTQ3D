import os
import shutil
from typing import Optional, List
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, text
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


# 0. LẤY DANH SÁCH & TÌM KIẾM PHIM
@router.get("", summary="0. Lấy danh sách phim có hỗ trợ tìm kiếm")
async def get_admin_movies(
    q: Optional[str] = Query(None, description="Từ khóa tìm kiếm theo tên hoặc slug"),
    db: Session = Depends(get_db)
):
    try:
        query = db.query(Movie)
        if q:
            keyword = f"%{q.strip()}%"
            query = query.filter(or_(Movie.title.ilike(keyword), Movie.slug.ilike(keyword)))
        
        movies = query.all()
        result = []
        for m in movies:
            result.append({
                "id": m.id,
                "title": m.title,
                "slug": m.slug,
                "description": m.description,
                "status": m.status,
                "total_ep": m.total_ep,
                "poster_url": m.poster_url,
                "backdrop_url": m.backdrop_url,
                "release_day": m.release_day,
                "is_banner": getattr(m, "is_banner", False),
                "ranking_order": getattr(m, "ranking_order", None), # Thêm trường ranking_order để frontend quản lý nếu cần
                "rating": getattr(m, "rating", 4.3),
                "vote_count": getattr(m, "vote_count", 10353)
            })
        return {"total": len(result), "movies": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


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
        
        db.add(new_movie)
        db.flush() 

        # 4. Gắn thể loại qua bảng trung gian
        if category_ids:
            cat_ids = [int(cid.strip()) for cid in category_ids.split(",") if cid.strip().isdigit()]
            categories = db.query(Category).filter(Category.id.in_(cat_ids)).all()
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


# 2. THÊM TẬP PHIM
@router.post("/{movie_slug}/episodes", summary="2. Thêm Tập Phim Cho Phim Đã Có")
async def add_episode(
    movie_slug: str,
    episode_slug: str = Form(..., description="Slug của tập không dấu (Ví dụ: tap1, tap2...)"),
    video_file: UploadFile = File(..., description="File video .mp4 gốc"),
    db: Session = Depends(get_db)
):
    try:
        movie = db.query(Movie).filter(Movie.slug == movie_slug).first()
        if not movie:
            raise HTTPException(status_code=404, detail=f"Không tìm thấy phim với slug: '{movie_slug}'")

        temp_dir = os.path.join("temp", movie_slug)
        os.makedirs(temp_dir, exist_ok=True)
        temp_file_path = os.path.join(temp_dir, f"{episode_slug}.mp4")

        with open(temp_file_path, "wb") as buffer:
            while chunk := await video_file.read(1024 * 1024):
                buffer.write(chunk)

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


# 3. CẬP NHẬT TRẠNG THÁI, TỔNG SỐ TẬP VÀ MÔ TẢ PHIM
@router.patch("/{movie_id}", summary="3. Cập nhật Trạng thái, Tổng số tập và Mô tả phim")
async def update_movie_status_and_total(
    movie_id: str,
    payload: dict,
    db: Session = Depends(get_db)
):
    try:
        movie = None
        if movie_id.isdigit():
            movie = db.query(Movie).filter(Movie.id == int(movie_id)).first()
        
        if not movie:
            movie = db.query(Movie).filter(Movie.slug == movie_id).first()

        if not movie:
            raise HTTPException(status_code=404, detail=f"Không tìm thấy phim với ID/Slug: '{movie_id}'")

        new_status = payload.get("status")
        new_total_ep = payload.get("total_ep")
        new_description = payload.get("description")

        if new_status is not None:
            movie.status = new_status
        if new_total_ep is not None:
            movie.total_ep = int(new_total_ep)
        if new_description is not None:
            movie.description = new_description

        db.commit()
        db.refresh(movie)

        return {
            "message": f"Cập nhật thành công phim '{movie.title}'!",
            "status": movie.status,
            "total_ep": movie.total_ep,
            "description": movie.description
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        db.rollback()
        print(f"❌ [LỖI UPDATE MOVIE]: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ==========================================
# 4. CHỌN 5 PHIM HIỂN THỊ TRÊN BANNER
# ==========================================
@router.post("/banner/set-top-5", summary="4. Chọn danh sách 5 phim hiển thị trên Banner")
async def set_banner_movies(
    payload: dict,
    db: Session = Depends(get_db)
):
    try:
        movie_ids = payload.get("movie_ids", [])
        processed_ids = [int(i) for i in movie_ids if i is not None]

        db.query(Movie).update({Movie.is_banner: False}, synchronize_session=False)
        
        if processed_ids:
            db.query(Movie).filter(Movie.id.in_(processed_ids)).update({Movie.is_banner: True}, synchronize_session=False)
            
        db.commit()
        return {"message": "Đã cập nhật thành công danh sách 5 phim chiếu trên banner!"}
    except Exception as e:
        db.rollback()
        print(f"❌ [LỖI SET BANNER]: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ==========================================
# 4.1. CẬP NHẬT THỨ TỰ BẢNG XẾP HẠNG (RANKING ORDER)
# ==========================================
@router.post("/ranking/set-order", summary="4.1. Cập nhật thứ tự 8 phim cho Bảng Xếp Hạng")
async def set_ranking_movies_order(
    payload: dict,
    db: Session = Depends(get_db)
):
    try:
        movie_ids = payload.get("movie_ids", [])
        
        # Reset toàn bộ ranking_order về NULL trước
        db.query(Movie).update({Movie.ranking_order: None}, synchronize_session=False)
        
        # Gán lại số thứ tự từ 1 đến N tương ứng với vị trí trong danh sách gửi lên
        for index, m_id in enumerate(movie_ids):
            if m_id is not None:
                # Kiểm tra xem m_id là số hay chuỗi/slug để query linh hoạt
                query = db.query(Movie)
                if str(m_id).isdigit():
                    query = query.filter(or_(Movie.id == int(m_id), Movie.slug == str(m_id)))
                else:
                    query = query.filter(Movie.slug == str(m_id))
                
                query.update({Movie.ranking_order: index + 1}, synchronize_session=False)
                
        db.commit()
        return {"message": "Đã cập nhật thứ tự Bảng Xếp Hạng thành công!"}
    except Exception as e:
        db.rollback()
        print(f"❌ [LỖI SET RANKING ORDER]: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# 5. FAKE ĐÁNG GIÁ SAO CHO PHIM
@router.patch("/{movie_id}/rating", summary="5. Fake số điểm đánh giá và lượt bình chọn")
async def update_movie_rating(
    movie_id: str,
    payload: dict,
    db: Session = Depends(get_db)
):
    try:
        movie = None
        try:
            numeric_id = int(movie_id)
            movie = db.query(Movie).filter(Movie.id == numeric_id).first()
        except ValueError:
            pass

        if not movie:
            movie = db.query(Movie).filter(Movie.slug == movie_id).first()

        if not movie:
            raise HTTPException(status_code=404, detail=f"Không tìm thấy phim với ID/Slug: {movie_id}")

        rating_val = payload.get("rating") if payload.get("rating") is not None else payload.get("voteAverage")
        vote_val = payload.get("vote_count") if payload.get("vote_count") is not None else payload.get("voteCount")

        if rating_val is not None:
            movie.rating = float(rating_val)
        
        if vote_val is not None:
            movie.vote_count = int(vote_val)

        db.commit()
        db.refresh(movie)
        
        return {
            "success": True,
            "message": f"Đã cập nhật đánh giá cho phim '{movie.title}' thành công!", 
            "rating": movie.rating, 
            "vote_count": movie.vote_count
        }
    except Exception as e:
        db.rollback()
        print(f"❌ [ERROR UPDATE RATING]: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# 6. XÓA PHIM KHỎI HỆ THỐNG
@router.delete("/{movie_id}", summary="6. Xóa phim khỏi hệ thống")
async def delete_movie(
    movie_id: str,
    db: Session = Depends(get_db)
):
    try:
        movie = db.query(Movie).filter(Movie.id == int(movie_id)).first() if movie_id.isdigit() else db.query(Movie).filter(Movie.slug == movie_id).first()
        if not movie:
            raise HTTPException(status_code=404, detail="Không tìm thấy phim để xóa")

        db.delete(movie)
        db.commit()
        return {"message": f"Đã xóa thành công phim '{movie.title}'!"}
    except Exception as e:
        db.rollback()
        print(f"❌ [LỖI DELETE MOVIE]: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# 7. CHỈNH SỬA / CẬP NHẬT RIÊNG NỘI DUNG (DESCRIPTION) CỦA PHIM
@router.patch("/{movie_id}/description", summary="7. Cập nhật riêng nội dung mô tả phim")
async def update_movie_description(
    movie_id: str,
    payload: dict,
    db: Session = Depends(get_db)
):
    try:
        movie = db.query(Movie).filter(Movie.id == int(movie_id)).first() if movie_id.isdigit() else db.query(Movie).filter(Movie.slug == movie_id).first()
        if not movie:
            raise HTTPException(status_code=404, detail="Không tìm thấy phim để cập nhật nội dung")

        new_description = payload.get("description")
        if new_description is not None:
            movie.description = new_description

        db.commit()
        db.refresh(movie)
        return {
            "message": f"Đã cập nhật nội dung mô tả cho phim '{movie.title}' thành công!",
            "movie_id": movie.id,
            "description": movie.description
        }
    except Exception as e:
        db.rollback()
        print(f"❌ [LỖI UPDATE DESCRIPTION]: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))