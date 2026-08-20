import React from "react";
import PropTypes from "prop-types";

export default function EpisodeList({
  totalEpCount,
  currentEpisode,
  onSelectEpisode,
}) {
  return (
    <div className="w-full bg-[#18191c] p-3 rounded border border-gray-800 shrink-0">
      <h3 className="text-xs font-bold text-gray-400 mb-2 px-1 uppercase tracking-wider">
        Danh sách tập ({totalEpCount})
      </h3>
      <div className="grid grid-cols-5 gap-1.5 max-h-[520px] overflow-y-auto pr-1">
        {Array.from({ length: totalEpCount }, (_, i) => totalEpCount - i).map(
          (ep) => (
            <button
              key={ep}
              onClick={() => onSelectEpisode(ep)}
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
}

EpisodeList.propTypes = {
  totalEpCount: PropTypes.number.isRequired,
  currentEpisode: PropTypes.number.isRequired,
  onSelectEpisode: PropTypes.func.isRequired,
};
