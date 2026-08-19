import os
from pathlib import Path
from dotenv import load_dotenv

# Tự động tìm file .env nằm ở thư mục gốc (lùi 2 cấp từ tasks/celery_app.py ra thư mục Fullstack-Movie)
env_path = Path(__file__).resolve().parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

from celery import Celery

celery_app = Celery(
    'movie_tasks',
    broker='redis://localhost:6379/0',
    backend='redis://localhost:6379/0',
    include=['app.tasks.movie_tasks']  # Tự động nạp các task trong movie_tasks.py
)

celery_app.conf.update(
    task_serializer='json',
    result_serializer='json',
    accept_content=['json'],
    timezone='Asia/Ho_Chi_Minh',
    enable_utc=True,
)