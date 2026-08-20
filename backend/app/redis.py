import os
from dotenv import load_dotenv
import redis

# Load các biến môi trường từ file .env (nằm ở thư mục cha /backend)
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

# Lấy URL kết nối Redis từ biến môi trường
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

# Khởi tạo Redis client
# decode_responses=True giúp dữ liệu trả về từ Redis tự động chuyển thành kiểu string
redis_client = redis.Redis.from_url(REDIS_URL, decode_responses=True)

def check_redis_connection():
    try:
        redis_client.ping()
        print("Kết nối Redis Cloud thành công!")
        return True
    except Exception as e:
        print(f"Lỗi kết nối Redis: {e}")
        return False