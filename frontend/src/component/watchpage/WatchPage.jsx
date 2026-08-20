import React, { useState, useEffect } from "react";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../header/Header";
import Movielist from "../Movielist";
import VideoPlayer from "../videoplayer/VideoPlayer";
import CommentSection from "../comment/CommentSection";
import EpisodeList from "./EpisodeList";
import MovieInfoCard from "./MovieInfoCard";
import MovieDescription from "./MovieDescription";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL;

function WatchPage() {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [movieData, setMovieData] = useState(null);
  const [allMovies, setAllMovies] = useState([]);
  const [currentEpisode, setCurrentEpisode] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  const saveHistory = async () => {
    if (!movieData) return;
    const movieId = movieData.id || movieData.movie_info?.id || movieData?.M_ID;
    if (!movieId) return;

    const token =
      localStorage.getItem("token") || localStorage.getItem("access_token");
    const movieTitle =
      movieData.title || movieData.movie_info?.title || "Phim Hoạt Hình";
    const moviePoster =
      movieData?.poster_url ||
      movieData?.thumb_url ||
      movieData?.movie_info?.poster_url ||
      movieData?.movie_info?.thumb_url ||
      movieData?.thumb ||
      "";

    if (token) {
      try {
        await axios.post(
          "http://localhost:8000/api/watch-history/",
          {
            movie_id: Number(movieId),
            episode_number: Number(currentEpisode),
          },
          { headers: { Authorization: `Bearer ${token}` } },
        );
      } catch (err) {
        console.error("Lỗi gửi lịch sử lên server:", err);
      }
    } else {
      const historyItem = {
        id: movieId,
        movie_id: Number(movieId),
        episode_number: Number(currentEpisode),
        updated_at: new Date().toISOString(),
        movie: {
          id: movieId,
          title: movieTitle,
          slug: slug,
          poster_url: moviePoster,
        },
      };

      const localData = JSON.parse(localStorage.getItem("watch_history")) || [];
      const filtered = localData.filter((item) => item.movie?.slug !== slug);
      const newHistory = [historyItem, ...filtered];
      localStorage.setItem("watch_history", JSON.stringify(newHistory));
    }
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const epFromUrl = searchParams.get("ep");
    if (epFromUrl) {
      setCurrentEpisode(parseInt(epFromUrl, 10) || 1);
    } else {
      setCurrentEpisode(1);
    }
  }, [location.search]);

  useEffect(() => {
    if (movieData) {
      saveHistory();
    }
  }, [currentEpisode, slug, movieData]);

  useEffect(() => {
    setLoading(true);
    const fetchDetail = axios.get(`${API_URL}/api/movies/${slug}`);
    const fetchAll = axios.get(`${API_URL}/api/movies`);

    Promise.all([fetchDetail, fetchAll])
      .then(([detailRes, allRes]) => {
        const movie = detailRes.data;
        setMovieData(movie);
        setAllMovies(allRes.data || []);
        setLoading(false);

        const currentKey =
          movie.slug ||
          movie.movie_info?.slug ||
          movie?.M_ID ||
          movie.id ||
          slug;
        const storedFavorites = JSON.parse(
          localStorage.getItem("favorite_movies") || "[]",
        );
        const isExisted = storedFavorites.some(
          (item) => (item.slug || item?.M_ID || item.id) === currentKey,
        );
        setIsFavorite(isExisted);
      })
      .catch((err) => {
        console.error("Lỗi lấy dữ liệu WatchPage:", err);
        setLoading(false);
      });
  }, [slug]);

  const handleToggleFavorite = () => {
    if (!movieData) return;
    const storedFavorites = JSON.parse(
      localStorage.getItem("favorite_movies") || "[]",
    );
    const currentKey =
      movieData.slug ||
      movieData.movie_info?.slug ||
      movieData?.M_ID ||
      movieData.id ||
      slug;

    const filteredFavorites = storedFavorites.filter(
      (item) => (item.slug || item?.M_ID || item.id) !== currentKey,
    );

    let updatedFavorites;
    if (isFavorite) {
      updatedFavorites = filteredFavorites;
      setIsFavorite(false);
    } else {
      const movieToSave = {
        ...movieData,
        slug: currentKey,
        M_ID: movieData?.M_ID || movieData?.movie_info?.M_ID || movieData.id,
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

  const episodes =
    movieData?.episodes ||
    movieData?.movie_info?.episodes ||
    movieData?.list_episodes ||
    [];
  const totalEpCount = episodes.length > 0 ? episodes.length : 1;

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
  const movieId = movieData?.movie_info?.id || movieData?.id;

  const categories =
    movieData?.categories ||
    movieData?.movie_info?.categories ||
    movieData?.genre ||
    movieData?.movie_info?.genre ||
    [];

  const releaseDayRaw =
    movieData?.release_day ||
    movieData?.movie_info?.release_day ||
    movieData?.schedule ||
    movieData?.movie_info?.schedule ||
    "Đang cập nhật";

  const rawRating =
    movieData?.movie_info?.rating ??
    movieData?.rating ??
    movieData?.movie_info?.vote_average ??
    movieData?.vote_average ??
    0;
  const ratingScore = Number(rawRating || 0).toFixed(1);

  const rawVoteCount =
    movieData?.movie_info?.vote_count ??
    movieData?.vote_count ??
    movieData?.movie_info?.total_vote ??
    movieData?.total_vote ??
    0;
  const voteCountStr = Number(rawVoteCount || 0).toLocaleString();

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

  const handleSelectEpisode = (ep) => {
    setCurrentEpisode(ep);
    navigate(`?ep=${ep}`, { replace: true });
  };

  if (loading) {
    return (
      <div className="bg-[#121315] min-h-screen text-white flex items-center justify-center">
        Đang tải thông tin phim...
      </div>
    );
  }

  return (
    <div className="bg-[#121315] min-h-screen text-white">
      <div className="container mx-auto px-6 py-4">
        {/* Breadcrumb */}
        <div className="text-xs text-[#FFE066] mb-4 flex items-center gap-2 overflow-x-auto whitespace-nowrap">
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

        {/* Nội dung responsive */}
        <div className="flex flex-col md:flex-row gap-4 items-start mb-10">
          {/* CỘT TRÁI: Danh sách tập */}
          <div className="hidden md:block w-72">
            <EpisodeList
              totalEpCount={totalEpCount}
              currentEpisode={currentEpisode}
              onSelectEpisode={handleSelectEpisode}
            />
          </div>

          {/* CỘT PHẢI: Video Player & Thông tin chi tiết */}
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

            {/* Thanh nút Trước / Tiếp tập dưới video */}
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

            {/* DANH SÁCH TẬP PHIM (MOBILE) */}
            <div className="block md:hidden w-full">
              <EpisodeList
                totalEpCount={totalEpCount}
                currentEpisode={currentEpisode}
                onSelectEpisode={handleSelectEpisode}
              />
            </div>

            {/* Thông tin phim */}
            <MovieInfoCard
              movieTitle={movieTitle}
              currentEpisode={currentEpisode}
              ratingScore={ratingScore}
              voteCountStr={voteCountStr}
              releaseDayRaw={releaseDayRaw}
              formatReleaseDay={formatReleaseDay}
              isFavorite={isFavorite}
              onToggleFavorite={handleToggleFavorite}
              categories={categories}
            />

            {/* TÍCH HỢP COMPONENT BÌNH LUẬN */}
            {movieId && <CommentSection movieId={movieId} />}

            {/* Mô tả phim */}
            <MovieDescription
              description={
                movieData?.movie_info?.description || movieData?.description
              }
            />
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
