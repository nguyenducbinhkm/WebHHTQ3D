import { Routes, Route } from "react-router-dom";
import MainLayout from "./component/MainLayout"; // Import layout chung
import Home from "./component/Home";
import CategoryPage from "./component/CategoryPage";
import SearchPage from "./component/SearchPage";
import WatchPage from "./component/WatchPage";
import FavoritesPage from "./component/FavoritesPage";
import AdminMoviesPage from "./component/AdminMoviesPage";

function App() {
  return (
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

      {/* Trang Admin giữ nguyên không bọc MainLayout (hoặc bọc layout riêng nếu cần) */}
      <Route path="/admin/movies" element={<AdminMoviesPage />} />
    </Routes>
  );
}

export default App;
