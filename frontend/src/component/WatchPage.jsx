import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import Header from "./Header";
import Movielist from "./Movielist";
import VideoPlayer from "./VideoPlayer";
import {
  FaHeart,
  FaRegHeart,
  FaStar,
  FaCommentAlt,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

// Lấy base URL từ biến môi trường của Vite
const API_URL = import.meta.env.VITE_API_URL;

function WatchPage() {
  const { slug } = useParams();
  const [movieData, setMovieData] = useState(null);
  const [allMovies, setAllMovies] = useState([]);
  const [currentEpisode, setCurrentEpisode] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    setLoading(true);
    setCurrentEpisode(1);

    const fetchDetail = axios.get(`${API_URL}/api/movies/${slug}`);
    const fetchAll = axios.get(`${API_URL}/api/movies`);

    Promise.all([fetchDetail, fetchAll])
      .then(([detailRes, allRes]) => {
        const movie = detailRes.data;
        setMovieData(movie);
        setAllMovies(allRes.data || []);
        setLoading(false);

        // Chuẩn hóa khóa định danh duy nhất cho phim
        const currentKey =
          movie.slug ||
          movie.movie_info?.slug ||
          movie.M_ID ||
          movie.id ||
          slug;

        // Kiểm tra xem phim đã có trong danh sách yêu thích của localStorage chưa
        const storedFavorites = JSON.parse(
          localStorage.getItem("favorite_movies") || "[]",
        );
        const isExisted = storedFavorites.some(
          (item) => (item.slug || item.M_ID || item.id) === currentKey,
        );
        setIsFavorite(isExisted);
      })
      .catch((err) => {
        console.error("Lỗi lấy dữ liệu WatchPage:", err);
        setLoading(false);
      });
  }, [slug]);

  // Hàm xử lý Thêm / Bỏ yêu thích chống trùng lặp hoàn toàn
  const handleToggleFavorite = () => {
    if (!movieData) return;

    const storedFavorites = JSON.parse(
      localStorage.getItem("favorite_movies") || "[]",
    );

    // Khóa định danh chuẩn
    const currentKey =
      movieData.slug ||
      movieData.movie_info?.slug ||
      movieData.M_ID ||
      movieData.id ||
      slug;

    // Lọc bỏ toàn bộ bản ghi cũ để tránh nhân đôi
    const filteredFavorites = storedFavorites.filter(
      (item) => (item.slug || item.M_ID || item.id) !== currentKey,
    );

    let updatedFavorites;
    if (isFavorite) {
      updatedFavorites = filteredFavorites;
      setIsFavorite(false);
    } else {
      const movieToSave = {
        ...movieData,
        slug: currentKey,
        M_ID: movieData.M_ID || movieData.movie_info?.M_ID || movieData.id,
        title:
          movieData?.movie_info?.title ||
          movieData?.title ||
          movieData?.name ||
          "Phim Hoạt Hình",
        thumb_url:
          movieData?.thumb_url ||
          movieData?.movie_info?.thumb_url ||
          movieData?.poster_url ||
          movieData?.movie_info?.poster_url ||
          movieData?.thumbnail ||
          "",
        poster_url:
          movieData?.poster_url ||
          movieData?.movie_info?.poster_url ||
          movieData?.thumb_url ||
          movieData?.movie_info?.thumb_url ||
          movieData?.thumbnail ||
          "",
      };
      updatedFavorites = [...filteredFavorites, movieToSave];
      setIsFavorite(true);
    }

    localStorage.setItem("favorite_movies", JSON.stringify(updatedFavorites));
  };

  // 1. Trích xuất mảng tập
  const episodes =
    movieData?.episodes ||
    movieData?.movie_info?.episodes ||
    movieData?.list_episodes ||
    [];

  const totalEpCount = episodes.length > 0 ? episodes.length : 1;

  // 2. Lấy Object của tập đang chọn
  const currentEpObj =
    episodes.find(
      (ep) =>
        Number(ep?.episode_number) === Number(currentEpisode) ||
        Number(ep?.episode) === Number(currentEpisode) ||
        Number(ep?.ep_number) === Number(currentEpisode) ||
        Number(ep?.name) === Number(currentEpisode) ||
        ep?.title?.includes(`Tập ${currentEpisode}`),
    ) ||
    episodes[currentEpisode - 1] ||
    episodes[0];

  // 3. Ưu tiên lấy m3u8_url chuẩn từ Backend
  const videoUrl =
    currentEpObj?.m3u8_url ||
    currentEpObj?.video_url ||
    currentEpObj?.link ||
    currentEpObj?.url ||
    currentEpObj?.stream_url ||
    currentEpObj?.file_url ||
    currentEpObj?.m3u8 ||
    (typeof currentEpObj === "string" ? currentEpObj : "") ||
    movieData?.m3u8_url ||
    movieData?.video_url ||
    movieData?.movie_info?.video_url ||
    "";

  const movieTitle =
    movieData?.movie_info?.title || movieData?.title || "Phim Hoạt Hình";

  // 4. Lấy Thể loại từ Database
  const categories =
    movieData?.categories ||
    movieData?.movie_info?.categories ||
    movieData?.genre ||
    movieData?.movie_info?.genre ||
    [];

  // 5. Lấy Lịch chiếu từ Database
  const releaseDayRaw =
    movieData?.release_day ||
    movieData?.movie_info?.release_day ||
    movieData?.schedule ||
    movieData?.movie_info?.schedule ||
    "Đang cập nhật";

  const formatReleaseDay = (day) => {
    if (!day) return "Đang cập nhật";
    const mapDays = {
      mon: "Thứ Hai",
      tue: "Thứ Ba",
      wed: "Thứ Tư",
      thu: "Thứ Năm",
      fri: "Thứ Sáu",
      sat: "Thứ Bảy",
      sun: "Chủ Nhật",
    };
    return mapDays[day.toLowerCase()] || day;
  };

  if (loading) {
    return (
      <div className="bg-[#121315] min-h-screen text-white flex items-center justify-center">
        Đang tải thông tin phim...
      </div>
    );
  }

  // Component giao diện chung cho phần Danh sách tập (để tái sử dụng cho cả Desktop cột trái và Mobile nằm dưới)
  const renderEpisodeList = () => (
    <div className="w-full bg-[#18191c] p-3 rounded border border-gray-800 shrink-0">
      <h3 className="text-xs font-bold text-gray-400 mb-2 px-1 uppercase tracking-wider">
        Danh sách tập ({totalEpCount})
      </h3>
      <div className="grid grid-cols-5 sm:grid-cols-5 md:grid-cols-5 gap-1.5 max-h-[520px] overflow-y-auto pr-1">
        {Array.from({ length: totalEpCount }, (_, i) => totalEpCount - i).map(
          (ep) => (
            <button
              key={ep}
              onClick={() => setCurrentEpisode(ep)}
              className={`py-2 text-xs rounded font-medium transition ${
                currentEpisode === ep
                  ? "bg-[#38bdf8] text-black font-bold"
                  : "bg-[#25272c] text-gray-300 hover:bg-gray-700"
              }`}
            >
              Tập {ep}
            </button>
          ),
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-[#121315] min-h-screen text-white">
      <div className="container mx-auto px-6 py-4">
        {/* Breadcrumb */}
        <div className="text-xs text-gray-400 mb-4 flex items-center gap-2 overflow-x-auto whitespace-nowrap">
          <Link to="/" className="hover:text-white">
            Trang chủ
          </Link>
          <span>›</span>
          <span className="hover:text-white cursor-pointer">Hoạt Hình 3D</span>
          <span>›</span>
          <span className="hover:text-white cursor-pointer">{movieTitle}</span>
          <span>›</span>
          <span className="text-[#38bdf8] font-semibold">
            Tập {currentEpisode}
          </span>
        </div>

        {/* Nội dung responsive: Desktop hiện 2 cột, Mobile hiện 1 cột */}
        <div className="flex flex-col md:flex-row gap-4 items-start mb-10">
          {/* CỘT TRÁI (CHỈ HIỂN THỊ TRÊN DESKTOP từ md trở lên): Danh sách tập */}
          <div className="hidden md:block w-72">{renderEpisodeList()}</div>

          {/* CỘT PHẢI / TOÀN BỘ TRÊN MOBILE: Video Player, Nút Trước/Tiếp & Thông tin chi tiết */}
          <div className="flex-1 w-full flex flex-col space-y-4">
            {videoUrl ? (
              <VideoPlayer
                url={videoUrl}
                title={`${movieTitle} - Tập ${currentEpisode}`}
                isModal={false}
              />
            ) : (
              <div className="w-full aspect-video bg-black rounded border border-gray-800 flex flex-col items-center justify-center p-6 text-center">
                <p className="text-gray-300 font-semibold mb-1">
                  Chưa tìm thấy link stream cho phim "{movieTitle}" (Tập{" "}
                  {currentEpisode})
                </p>
              </div>
            )}

            {/* Thanh nút Trước / Tiếp tập dưới video (Không khung xám nền) */}
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() =>
                  setCurrentEpisode((prev) => Math.max(prev - 1, 1))
                }
                disabled={currentEpisode <= 1}
                className={`px-4 py-2 rounded-md text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition bg-[#2d2f36] text-gray-200 hover:bg-[#3f424b] ${
                  currentEpisode <= 1
                    ? "opacity-40 cursor-not-allowed hover:bg-[#2d2f36]"
                    : ""
                }`}
              >
                <FaChevronLeft className="text-[10px]" /> Trước
              </button>
              <button
                onClick={() =>
                  setCurrentEpisode((prev) => Math.min(prev + 1, totalEpCount))
                }
                disabled={currentEpisode >= totalEpCount}
                className={`px-4 py-2 rounded-md text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition bg-[#2d2f36] text-gray-200 hover:bg-[#3f424b] ${
                  currentEpisode >= totalEpCount
                    ? "opacity-40 cursor-not-allowed hover:bg-[#2d2f36]"
                    : ""
                }`}
              >
                Tiếp <FaChevronRight className="text-[10px]" />
              </button>
            </div>

            {/* DANH SÁCH TẬP PHIM (CHỈ HIỂN THỊ DƯỚI VIDEO KHI Ở MÀN HÌNH MOBILE) */}
            <div className="block md:hidden w-full">{renderEpisodeList()}</div>

            {/* Thông tin phim */}
            <div className="p-5 bg-[#18191c] border border-gray-800 rounded space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-sky-400">
                    {movieTitle} - Tập {currentEpisode}
                  </h1>
                  <p className="text-xs text-gray-400 mt-1">
                    Hoạt hình Trung Quốc
                  </p>
                </div>

                {/* Đánh giá sao */}
                <div className="flex items-center gap-2 bg-[#222] px-3 py-1.5 rounded-lg border border-gray-700">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} className="text-sm" />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-gray-200">
                    4.3/5{" "}
                    <span className="text-xs text-gray-400 font-normal">
                      (10353 bình chọn)
                    </span>
                  </span>
                </div>
              </div>

              {/* Lịch chiếu */}
              <p className="text-sm text-gray-300">
                <strong className="text-gray-100">Lịch chiếu:</strong>{" "}
                {formatReleaseDay(releaseDayRaw)}
              </p>

              {/* Nút Yêu thích */}
              <button
                onClick={handleToggleFavorite}
                className={`w-full py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition ${
                  isFavorite
                    ? "bg-[#b91c1c] hover:bg-red-700 text-white"
                    : "bg-gray-800 hover:bg-gray-700 text-gray-200"
                }`}
              >
                {isFavorite ? <FaHeart /> : <FaRegHeart />}
                {isFavorite ? "Bỏ yêu thích" : "Thêm yêu thích"}
              </button>

              {/* Thể loại */}
              <div className="flex items-center gap-2 flex-wrap pt-1">
                <span className="text-sm text-gray-400">Thể loại:</span>
                {categories.length > 0 ? (
                  categories.map((cat, index) => (
                    <span
                      key={cat.id || index}
                      className="px-3 py-1 bg-[#262626] border border-gray-700 text-xs rounded-full text-gray-300"
                    >
                      {typeof cat === "string" ? cat : cat.name || cat.title}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-500">
                    Đang cập nhật thể loại
                  </span>
                )}
              </div>
            </div>

            {/* Bình luận */}
            <div className="bg-[#18191c] p-4 rounded border border-gray-800 flex items-center gap-3 text-gray-400 cursor-pointer hover:border-gray-600 transition">
              <FaCommentAlt className="text-lg" />
              <span>Bình luận (2404)</span>
            </div>

            {/* Mô tả phim */}
            <div className="p-4 bg-[#18191c] border border-gray-800 rounded">
              <h3 className="text-sm font-bold text-gray-200 mb-2">
                Nội dung phim
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                {movieData?.movie_info?.description ||
                  movieData?.description ||
                  "Chưa có mô tả nội dung."}
              </p>
            </div>
          </div>
        </div>

        <Movielist
          title="PHIM HOẠT HÌNH ĐỀ CỬ KHÁC"
          data={allMovies.slice(0, 8)}
        />
      </div>
    </div>
  );
}

export default WatchPage;
