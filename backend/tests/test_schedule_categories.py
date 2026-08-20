from locust import HttpUser, task, between

class ScheduleCategoriesPerformanceTest(HttpUser):
    # Thời gian chờ ngẫu nhiên giữa mỗi request của 1 user (từ 0.5 đến 1 giây)
    wait_time = between(0.5, 1.0)

    @task(3) # Trọng số cao hơn cho API xem lịch phim theo ngày
    def test_get_movies_by_schedule(self):
        # Giả lập test các ngày trong tuần phổ biến
        days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
        import random
        selected_day = random.choice(days)
        self.client.get(f"/api/movies/schedule/{selected_day}")

    @task(1) # API lấy danh sách thể loại phục vụ schedule
    def test_get_schedule_categories(self):
        self.client.get("/api/categories")