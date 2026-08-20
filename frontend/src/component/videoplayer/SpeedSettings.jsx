import React from "react";
import PropTypes from "prop-types";

export default function SpeedSettings({ playbackRate, onChangeSpeed }) {
  const speeds = [0.5, 1, 1.25, 1.5, 2];

  return (
    <div className="absolute bottom-8 right-0 bg-black/95 border border-gray-700 rounded-lg p-2 w-28 text-xs text-gray-200 z-50 backdrop-blur shadow-xl">
      <div className="font-semibold mb-1 text-gray-400 border-b border-gray-700 pb-1 text-center">
        Tốc độ phát
      </div>
      {speeds.map((speed) => (
        <button
          key={speed}
          onClick={() => onChangeSpeed(speed)}
          className={`w-full text-left px-2 py-1 rounded hover:bg-sky-500 hover:text-white transition ${
            playbackRate === speed ? "bg-sky-600 text-white font-bold" : ""
          }`}
        >
          {speed === 1 ? "Chuẩn (1x)" : `${speed}x`}
        </button>
      ))}
    </div>
  );
}

SpeedSettings.propTypes = {
  playbackRate: PropTypes.number.isRequired,
  onChangeSpeed: PropTypes.func.isRequired,
};
