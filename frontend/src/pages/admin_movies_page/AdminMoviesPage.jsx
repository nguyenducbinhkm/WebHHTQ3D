import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "../../component/header/Header"; // Sửa lại đường dẫn gọi Header từ thư mục bên cạnh
import AdminToolbar from "./AdminToolbar"; // Cùng thư mục thì dùng ./
import AdminMovieTable from "./AdminMovieTable"; // Cùng thư mục thì dùng ./
import AdminDescriptionModal from "./AdminDescriptionModal"; // Cùng thư mục thì dùng ./

const API_URL = import.meta.env.VITE_API_URL;

function AdminMoviesPage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [savingBanner, setSavingBanner] = useState(false);
  const [savingRanking, setSavingRanking] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [editingMovie, setEditingMovie] = useState(null);
  const [modalDescription, setModalDescription] = useState("");

  const fetchMovies = async (searchQuery = "") => {
    try {
      setLoading(true);
      const url = searchQuery
        ? `${API_URL}/api/admin/movies?q=${encodeURIComponent(searchQuery)}`
        : `${API_URL}/api/admin/movies`;

      const response = await axios.get(url);
      const rawMovies = response.data.movies || response.data || [];

      const sanitizedMovies = rawMovies.map((movie) => {
        const rank = Number(movie.ranking_order);
        const isValidRank = !isNaN(rank) && rank >= 1 && rank <= 8;
        return {
          ...movie,
          ranking_order: isValidRank ? rank : "",
        };
      });

      setMovies(sanitizedMovies);
    } catch (err) {
      console.error("Lỗi tải danh sách phim quản trị:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleChangeField = (id, field, value) => {
    setMovies((prevMovies) =>
      prevMovies.map((movie) => {
        const movieId = movie.id || movie.slug;
        if (movieId === id) {
          return { ...movie, [field]: value };
        }
        return movie;
      }),
    );
  };

  const handleSaveInfo = async (movie) => {
    const movieId = movie.id || movie.slug;
    setUpdatingId(movieId);
    try {
      await axios.patch(`${API_URL}/api/admin/movies/${movieId}`, {
        status: movie.status || "ongoing",
        total_ep: Number(movie.total_ep || 0),
        description: movie.description || "",
      });
      alert(`Đã cập nhật thành công phim: ${movie.title}`);
    } catch (err) {
      console.error("Lỗi cập nhật phim:", err);
      alert("Cập nhật thất bại, vui lòng thử lại!");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSaveRating = async (movie) => {
    const movieId = movie.id || movie.slug;
    try {
      await axios.patch(`${API_URL}/api/admin/movies/${movieId}/rating`, {
        rating: parseFloat(movie.rating || 4.3),
        vote_count: parseInt(movie.vote_count || 0),
      });
      alert(`Đã cập nhật đánh giá cho phim: ${movie.title}`);
    } catch (err) {
      console.error("Lỗi cập nhật rating:", err);
      alert("Cập nhật đánh giá thất bại!");
    }
  };

  const handleSaveBannerTop5 = async () => {
    const selectedIds = movies
      .filter((m) => m.is_banner)
      .map((m) => m.id || m.slug);

    if (selectedIds.length > 5) {
      alert("Bạn chỉ nên chọn tối đa 5 phim hiển thị lên Banner!");
      return;
    }

    setSavingBanner(true);
    try {
      const response = await axios.post(
        `${API_URL}/api/admin/movies/banner/set-top-5`,
        { movie_ids: selectedIds },
      );
      alert(
        response.data.message || "Đã lưu danh sách phim Banner thành công!",
      );
    } catch (err) {
      console.error("Lỗi lưu banner:", err);
      alert("Lưu danh sách banner thất bại!");
    } finally {
      setSavingBanner(false);
    }
  };

  const handleSaveRankingOrder = async () => {
    const rankedMovies = movies
      .filter(
        (m) =>
          m.ranking_order !== null &&
          m.ranking_order !== "" &&
          !isNaN(m.ranking_order),
      )
      .map((m) => ({
        id: m.id || m.slug,
        order: Number(m.ranking_order),
      }))
      .sort((a, b) => a.order - b.order);

    if (rankedMovies.length > 8) {
      alert("Bạn chỉ nên chọn tối đa 8 phim cho bảng xếp hạng!");
      return;
    }

    const selectedIds = rankedMovies.map((m) => m.id);

    setSavingRanking(true);
    try {
      const response = await axios.post(
        `${API_URL}/api/admin/movies/ranking/set-order`,
        { movie_ids: selectedIds },
      );
      alert(response.data.message || "Đã lưu thứ tự Bảng Xếp Hạng thành công!");
      fetchMovies(searchTerm);
    } catch (err) {
      console.error("Lỗi lưu bảng xếp hạng:", err);
      alert("Lưu thứ tự bảng xếp hạng thất bại!");
    } finally {
      setSavingRanking(false);
    }
  };

  const handleDeleteMovie = async (movie) => {
    const movieId = movie.id || movie.slug;
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn xóa phim "${movie.title}" không? Hành động này không thể hoàn tác!`,
      )
    ) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/api/admin/movies/${movieId}`);
      setMovies((prevMovies) =>
        prevMovies.filter((m) => (m.id || m.slug) !== movieId),
      );
      alert(`Đã xóa thành công phim: ${movie.title}`);
    } catch (err) {
      console.error("Lỗi xóa phim:", err);
      alert("Xóa phim thất bại, vui lòng thử lại!");
    }
  };

  const handleOpenEditModal = (movie) => {
    setEditingMovie(movie);
    setModalDescription(movie.description || "");
  };

  const handleSaveDescription = async () => {
    if (!editingMovie) return;
    const movieId = editingMovie.id || editingMovie.slug;

    try {
      await axios.patch(`${API_URL}/api/admin/movies/${movieId}/description`, {
        description: modalDescription,
      });

      setMovies((prevMovies) =>
        prevMovies.map((m) => {
          if ((m.id || m.slug) === movieId) {
            return { ...m, description: modalDescription };
          }
          return m;
        }),
      );

      alert("Cập nhật nội dung mô tả phim thành công!");
      setEditingMovie(null);
    } catch (err) {
      console.error("Lỗi cập nhật nội dung mô tả:", err);
      alert("Cập nhật nội dung mô tả thất bại!");
    }
  };

  if (loading && movies.length === 0) {
    return (
      <div className="bg-[#121315] min-h-screen text-white flex items-center justify-center">
        Đang tải trang quản trị...
      </div>
    );
  }

  const bannerCount = movies.filter((m) => m.is_banner).length;
  const rankingCount = movies.filter(
    (m) =>
      m.ranking_order !== null &&
      m.ranking_order !== "" &&
      Number(m.ranking_order) > 0,
  ).length;

  return (
    <div className="bg-[#121315] min-h-screen text-white relative">
      <Header />

      <div className="container mx-auto px-6 py-8">
        {/* Module Thanh Công Cụ */}
        <AdminToolbar
          bannerCount={bannerCount}
          rankingCount={rankingCount}
          savingBanner={savingBanner}
          savingRanking={savingRanking}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onSaveBanner={handleSaveBannerTop5}
          onSaveRanking={handleSaveRankingOrder}
          onSearch={() => fetchMovies(searchTerm)}
        />

        {/* Module Bảng Dữ Liệu Phim */}
        <AdminMovieTable
          movies={movies}
          updatingId={updatingId}
          onChangeField={handleChangeField}
          onSaveInfo={handleSaveInfo}
          onSaveRating={handleSaveRating}
          onOpenEditModal={handleOpenEditModal}
          onDeleteMovie={handleDeleteMovie}
        />
      </div>

      {/* Module Modal Sửa Mô Tả */}
      <AdminDescriptionModal
        editingMovie={editingMovie}
        modalDescription={modalDescription}
        setModalDescription={setModalDescription}
        onClose={() => setEditingMovie(null)}
        onSave={handleSaveDescription}
      />
    </div>
  );
}

export default AdminMoviesPage;
