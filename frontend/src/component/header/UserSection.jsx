import React, { useState, useEffect, useRef } from "react";
import { FaUser } from "react-icons/fa";
import Login from "../login/Login";
import ProfileModal from "../profile/ProfileModal";

const UserSection = () => {
  const [user, setUser] = useState(null);
  const [isOpenUserMenu, setIsOpenUserMenu] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Lỗi đọc dữ liệu user từ localStorage:", e);
      }
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsOpenUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    setUser(null);
    setIsOpenUserMenu(false);
    window.location.reload();
  };

  return (
    <div className="relative ml-1" ref={userMenuRef}>
      {user ? (
        <div>
          <div
            onClick={() => setIsOpenUserMenu(!isOpenUserMenu)}
            className="w-8 h-8 md:w-9 md:h-9 rounded-full overflow-hidden border-2 border-sky-400/80 cursor-pointer hover:opacity-90 transition shadow-md shrink-0 flex items-center justify-center bg-gray-800"
            title={user.username || "Tài khoản của tôi"}
          >
            <img
              src={user.avatar || user.avatar_url || "/avatar.png"}
              alt="User Avatar"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/avatar.png";
              }}
            />
          </div>

          {isOpenUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-[#1a1c20] border border-gray-700 rounded-lg shadow-2xl py-2 z-50 text-white">
              <div className="px-4 py-2 text-xs text-gray-400 border-b border-gray-700/80">
                Xin chào,{" "}
                <span className="font-bold text-sky-400">
                  {user.username || "Thành viên"}
                </span>
              </div>

              <button
                onClick={() => {
                  setIsOpenUserMenu(false);
                  setIsProfileOpen(true);
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-200 hover:bg-[#2a2d34] transition flex items-center space-x-2.5 font-medium"
              >
                <FaUser className="text-sky-400 text-xs" />
                <span>Thông tin cá nhân</span>
              </button>

              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-[#2a2d34] transition flex items-center space-x-2 font-medium border-t border-gray-700/50 mt-1 pt-2"
              >
                <span>🚪</span>
                <span>Đăng xuất</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => setIsLoginOpen(true)}
          className="bg-gradient-to-r from-[#60a5fa] to-[#38bdf8] hover:opacity-90 text-white text-[11px] md:text-xs font-medium px-2.5 md:px-4 py-1.5 md:py-2 rounded-sm shadow-sm transition-all whitespace-nowrap"
        >
          Đăng Nhập
        </button>
      )}

      {/* Modal Đăng Nhập */}
      <Login
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={() => {
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
          window.location.reload();
        }}
      />

      {/* Modal Thông Tin Cá Nhân */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        onUpdateSuccess={(updatedUser) => {
          setUser(updatedUser);
          localStorage.setItem("user", JSON.stringify(updatedUser));
        }}
      />
    </div>
  );
};

export default UserSection;
