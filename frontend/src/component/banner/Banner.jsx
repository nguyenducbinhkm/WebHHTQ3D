import React, { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";

// Swiper CSS
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

import BannerSlideItem from "./BannerSlideItem";
import BannerThumbnails from "./BannerThumbnails";

const API_URL = import.meta.env.VITE_API_URL;

const Banner = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);

  const mainSwiperRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

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

  const displayMovies = useMemo(() => {
    return movies
      .filter((movie) => {
        const val = movie.is_banner;
        return val === true || val === "true" || val === "TRUE" || val === 1;
      })
      .slice(0, 5);
  }, [movies]);

  const total = displayMovies.length;

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
        {displayMovies.map((movie, currentIndex) => (
          <SwiperSlide
            key={movie.id || currentIndex}
            className="relative w-full h-full"
          >
            <BannerSlideItem
              movie={movie}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* THUMBNAIL STACKED 5 ẢNH */}
      <BannerThumbnails
        displayMovies={displayMovies}
        activeIndex={activeIndex}
        handleThumbClick={handleThumbClick}
      />

      {/* CSS TÙY CHỈNH CHO THUMBNAIL STAGE */}
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

        .thumb-pos-0 {
          transform: translate(-50%, -50%) translateX(0) scale(1);
          opacity: 1;
          filter: brightness(1);
          z-index: 50;
        }

        .thumb-pos-0.is-active {
          border-color: #fbbf24;
          box-shadow:
            0 0 0 1px rgba(251, 191, 36, 0.95),
            0 0 12px rgba(251, 191, 36, 0.85),
            0 0 26px rgba(245, 158, 11, 0.65),
            0 16px 34px rgba(0, 0, 0, 0.62);
        }

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

        @media (max-width: 1280px) {
          .thumb-stage { width: 620px; max-width: 70vw; height: 104px; }
          .thumb-layer { width: 190px; height: 78px; }
          .thumb-pos--1 { transform: translate(-50%, -50%) translateX(-112px) scale(0.68); }
          .thumb-pos-1 { transform: translate(-50%, -50%) translateX(112px) scale(0.68); }
          .thumb-pos--2 { transform: translate(-50%, -50%) translateX(-182px) scale(0.5); }
          .thumb-pos-2 { transform: translate(-50%, -50%) translateX(182px) scale(0.5); }
        }

        @media (max-width: 900px) {
          .thumb-stage { width: 480px; max-width: 92vw; height: 88px; }
          .thumb-layer { width: 160px; height: 66px; }
          .thumb-pos--1 { transform: translate(-50%, -50%) translateX(-96px) scale(0.68); }
          .thumb-pos-1 { transform: translate(-50%, -50%) translateX(96px) scale(0.68); }
          .thumb-pos--2 { transform: translate(-50%, -50%) translateX(-156px) scale(0.5); }
          .thumb-pos-2 { transform: translate(-50%, -50%) translateX(156px) scale(0.5); }
        }

        @media (max-width: 480px) {
          .thumb-stage { width: 340px; max-width: 92vw; height: 70px; }
          .thumb-layer { width: 130px; height: 54px; border-radius: 10px; }
          .thumb-pos--1 { transform: translate(-50%, -50%) translateX(-78px) scale(0.68); }
          .thumb-pos-1 { transform: translate(-50%, -50%) translateX(78px) scale(0.68); }
          .thumb-pos--2 { transform: translate(-50%, -50%) translateX(-128px) scale(0.5); }
          .thumb-pos-2 { transform: translate(-50%, -50%) translateX(128px) scale(0.5); }
        }
      `}</style>
    </div>
  );
};

export default Banner;
