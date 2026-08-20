import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

export default function WatchHistoryPage() {
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Khai báo state phục vụ phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20; // 5 cột x 4 hàng = 20 phim mỗi trang

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    const token =
      localStorage.getItem("token") || localStorage.getItem("access_token");

    if (token) {
      // === 1. ĐÃ ĐĂNG NHẬP: Lấy từ Backend API ===
      try {
        const response = await axios.get(
          "http://localhost:8000/api/watch-history/",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setHistoryList(response.data);
      } catch (error) {
        console.error("Lỗi lấy lịch sử xem từ API:", error);
        // Fallback đọc từ localStorage nếu API lỗi
        loadFromLocalStorage();
      }
    } else {
      // === 2. CHƯA ĐĂNG NHẬP: Đọc từ localStorage ===
      loadFromLocalStorage();
    }
    setLoading(false);
  };

  const loadFromLocalStorage = () => {
    const localData = JSON.parse(localStorage.getItem("watch_history")) || [];
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    const now = new Date().getTime();

    // Lọc chỉ lấy phim được xem trong vòng 7 ngày qua
    const recentHistory = localData.filter((item) => {
      const itemTime = new Date(item.updated_at).getTime();
      return now - itemTime <= SEVEN_DAYS_MS;
    });

    setHistoryList(recentHistory);
  };

  // Tính toán dữ liệu phân trang
  const totalPages = Math.ceil(historyList.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = historyList.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="bg-[#121315] min-h-screen text-white">
      <div className="container mx-auto px-6 py-6">
        {/* Breadcrumb */}
        <div className="text-xs text-[#FFE066] mb-6 flex items-center gap-2 overflow-x-auto whitespace-nowrap">
          <Link to="/" className="hover:text-white">
            Trang chủ
          </Link>
          <span>›</span>
          <span className="text-white font-semibold">Lịch sử xem phim</span>
        </div>

        {/* Tiêu đề */}
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-800">
          <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            <span className="text-[#FFE066]">⏱</span> Lịch sử xem (7 ngày gần
            nhất)
          </h1>
          <span className="text-xs text-gray-400">
            {historyList.length} bộ phim
          </span>
        </div>

        {/* Trạng thái Loading */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">
            Đang tải lịch sử...
          </div>
        ) : historyList.length === 0 ? (
          /* Trạng thái trống */
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg mb-2">
              Bạn chưa xem bộ phim nào trong 7 ngày qua.
            </p>
            <Link to="/" className="text-[#38bdf8] hover:underline text-sm">
              Khám phá danh sách phim ngay
            </Link>
          </div>
        ) : (
          /* Danh sách Lịch sử Phim + Phân trang */
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {currentItems.map((item) => {
                const movie = item.movie || {};
                return (
                  <div
                    key={item.id || movie.id}
                    className="bg-[#1a1c23] rounded-lg overflow-hidden shadow-lg border border-gray-800 hover:border-gray-700 transition flex flex-col group"
                  >
                    {/* Poster phim */}
                    <div className="relative aspect-[3/4] overflow-hidden">
                      <img
                        src={movie.poster_url || "/placeholder.jpg"}
                        alt={movie.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />

                      {/* Thẻ tag "Đang xem tập X" - Màu vàng sáng chói #FFE066 */}
                      <div className="absolute top-2 left-2 bg-[#FFE066] text-black text-[11px] font-bold px-2 py-0.5 rounded shadow-md">
                        Đang xem tập {item.episode_number}
                      </div>
                    </div>

                    {/* Thông tin & Nút xem tiếp */}
                    <div className="p-3 flex flex-col flex-grow justify-between">
                      <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-[#FFE066] transition">
                        {movie.title}
                      </h3>

                      <Link
                        to={`/watch/${movie.slug || movie.id}?ep=${item.episode_number}`}
                        className="mt-3 block text-center bg-[#38bdf8] text-black font-bold text-xs py-2 rounded hover:bg-sky-400 transition"
                      >
                        Xem tiếp
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Thanh điều hướng phân trang (Pagination) */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8 mb-12">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 rounded bg-[#25272c] text-sm font-semibold flex items-center gap-1 transition ${
                    currentPage === 1
                      ? "opacity-40 cursor-not-allowed"
                      : "hover:bg-gray-700 text-white"
                  }`}
                >
                  <FaChevronLeft className="text-xs" /> Trước
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-9 h-9 rounded text-sm font-bold transition ${
                          currentPage === page
                            ? "bg-[#38bdf8] text-black"
                            : "bg-[#25272c] text-gray-300 hover:bg-gray-700"
                        }`}
                      >
                        {page}
                      </button>
                    ),
                  )}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-2 rounded bg-[#25272c] text-sm font-semibold flex items-center gap-1 transition ${
                    currentPage === totalPages
                      ? "opacity-40 cursor-not-allowed"
                      : "hover:bg-gray-700 text-white"
                  }`}
                >
                  Tiếp <FaChevronRight className="text-xs" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
