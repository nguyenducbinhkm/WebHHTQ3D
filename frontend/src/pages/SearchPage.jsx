import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import { FaPlay, FaFrown, FaFire } from "react-icons/fa";

// Lấy base URL từ biến môi trường của Vite
const API_URL = import.meta.env.VITE_API_URL;

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const [searchResults, setSearchResults] = useState([]);
  const [recommendedMovies, setRecommendedMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    Promise.all([
      axios.get(`${API_URL}/api/movies/search?q=${encodeURIComponent(query)}`),
      axios.get(`${API_URL}/api/movies/top-hot`),
    ])
      .then(([searchRes, topRes]) => {
        const searchData = Array.isArray(searchRes.data)
          ? searchRes.data
          : searchRes.data?.data || searchRes.data?.movies || [];

        const topData = Array.isArray(topRes.data)
          ? topRes.data
          : topRes.data?.data || topRes.data?.movies || [];

        setSearchResults(searchData);

        // Lọc bỏ các phim đã xuất hiện trong kết quả tìm kiếm và lấy đúng 12 phim
        const searchIdentifiers = new Set(
          searchData.map((m) => m.slug || m.id),
        );
        const filteredRecommendations = topData
          .filter((m) => {
            const mSlug = m.slug || m.id;
            return !searchIdentifiers.has(mSlug);
          })
          .slice(0, 12);

        setRecommendedMovies(filteredRecommendations);
      })
      .catch((err) => {
        console.error("Lỗi khi kết nối API:", err);
        setSearchResults([]);
        setRecommendedMovies([]);
      })
      .finally(() => setLoading(false));
  }, [query]);

  // Component hiển thị thẻ phim với xử lý bóc tách object an toàn
  const MovieCard = ({ movie }) => {
    // Đề phòng trường hợp dữ liệu bị bọc trong object con (ví dụ: row mapping)
    const data = movie.movies || movie.movie || movie || {};

    const slug = data.slug || data.id || "";
    const title = data.title || data.name || "Đang cập nhật";
    const image =
      data.poster_url || data.thumb_url || data.backdrop_url || "/banner.png";

    return (
      <Link
        to={`/watch/${slug}`}
        className="group relative bg-[#1a1c20] rounded border border-gray-800/80 hover:border-sky-500/80 transition-all duration-300 overflow-hidden flex flex-col shadow-md hover:shadow-sky-500/10"
      >
        <div className="relative aspect-[2/3] w-full overflow-hidden bg-gray-900">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.src = "/banner.png";
            }}
          />
          <span className="absolute top-2 left-2 bg-red-600/95 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
            {data.status || data.current_episode || "FULL"}
          </span>
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="w-10 h-10 bg-sky-500 rounded-full flex items-center justify-center text-white shadow-lg transform group-hover:scale-110 transition-transform">
              <FaPlay className="ml-0.5 text-xs" />
            </div>
          </div>
        </div>
        <div className="p-2.5 flex-1 flex flex-col justify-center">
          <h3 className="text-sm font-semibold text-gray-200 group-hover:text-sky-400 line-clamp-1 transition-colors">
            {title}
          </h3>
        </div>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-[#121316] text-white pt-6">
      <div className="px-4 md:px-10 py-6">
        <div className="mb-6 border-b border-gray-800 pb-3 flex items-baseline justify-between">
          <h1 className="text-xl md:text-2xl font-bold text-gray-100 tracking-wide">
            Tìm Kiếm <span className="text-sky-400">"{query}"</span>
          </h1>
          <span className="text-xs text-gray-400">
            Tìm thấy <b className="text-amber-400">{searchResults.length}</b>{" "}
            kết quả
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-sm">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <>
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-12">
                {searchResults.map((movie, index) => (
                  <MovieCard
                    key={`search-${movie.id || movie.slug || index}`}
                    movie={movie}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 bg-[#1a1c20] rounded-lg border border-gray-800/60 mb-12 text-center px-4">
                <FaFrown className="text-4xl text-amber-500 mb-2" />
                <h2 className="text-base font-semibold text-gray-200">
                  Không tìm thấy phim trùng khớp với từ khóa "{query}"
                </h2>
              </div>
            )}

            {recommendedMovies.length > 0 && (
              <div className="mt-8 border-t border-gray-800/80 pt-6">
                <div className="flex items-center gap-2 mb-5">
                  <FaFire className="text-amber-500 text-lg" />
                  <h2 className="text-lg md:text-xl font-bold text-gray-100 uppercase tracking-wide">
                    Có Thể Bạn Cũng Thích
                  </h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {recommendedMovies.map((movie, index) => (
                    <MovieCard
                      key={`rec-${movie.id || movie.slug || index}`}
                      movie={movie}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
