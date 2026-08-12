import React, { useState, useEffect } from "react";
import Header from "./Header";
import Movielist from "./Movielist";

export default function FavoritesPage() {
  const [favoriteMovies, setFavoriteMovies] = useState([]);

  useEffect(() => {
    // Đọc và chuẩn hóa dữ liệu từ localStorage để đảm bảo luôn có đủ ảnh và tiêu đề
    const storedFavorites = JSON.parse(
      localStorage.getItem("favorite_movies") || "[]",
    );

    const normalizedFavorites = storedFavorites.map((movie) => ({
      ...movie,
      // Map các trường ảnh để Movielist ở trang nào cũng nhận diện được
      thumb_url: movie.thumb_url || movie.poster_url || movie.thumbnail || "",
      poster_url: movie.poster_url || movie.thumb_url || movie.thumbnail || "",
      title: movie.title || movie.name || "Phim Hoạt Hình",
    }));

    setFavoriteMovies(normalizedFavorites);
  }, []);

  return (
    <div className="bg-[#121315] min-h-screen text-white">
      <Header />
      <div className="container mx-auto px-6 py-6">
        <h1 className="text-xl md:text-2xl font-bold mb-6 text-sky-400 border-b border-gray-800 pb-3">
          Danh Sách Phim Yêu Thích ({favoriteMovies.length})
        </h1>

        {favoriteMovies.length > 0 ? (
          <Movielist title="" data={favoriteMovies} />
        ) : (
          <div className="text-center py-20 text-gray-400 text-sm">
            Bạn chưa thêm bộ phim yêu thích nào. Hãy khám phá và thêm phim vào
            danh sách nhé!
          </div>
        )}
      </div>
    </div>
  );
}
