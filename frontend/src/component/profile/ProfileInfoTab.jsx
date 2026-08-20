import React from "react";
import PropTypes from "prop-types";
import { FaUser, FaLock, FaImage } from "react-icons/fa";

export default function ProfileInfoTab({ user, onSelectTab }) {
  return (
    <div className="space-y-5">
      <div className="flex flex-col items-center pb-4 border-b border-gray-700/50">
        <img
          src={
            user?.avatar_url ||
            user?.avatar ||
            "https://via.placeholder.com/150"
          }
          alt="Avatar"
          className="w-24 h-24 rounded-full object-cover border-4 border-amber-400/80 shadow-lg"
        />
        <h4 className="mt-3 font-bold text-white text-lg">
          {user?.username || "Người dùng"}
        </h4>
        <p className="text-xs text-gray-400">{user?.email || ""}</p>
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={() => onSelectTab("avatar")}
          className="w-full flex items-center justify-between p-3.5 bg-black/30 hover:bg-white/5 rounded-xl border border-gray-700/50 transition"
        >
          <div className="flex items-center gap-3 text-sky-400">
            <FaImage /> Thay đổi Avatar
          </div>
          <span className="text-xs text-sky-400 font-semibold px-3 py-1 bg-sky-500/10 rounded-lg">
            Chọn
          </span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab("username")}
          className="w-full flex items-center justify-between p-3.5 bg-black/30 hover:bg-white/5 rounded-xl border border-gray-700/50 transition"
        >
          <div className="flex items-center gap-3 text-emerald-400">
            <FaUser /> Thay đổi Username
          </div>
          <span className="text-xs text-emerald-400 font-semibold px-3 py-1 bg-emerald-500/10 rounded-lg">
            Đổi tên
          </span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab("password")}
          className="w-full flex items-center justify-between p-3.5 bg-black/30 hover:bg-white/5 rounded-xl border border-gray-700/50 transition"
        >
          <div className="flex items-center gap-3 text-amber-400">
            <FaLock /> Thay đổi Mật khẩu
          </div>
          <span className="text-xs text-amber-400 font-semibold px-3 py-1 bg-amber-500/10 rounded-lg">
            Cập nhật
          </span>
        </button>
      </div>
    </div>
  );
}

ProfileInfoTab.propTypes = {
  user: PropTypes.object,
  onSelectTab: PropTypes.func.isRequired,
};
