import React from "react";
import PropTypes from "prop-types";

export default function UsernameTab({
  newUsername,
  onChangeUsername,
  loading,
  onBack,
  onSubmit,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h4 className="text-sm font-semibold text-amber-400 mb-2">
        Đổi tên hiển thị (Username)
      </h4>
      <div>
        <label className="block text-xs text-gray-400 mb-1">
          Tên tài khoản mới
        </label>
        <input
          type="text"
          value={newUsername}
          onChange={(e) => onChangeUsername(e.target.value)}
          className="w-full bg-black/40 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 transition"
          required
        />
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
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition disabled:opacity-50"
        >
          {loading ? "Đang lưu..." : "Xác nhận đổi tên"}
        </button>
      </div>
    </form>
  );
}

UsernameTab.propTypes = {
  newUsername: PropTypes.string.isRequired,
  onChangeUsername: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  onBack: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};
