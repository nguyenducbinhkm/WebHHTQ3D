import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import Hls from "hls.js";
import {
  FaPlay,
  FaPause,
  FaVolumeUp,
  FaVolumeMute,
  FaCog,
  FaExpand,
  FaCompress,
} from "react-icons/fa";
import { MdReplay10, MdForward10, MdPictureInPictureAlt } from "react-icons/md";

function VideoPlayer({ url, title, onClose, isModal = false }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  // States quản lý Trình phát video
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);

  const controlsTimeoutRef = useRef(null);

  // 1. Tải HLS (.m3u8) Stream
  useEffect(() => {
    if (!url || !videoRef.current) return;

    const video = videoRef.current;
    let hls;

    if (Hls.isSupported()) {
      hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => setIsPlaying(false));
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      video.addEventListener("loadedmetadata", () => {
        video.play().catch(() => setIsPlaying(false));
      });
    }

    return () => {
      if (hls) hls.destroy();
    };
  }, [url]);

  // 2. Lắng nghe Sự kiện từ Video
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => setDuration(video.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ended", handleEnded);
    };
  }, []);

  // 3. Xử lý Phím tắt Keyboard (Space, F, Mũi tên)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeTag = document.activeElement?.tagName;
      if (activeTag === "INPUT" || activeTag === "TEXTAREA") return;

      switch (e.code) {
        case "Space":
          e.preventDefault();
          togglePlay();
          break;
        case "KeyF":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "ArrowLeft":
          e.preventDefault();
          skip(-10);
          break;
        case "ArrowRight":
          e.preventDefault();
          skip(10);
          break;
        case "ArrowUp":
          e.preventDefault();
          changeVolume(Math.min(1, volume + 0.1));
          break;
        case "ArrowDown":
          e.preventDefault();
          changeVolume(Math.max(0, volume - 0.1));
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, volume]);

  // Các hàm tương tác với Video
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) videoRef.current.pause();
    else videoRef.current.play();
  };

  const skip = (seconds) => {
    const video = videoRef.current;
    if (!video) return;

    // Lấy duration trực tiếp từ DOM element để tránh trễ state
    const videoDuration =
      Number.isFinite(video.duration) && video.duration > 0
        ? video.duration
        : Infinity;

    const newTime = Math.min(
      Math.max(0, video.currentTime + seconds),
      videoDuration,
    );

    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    if (videoRef.current) videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const changeVolume = (val) => {
    if (!videoRef.current) return;
    setVolume(val);
    videoRef.current.volume = val;
    setIsMuted(val === 0);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.volume = volume || 1;
      setIsMuted(false);
    } else {
      videoRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const togglePiP = async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (videoRef.current) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (err) {
      console.error("Lỗi PiP:", err);
    }
  };

  const changeSpeed = (speed) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackRate(speed);
      setShowSettings(false);
    }
  };

  // Tự động ẩn thanh Control khi không di chuột
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3500);
  };

  // Format giây thành mm:ss
  const formatTime = (timeInSec) => {
    if (isNaN(timeInSec)) return "00:00";
    const min = Math.floor(timeInSec / 60);
    const sec = Math.floor(timeInSec % 60);
    return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  if (!url) {
    return (
      <div className="w-full aspect-video bg-black flex items-center justify-center text-gray-500 text-sm rounded border border-gray-800">
        Chưa có dữ liệu Video / Link stream m3u8...
      </div>
    );
  }

  const PlayerCore = (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className="relative w-full aspect-video bg-black overflow-hidden rounded shadow-xl border border-gray-800 group select-none"
    >
      {/* Thẻ Video chính */}
      <video
        ref={videoRef}
        onClick={togglePlay}
        playsInline
        autoPlay
        className="w-full h-full object-contain cursor-pointer"
      />

      {/* THANH ĐIỀU KHIỂN TÙY CHỈNH (CUSTOM CONTROLS) */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent px-6 pb-4 pt-8 transition-opacity duration-300 z-30 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Thanh Progress Bar */}
        <div className="relative w-full h-2 bg-gray-600/60 rounded-full mb-4 cursor-pointer group/progress">
          <div
            className="absolute top-0 left-0 h-full bg-white rounded-full transition-all"
            style={{
              width: `${duration ? (currentTime / duration) * 100 : 0}%`,
            }}
          />
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>

        {/* Các nút Chức năng */}
        <div className="flex items-center justify-between text-white">
          {/* Cụm Bên Trái */}
          <div className="flex items-center space-x-6">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="hover:text-sky-400 transition text-2xl flex items-center"
            >
              {isPlaying ? <FaPause /> : <FaPlay />}
            </button>

            {/* Tua 10s Ngược */}
            <button
              onClick={() => skip(-10)}
              className="hover:text-sky-400 transition text-3xl flex items-center"
              title="Tua ngược 10s"
            >
              <MdReplay10 />
            </button>

            {/* Tua 10s Tiến */}
            <button
              onClick={() => skip(10)}
              className="hover:text-sky-400 transition text-3xl flex items-center"
              title="Tua tiến 10s"
            >
              <MdForward10 />
            </button>

            {/* Âm lượng */}
            <div className="flex items-center space-x-3 group/vol">
              <button
                onClick={toggleMute}
                className="hover:text-sky-400 transition text-2xl flex items-center"
              >
                {isMuted || volume === 0 ? <FaVolumeMute /> : <FaVolumeUp />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => changeVolume(parseFloat(e.target.value))}
                className="w-20 h-1.5 bg-gray-600 accent-sky-400 rounded cursor-pointer"
              />
            </div>

            {/* Hiển thị thời gian đã được tinh chỉnh font chữ đẹp hơn */}
            <span className="text-base font-sans font-semibold text-gray-200 tracking-wider pl-2 tabular-nums">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Cụm Bên Phải (mở rộng khoảng cách dãn ra) */}
          <div className="flex items-center space-x-7 relative">
            {/* Cài đặt (Tốc độ phát) */}
            <div className="relative flex items-center">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="hover:text-sky-400 transition text-2xl flex items-center"
                title="Cài đặt tốc độ"
              >
                <FaCog />
              </button>

              {/* Menu cài đặt tốc độ */}
              {showSettings && (
                <div className="absolute bottom-10 right-0 bg-black/90 border border-gray-700 rounded-lg p-2.5 w-32 text-xs text-gray-200 z-50 backdrop-blur shadow-xl">
                  <div className="font-semibold mb-1 text-gray-400 border-b border-gray-700 pb-1 text-center">
                    Tốc độ phát
                  </div>
                  {[0.5, 1, 1.25, 1.5, 2].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => changeSpeed(speed)}
                      className={`w-full text-left px-2 py-1.5 rounded hover:bg-sky-500 hover:text-white transition ${
                        playbackRate === speed
                          ? "bg-sky-600 text-white font-bold"
                          : ""
                      }`}
                    >
                      {speed === 1 ? "Chuẩn (1x)" : `${speed}x`}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Picture-in-Picture */}
            <button
              onClick={togglePiP}
              className="hover:text-sky-400 transition text-3xl flex items-center"
              title="Phát trong nền (Picture-in-Picture)"
            >
              <MdPictureInPictureAlt />
            </button>

            {/* Phóng Toàn Màn Hình */}
            <button
              onClick={toggleFullscreen}
              className="hover:text-sky-400 transition text-2xl flex items-center"
              title="Toàn màn hình"
            >
              {isFullscreen ? <FaCompress /> : <FaExpand />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="relative w-full max-w-5xl bg-gray-900 rounded-lg overflow-hidden shadow-2xl border border-gray-800">
          <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-800">
            <h3 className="text-white font-semibold text-lg truncate">
              {title || "Đang phát video"}
            </h3>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white text-xl font-bold px-2 py-1 transition-colors"
              >
                ✕
              </button>
            )}
          </div>
          {PlayerCore}
        </div>
      </div>
    );
  }

  return PlayerCore;
}

VideoPlayer.propTypes = {
  url: PropTypes.string,
  title: PropTypes.string,
  onClose: PropTypes.func,
  isModal: PropTypes.bool,
};

export default VideoPlayer;
