import React, { useState, useEffect, useMemo, useRef } from "react";
import { FaStar, FaStarHalfAlt, FaPlay, FaHeart, FaInfo } from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";

// Swiper CSS
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

const API_URL = import.meta.env.VITE_API_URL;

const Banner = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);

  // Main banner refs + active index
  const mainSwiperRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Lấy màu badge theo thể loại
  const getCategoryColor = (name) => {
    const lowerName = name ? name.toLowerCase() : "";
    if (lowerName.includes("cổ trang") || lowerName.includes("hiện đại")) {
      return "text-emerald-400 border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20";
    }
    if (
      lowerName.includes("đô thị") ||
      lowerName.includes("kiếm hiệp") ||
      lowerName.includes("tu tiên")
    ) {
      return "text-amber-400 border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20";
    }
    if (lowerName.includes("hài hước") || lowerName.includes("xuyên không")) {
      return "text-cyan-400 border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20";
    }
    if (lowerName.includes("tiên hiệp")) {
      return "text-rose-400 border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20";
    }
    if (lowerName.includes("trùng sinh")) {
      return "text-purple-400 border-purple-500/40 bg-purple-500/10 hover:bg-purple-500/20";
    }
    return "text-sky-400 border-sky-500/40 bg-sky-500/10 hover:bg-sky-500/20";
  };

  // Fetch data
  useEffect(() => {
    let isMounted = true;

    axios
      .get(`${API_URL}/api/movies`)
      .then((res) => {
        if (!isMounted) return;
        const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
        if (data.length > 0) setMovies(data);
      })
      .catch((err) => console.error("Lỗi lấy dữ liệu banner:", err))
      .finally(() => isMounted && setLoading(false));

    const savedFavorites =
      JSON.parse(localStorage.getItem("favorite_movies")) || [];
    setFavorites(savedFavorites);

    return () => {
      isMounted = false;
    };
  }, []);

  // Lọc chỉ lấy các phim có is_banner là true và giới hạn tối đa đúng 5 phim
  // Lọc lấy các phim có is_banner là true (hỗ trợ cả boolean, string 'true', hoặc số 1)
  const displayMovies = useMemo(() => {
    return movies
      .filter((movie) => {
        const val = movie.is_banner;
        return val === true || val === "true" || val === "TRUE" || val === 1;
      })
      .slice(0, 5);
  }, [movies]);

  const total = displayMovies.length;

  // tránh % âm
  const norm = (n, m) => ((n % m) + m) % m;

  // Vị trí tương đối quanh ảnh active: -2, -1, 0, 1, 2
  const getPos = (idx, active, len) => {
    if (len <= 1) return 0;
    const d = norm(idx - active, len);
    if (d === 0) return 0;
    if (d === 1) return 1;
    if (d === 2) return 2;
    if (d === len - 1) return -1;
    return -2;
  };

  const toggleFavorite = (movie, e) => {
    e.preventDefault();

    const isExist = favorites.some(
      (fav) => (fav.id || fav.slug) === (movie.id || movie.slug),
    );

    const updatedFavorites = isExist
      ? favorites.filter(
          (fav) => (fav.id || fav.slug) !== (movie.id || movie.slug),
        )
      : [...favorites, movie];

    setFavorites(updatedFavorites);
    localStorage.setItem("favorite_movies", JSON.stringify(updatedFavorites));
  };

  // Click thumb -> nhảy về giữa + sync main
  const handleThumbClick = (idx) => {
    setActiveIndex(idx);
    if (mainSwiperRef.current) {
      mainSwiperRef.current.slideToLoop(idx, 900);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-[50vh] min-h-[420px] bg-[#0b0c0e] flex items-center justify-center text-gray-400 font-medium text-lg">
        Đang tải Banner...
      </div>
    );
  }

  if (!total) return null;

  return (
    <div className="relative w-full h-[360px] min-h-[360px] md:h-[62vh] md:min-h-[560px] bg-[#0b0c0e] overflow-hidden text-white select-none banner-swiper-container flex flex-col justify-between">
      {/* SWIPER CHÍNH */}
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        slidesPerView={1}
        loop={true}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={false}
        speed={1000}
        onSwiper={(sw) => (mainSwiperRef.current = sw)}
        onSlideChange={(sw) => {
          const real = sw.realIndex % total;
          setActiveIndex(real);
        }}
        className="w-full h-full absolute inset-0"
      >
        {displayMovies.map((movie, currentIndex) => {
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
            <SwiperSlide
              key={movie.id || currentIndex}
              className="relative w-full h-full"
            >
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
                {/* Tự động tăng mt lên [90px] khi tên phim ngắn (1 dòng) để đẩy toàn bộ cụm xuống thấp hơn */}
                <div
                  className={`max-w-2xl flex flex-col space-y-4 self-start ${title && title.length <= 15 ? "mt-[90px]" : "mt-[55px]"}`}
                >
                  {/* Tiêu đề & Tên tiếng Anh */}
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

                  {/* Đánh giá sao */}
                  <div className="flex items-center space-x-1.5 text-amber-400 text-xl ">
                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <FaStarHalfAlt />
                  </div>

                  {/* Nhãn tập, năm, chất lượng và Thể loại chung một hàng */}
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
                        const catName =
                          typeof item === "object" ? item.name : item;
                        const catSlug =
                          typeof item === "object"
                            ? item.slug
                            : typeof item === "string"
                              ? item.toLowerCase().replace(/\s+/g, "-")
                              : "";
                        const displayTitle =
                          typeof catName === "string"
                            ? catName.trim()
                            : catName;
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

                  {/* Mô tả phim */}
                  <p className="text-white text-sm md:text-base leading-relaxed line-clamp-4 max-w-[400px] text-justify pt-1">
                    {description && description.length > 180
                      ? `${description.substring(0, 180).trim()}...`
                      : description}
                  </p>

                  {/* Nút hành động */}
                  <div className="flex items-center gap-5 pt-2">
                    <Link
                      to={`/watch/${slug}`}
                      className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-xl transition transform hover:scale-105 active:scale-95 shrink-0"
                      title="Xem Phim"
                    >
                      <FaPlay className="text-xl ml-1" />
                    </Link>

                    <div className="flex items-center gap-6 bg-white/10 backdrop-blur-md px-6 py-3.5 rounded-full border border-white/15 text-gray-200">
                      <button
                        onClick={(e) => toggleFavorite(movie, e)}
                        className={`transition ${
                          isFavorite
                            ? "text-red-500 scale-110"
                            : "hover:text-red-500"
                        }`}
                        title={
                          isFavorite ? "Bỏ yêu thích" : "Thêm vào yêu thích"
                        }
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
                  {/* Tiêu đề + poster nhỏ góc phải */}
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
                            const catName =
                              typeof item === "object" ? item.name : item;
                            const catSlug =
                              typeof item === "object"
                                ? item.slug
                                : typeof item === "string"
                                  ? item.toLowerCase().replace(/\s+/g, "-")
                                  : "";
                            const displayTitle =
                              typeof catName === "string"
                                ? catName.trim()
                                : catName;
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

                {/* Nút play + yêu thích + info */}
                <div className="flex items-center gap-4 mt-3">
                  <Link
                    to={`/watch/${slug}`}
                    className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-xl transition transform active:scale-95 shrink-0"
                    title="Xem Phim"
                  >
                    <FaPlay className="text-base ml-0.5" />
                  </Link>

                  <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-full border border-white/15 text-gray-200">
                    <button
                      onClick={(e) => toggleFavorite(movie, e)}
                      className={`transition ${
                        isFavorite
                          ? "text-red-500 scale-110"
                          : "hover:text-red-500"
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
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* THUMBNAIL STACKED 5 ẢNH - DÙNG CHUNG CHO CẢ MOBILE VÀ DESKTOP */}
      <div className="absolute bottom-3 md:bottom-6 left-1/2 -translate-x-1/2 z-30 w-full pointer-events-none">
        <div className="thumb-stage pointer-events-auto mx-auto">
          {displayMovies.map((movie, idx) => {
            const pos = getPos(idx, activeIndex, total); // -2,-1,0,1,2
            const thumbImg =
              movie.backdrop_url || movie.poster_url || "/banner.png";

            return (
              <button
                key={movie.id || idx}
                type="button"
                onClick={() => handleThumbClick(idx)}
                className={`thumb-layer thumb-pos-${pos} ${pos === 0 ? "is-active" : ""}`}
                aria-label={`Chọn phim ${movie.title || idx + 1}`}
              >
                <img
                  src={thumbImg}
                  alt={movie.title || "thumbnail"}
                  className="thumb-img"
                />
              </button>
            );
          })}
        </div>
      </div>

      <style>{`
        .custom-swiper-pagination .swiper-pagination-bullet {
          height: 8px;
          border-radius: 9999px;
          background-color: rgba(107, 114, 128, 0.6);
          width: 10px;
          transition: all 0.3s ease-in-out;
          opacity: 1;
          cursor: pointer;
        }
        .custom-swiper-pagination .swiper-pagination-bullet-active {
          width: 40px;
          background-color: #dc2626 !important;
        }

        /* ====== STACKED THUMB STAGE (DESKTOP) ====== */
        .thumb-stage {
          position: relative;
          width: 660px;
          max-width: 66vw;
          height: 110px;
        }

        .thumb-layer {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 210px;
          height: 86px;
          border-radius: 12px;
          overflow: hidden;
          border: 2px solid transparent;
          background: rgba(0, 0, 0, 0.45);
          transform-origin: center center;
          transition:
            transform 620ms cubic-bezier(0.22, 1, 0.36, 1),
            opacity 420ms ease,
            filter 420ms ease,
            box-shadow 420ms ease,
            border-color 420ms ease;
          cursor: pointer;
          will-change: transform, opacity;
        }

        .thumb-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        /* Ảnh giữa */
        .thumb-pos-0 {
          transform: translate(-50%, -50%) translateX(0) scale(1);
          opacity: 1;
          filter: brightness(1);
          z-index: 50;
        }

        /* Viền vàng sáng + đổ bóng */
        .thumb-pos-0.is-active {
          border-color: #fbbf24;
          box-shadow:
            0 0 0 1px rgba(251, 191, 36, 0.95),
            0 0 12px rgba(251, 191, 36, 0.85),
            0 0 26px rgba(245, 158, 11, 0.65),
            0 16px 34px rgba(0, 0, 0, 0.62);
        }

        /* 2 ảnh cạnh */
        .thumb-pos--1 {
          transform: translate(-50%, -50%) translateX(-125px) scale(0.68);
          opacity: 0.78;
          filter: brightness(0.72);
          z-index: 30;
        }

        .thumb-pos-1 {
          transform: translate(-50%, -50%) translateX(125px) scale(0.68);
          opacity: 0.78;
          filter: brightness(0.72);
          z-index: 30;
        }

        /* 2 ảnh ngoài cùng */
        .thumb-pos--2 {
          transform: translate(-50%, -50%) translateX(-205px) scale(0.5);
          opacity: 0.45;
          filter: brightness(0.55);
          z-index: 10;
        }

        .thumb-pos-2 {
          transform: translate(-50%, -50%) translateX(205px) scale(0.5);
          opacity: 0.45;
          filter: brightness(0.55);
          z-index: 10;
        }

        /* Responsive */
        @media (max-width: 1280px) {
          .thumb-stage {
            width: 620px;
            max-width: 70vw;
            height: 104px;
          }
          .thumb-layer {
            width: 190px;
            height: 78px;
          }
          .thumb-pos--1 {
            transform: translate(-50%, -50%) translateX(-112px) scale(0.68);
          }
          .thumb-pos-1 {
            transform: translate(-50%, -50%) translateX(112px) scale(0.68);
          }
          .thumb-pos--2 {
            transform: translate(-50%, -50%) translateX(-182px) scale(0.5);
          }
          .thumb-pos-2 {
            transform: translate(-50%, -50%) translateX(182px) scale(0.5);
          }
        }

        @media (max-width: 900px) {
          .thumb-stage {
            width: 480px;
            max-width: 92vw;
            height: 88px;
          }
          .thumb-layer {
            width: 160px;
            height: 66px;
          }
          .thumb-pos--1 {
            transform: translate(-50%, -50%) translateX(-96px) scale(0.68);
          }
          .thumb-pos-1 {
            transform: translate(-50%, -50%) translateX(96px) scale(0.68);
          }
          .thumb-pos--2 {
            transform: translate(-50%, -50%) translateX(-156px) scale(0.5);
          }
          .thumb-pos-2 {
            transform: translate(-50%, -50%) translateX(156px) scale(0.5);
          }
        }

        @media (max-width: 480px) {
          .thumb-stage {
            width: 340px;
            max-width: 92vw;
            height: 70px;
          }
          .thumb-layer {
            width: 130px;
            height: 54px;
            border-radius: 10px;
          }
          .thumb-pos--1 {
            transform: translate(-50%, -50%) translateX(-78px) scale(0.68);
          }
          .thumb-pos-1 {
            transform: translate(-50%, -50%) translateX(78px) scale(0.68);
          }
          .thumb-pos--2 {
            transform: translate(-50%, -50%) translateX(-128px) scale(0.5);
          }
          .thumb-pos-2 {
            transform: translate(-50%, -50%) translateX(128px) scale(0.5);
          }
        }
      `}</style>
    </div>
  );
};

export default Banner;
