import os
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.crud import crud_admin_movies
from app.redis import redis_client
# Khởi tạo router cho module quản lý phim admin
router = APIRouter(prefix="/api/admin/movies", tags=["Admin Movies"])

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
        movies = crud_admin_movies.get_movies_by_query_db(db, q)
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
                "ranking_order": getattr(m, "ranking_order", None), 
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
    category_ids: str = Form("1,6", description="Danh sách ID thể loại cách nhau bằng dấu phẩy"),
    poster_file: UploadFile = File(..., description="Ảnh Poster dọc"),
    backdrop_file: Optional[UploadFile] = File(None, description="Ảnh Banner ngang"),
    db: Session = Depends(get_db)
):
    try:
        new_movie = await crud_admin_movies.create_movie_db(
            db, title, slug, description, release_day, category_ids, poster_file, backdrop_file
        )
        return {
            "message": f"Tạo thành công phim mới: '{title}'!",
            "movie_id": new_movie.id,
            "slug": new_movie.slug,
            "release_day": new_movie.release_day,
            "poster_url": new_movie.poster_url,
            "backdrop_url": new_movie.backdrop_url
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        db.rollback()
        print(f"❌ [LỖI CREATE MOVIE]: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Lỗi xử lý server: {str(e)}")


# 1.1. CẬP NHẬT / THAY ĐỔI POSTER VÀ BACKDROP THEO SLUG
@router.patch("/{slug}/images", summary="1.1. Thay đổi Poster và Backdrop của phim theo slug")
async def update_movie_images(
    slug: str,
    poster_file: Optional[UploadFile] = File(None, description="Tải lên file Poster mới"),
    backdrop_file: Optional[UploadFile] = File(None, description="Tải lên file Backdrop mới"),
    db: Session = Depends(get_db)
):
    try:
        movie = await crud_admin_movies.update_movie_images_db(db, slug, poster_file, backdrop_file)
        if not movie:
            raise HTTPException(status_code=404, detail=f"Không tìm thấy phim với slug: '{slug}'")

        return {
            "success": True,
            "message": f"Đã cập nhật hình ảnh thành công cho phim: '{movie.title}'!",
            "slug": movie.slug,
            "poster_url": movie.poster_url,
            "backdrop_url": movie.backdrop_url
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# 2. THÊM TẬP PHIM
@router.post("/{movie_slug}/episodes", summary="2. Thêm Tập Phim Cho Phim Đã Có")
async def add_episode(
    movie_slug: str,
    episode_slug: str = Form(..., description="Slug của tập không dấu (tap1, tap2...)"),
    video_file: UploadFile = File(..., description="File video .mp4 gốc"),
    db: Session = Depends(get_db)
):
    try:
        movie = crud_admin_movies.find_movie_by_id_or_slug(db, movie_slug)
        if not movie:
            raise HTTPException(status_code=404, detail=f"Không tìm thấy phim với slug: '{movie_slug}'")

        await crud_admin_movies.save_video_and_dispatch_task(movie_slug, episode_slug, video_file)

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
        movie = crud_admin_movies.find_movie_by_id_or_slug(db, movie_id)
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
        #  XÓA CACHE CỦA PHIM HOÀN THÀNH NGAY KHI CÓ CẬP NHẬT TRẠNG THÁI
        try:
            redis_client.delete("movies:completed_v2")
        except Exception as cache_err:
            print(f"⚠️ Không thể xóa cache redis: {cache_err}")

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
        raise HTTPException(status_code=500, detail=str(e))


# 4. CHỌN 5 PHIM HIỂN THỊ TRÊN BANNER
@router.post("/banner/set-top-5", summary="4. Chọn danh sách 5 phim hiển thị trên Banner")
async def set_banner_movies(
    payload: dict,
    db: Session = Depends(get_db)
):
    try:
        movie_ids = payload.get("movie_ids", [])
        crud_admin_movies.set_banner_movies_db(db, movie_ids)
        return {"message": "Đã cập nhật thành công danh sách 5 phim chiếu trên banner!"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# 4.1. CẬP NHẬT THỨ TỰ BẢNG XẾP HẠNG (RANKING ORDER)
@router.post("/ranking/set-order", summary="4.1. Cập nhật thứ tự 8 phim cho Bảng Xếp Hạng")
async def set_ranking_movies_order(
    payload: dict,
    db: Session = Depends(get_db)
):
    try:
        movie_ids = payload.get("movie_ids", [])
        crud_admin_movies.set_ranking_order_db(db, movie_ids)
        return {"message": "Đã cập nhật thứ tự Bảng Xếp Hạng thành công!"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# 5. FAKE ĐÁNG GIÁ SAO CHO PHIM
@router.patch("/{movie_id}/rating", summary="5. Fake số điểm đánh giá và lượt bình chọn")
async def update_movie_rating(
    movie_id: str,
    payload: dict,
    db: Session = Depends(get_db)
):
    try:
        movie = crud_admin_movies.find_movie_by_id_or_slug(db, movie_id)
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
        raise HTTPException(status_code=500, detail=str(e))


# 6. XÓA PHIM KHỎI HỆ THỐNG
@router.delete("/{movie_id}", summary="6. Xóa phim khỏi hệ thống")
async def delete_movie(
    movie_id: str,
    db: Session = Depends(get_db)
):
    try:
        movie = crud_admin_movies.find_movie_by_id_or_slug(db, movie_id)
        if not movie:
            raise HTTPException(status_code=404, detail="Không tìm thấy phim để xóa")

        db.delete(movie)
        db.commit()
        return {"message": f"Đã xóa thành công phim '{movie.title}'!"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# 7. CHỈNH SỬA / CẬP NHẬT RIÊNG NỘI DUNG (DESCRIPTION) CỦA PHIM
@router.patch("/{movie_id}/description", summary="7. Cập nhật riêng nội dung mô tả phim")
async def update_movie_description(
    movie_id: str,
    payload: dict,
    db: Session = Depends(get_db)
):
    try:
        movie = crud_admin_movies.find_movie_by_id_or_slug(db, movie_id)
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
        raise HTTPException(status_code=500, detail=str(e))