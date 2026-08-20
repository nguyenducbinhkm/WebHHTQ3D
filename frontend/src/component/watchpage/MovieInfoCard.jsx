import React from "react";
import PropTypes from "prop-types";
import { FaStar, FaHeart, FaRegHeart } from "react-icons/fa";

export default function MovieInfoCard({
  movieTitle,
  currentEpisode,
  ratingScore,
  voteCountStr,
  releaseDayRaw,
  formatReleaseDay,
  isFavorite,
  onToggleFavorite,
  categories,
}) {
  return (
    <div className="p-5 bg-[#18191c] border border-gray-800 rounded space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-sky-400">
            {movieTitle} - Tập {currentEpisode}
          </h1>
          <p className="text-xs text-gray-400 mt-1">Hoạt hình Trung Quốc</p>
        </div>

        {/* Đánh giá sao */}
        <div className="flex items-center gap-2 bg-[#222] px-3 py-1.5 rounded-lg border border-gray-700">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <FaStar key={i} className="text-sm" />
            ))}
          </div>
          <span className="text-sm font-bold text-gray-200">
            {ratingScore}/5{" "}
            <span className="text-xs text-gray-400 font-normal">
              ({voteCountStr} bình chọn)
            </span>
          </span>
        </div>
      </div>

      {/* Lịch chiếu */}
      <p className="text-sm text-gray-300">
        <strong className="text-gray-100">Lịch chiếu:</strong>{" "}
        {formatReleaseDay(releaseDayRaw)}
      </p>

      {/* Nút Yêu thích */}
      <button
        onClick={onToggleFavorite}
        className={`w-full py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition ${
          isFavorite
            ? "bg-[#b91c1c] hover:bg-red-700 text-white"
            : "bg-gray-800 hover:bg-gray-700 text-gray-200"
        }`}
      >
        {isFavorite ? <FaHeart /> : <FaRegHeart />}
        {isFavorite ? "Bỏ yêu thích" : "Thêm yêu thích"}
      </button>

      {/* Thể loại */}
      <div className="flex items-center gap-2 flex-wrap pt-1">
        <span className="text-sm text-gray-400">Thể loại:</span>
        {categories.length > 0 ? (
          categories.map((cat, index) => (
            <span
              key={cat.id || index}
              className="px-3 py-1 bg-[#262626] border border-gray-700 text-xs rounded-full text-gray-300"
            >
              {typeof cat === "string" ? cat : cat.name || cat.title}
            </span>
          ))
        ) : (
          <span className="text-xs text-gray-500">Đang cập nhật thể loại</span>
        )}
      </div>
    </div>
  );
}

MovieInfoCard.propTypes = {
  movieTitle: PropTypes.string.isRequired,
  currentEpisode: PropTypes.number.isRequired,
  ratingScore: PropTypes.string.isRequired,
  voteCountStr: PropTypes.string.isRequired,
  releaseDayRaw: PropTypes.string.isRequired,
  formatReleaseDay: PropTypes.func.isRequired,
  isFavorite: PropTypes.bool.isRequired,
  onToggleFavorite: PropTypes.func.isRequired,
  categories: PropTypes.array.isRequired,
};
