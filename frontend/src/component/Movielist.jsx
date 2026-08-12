import React from "react";
import { Link } from "react-router-dom";

function Movielist({ title, data = [] }) {
  const movieList = Array.isArray(data) ? data : [];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-5 border-b border-gray-800 pb-3">
        <h2 className="text-xl font-bold text-sky-400 uppercase tracking-wide">
          {title}
        </h2>
      </div>

      {/* Grid 4 cột chuẩn tỉ lệ poster 2/3 */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {movieList.map((movie, idx) => {
          const currentEp = movie.current_ep || 0;
          const totalEp = movie.total_ep || 0;
          const status = movie.status;

          // Xây dựng chuỗi hiển thị số tập theo đúng logic yêu cầu
          let episodeLabel = "Tập mới";

          if (status === "trailer") {
            episodeLabel = "Trailer"; // Nếu là trailer thì hiện chữ Trailer
          } else if (totalEp > 0 && totalEp > currentEp) {
            episodeLabel = `Tập ${currentEp}/${totalEp}`;
          } else if (currentEp > 0) {
            episodeLabel = `Tập ${currentEp}`;
          }

          return (
            <Link
              key={movie.id || movie.slug || idx}
              to={`/watch/${movie.slug}`}
              className="group relative bg-[#14161d] rounded-2xl overflow-hidden border border-gray-800/80 hover:border-sky-500/60 transition-all duration-300 shadow-lg flex flex-col"
            >
              {/* Tỉ lệ aspect [2/3] thuôn dài xịn xò */}
              <div className="relative aspect-[2/3] w-full overflow-hidden bg-gray-900">
                <img
                  src={
                    movie.poster_url ||
                    movie.thumbnail ||
                    "https://via.placeholder.com/300x450"
                  }
                  alt={movie.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />

                {/* Tag Tập Phim / Trailer */}
                <div className="absolute top-2.5 left-2.5 bg-red-600/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-md backdrop-blur-sm">
                  {episodeLabel}
                </div>

                {/* Tag Sub/TM */}
                <div className="absolute bottom-2.5 left-2.5 bg-teal-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md backdrop-blur-sm">
                  SUB+TM
                </div>
              </div>

              {/* Tiêu đề dưới Poster */}
              <div className="p-3 bg-[#14161d]">
                <h3 className="text-sm font-bold text-gray-200 group-hover:text-sky-400 truncate transition">
                  {movie.title}
                </h3>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default Movielist;
