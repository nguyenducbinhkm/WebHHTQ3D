import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import Hls from "hls.js";
import VideoControls from "./VideoControls";

export default function VideoPlayer({ url, title, onClose, isModal = false }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  // States quản lý Trình phát video
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
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

  // Các hàm tương tác với Video
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  };

  const handleContainerClick = () => {
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      setShowControls(!showControls);
    } else {
      togglePlay();
    }
  };

  const skip = (seconds) => {
    const video = videoRef.current;
    if (!video) return;

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
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container) return;

    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      if (container.requestFullscreen) {
        container.requestFullscreen().catch((err) => console.error(err));
      } else if (video && video.webkitEnterFullscreen) {
        video.webkitEnterFullscreen();
      } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch((err) => console.error(err));
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  const togglePiP = async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (videoRef.current && videoRef.current.requestPictureInPicture) {
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
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3500);
  };

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
      onClick={handleContainerClick}
      className="relative w-full aspect-video bg-black overflow-hidden rounded shadow-xl border border-gray-800 group select-none cursor-pointer"
    >
      {/* Thẻ Video chính */}
      <video
        ref={videoRef}
        playsInline
        autoPlay
        className="w-full h-full object-contain pointer-events-none"
      />

      {/* Thanh Điều Khiển Tách Biệt */}
      <VideoControls
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        isMuted={isMuted}
        isFullscreen={isFullscreen}
        playbackRate={playbackRate}
        showControls={showControls}
        onTogglePlay={togglePlay}
        onSkip={skip}
        onSeek={handleSeek}
        onChangeVolume={changeVolume}
        onToggleMute={toggleMute}
        onToggleFullscreen={toggleFullscreen}
        onTogglePiP={togglePiP}
        onChangeSpeed={changeSpeed}
        formatTime={formatTime}
      />
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-2 sm:p-4 backdrop-blur-sm">
        <div className="relative w-full max-w-5xl bg-gray-900 rounded-lg overflow-hidden shadow-2xl border border-gray-800">
          <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-800">
            <h3 className="text-white font-semibold text-base sm:text-lg truncate">
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
