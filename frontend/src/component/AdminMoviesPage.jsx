import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "./Header";

const API_URL = import.meta.env.VITE_API_URL;

function AdminMoviesPage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [savingBanner, setSavingBanner] = useState(false);
  const [savingRanking, setSavingRanking] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // State quản lý Modal chỉnh sửa nội dung (Description)
  const [editingMovie, setEditingMovie] = useState(null);
  const [modalDescription, setModalDescription] = useState("");

  // 1. Lấy danh sách phim từ API ADMIN
  const fetchMovies = async (searchQuery = "") => {
    try {
      setLoading(true);
      const url = searchQuery
        ? `${API_URL}/api/admin/movies?q=${encodeURIComponent(searchQuery)}`
        : `${API_URL}/api/admin/movies`;

      const response = await axios.get(url);
      const rawMovies = response.data.movies || response.data || [];

      // Chuẩn hóa ranking_order: nếu không phải số hợp lệ từ 1-8 thì để trống ("")
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

  // 2. Xử lý thay đổi state cục bộ
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

  // 3. Gửi request cập nhật thông tin chung (Trạng thái, Tổng tập, ...)
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

  // 4. Gửi request cập nhật Rating & Vote Count
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

  // 5. Lưu danh sách 5 phim làm Banner
  const handleSaveBannerTop5 = async () => {
    const selectedIds = movies.filter((m) => m.is_banner).map((m) => m.id);

    if (selectedIds.length > 5) {
      alert("Bạn chỉ nên chọn tối đa 5 phim hiển thị lên Banner!");
      return;
    }

    setSavingBanner(true);
    try {
      const response = await axios.post(
        `${API_URL}/api/admin/movies/banner/set-top-5`,
        {
          movie_ids: selectedIds,
        },
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

  // 5.1. Lưu thứ tự 8 phim cho Bảng Xếp Hạng (Ranking)
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
        {
          movie_ids: selectedIds,
        },
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

  // 6. Xóa phim khỏi hệ thống
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

  // 7. Mở Modal Chỉnh Sửa Nội Dung (Description)
  const handleOpenEditModal = (movie) => {
    setEditingMovie(movie);
    setModalDescription(movie.description || "");
  };

  // 8. Lưu Nội Dung (Description) Mới Qua API Riêng Biệt
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
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl font-bold text-sky-400">
            Quản Lý Phim & Đánh Giá (Admin)
          </h1>

          {/* Khu vực thao tác Banner, Ranking & Tìm kiếm */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            <button
              onClick={handleSaveBannerTop5}
              disabled={savingBanner}
              className="px-4 py-1.5 bg-amber-500 text-black font-bold rounded text-sm hover:bg-amber-400 transition disabled:opacity-50"
            >
              {savingBanner
                ? "Đang lưu..."
                : `Lưu Banner Top 5 (${bannerCount}/5)`}
            </button>

            <button
              onClick={handleSaveRankingOrder}
              disabled={savingRanking}
              className="px-4 py-1.5 bg-purple-500 text-black font-bold rounded text-sm hover:bg-purple-400 transition disabled:opacity-50"
            >
              {savingRanking
                ? "Đang lưu..."
                : `Lưu BXH Top 8 (${rankingCount}/8)`}
            </button>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Tìm theo tên phim..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#1f2126] border border-gray-700 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-sky-500 w-48"
              />
              <button
                onClick={() => fetchMovies(searchTerm)}
                className="px-4 py-1.5 bg-sky-500 text-black font-semibold rounded text-sm hover:bg-sky-400 transition"
              >
                Tìm
              </button>
            </div>
          </div>
        </div>

        <div className="bg-[#18191c] border border-gray-800 rounded-lg overflow-x-auto shadow-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-800 bg-[#1f2126] text-xs text-gray-400 uppercase tracking-wider">
                <th className="p-4 text-center w-16">Banner</th>
                <th className="p-4 text-center w-20">Thứ Hạng (1-8)</th>
                <th className="p-4">Tên Phim</th>
                <th className="p-4">Trạng Thái</th>
                <th className="p-4 text-center">Tổng Tập Dự Kiến</th>
                <th className="p-4 text-center">Rating (Điểm)</th>
                <th className="p-4 text-center">Lượt Vote</th>
                <th className="p-4 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-sm">
              {movies.map((movie) => {
                const movieId = movie.id || movie.slug;
                const title = movie.title || "Không tên";
                const thumb = movie.poster_url || "";
                const totalEp = movie.total_ep || 0;
                const status = movie.status || "ongoing";
                const rating = movie.rating ?? 4.3;
                const voteCount = movie.vote_count ?? 10353;
                const isBanner = Boolean(movie.is_banner);
                const rankingOrder = movie.ranking_order ?? "";

                return (
                  <tr key={movieId} className="hover:bg-[#1c1e22] transition">
                    {/* Cột chọn Banner (Checkbox) */}
                    <td className="p-4 text-center">
                      <input
                        type="checkbox"
                        checked={isBanner}
                        onChange={(e) =>
                          handleChangeField(
                            movieId,
                            "is_banner",
                            e.target.checked,
                          )
                        }
                        className="w-4 h-4 accent-amber-500 cursor-pointer"
                        title="Chọn hiển thị lên banner trang chủ"
                      />
                    </td>

                    {/* Cột nhập thứ hạng Bảng Xếp Hạng (1 đến 8) */}
                    <td className="p-4 text-center">
                      <input
                        type="number"
                        min="1"
                        max="8"
                        value={rankingOrder}
                        onChange={(e) =>
                          handleChangeField(
                            movieId,
                            "ranking_order",
                            e.target.value === "" ? "" : Number(e.target.value),
                          )
                        }
                        placeholder="1-8"
                        className="w-16 bg-[#222] border border-gray-700 rounded px-2 py-1.5 text-center text-white text-xs focus:outline-none focus:border-purple-500"
                        title="Điền số từ 1 đến 8 để đưa vào bảng xếp hạng"
                      />
                    </td>

                    {/* Tên & Ảnh Poster */}
                    <td className="p-4 flex items-center gap-3">
                      <img
                        src={thumb}
                        alt=""
                        className="w-10 h-14 object-cover rounded border border-gray-700 shrink-0"
                      />
                      <span className="font-semibold text-gray-200 line-clamp-2">
                        {title}
                      </span>
                    </td>

                    {/* Trạng thái (Select) */}
                    <td className="p-4">
                      <select
                        value={status}
                        onChange={(e) =>
                          handleChangeField(movieId, "status", e.target.value)
                        }
                        className="bg-[#222] border border-gray-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                      >
                        <option value="trailer">Trailer</option>
                        <option value="ongoing">Đang phát sóng</option>
                        <option value="completed">Hoàn thành</option>
                      </select>
                    </td>

                    {/* Tổng số tập */}
                    <td className="p-4 text-center">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={totalEp === 0 ? "" : totalEp}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (/^\d*$/.test(val)) {
                            handleChangeField(
                              movieId,
                              "total_ep",
                              val === "" ? 0 : Number(val),
                            );
                          }
                        }}
                        placeholder="VD: 12"
                        className="w-16 bg-[#222] border border-gray-700 rounded px-2 py-1.5 text-center text-white text-xs focus:outline-none focus:border-sky-500"
                      />
                    </td>

                    {/* Rating */}
                    <td className="p-4 text-center">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={rating}
                        onChange={(e) =>
                          handleChangeField(movieId, "rating", e.target.value)
                        }
                        className="w-16 bg-[#222] border border-gray-700 rounded px-2 py-1.5 text-center text-white text-xs focus:outline-none focus:border-sky-500"
                      />
                    </td>

                    {/* Vote Count */}
                    <td className="p-4 text-center">
                      <input
                        type="number"
                        value={voteCount}
                        onChange={(e) =>
                          handleChangeField(
                            movieId,
                            "vote_count",
                            e.target.value,
                          )
                        }
                        className="w-20 bg-[#222] border border-gray-700 rounded px-2 py-1.5 text-center text-white text-xs focus:outline-none focus:border-sky-500"
                      />
                    </td>

                    {/* Nhóm nút thao tác & lưu */}
                    <td className="p-4 text-center space-x-1 space-y-1">
                      <button
                        onClick={() => handleSaveInfo(movie)}
                        disabled={updatingId === movieId}
                        className="px-2.5 py-1 bg-[#38bdf8] text-black font-bold rounded hover:bg-sky-400 transition text-xs disabled:opacity-50"
                      >
                        {updatingId === movieId ? "Đang lưu..." : "Lưu Info"}
                      </button>

                      <button
                        onClick={() => handleSaveRating(movie)}
                        className="px-2.5 py-1 bg-emerald-500 text-black font-bold rounded hover:bg-emerald-400 transition text-xs"
                      >
                        Lưu ĐG
                      </button>

                      <button
                        onClick={() => handleOpenEditModal(movie)}
                        className="px-2.5 py-1 bg-purple-600 text-white font-bold rounded hover:bg-purple-500 transition text-xs"
                      >
                        Sửa Nội Dung
                      </button>

                      <button
                        onClick={() => handleDeleteMovie(movie)}
                        className="px-2.5 py-1 bg-rose-600 text-white font-bold rounded hover:bg-rose-500 transition text-xs"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CHỈNH SỬA NỘI DUNG (DESCRIPTION) */}
      {editingMovie && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1f2126] border border-gray-700 rounded-lg w-full max-w-lg p-6 shadow-2xl text-white">
            <h2 className="text-xl font-bold mb-4 text-sky-400">
              Chỉnh Sửa Nội Dung: {editingMovie.title}
            </h2>

            <div className="mb-4">
              <label className="block text-xs uppercase text-gray-400 mb-2">
                Nội Dung Mô Tả (Description)
              </label>
              <textarea
                rows="6"
                value={modalDescription}
                onChange={(e) => setModalDescription(e.target.value)}
                className="w-full bg-[#121315] border border-gray-700 rounded p-3 text-sm text-white focus:outline-none focus:border-sky-500"
                placeholder="Nhập nội dung mô tả phim..."
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setEditingMovie(null)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm font-semibold transition"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveDescription}
                className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-black rounded text-sm font-bold transition"
              >
                Lưu Thay Đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminMoviesPage;
