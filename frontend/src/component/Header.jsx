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
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Header = () => {
  const [categories, setCategories] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // States cho tính năng Tìm kiếm
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const searchRef = useRef(null);
  const navigate = useNavigate();

  // 1. Gọi API lấy danh sách Thể Loại từ Backend FastAPI
  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/categories")
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setCategories(data);
      })
      .catch((err) => console.error("Lỗi kết nối API Thể loại:", err));
  }, []);

  // 2. Đóng menu thể loại khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 3. Tự động tìm kiếm trực tiếp (Live Search + Debounce 300ms)
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
        .get(
          `http://127.0.0.1:8000/api/movies/search?q=${encodeURIComponent(query)}`,
        )
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

  // 4. Xử lý khi nhấn Submit Form
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setShowDropdown(false);
      navigate(`/tim-kiem?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  // Mảng các class màu sắc luân phiên cho thể loại phim
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
    <header className="bg-[#22252a] text-white px-5 py-2.5 flex items-center justify-between shadow-md relative z-50">
      {/* Bên trái: Menu Icon (Dropdown Thể Loại) + Logo */}
      <div className="flex items-center space-x-3 relative" ref={menuRef}>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="text-white hover:text-sky-400 text-xl focus:outline-none p-1 transition-colors flex items-center gap-1"
        >
          <FaBars />
          <FaCaretDown className="text-xs text-gray-400" />
        </button>

        {/* Dropdown danh sách Thể Loại từ DB */}
        {isMenuOpen && (
          <div className="absolute top-10 left-0 bg-[#1a1c20] border border-gray-700 rounded shadow-xl py-2 w-48 z-50 max-h-96 overflow-y-auto">
            <div className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase border-b border-gray-700 mb-1">
              Thể Loại Phim
            </div>
            {categories.length > 0 ? (
              categories.map((cat, index) => {
                // Lấy màu xoay vòng theo index
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
              <div className="px-4 py-2 text-xs text-gray-500">Đang tải...</div>
            )}
          </div>
        )}

        {/* Logo DUCBINH.ME */}
        <Link
          to="/"
          className="text-2xl font-black tracking-tight cursor-pointer select-none leading-none"
        >
          <span className="text-[#3b82f6]">DUC</span>
          <span className="text-[#60a5fa]">BINH</span>
          <span className="text-[#d97706] -ml-0.5">.ME</span>
        </Link>
      </div>

      {/* Ở giữa: Thanh tìm kiếm thông minh (Live Search) */}
      <div className="flex-1 max-w-[550px] mx-6 relative" ref={searchRef}>
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

          {/* Nút xóa từ khóa nếu đã nhập */}
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
              className="bg-[#4b5563] hover:bg-[#374151] text-white text-xs px-3 py-1 rounded transition-colors font-medium flex items-center gap-1"
            >
              <FaSearch className="text-xs" />
              <span>Tìm</span>
            </button>
          </div>
        </form>

        {/* Dynamic Live Search Dropdown */}
        {showDropdown && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1c20] border border-gray-700 rounded-b shadow-2xl overflow-hidden z-50 max-h-[420px] overflow-y-auto">
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
                    onClick={() => setShowDropdown(false)}
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
                <span className="text-amber-400 font-medium">{searchTerm}</span>
                "
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bên phải: Lịch sử, Yêu thích + Đăng nhập */}
      <div className="flex items-center space-x-4">
        {/* Lịch sử xem */}
        <Link
          to="/lich-su"
          className="flex flex-col items-center cursor-pointer hover:text-sky-400 transition-colors group px-1"
        >
          <FaHistory className="text-[#38bdf8] text-lg group-hover:scale-105 transition-transform" />
          <span className="text-[11px] mt-1 font-normal text-gray-200 whitespace-nowrap">
            Lịch sử xem
          </span>
        </Link>

        {/* Phim yêu thích */}
        <Link
          to="/favorites"
          className="flex flex-col items-center cursor-pointer hover:text-sky-400 transition-colors group px-1"
        >
          <FaBookmark className="text-[#38bdf8] text-lg group-hover:scale-105 transition-transform" />
          <span className="text-[11px] mt-1 font-normal text-gray-200 whitespace-nowrap">
            Phim yêu thích
          </span>
        </Link>

        {/* Nút Đăng Nhập */}
        <button className="bg-gradient-to-r from-[#60a5fa] to-[#38bdf8] hover:opacity-90 text-white text-xs font-medium px-4 py-2 rounded-sm shadow-sm transition-all ml-2 whitespace-nowrap">
          Đăng Nhập
        </button>
      </div>
    </header>
  );
};

export default Header;
