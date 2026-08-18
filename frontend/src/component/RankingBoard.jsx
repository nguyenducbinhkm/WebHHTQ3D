import React from "react";
import { Link } from "react-router-dom";

function RankingBoard({ movies = [] }) {
  const safeMovies = Array.isArray(movies) ? movies : [];

  // 1. Lọc ra những phim có ranking_order là số hợp lệ (từ 1 đến 8)
  const rankedMovies = safeMovies
    .filter((movie) => {
      const rank = Number(movie.ranking_order);
      return !isNaN(rank) && rank >= 1 && rank <= 8;
    })
    // 2. Sắp xếp lại theo đúng thứ tự từ 1 đến 8
    .sort((a, b) => Number(a.ranking_order) - Number(b.ranking_order));

  // Nếu chưa chọn phim nào vào BXH thì có thể ẩn hoặc hiển thị thông báo trống
  if (rankedMovies.length === 0) {
    return (
      <div className="bg-[#14161d] p-6 rounded-2xl border border-gray-800/80 shadow-2xl w-full">
        <h2 className="text-lg font-bold text-sky-400 mb-4 uppercase tracking-wider flex items-center gap-2 border-b border-gray-800/80 pb-3">
          Bảng Xếp Hạng
        </h2>
        <p className="text-sm text-gray-500 text-center py-4">
          Chưa có phim nào trong bảng xếp hạng.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#14161d] p-6 rounded-2xl border border-gray-800/80 shadow-2xl w-full">
      <h2 className="text-lg font-bold text-sky-400 mb-6 uppercase tracking-wider flex items-center gap-2 border-b border-gray-800/80 pb-3">
        Bảng Xếp Hạng
      </h2>

      <div className="flex flex-col gap-4">
        {rankedMovies.map((movie) => {
          // Lấy chính xác thứ tự được admin gán (1, 2, 3...)
          const rank = Number(movie.ranking_order);

          return (
            <div
              key={movie.id || movie.slug}
              className="flex items-center gap-4 py-2 border-b border-gray-800/40 last:border-none group cursor-pointer"
            >
              {/* Cột Số thứ tự style YanHH3D: Số xanh + gạch chân */}
              <div className="w-8 flex flex-col items-center justify-center shrink-0">
                <span className="text-2xl font-black text-sky-400 leading-none">
                  {rank}
                </span>
                <div className="w-3.5 h-[3px] bg-sky-400 rounded-full mt-1.5 opacity-80"></div>
              </div>

              {/* Poster tỉ lệ chuẩn */}
              <Link
                to={`/watch/${movie.slug}`}
                className="shrink-0 overflow-hidden rounded-lg border border-gray-700/50 shadow-md"
              >
                <img
                  src={
                    movie.poster_url ||
                    movie.thumbnail ||
                    "https://via.placeholder.com/80x110"
                  }
                  alt={movie.title}
                  className="w-14 h-19 object-cover group-hover:scale-105 transition duration-300"
                />
              </Link>

              {/* Thông tin phim */}
              <div className="flex flex-col min-w-0 flex-1 justify-center">
                <Link
                  to={`/watch/${movie.slug}`}
                  className="text-sm font-bold text-gray-100 group-hover:text-sky-400 truncate transition leading-snug"
                  title={movie.title}
                >
                  {movie.title}
                </Link>
                <span className="text-xs text-gray-400 mt-1.5 truncate font-medium">
                  {movie.episode_info ||
                    movie.current_episode ||
                    "Tập mới nhất"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RankingBoard;
