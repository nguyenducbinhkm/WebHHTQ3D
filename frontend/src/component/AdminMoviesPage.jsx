import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "./Header"; // Hoặc layout admin riêng của bạn

// Lấy base URL từ biến môi trường của Vite
const API_URL = import.meta.env.VITE_API_URL;

function AdminMoviesPage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // 1. Lấy danh sách phim từ Backend
  const fetchMovies = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/movies`);
      setMovies(response.data || []);
      setLoading(false);
    } catch (err) {
      console.error("Lỗi tải danh sách phim:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  // 2. Xử lý thay đổi state cục bộ của từng bộ phim khi người dùng chỉnh sửa trên bảng
  const handleChangeField = (id, field, value) => {
    setMovies((prevMovies) =>
      prevMovies.map((movie) => {
        const movieId = movie.id || movie.M_ID || movie.slug;
        if (movieId === id) {
          return { ...movie, [field]: value };
        }
        return movie;
      }),
    );
  };

  // 3. Gửi request cập nhật lên Backend
  const handleSave = async (movie) => {
    const movieId = movie.id || movie.M_ID || movie.slug;
    setUpdatingId(movieId);
    try {
      // Bổ sung thêm chữ 'admin' vào đường dẫn cho khớp với backend router
      await axios.patch(`${API_URL}/api/admin/movies/${movieId}/`, {
        status: movie.status || "ongoing",
        total_ep: Number(movie.total_ep || movie.total_episodes || 0),
      });
      alert(
        `Đã cập nhật thành công phim: ${movie.title || movie.movie_info?.title}`,
      );
    } catch (err) {
      console.error("Lỗi cập nhật phim:", err);
      alert("Cập nhật thất bại, vui lòng thử lại!");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#121315] min-h-screen text-white flex items-center justify-center">
        Đang tải trang quản trị...
      </div>
    );
  }

  return (
    <div className="bg-[#121315] min-h-screen text-white">
      <Header />

      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-sky-400">
            Quản Lý Trạng Thái & Số Tập Phim
          </h1>
          <span className="text-xs text-gray-400 bg-[#1f2126] px-3 py-1.5 rounded border border-gray-800">
            Tổng số phim: {movies.length}
          </span>
        </div>

        <div className="bg-[#18191c] border border-gray-800 rounded-lg overflow-x-auto shadow-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-800 bg-[#1f2126] text-xs text-gray-400 uppercase tracking-wider">
                <th className="p-4">Tên Phim</th>
                <th className="p-4">Trạng Thái</th>
                <th className="p-4 text-center">Số Tập Hiện Tại (Auto)</th>
                <th className="p-4 text-center">Tổng Số Tập Dự Kiến</th>
                <th className="p-4 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-sm">
              {movies.map((movie) => {
                const movieId = movie.id || movie.M_ID || movie.slug;
                const title =
                  movie.title || movie.movie_info?.title || "Không tên";
                const thumb =
                  movie.thumb_url ||
                  movie.poster_url ||
                  movie.movie_info?.thumb_url ||
                  "";
                const currentEp =
                  movie.current_ep ||
                  movie.episodes_count ||
                  movie.total_current_ep ||
                  (movie.episodes ? movie.episodes.length : 0);
                const totalEp = movie.total_ep || movie.total_episodes || 0;
                const status = movie.status || "ongoing";

                return (
                  <tr key={movieId} className="hover:bg-[#1c1e22] transition">
                    {/* Tên & Ảnh */}
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
                        <option value="completed">
                          Hoàn thành (Completed)
                        </option>
                      </select>
                    </td>

                    {/* Số tập hiện tại (Chỉ đọc - Backend tự đếm) */}
                    <td className="p-4 text-center font-bold text-sky-400">
                      {currentEp}
                    </td>

                    {/* Tổng số tập (Input nhập tay) */}
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
                        className="w-20 bg-[#222] border border-gray-700 rounded px-2 py-1.5 text-center text-white text-xs focus:outline-none focus:border-sky-500"
                      />
                    </td>

                    {/* Nút lưu */}
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleSave(movie)}
                        disabled={updatingId === movieId}
                        className="px-4 py-1.5 bg-[#38bdf8] text-black font-bold rounded hover:bg-sky-400 transition text-xs disabled:opacity-50"
                      >
                        {updatingId === movieId ? "Đang lưu..." : "Lưu"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminMoviesPage;
