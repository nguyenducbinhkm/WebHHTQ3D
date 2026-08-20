import React from "react";
import PropTypes from "prop-types";

export default function PasswordTab({
  passwordData,
  onChangePasswordData,
  loading,
  onBack,
  onSubmit,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h4 className="text-sm font-semibold text-amber-400 mb-2">
        Thay đổi mật khẩu tài khoản
      </h4>
      <div>
        <label className="block text-xs text-gray-400 mb-1">Mật khẩu mới</label>
        <input
          type="password"
          value={passwordData.newPassword}
          onChange={(e) =>
            onChangePasswordData({
              ...passwordData,
              newPassword: e.target.value,
            })
          }
          className="w-full bg-black/40 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 transition"
          required
        />
      </div>
      <div>
        <label className="block text-xs text-gray-400 mb-1">
          Nhập lại mật khẩu mới
        </label>
        <input
          type="password"
          value={passwordData.confirmPassword}
          onChange={(e) =>
            onChangePasswordData({
              ...passwordData,
              confirmPassword: e.target.value,
            })
          }
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
          className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-xl transition disabled:opacity-50"
        >
          {loading ? "Đang xử lý..." : "Cập nhật mật khẩu"}
        </button>
      </div>
    </form>
  );
}

PasswordTab.propTypes = {
  passwordData: PropTypes.object.isRequired,
  onChangePasswordData: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  onBack: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};
