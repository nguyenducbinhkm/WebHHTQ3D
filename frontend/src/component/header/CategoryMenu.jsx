import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaCaretDown } from "react-icons/fa";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

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

const CategoryMenu = () => {
  const [categories, setCategories] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

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
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative shrink-0" ref={menuRef}>
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="text-white hover:text-sky-400 text-lg focus:outline-none p-1 transition-colors flex items-center gap-1"
      >
        <FaBars />
        <FaCaretDown className="text-xs text-gray-400" />
      </button>

      {isMenuOpen && (
        <div className="absolute top-10 left-0 bg-[#1a1c20] border border-gray-700 rounded shadow-xl py-2 w-48 z-50 max-h-96 overflow-y-auto">
          <Link
            to="/movies/completed"
            onClick={() => setIsMenuOpen(false)}
            className="block px-4 py-2 text-sm font-semibold transition-colors hover:text-sky-400 text-white border-b border-gray-700 pb-2 mb-1"
          >
            Phim Đã Hoàn Thành
          </Link>

          <div className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase mt-1 mb-1">
            Thể Loại
          </div>

          {categories.length > 0 ? (
            categories.map((cat, index) => {
              const colorClass = categoryColors[index % categoryColors.length];
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
    </div>
  );
};

export default CategoryMenu;
