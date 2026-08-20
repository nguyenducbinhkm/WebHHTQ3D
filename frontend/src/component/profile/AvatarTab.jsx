import React from "react";
import PropTypes from "prop-types";
import { FaCamera } from "react-icons/fa";

export default function AvatarTab({
  avatarPreview,
  fileInputRef,
  loading,
  onFileChange,
  onBack,
  onSubmit,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h4 className="text-sm font-semibold text-amber-400 mb-2">
        Cập nhật ảnh đại diện mới từ thiết bị
      </h4>
      <div className="flex flex-col items-center gap-4 py-2">
        <div className="relative">
          <img
            src={avatarPreview}
            alt="Preview"
            className="w-24 h-24 rounded-full object-cover border-4 border-amber-400/80 shadow-md"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current.click()}
            className="absolute bottom-0 right-0 p-2 bg-amber-500 rounded-full hover:bg-amber-400 transition shadow"
          >
            <FaCamera className="text-white text-xs" />
          </button>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={onFileChange}
          accept="image/*"
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current.click()}
          className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-xs text-gray-300 rounded-xl transition"
        >
          Chọn ảnh từ máy tính
        </button>
        <p className="text-xs text-gray-400">
          Định dạng hỗ trợ: JPG, PNG, WEBP
        </p>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-xs font-semibold rounded-xl transition"
        >
          Quay lại
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-xl transition disabled:opacity-50"
        >
          {loading ? "Đang tải lên..." : "Lưu thay đổi"}
        </button>
      </div>
    </form>
  );
}

AvatarTab.propTypes = {
  avatarPreview: PropTypes.string.isRequired,
  fileInputRef: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  onFileChange: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};
