from celery import Celery

celery_app = Celery(
    'movie_tasks',
    broker='redis://localhost:6379/0',
    backend='redis://localhost:6379/0',
    include=['tasks.movie_tasks']  # Tự động nạp các task trong movie_tasks.py
)

celery_app.conf.update(
    task_serializer='json',
    result_serializer='json',
    accept_content=['json'],
    timezone='Asia/Ho_Chi_Minh',
    enable_utc=True,
)