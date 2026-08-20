import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import MainLayout from "./component/MainLayout"; // Import layout chung
import Home from "./pages/Home";
import CategoryPage from "./pages/CategoryPage";
import SearchPage from "./pages/SearchPage";
import WatchPage from "./component/watchpage/WatchPage";
import FavoritesPage from "./pages/FavoritesPage";
import WatchHistoryPage from "./pages/WatchHistoryPage";
import CompletedMoviesPage from "./pages/CompletedMoviesPage"; // <--- 1. IMPORT TRANG PHIM ĐÃ HOÀN THÀNH
import AdminMoviesPage from "./pages/admin_movies_page/AdminMoviesPage";

// Component tự động đưa màn hình về vị trí (0, 0) ngay lập tức khi đổi đường dẫn hoặc tham số (?ep=...)
function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant", // Dùng 'instant' để dịch chuyển tức thì, không bị hiệu ứng kéo/trượt
    });
  }, [pathname, search]);

  return null;
}

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Các trang người dùng sẽ nằm trong MainLayout để có Header và Footer */}
        <Route
          path="/"
          element={
            <MainLayout>
              <Home />
            </MainLayout>
          }
        />
        <Route
          path="/the-loai/:slug"
          element={
            <MainLayout>
              <CategoryPage />
            </MainLayout>
          }
        />
        <Route
          path="/tim-kiem"
          element={
            <MainLayout>
              <SearchPage />
            </MainLayout>
          }
        />
        <Route
          path="/watch/:slug"
          element={
            <MainLayout>
              <WatchPage />
            </MainLayout>
          }
        />
        <Route
          path="/favorites"
          element={
            <MainLayout>
              <FavoritesPage />
            </MainLayout>
          }
        />
        <Route
          path="/lich-su-xem"
          element={
            <MainLayout>
              <WatchHistoryPage />
            </MainLayout>
          }
        />

        {/* 2. THÊM ROUTE PHIM ĐÃ HOÀN THÀNH VÀO ĐÂY */}
        <Route
          path="/movies/completed"
          element={
            <MainLayout>
              <CompletedMoviesPage />
            </MainLayout>
          }
        />

        {/* Trang Admin giữ nguyên không bọc MainLayout */}
        <Route path="/admin/movies" element={<AdminMoviesPage />} />
      </Routes>
    </>
  );
}

export default App;
