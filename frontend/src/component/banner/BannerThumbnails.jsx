import React from "react";
import { getPos } from "./bannerUtils";

const BannerThumbnails = ({ displayMovies, activeIndex, handleThumbClick }) => {
  const total = displayMovies.length;

  return (
    <div className="absolute bottom-3 md:bottom-6 left-1/2 -translate-x-1/2 z-30 w-full pointer-events-none">
      <div className="thumb-stage pointer-events-auto mx-auto">
        {displayMovies.map((movie, idx) => {
          const pos = getPos(idx, activeIndex, total);
          const thumbImg =
            movie.backdrop_url || movie.poster_url || "/banner.png";

          return (
            <button
              key={movie.id || idx}
              type="button"
              onClick={() => handleThumbClick(idx)}
              className={`thumb-layer thumb-pos-${pos} ${
                pos === 0 ? "is-active" : ""
              }`}
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
  );
};

export default BannerThumbnails;
