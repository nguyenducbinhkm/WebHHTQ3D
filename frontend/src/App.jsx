import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import MainLayout from "./component/MainLayout"; // Import layout chung
import Home from "./component/Home";
import CategoryPage from "./component/CategoryPage";
import SearchPage from "./component/SearchPage";
import WatchPage from "./component/WatchPage";
import FavoritesPage from "./component/FavoritesPage";
import WatchHistoryPage from "./component/WatchHistoryPage"; // <--- 1. IMPORT TRANG LỊCH SỬ XEM
import AdminMoviesPage from "./component/AdminMoviesPage";

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
        {/* 2. THÊM ROUTE LỊCH SỬ XEM VÀO ĐÂY */}
        <Route
          path="/lich-su-xem"
          element={
            <MainLayout>
              <WatchHistoryPage />
            </MainLayout>
          }
        />

        {/* Trang Admin giữ nguyên không bọc MainLayout (hoặc bọc layout riêng nếu cần) */}
        <Route path="/admin/movies" element={<AdminMoviesPage />} />
      </Routes>
    </>
  );
}

export default App;
