import React, { useState, useEffect } from "react";
import { FaStar, FaStarHalfAlt, FaPlay, FaHeart, FaInfo } from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";

// Import CSS của Swiper
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

const Banner = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);

  // Hàm helper để gán màu sắc đẹp mắt cho từng thể loại phim
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
    // Mặc định cho các thể loại khác
    return "text-sky-400 border-sky-500/40 bg-sky-500/10 hover:bg-sky-500/20";
  };

  // Fetch danh sách phim và load danh sách yêu thích từ localStorage
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

    const savedFavorites =
      JSON.parse(localStorage.getItem("favorite_movies")) || [];
    setFavorites(savedFavorites);

    return () => {
      isMounted = false;
    };
  }, []);

  // Hàm xử lý Thêm/Xóa yêu thích
  const toggleFavorite = (movie, e) => {
    e.preventDefault();
    let updatedFavorites;
    const isExist = favorites.some(
      (fav) => (fav.id || fav.slug) === (movie.id || movie.slug),
    );

    if (isExist) {
      updatedFavorites = favorites.filter(
        (fav) => (fav.id || fav.slug) !== (movie.id || movie.slug),
      );
    } else {
      updatedFavorites = [...favorites, movie];
    }

    setFavorites(updatedFavorites);
    localStorage.setItem("favorite_movies", JSON.stringify(updatedFavorites));
  };

  if (loading) {
    return (
      <div className="w-full h-[calc(100vh-56px)] min-h-[550px] bg-[#0b0c0e] flex items-center justify-center text-gray-400 font-medium text-lg">
        Đang tải Banner...
      </div>
    );
  }

  return (
    <div className="relative w-full h-[calc(100vh-56px)] min-h-[600px] bg-[#0b0c0e] overflow-hidden text-white select-none banner-swiper-container">
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        effect={"fade"}
        fadeEffect={{ crossFade: true }}
        spaceBetween={0}
        slidesPerView={1}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
          el: ".custom-swiper-pagination",
        }}
        speed={1000}
        className="w-full h-full"
      >
        {movies.map((movie, currentIndex) => {
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

          // Logic xử lý hiển thị số tập chuẩn
          let episodeLabel = "Tập mới";
          if (status === "trailer") {
            episodeLabel = "Trailer";
          } else if (total_ep > 0 && total_ep > current_ep) {
            episodeLabel = `Tập ${current_ep}/${total_ep}`;
          } else if (current_ep > 0) {
            episodeLabel = `Tập ${current_ep}`;
          }

          // Xử lý danh sách thể loại linh hoạt
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
              {/* Phông nền Backdrop */}
              <div
                className="absolute inset-0 bg-cover bg-center scale-105"
                style={{ backgroundImage: `url('${backdropUrl}')` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#0b0c0e] via-[#0b0c0e]/80 to-transparent w-full lg:w-2/3" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c0e] via-transparent to-transparent" />
              </div>

              {/* Nội dung Banner */}
              <div className="relative max-w-[1650px] mx-auto h-full px-6 md:px-12 flex items-center justify-between z-10 pb-12">
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

                  {/* Đánh giá sao */}
                  <div className="flex items-center space-x-1.5 text-amber-400 text-xl">
                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <FaStarHalfAlt />
                  </div>

                  {/* Badges thông tin */}
                  <div className="flex flex-wrap items-center gap-2.5 pt-1">
                    <span className="bg-red-600 text-white text-sm font-bold px-3 py-1 rounded shadow-md">
                      {episodeLabel}
                    </span>
                    <span className="border border-gray-600 text-gray-300 text-sm font-semibold px-3 py-1 rounded bg-black/50 backdrop-blur-sm">
                      {year}
                    </span>
                    <span className="border border-gray-600 text-gray-300 text-sm font-semibold px-3 py-1 rounded bg-black/50 backdrop-blur-sm">
                      {quality}
                    </span>
                  </div>

                  {/* Thể loại phim có màu sắc riêng và chuyển hướng sang CategoryPage */}
                  <div className="flex flex-wrap gap-2.5 pt-1">
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
                            className={`text-xs md:text-sm px-3.5 py-1.5 rounded-lg border backdrop-blur-sm font-semibold transition duration-200 ${colorClass}`}
                          >
                            {displayTitle}
                          </Link>
                        );
                      })
                    ) : (
                      <span className="text-sky-400 border-sky-500/40 bg-sky-500/10 text-xs md:text-sm px-3.5 py-1.5 rounded-lg border backdrop-blur-sm font-semibold">
                        3D Donghua
                      </span>
                    )}
                  </div>

                  {/* Mô tả chuẩn từ DB */}
                  <p className="text-gray-300 text-sm md:text-base leading-relaxed line-clamp-4 max-w-xl opacity-90">
                    {description}
                  </p>

                  {/* Nút hành động */}
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
                        onClick={(e) => toggleFavorite(movie, e)}
                        className={`transition ${isFavorite ? "text-red-500 scale-110" : "hover:text-red-500"}`}
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

                {/* Poster đứng bên phải */}
                <div className="hidden lg:block w-[320px] h-[450px] xl:w-[350px] xl:h-[490px] rounded-2xl overflow-hidden shadow-2xl border border-white/15 shrink-0">
                  <img
                    src={posterUrl}
                    alt={title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* Thanh Pagination vạch đỏ */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2.5 z-20 custom-swiper-pagination"></div>

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
      `}</style>
    </div>
  );
};

export default Banner;
