from sqlalchemy.orm import Session
from app.model.models import Category

def get_all_categories_db(db: Session):
    """Lấy danh sách tất cả các thể loại phim"""
    return db.query(Category).all()

def get_category_by_slug_db(db: Session, category_slug: str):
    """Tìm thông tin thể loại và danh sách phim thuộc thể loại đó theo slug"""
    return db.query(Category).filter(Category.slug == category_slug).first()