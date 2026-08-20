import React from "react";
import PropTypes from "prop-types";

export default function MovieDescription({ description }) {
  return (
    <div className="p-4 bg-[#18191c] border border-gray-800 rounded">
      <h3 className="text-sm font-bold text-gray-200 mb-2">Nội dung phim</h3>
      <p className="text-xs text-gray-400 leading-relaxed">
        {description || "Chưa có mô tả nội dung."}
      </p>
    </div>
  );
}

MovieDescription.propTypes = {
  description: PropTypes.string,
};
