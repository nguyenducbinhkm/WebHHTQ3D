import React, { useState, useEffect, useRef } from "react";
import {
  FaBars,
  FaSearch,
  FaHistory,
  FaBookmark,
  FaCaretDown,
  FaSpinner,
  FaTimes,
  FaPlayCircle,
  FaUser,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Login from "./Login";
import ProfileModal from "./ProfileModal";

const API_URL = import.meta.env.VITE_API_URL;

const Header = () => {
  const [categories, setCategories] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Trạng thái user và menu dropdown avatar
  const [user, setUser] = useState(null);
  const [isOpenUserMenu, setIsOpenUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Đọc thông tin user từ localStorage khi load trang hoặc F5
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (e) {
        console.error("Lỗi đọc dữ liệu user từ localStorage:", e);
      }
    }
  }, []);

  useEffect(() => {
    axios
      .get(`${API_URL}/api/categories`)
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setCategories(data);
      })
      .catch((err) => console.error("Lỗi kết nối API Thể loại:", err));
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsOpenUserMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const query = searchTerm.trim();
    if (!query) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    setShowDropdown(true);

    const timer = setTimeout(() => {
      axios
        .get(`${API_URL}/api/movies/search?q=${encodeURIComponent(query)}`)
        .then((res) => {
          const data = Array.isArray(res.data)
            ? res.data
            : res.data?.data || [];
          setSearchResults(data);
        })
        .catch((err) => {
          console.error("Lỗi tìm kiếm phim:", err);
          setSearchResults([]);
        })
        .finally(() => setIsSearching(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setShowDropdown(false);
      setIsMobileSearchOpen(false);
      navigate(`/tim-kiem?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    setUser(null);
    setIsOpenUserMenu(false);
    window.location.reload();
  };

  const categoryColors = [
    "text-emerald-400 hover:text-emerald-300",
    "text-orange-400 hover:text-orange-300",
    "text-sky-400 hover:text-sky-300",
    "text-teal-400 hover:text-teal-300",
    "text-amber-400 hover:text-amber-300",
    "text-rose-400 hover:text-rose-300",
    "text-purple-400 hover:text-purple-300",
    "text-yellow-300 hover:text-yellow-200",
    "text-cyan-400 hover:text-cyan-300",
  ];

  return (
    <div className="relative z-50" ref={searchRef}>
      {/* Header chính */}
      <header className="bg-[#22252a] text-white px-3 md:px-5 py-2.5 flex items-center justify-between shadow-md relative gap-2">
        {/* Bên trái: Menu Icon + Logo */}
        <div
          className="flex items-center space-x-2 md:space-x-3 relative shrink-0"
          ref={menuRef}
        >
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white hover:text-sky-400 text-lg focus:outline-none p-1 transition-colors flex items-center gap-1"
          >
            <FaBars />
            <FaCaretDown className="text-xs text-gray-400" />
          </button>

          {isMenuOpen && (
            <div className="absolute top-10 left-0 bg-[#1a1c20] border border-gray-700 rounded shadow-xl py-2 w-48 z-50 max-h-96 overflow-y-auto">
              <div className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase border-b border-gray-700 mb-1">
                Thể Loại Phim
              </div>
              {categories.length > 0 ? (
                categories.map((cat, index) => {
                  const colorClass =
                    categoryColors[index % categoryColors.length];
                  return (
                    <Link
                      key={cat.id || cat.slug}
                      to={`/the-loai/${cat.slug}`}
                      onClick={() => setIsMenuOpen(false)}
                      className={`block px-4 py-2 text-sm font-medium transition-colors hover:bg-[#2a2d34] ${colorClass}`}
                    >
                      {cat.name}
                    </Link>
                  );
                })
              ) : (
                <div className="px-4 py-2 text-xs text-gray-500">
                  Đang tải...
                </div>
              )}
            </div>
          )}

          <Link
            to="/"
            className="text-xl md:text-2xl font-black tracking-tight cursor-pointer select-none leading-none"
          >
            <span className="text-[#3b82f6]">DUC</span>
            <span className="text-[#60a5fa]">BINH</span>
            <span className="text-[#d97706] -ml-0.5">.ME</span>
          </Link>
        </div>

        {/* Ở giữa: Thanh tìm kiếm cho Desktop */}
        <div className="hidden md:block flex-1 max-w-[550px] mx-6 relative">
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center bg-white rounded-sm pl-3 pr-1 py-1 shadow-inner relative z-10"
          >
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => searchTerm.trim() && setShowDropdown(true)}
              placeholder="Tìm kiếm phim..."
              className="w-full text-gray-800 bg-transparent focus:outline-none text-sm placeholder-gray-400 pr-2"
            />

            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="text-gray-400 hover:text-gray-600 mr-2"
              >
                <FaTimes className="text-xs" />
              </button>
            )}

            <div className="flex items-center space-x-2">
              <button
                type="submit"
                className="bg-[#4b5563] hover:bg-[#374151] text-white text-xs px-3 py-1 rounded transition-colors font-medium flex items-center gap-1 shrink-0"
              >
                <FaSearch className="text-xs" />
                <span>Tìm</span>
              </button>
            </div>
          </form>
        </div>

        {/* Bên phải: Tiện ích & Tài khoản */}
        <div className="flex items-center space-x-2.5 md:space-x-4 shrink-0">
          <button
            type="button"
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            className="md:hidden flex flex-col items-center cursor-pointer hover:text-sky-400 transition-colors p-1"
            title="Tìm kiếm"
          >
            <FaSearch className="text-[#38bdf8] text-base" />
          </button>

          <Link
            to="/lich-su-xem"
            className="flex flex-col items-center cursor-pointer hover:text-sky-400 transition-colors group px-0.5"
            title="Lịch sử xem"
          >
            <FaHistory className="text-[#38bdf8] text-base md:text-lg group-hover:scale-105 transition-transform" />
            <span className="text-[10px] md:text-[11px] mt-1 font-normal text-gray-200 hidden md:block whitespace-nowrap">
              Lịch sử xem
            </span>
          </Link>

          <Link
            to="/favorites"
            className="flex flex-col items-center cursor-pointer hover:text-sky-400 transition-colors group px-0.5"
            title="Phim yêu thích"
          >
            <FaBookmark className="text-[#38bdf8] text-base md:text-lg group-hover:scale-105 transition-transform" />
            <span className="text-[10px] md:text-[11px] mt-1 font-normal text-gray-200 hidden md:block whitespace-nowrap">
              Phim yêu thích
            </span>
          </Link>

          {/* AVATAR HOẶC NÚT ĐĂNG NHẬP */}
          {user ? (
            <div className="relative ml-1" ref={userMenuRef}>
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
              className="bg-gradient-to-r from-[#60a5fa] to-[#38bdf8] hover:opacity-90 text-white text-[11px] md:text-xs font-medium px-2.5 md:px-4 py-1.5 md:py-2 rounded-sm shadow-sm transition-all ml-1 whitespace-nowrap"
            >
              Đăng Nhập
            </button>
          )}
        </div>
      </header>

      {/* Ô tìm kiếm mobile */}
      {isMobileSearchOpen && (
        <div className="block md:hidden bg-[#1c1e22] px-3 py-2 border-t border-gray-800 relative">
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center bg-white rounded-sm pl-3 pr-2 py-1.5 shadow-inner relative z-10"
          >
            <input
              type="text"
              autoFocus
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => searchTerm.trim() && setShowDropdown(true)}
              placeholder="Tìm kiếm phim..."
              className="w-full text-gray-800 bg-transparent focus:outline-none text-sm placeholder-gray-400 pr-2"
            />

            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="text-gray-400 hover:text-gray-600 mr-2"
              >
                <FaTimes className="text-xs" />
              </button>
            )}

            <button
              type="submit"
              className="text-gray-700 hover:text-sky-600 transition-colors p-1"
            >
              <FaSearch className="text-base" />
            </button>
          </form>
        </div>
      )}

      {/* Dropdown tìm kiếm */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 bg-[#1a1c20] border border-gray-700 rounded-b shadow-2xl overflow-hidden z-50 max-h-[420px] overflow-y-auto">
          {isSearching ? (
            <div className="p-4 flex items-center justify-center gap-2 text-gray-400 text-sm">
              <FaSpinner className="animate-spin text-sky-400" />
              <span>Đang tìm kiếm phim...</span>
            </div>
          ) : searchResults.length > 0 ? (
            <div>
              <div className="px-3 py-2 text-[11px] font-semibold text-gray-400 uppercase bg-[#22252a] border-b border-gray-700/60">
                Kết quả tìm kiếm ({searchResults.length})
              </div>
              {searchResults.map((movie) => (
                <Link
                  key={movie.id || movie.slug}
                  to={`/watch/${movie.slug}`}
                  onClick={() => {
                    setShowDropdown(false);
                    setIsMobileSearchOpen(false);
                  }}
                  className="flex items-center gap-3 p-2.5 hover:bg-[#2a2d34] border-b border-gray-800/80 transition group"
                >
                  <img
                    src={
                      movie.poster_url || movie.backdrop_url || "/banner.png"
                    }
                    alt={movie.title}
                    className="w-10 h-14 object-cover rounded shadow shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-100 group-hover:text-sky-400 truncate">
                      {movie.title}
                    </h4>
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {movie.english_title || "Phim 3D Donghua"}
                    </p>
                    <span className="inline-block mt-1 text-[10px] bg-red-600/80 text-white px-1.5 py-0.5 rounded">
                      {movie.episode_info || movie.current_episode || "Full"}
                    </span>
                  </div>
                  <FaPlayCircle className="text-gray-500 group-hover:text-sky-400 text-lg mr-2 shrink-0 transition" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-400 text-sm">
              Không tìm thấy phim nào khớp với "
              <span className="text-amber-400 font-medium">{searchTerm}</span>"
            </div>
          )}
        </div>
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

export default Header;
