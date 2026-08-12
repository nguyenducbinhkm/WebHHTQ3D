import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import Header from "./Header";
import { FaPlay, FaFrown } from "react-icons/fa";

export default function CategoryPage() {
  const { slug } = useParams();
  const [movies, setMovies] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Gọi đúng endpoint đã khai báo trong main.py (không có /movies ở cuối)
    axios
      .get(`http://127.0.0.1:8000/api/categories/${slug}`)
      .then((res) => {
        const data = res.data;
        // Backend trả về dạng { id, name, slug, movies: [...] }
        setMovies(data.movies || []);
        setCategoryName(data.name || slug);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi lấy danh sách phim theo thể loại:", err);
        setMovies([]);
        setCategoryName(slug);
        setLoading(false);
      });
  }, [slug]);

  return (
    <div className="bg-[#121316] min-h-screen text-white pb-12">
      <main className="max-w-[1650px] mx-auto px-4 md:px-10 py-6">
        <div className="mb-6 border-b border-gray-800 pb-3 flex items-baseline justify-between">
          <h1 className="text-xl md:text-2xl font-bold text-gray-100 tracking-wide capitalize">
            Thể loại: <span className="text-sky-400">{categoryName}</span>
          </h1>
          <span className="text-xs text-gray-400">
            Tìm thấy <b className="text-amber-400">{movies.length}</b> phim
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-sm">Đang tải danh sách phim...</p>
          </div>
        ) : movies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {movies.map((movie) => (
              <Link
                key={movie.id || movie.slug}
                to={`/watch/${movie.slug}`}
                className="group relative bg-[#1a1c20] rounded border border-gray-800/80 hover:border-sky-500/80 transition-all duration-300 overflow-hidden flex flex-col shadow-md hover:shadow-sky-500/10"
              >
                <div className="relative aspect-[2/3] w-full overflow-hidden bg-gray-900">
                  <img
                    src={
                      movie.poster_url || movie.backdrop_url || "/banner.png"
                    }
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2 left-2 bg-red-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                    {movie.status || "FULL"}
                  </span>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-10 h-10 bg-sky-500 rounded-full flex items-center justify-center text-white shadow-lg transform group-hover:scale-110 transition-transform">
                      <FaPlay className="ml-0.5 text-xs" />
                    </div>
                  </div>
                </div>
                <div className="p-2.5 flex-1 flex flex-col justify-center">
                  <h3 className="text-sm font-semibold text-gray-200 group-hover:text-sky-400 line-clamp-1 transition-colors">
                    {movie.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 bg-[#1a1c20] rounded-lg border border-gray-800/60 text-center px-4">
            <FaFrown className="text-4xl text-amber-500 mb-2" />
            <h2 className="text-base font-semibold text-gray-200">
              Chưa có bộ phim nào thuộc thể loại này.
            </h2>
          </div>
        )}
      </main>
    </div>
  );
}
