from sqlalchemy import Column, Integer, String, Text, Enum, ForeignKey, DateTime, Table
from sqlalchemy.orm import relationship
from database import Base
import datetime

# Khai báo bảng trung gian many-to-many giữa Movie và Category
movie_categories = Table(
    'movie_categories',
    Base.metadata,
    Column('movie_id', Integer, ForeignKey('movies.id', ondelete="CASCADE"), primary_key=True),
    Column('category_id', Integer, ForeignKey('categories.id', ondelete="CASCADE"), primary_key=True)
)

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), unique=True, nullable=False)
    slug = Column(String(100), unique=True, nullable=False)

class Movie(Base):
    __tablename__ = "movies"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    poster_url = Column(String(500), nullable=True)
    banner_url = Column(String(500), nullable=True)
    backdrop_url = Column(String(500), nullable=True)
    status = Column(Enum('trailer', 'ongoing', 'completed'), default='ongoing')
    process_status = Column(Enum('pending', 'processing', 'completed', 'failed'), default='pending')
    progress = Column(Integer, default=0)
    views_count = Column(Integer, default=0)
    stream_url = Column(String(550), nullable=True)
    release_day = Column(String(50), nullable=True, default='tue')
    total_ep = Column(Integer, default=0) 
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Quan hệ tới bảng episodes
    episodes = relationship("Episode", back_populates="movie", cascade="all, delete-orphan")
    
    # Quan hệ tới bảng categories qua bảng trung gian vừa tạo
    categories = relationship("Category", secondary=movie_categories, backref="movies")

class Episode(Base):
    __tablename__ = "episodes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    movie_id = Column(Integer, ForeignKey("movies.id", ondelete="CASCADE"), nullable=False)
    episode_number = Column(Integer, nullable=False)
    title = Column(String(255), nullable=True)
    m3u8_url = Column(String(1000), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    movie = relationship("Movie", back_populates="episodes")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum('user', 'admin'), default='user')
    created_at = Column(DateTime, default=datetime.datetime.utcnow)