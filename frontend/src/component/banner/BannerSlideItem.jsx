import React from "react";
import { FaStar, FaStarHalfAlt, FaPlay, FaHeart, FaInfo } from "react-icons/fa";
import { Link } from "react-router-dom";
import { getCategoryColor } from "./bannerUtils";

const BannerSlideItem = ({ movie, favorites, toggleFavorite }) => {
  const {
    title = "PHIM HOẠT HÌNH 3D",
    english_title,
    current_ep = 0,
    total_ep = 0,
    status,
    year = "2026",
    quality = "4K",
    description = "Mô tả phim đang được cập nhật...",
    slug = "",
    categories,
    genres,
    backdrop_url,
    poster_url,
  } = movie;

  const backdropUrl = backdrop_url || poster_url || "/banner.png";
  const posterUrl = poster_url || backdropUrl;

  let episodeLabel = "Tập mới";
  if (status === "trailer") {
    episodeLabel = "Trailer";
  } else if (total_ep > 0 && total_ep > current_ep) {
    episodeLabel = `Tập ${current_ep}/${total_ep}`;
  } else if (current_ep > 0) {
    episodeLabel = `Tập ${current_ep}`;
  }

  const rawCategories = categories || genres || [];
  const categoriesList = Array.isArray(rawCategories)
    ? rawCategories
    : typeof rawCategories === "string"
      ? rawCategories.split(",")
      : [];

  const isFavorite = favorites.some(
    (fav) => (fav.id || fav.slug) === (movie.id || movie.slug),
  );

  return (
    <div className="relative w-full h-full">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-105"
        style={{ backgroundImage: `url('${backdropUrl}')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b0c0e] via-[#0b0c0e]/80 to-transparent w-full lg:w-2/3" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c0e] via-transparent to-transparent" />
      </div>

      {/* ============ DESKTOP / TABLET CONTENT ============ */}
      <div className="hidden md:flex relative max-w-[1650px] mx-auto h-full px-6 md:px-12 items-center justify-between z-10 pb-20">
        <div
          className={`max-w-2xl flex flex-col space-y-4 self-start ${
            title && title.length <= 15 ? "mt-[90px]" : "mt-[55px]"
          }`}
        >
          <div>
            <h1
              className="text-5xl lg:text-7xl xl:text-8xl font-bold tracking-wide leading-tight text-amber-300 py-1 drop-shadow-2xl mb-2"
              style={{
                fontFamily: "'Charm', cursive",
                textShadow:
                  "0 0 25px rgba(245, 158, 11, 0.5), 0 4px 12px rgba(0, 0, 0, 0.95)",
              }}
            >
              {title}
            </h1>
            {english_title && (
              <p className="text-amber-200/80 text-lg md:text-xl mt-1 font-medium italic">
                {english_title}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-1.5 text-amber-400 text-xl">
            <FaStar />
            <FaStar />
            <FaStar />
            <FaStar />
            <FaStarHalfAlt />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="bg-red-600 text-white text-sm font-bold px-3 py-1 rounded shadow-md">
              {episodeLabel}
            </span>
            <span className="border border-gray-600 text-gray-300 text-sm font-semibold px-3 py-1 rounded bg-black/50 backdrop-blur-sm">
              {year}
            </span>
            <span className="border border-gray-600 text-gray-300 text-sm font-semibold px-3 py-1 rounded bg-black/50 backdrop-blur-sm">
              {quality}
            </span>

            {categoriesList.length > 0 ? (
              categoriesList.map((item, idx) => {
                const catName = typeof item === "object" ? item.name : item;
                const catSlug =
                  typeof item === "object"
                    ? item.slug
                    : typeof item === "string"
                      ? item.toLowerCase().replace(/\s+/g, "-")
                      : "";
                const displayTitle =
                  typeof catName === "string" ? catName.trim() : catName;
                const colorClass = getCategoryColor(displayTitle);

                return (
                  <Link
                    key={idx}
                    to={`/the-loai/${catSlug}`}
                    className={`text-xs md:text-sm px-3.5 py-1 rounded-lg border backdrop-blur-sm font-semibold transition duration-200 ${colorClass}`}
                  >
                    {displayTitle}
                  </Link>
                );
              })
            ) : (
              <span className="text-sky-400 border-sky-500/40 bg-sky-500/10 text-xs md:text-sm px-3.5 py-1 rounded-lg border backdrop-blur-sm font-semibold">
                3D Donghua
              </span>
            )}
          </div>

          <p className="text-white text-sm md:text-base leading-relaxed line-clamp-4 max-w-[400px] text-justify pt-1">
            {description && description.length > 180
              ? `${description.substring(0, 180).trim()}...`
              : description}
          </p>

          <div className="flex items-center gap-5 pt-2">
            <Link
              to={`/watch/${slug}`}
              className="w-16 h-16 rounded-full bg-[#fae19d] hover:bg-[#ffecb3] text-[#1a1a1a] flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-[0_0_25px_rgba(250,225,157,0.5)] shrink-0"
            >
              <FaPlay className="text-xl ml-1" />
            </Link>

            <div className="flex items-center gap-6 bg-white/10 backdrop-blur-md px-6 py-3.5 rounded-full border border-white/15 text-gray-200 transition-all duration-300 hover:border-white hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]">
              <button
                onClick={(e) => toggleFavorite(movie, e)}
                className={`transition ${
                  isFavorite ? "text-red-500 scale-110" : "hover:text-red-500"
                }`}
                title={isFavorite ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
              >
                <FaHeart className="text-lg" />
              </button>
              <div className="w-[1px] h-5 bg-gray-500" />
              <Link
                to={`/watch/${slug}`}
                className="hover:text-sky-400 transition flex items-center"
                title="Xem thông tin chi tiết"
              >
                <FaInfo className="text-lg" />
              </Link>
            </div>
          </div>
        </div>

        {/* Poster bên phải */}
        <div className="hidden lg:block self-start mt-[28px] w-[360px] h-[420px] xl:w-[320px] xl:h-[490px] rounded-2xl overflow-hidden shadow-2xl border border-white/15 shrink-0">
          <img
            src={posterUrl}
            alt={title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
          />
        </div>
      </div>

      {/* ============ MOBILE CONTENT ============ */}
      <div className="flex md:hidden relative h-full px-4 pt-4 pb-20 z-10 flex-col">
        <div>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0 pr-1">
              <h1
                className="text-2xl font-bold leading-tight text-amber-300 drop-shadow-lg"
                style={{
                  fontFamily: "'Charm', cursive",
                  textShadow:
                    "0 0 15px rgba(245, 158, 11, 0.5), 0 2px 8px rgba(0, 0, 0, 0.9)",
                }}
              >
                {title}
              </h1>

              <div className="flex items-center space-x-1 text-amber-400 text-sm mt-1.5">
                <FaStar />
                <FaStar />
                <FaStar />
                <FaStar />
                <FaStarHalfAlt />
              </div>

              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                <span className="bg-red-600 text-white text-[11px] font-bold px-2.5 py-1 rounded shadow-md">
                  {episodeLabel}
                </span>
                <span className="border border-gray-600 text-gray-300 text-[11px] font-semibold px-2.5 py-1 rounded bg-black/50 backdrop-blur-sm">
                  {year}
                </span>
                <span className="border border-gray-600 text-gray-300 text-[11px] font-semibold px-2.5 py-1 rounded bg-black/50 backdrop-blur-sm">
                  {quality}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {categoriesList.length > 0 ? (
                  categoriesList.slice(0, 2).map((item, idx) => {
                    const catName = typeof item === "object" ? item.name : item;
                    const catSlug =
                      typeof item === "object"
                        ? item.slug
                        : typeof item === "string"
                          ? item.toLowerCase().replace(/\s+/g, "-")
                          : "";
                    const displayTitle =
                      typeof catName === "string" ? catName.trim() : catName;
                    const colorClass = getCategoryColor(displayTitle);

                    return (
                      <Link
                        key={idx}
                        to={`/the-loai/${catSlug}`}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border backdrop-blur-sm font-semibold transition duration-200 ${colorClass}`}
                      >
                        {displayTitle}
                      </Link>
                    );
                  })
                ) : (
                  <span className="text-sky-400 border-sky-500/40 bg-sky-500/10 text-[11px] px-2.5 py-1 rounded-lg border backdrop-blur-sm font-semibold">
                    3D Donghua
                  </span>
                )}
              </div>
            </div>

            <div className="w-[100px] h-[144px] rounded-lg overflow-hidden shadow-xl border border-white/15 shrink-0">
              <img
                src={posterUrl}
                alt={title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {english_title && (
            <p className="text-gray-300 text-sm mt-2 line-clamp-1 opacity-90">
              {english_title}
            </p>
          )}
        </div>

        <div className="flex items-center gap-4 mt-3">
          <Link
            to={`/watch/${slug}`}
            className="w-12 h-12 rounded-full bg-[#fae19d] hover:bg-[#ffecb3] text-[#1a1a1a] flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-[0_0_20px_rgba(250,225,157,0.5)] shrink-0"
            title="Xem Phim"
          >
            <FaPlay className="text-base ml-0.5" />
          </Link>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-full border border-white/15 text-gray-200 transition-all duration-300 hover:border-white hover:shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            <button
              onClick={(e) => toggleFavorite(movie, e)}
              className={`transition ${
                isFavorite ? "text-red-500 scale-110" : "hover:text-red-500"
              }`}
              title={isFavorite ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
            >
              <FaHeart className="text-base" />
            </button>
            <div className="w-[1px] h-4 bg-gray-500" />
            <Link
              to={`/watch/${slug}`}
              className="hover:text-sky-400 transition flex items-center"
              title="Xem thông tin chi tiết"
            >
              <FaInfo className="text-base" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerSlideItem;
