import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
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
import SpeedSettings from "./SpeedSettings";

export default function VideoControls({
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  isFullscreen,
  playbackRate,
  showControls,
  onTogglePlay,
  onSkip,
  onSeek,
  onChangeVolume,
  onToggleMute,
  onToggleFullscreen,
  onTogglePiP,
  onChangeSpeed,
  formatTime,
}) {
  const [showSettings, setShowSettings] = useState(false);

  // Xử lý phím tắt bàn phím
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Tránh bắt phím khi đang nhập liệu ở ô input/textarea khác
      if (["INPUT", "TEXTAREA"].includes(document.activeElement.tagName))
        return;

      switch (e.key.toLowerCase()) {
        case " ": // Phím Cách: Play/Pause
        case "k":
          e.preventDefault();
          onTogglePlay();
          break;
        case "f": // Phím F: Toàn màn hình
          e.preventDefault();
          onToggleFullscreen();
          break;
        case "arrowleft": // Mũi tên trái: Tua lùi 10s
          e.preventDefault();
          onSkip(-10);
          break;
        case "arrowright": // Mũi tên phải: Tua tới 10s
          e.preventDefault();
          onSkip(10);
          break;
        case "arrowup": // Mũi tên lên: Tăng âm lượng
          e.preventDefault();
          onChangeVolume(Math.min(1, Number((volume + 0.05).toFixed(2))));
          break;
        case "arrowdown": // Mũi tên xuống: Giảm âm lượng
          e.preventDefault();
          onChangeVolume(Math.max(0, Number((volume - 0.05).toFixed(2))));
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onTogglePlay, onToggleFullscreen, onSkip, onChangeVolume, volume]);

  return (
    <div
      onClick={(e) => e.stopPropagation()} // Ngăn sự kiện click lan ra ngoài
      className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent px-3 sm:px-6 pb-3 sm:pb-4 pt-8 transition-opacity duration-300 z-30 flex flex-col justify-end cursor-default ${
        showControls ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* HÀNG TRÊN TRÊN MOBILE (Tua lùi 10s, Play/Pause, Tua tới 10s) */}
      <div className="flex sm:hidden items-center justify-center space-x-12 mb-6">
        <button
          onClick={() => onSkip(-10)}
          className="text-white hover:text-sky-400 transition text-3xl p-1"
          title="Tua ngược 10s"
        >
          <MdReplay10 />
        </button>
        <button
          onClick={onTogglePlay}
          className="text-white hover:text-sky-400 transition text-4xl p-1"
        >
          {isPlaying ? <FaPause /> : <FaPlay />}
        </button>
        <button
          onClick={() => onSkip(10)}
          className="text-white hover:text-sky-400 transition text-3xl p-1"
          title="Tua tiến 10s"
        >
          <MdForward10 />
        </button>
      </div>

      {/* Thanh Progress Bar */}
      <div className="relative w-full h-1.5 sm:h-2 bg-gray-600/60 rounded-full mb-3 cursor-pointer group/progress">
        <div
          className="absolute top-0 left-0 h-full bg-sky-500 rounded-full transition-all"
          style={{
            width: `${duration ? (currentTime / duration) * 100 : 0}%`,
          }}
        />
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={onSeek}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>

      {/* Hàng Dưới Cùng */}
      <div className="flex items-center justify-between text-white">
        {/* Cụm Bên Trái */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button
            onClick={onTogglePlay}
            className="hidden sm:flex hover:text-sky-400 transition text-xl items-center p-1"
          >
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>

          <button
            onClick={() => onSkip(-10)}
            className="hidden sm:flex hover:text-sky-400 transition text-2xl items-center p-1"
            title="Tua ngược 10s"
          >
            <MdReplay10 />
          </button>

          <button
            onClick={() => onSkip(10)}
            className="hidden sm:flex hover:text-sky-400 transition text-2xl items-center p-1"
            title="Tua tiến 10s"
          >
            <MdForward10 />
          </button>

          {/* Âm lượng */}
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <button
              onClick={onToggleMute}
              className="hover:text-sky-400 transition text-xl sm:text-2xl flex items-center p-1"
            >
              {isMuted || volume === 0 ? <FaVolumeMute /> : <FaVolumeUp />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => onChangeVolume(parseFloat(e.target.value))}
              className="w-12 sm:w-20 h-1.5 bg-gray-600 accent-sky-400 rounded cursor-pointer"
            />
          </div>

          {/* Thời gian */}
          <span className="text-xs sm:text-sm font-sans font-medium text-gray-200 tracking-wider tabular-nums whitespace-nowrap pl-1">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        {/* Cụm Bên Phải */}
        <div className="flex items-center space-x-3 sm:space-x-5 relative">
          {/* Cài đặt tốc độ */}
          <div className="relative flex items-center">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="hover:text-sky-400 transition text-xl sm:text-2xl flex items-center p-1"
              title="Cài đặt tốc độ"
            >
              <FaCog />
            </button>

            {showSettings && (
              <SpeedSettings
                playbackRate={playbackRate}
                onChangeSpeed={(speed) => {
                  onChangeSpeed(speed);
                  setShowSettings(false);
                }}
              />
            )}
          </div>

          {/* Picture-in-Picture */}
          <button
            onClick={onTogglePiP}
            className="hover:text-sky-400 transition text-xl sm:text-2xl flex items-center p-1"
            title="Phát trong nền"
          >
            <MdPictureInPictureAlt />
          </button>

          {/* Phóng Toàn Màn Hình */}
          <button
            onClick={onToggleFullscreen}
            className="hover:text-sky-400 transition text-xl sm:text-2xl flex items-center p-1"
            title="Toàn màn hình"
          >
            {isFullscreen ? <FaCompress /> : <FaExpand />}
          </button>
        </div>
      </div>
    </div>
  );
}

VideoControls.propTypes = {
  isPlaying: PropTypes.bool.isRequired,
  currentTime: PropTypes.number.isRequired,
  duration: PropTypes.number.isRequired,
  volume: PropTypes.number.isRequired,
  isMuted: PropTypes.bool.isRequired,
  isFullscreen: PropTypes.bool.isRequired,
  playbackRate: PropTypes.number.isRequired,
  showControls: PropTypes.bool.isRequired,
  onTogglePlay: PropTypes.func.isRequired,
  onSkip: PropTypes.func.isRequired,
  onSeek: PropTypes.func.isRequired,
  onChangeVolume: PropTypes.func.isRequired,
  onToggleMute: PropTypes.func.isRequired,
  onToggleFullscreen: PropTypes.func.isRequired,
  onTogglePiP: PropTypes.func.isRequired,
  onChangeSpeed: PropTypes.func.isRequired,
  formatTime: PropTypes.func.isRequired,
};
