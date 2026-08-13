import React, { useState, useEffect } from "react";
import axios from "axios";
import Banner from "./Banner";
import Movielist from "./Movielist";
import RankingBoard from "./RankingBoard";
import VideoPlayer from "./VideoPlayer";
import ScheduleSection from "./ScheduleSection";

// Lấy base URL từ biến môi trường của Vite
const API_URL = import.meta.env.VITE_API_URL;

function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentVideo, setCurrentVideo] = useState(null);

  useEffect(() => {
    axios
      .get(`${API_URL}/api/movies`)
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setMovies(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi lấy danh sách phim:", err);
        setLoading(false);
      });
  }, []);

  const handlePlayKiemLai = () => {
    setCurrentVideo({
      title: "Kiếm Lai - Tập 01",
      url: "https://fhdbpwxujmrxuebfnfzd.supabase.co/storage/v1/object/public/movies/kiemlai/tap1/playlist.m3u8",
    });
  };

  return (
    <div className="bg-[#0b0c0e] min-h-screen text-white">
      <Banner onPlay={handlePlayKiemLai} />

      {/* Mở rộng max-w lên 1650px để thoát dáng bị hẹp */}
      <main className="max-w-[1650px] mx-auto px-4 md:px-8 py-8">
        {loading ? (
          <div className="text-center py-12 text-gray-400 font-medium">
            Đang tải dữ liệu...
          </div>
        ) : (
          <>
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {/* Cột trái */}
              <div className="flex-1 w-full min-w-0">
                <Movielist title="HOẠT HÌNH 3D MỚI CẬP NHẬT" data={movies} />
              </div>

              {/* Cột phải: Bảng xếp hạng */}
              <div className="w-full lg:w-[380px] shrink-0 sticky top-6">
                <RankingBoard movies={movies} />
              </div>
            </div>

            {/* Phần Lịch Phim */}
            <div className="mt-12">
              <ScheduleSection />
            </div>
          </>
        )}
      </main>

      {currentVideo && (
        <VideoPlayer
          url={currentVideo.url}
          title={currentVideo.title}
          isModal={true}
          onClose={() => setCurrentVideo(null)}
        />
      )}
    </div>
  );
}

export default Home;
