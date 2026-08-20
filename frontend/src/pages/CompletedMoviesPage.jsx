import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:8000";

export default function CompletedMoviesPage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompletedMovies = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${API_URL}/api/movies/status/completed`,
        );
        setMovies(response.data || []);
      } catch (err) {
        console.error("Lỗi lấy danh sách phim hoàn thành:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedMovies();
  }, []);

  return (
    <div className="bg-[#121315] min-h-screen text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white border-l-4 border-sky-500 pl-3">
            Phim Đã Hoàn Thành
          </h1>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">
            Đang tải dữ liệu...
          </div>
        ) : movies.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            Chưa có bộ phim nào hoàn thành.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {movies.map((movie) => (
              <Link
                to={`/watch/${movie.slug}`}
                key={movie.id}
                className="group relative bg-[#1a1c23] rounded overflow-hidden shadow-lg hover:-translate-y-1 transition duration-300"
              >
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src={movie.poster_url || "/placeholder.jpg"}
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-medium line-clamp-1 group-hover:text-sky-400 transition">
                    {movie.title}
                  </h3>
                  <div className="text-[11px] text-gray-400 mt-1">
                    Hoàn thành
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
