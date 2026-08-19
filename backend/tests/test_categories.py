from locust import HttpUser, task, between

class CategoriesPerformanceTest(HttpUser):
    # Thiết lập thời gian chờ ngẫu nhiên giữa mỗi request của 1 user (từ 0.5 đến 1 giây)
    wait_time = between(0.5, 1.0)

    @task(3)  # Gộp lên cùng 1 dòng, hoặc viết là @task(weight=3)
    def test_get_categories(self):
        # Endpoint lấy danh sách thể loại mà chúng ta vừa tối ưu cache
        self.client.get("/api/categories")
        
    @task(1)  # Tương tự, gộp lại cho gọn
    def test_get_category_detail(self):
        # Test thử thêm API chi tiết một thể loại (ví dụ: hanh-dong)
        self.client.get("/api/categories/tu-tien")