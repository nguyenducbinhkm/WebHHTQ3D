import random
from locust import HttpUser, task, between

class MoviesPerformanceTest(HttpUser):
    # Thời gian chờ ngẫu nhiên giữa các request của mỗi user (0.5 đến 1 giây)
    wait_time = between(0.5, 1.0)

    @task(3)
    def test_get_top_hot_movies(self):
        self.client.get("/api/movies/top-hot")

    @task(2)
    def test_get_ranking_movies(self):
        self.client.get("/api/movies/ranking")

    @task(2)
    def test_get_completed_movies(self):
        self.client.get("/api/movies/status/completed")

    @task(2)
    def test_get_movies_by_schedule(self):
        days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
        selected_day = random.choice(days)
        self.client.get(f"/api/movies/schedule/{selected_day}")

    @task(1)
    def test_get_movie_detail(self):
        # Giả lập một vài slug phim phổ biến để test cache chi tiết phim
        sample_slugs = ["tiennghich", "trutien", "thegioihoanmy", "nguyenton"]
        slug = random.choice(sample_slugs)
        self.client.get(f"/api/movies/{slug}")

