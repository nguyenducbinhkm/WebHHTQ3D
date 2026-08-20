import React from "react";

export default function AdminMovieTable({
  movies,
  updatingId,
  onChangeField,
  onSaveInfo,
  onSaveRating,
  onOpenEditModal,
  onDeleteMovie,
}) {
  return (
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
                <td className="p-4 text-center">
                  <input
                    type="checkbox"
                    checked={isBanner}
                    onChange={(e) =>
                      onChangeField(movieId, "is_banner", e.target.checked)
                    }
                    className="w-4 h-4 accent-amber-500 cursor-pointer"
                    title="Chọn hiển thị lên banner trang chủ"
                  />
                </td>

                <td className="p-4 text-center">
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={rankingOrder}
                    onChange={(e) =>
                      onChangeField(
                        movieId,
                        "ranking_order",
                        e.target.value === "" ? "" : Number(e.target.value),
                      )
                    }
                    placeholder="1-8"
                    className="w-16 bg-[#222] border border-gray-700 rounded px-2 py-1.5 text-center text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </td>

                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={thumb}
                      alt=""
                      className="w-10 h-14 object-cover rounded border border-gray-700 shrink-0"
                    />
                    <span className="font-semibold text-gray-200 line-clamp-2">
                      {title}
                    </span>
                  </div>
                </td>

                <td className="p-4">
                  <select
                    value={status}
                    onChange={(e) =>
                      onChangeField(movieId, "status", e.target.value)
                    }
                    className="bg-[#222] border border-gray-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="trailer">Trailer</option>
                    <option value="ongoing">Đang phát sóng</option>
                    <option value="completed">Hoàn thành</option>
                  </select>
                </td>

                <td className="p-4 text-center">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={totalEp === 0 ? "" : totalEp}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^\d*$/.test(val)) {
                        onChangeField(
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

                <td className="p-4 text-center">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={rating}
                    onChange={(e) =>
                      onChangeField(movieId, "rating", e.target.value)
                    }
                    className="w-16 bg-[#222] border border-gray-700 rounded px-2 py-1.5 text-center text-white text-xs focus:outline-none focus:border-sky-500"
                  />
                </td>

                <td className="p-4 text-center">
                  <input
                    type="number"
                    value={voteCount}
                    onChange={(e) =>
                      onChangeField(movieId, "vote_count", e.target.value)
                    }
                    className="w-20 bg-[#222] border border-gray-700 rounded px-2 py-1.5 text-center text-white text-xs focus:outline-none focus:border-sky-500"
                  />
                </td>

                <td className="p-4 text-center">
                  <div className="flex flex-wrap items-center justify-center gap-1.5">
                    <button
                      onClick={() => onSaveInfo(movie)}
                      disabled={updatingId === movieId}
                      className="px-2.5 py-1 bg-[#38bdf8] text-black font-bold rounded hover:bg-sky-400 transition text-xs disabled:opacity-50"
                    >
                      {updatingId === movieId ? "Đang lưu..." : "Lưu Info"}
                    </button>

                    <button
                      onClick={() => onSaveRating(movie)}
                      className="px-2.5 py-1 bg-emerald-500 text-black font-bold rounded hover:bg-emerald-400 transition text-xs"
                    >
                      Lưu ĐG
                    </button>

                    <button
                      onClick={() => onOpenEditModal(movie)}
                      className="px-2.5 py-1 bg-purple-600 text-white font-bold rounded hover:bg-purple-500 transition text-xs"
                    >
                      Sửa Nội Dung
                    </button>

                    <button
                      onClick={() => onDeleteMovie(movie)}
                      className="px-2.5 py-1 bg-rose-600 text-white font-bold rounded hover:bg-rose-500 transition text-xs"
                    >
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
