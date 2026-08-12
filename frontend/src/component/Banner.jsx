import React, { useState, useEffect, useMemo } from "react";
import { FaStar, FaStarHalfAlt, FaPlay, FaHeart, FaInfo } from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "axios";

const Banner = () => {
  const [movies, setMovies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // 1. Fetch danh sách phim từ API
  useEffect(() => {
    let isMounted = true;
    axios
      .get("http://127.0.0.1:8000/api/movies")
      .then((res) => {
        if (!isMounted) return;
        const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
        if (data.length > 0) setMovies(data);
      })
      .catch((err) => console.error("Lỗi lấy dữ liệu banner:", err))
      .finally(() => isMounted && setLoading(false));

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Tự động chuyển slide
  useEffect(() => {
    if (movies.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [movies.length]);

  // 3. Lấy dữ liệu phim hiện tại
  const currentMovie = movies[currentIndex] || {};
  const {
    title = "PHIM HOẠT HÌNH 3D",
    english_title,
    episode_info,
    current_episode,
    year = "2026",
    quality = "4K",
    description = "Mô tả phim đang được cập nhật...",
    slug = "",
    genres,
    backdrop_url,
    poster_url,
  } = currentMovie;

  const backdropUrl = backdrop_url || poster_url || "/banner.png";
  const posterUrl = poster_url || backdropUrl;

  const genresList = useMemo(() => {
    if (Array.isArray(genres)) return genres;
    if (typeof genres === "string") return genres.split(",");
    return ["3D Donghua", "Huyền Huyễn"];
  }, [genres]);

  if (loading) {
    return (
      <div className="w-full h-[calc(100vh-56px)] min-h-[550px] bg-[#0b0c0e] flex items-center justify-center text-gray-400 font-medium text-lg">
        Đang tải Banner...
      </div>
    );
  }

  return (
    /* Đã sửa h-[650px] md:h-[720px] thành h-[calc(100vh-56px)] min-h-[600px] để phủ kín màn hình */
    <div className="relative w-full h-[calc(100vh-56px)] min-h-[600px] bg-[#0b0c0e] overflow-hidden text-white select-none">
      {/* Phông Nền Backdrop toàn màn hình */}
      <div
        key={currentIndex}
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out scale-105"
        style={{ backgroundImage: `url('${backdropUrl}')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b0c0e] via-[#0b0c0e]/80 to-transparent w-full lg:w-2/3" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c0e] via-transparent to-transparent" />
      </div>

      {/* Nội Dung Chính */}
      <div className="relative max-w-[1650px] mx-auto h-full px-6 md:px-12 flex items-center justify-between z-10 pb-8">
        {/* Cột Trái: Thông tin phim */}
        <div className="max-w-2xl space-y-5">
          <div>
            <h1
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-wide leading-relaxed text-amber-300 py-2 drop-shadow-2xl"
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

          {/* Đánh giá Sao */}
          <div className="flex items-center space-x-1.5 text-amber-400 text-xl">
            <FaStar />
            <FaStar />
            <FaStar />
            <FaStar />
            <FaStarHalfAlt />
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <span className="bg-red-600 text-white text-sm font-bold px-3 py-1 rounded shadow-md">
              {episode_info || current_episode || "Tập mới"}
            </span>
            <span className="border border-gray-600 text-gray-300 text-sm font-semibold px-3 py-1 rounded bg-black/50 backdrop-blur-sm">
              {year}
            </span>
            <span className="border border-gray-600 text-gray-300 text-sm font-semibold px-3 py-1 rounded bg-black/50 backdrop-blur-sm">
              {quality}
            </span>
          </div>

          {/* Thể Loại */}
          <div className="flex flex-wrap gap-2.5 pt-1">
            {genresList.map((item, idx) => (
              <span
                key={idx}
                className="bg-neutral-800/80 text-gray-200 text-xs md:text-sm px-3.5 py-1.5 rounded-lg border border-neutral-700/60 backdrop-blur-sm font-medium"
              >
                {item.trim()}
              </span>
            ))}
          </div>

          {/* Mô Tả */}
          <p className="text-gray-300 text-sm md:text-base leading-relaxed line-clamp-4 max-w-xl opacity-90">
            {description}
          </p>

          {/* Nút Action */}
          <div className="flex items-center gap-5 pt-3">
            <Link
              to={`/watch/${slug}`}
              className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-xl transition transform hover:scale-105 active:scale-95 shrink-0"
              title="Xem Phim"
            >
              <FaPlay className="text-xl ml-1" />
            </Link>

            <div className="flex items-center gap-6 bg-white/10 backdrop-blur-md px-6 py-3.5 rounded-full border border-white/15 text-gray-200">
              <button
                className="hover:text-red-500 transition"
                title="Thêm vào yêu thích"
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

        {/* Cột Phải: Poster Đứng Phóng To */}
        <div className="hidden lg:block w-[320px] h-[450px] xl:w-[350px] xl:h-[490px] rounded-2xl overflow-hidden shadow-2xl border border-white/15 shrink-0">
          <img
            key={currentIndex}
            src={posterUrl}
            alt={title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
          />
        </div>
      </div>

      {/* Dots chuyển slide */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2.5 z-20">
        {movies.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? "w-10 bg-red-600"
                : "w-2.5 bg-gray-500/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Banner;
