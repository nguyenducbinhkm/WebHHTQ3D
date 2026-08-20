import React, { useState } from "react";
import { FaSearch, FaHistory, FaBookmark } from "react-icons/fa";
import { Link } from "react-router-dom";
import CategoryMenu from "./CategoryMenu";
import SearchBar from "./SearchBar";
import UserSection from "./UserSection";

const Header = () => {
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  return (
    <div className="relative z-50">
      {/* Header chính */}
      <header className="bg-[#22252a] text-white px-3 md:px-5 py-2.5 flex items-center justify-between shadow-md relative gap-2">
        {/* Bên trái: Menu Thể loại + Logo */}
        <div className="flex items-center space-x-2 md:space-x-3 relative shrink-0">
          <CategoryMenu />

          <Link
            to="/"
            className="text-xl md:text-2xl font-black tracking-tight cursor-pointer select-none leading-none"
          >
            <span className="text-[#3b82f6]">DUC</span>
            <span className="text-[#60a5fa]">BINH</span>
            <span className="text-[#d97706] -ml-0.5">.ME</span>
          </Link>
        </div>

        {/* Ở giữa: Thanh tìm kiếm Desktop */}
        <SearchBar
          isMobileSearchOpen={isMobileSearchOpen}
          setIsMobileSearchOpen={setIsMobileSearchOpen}
        />

        {/* Bên phải: Tiện ích (Tìm kiếm mobile, Lịch sử, Yêu thích) & Tài khoản */}
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

          {/* Phần Đăng nhập & Avatar */}
          <UserSection />
        </div>
      </header>
    </div>
  );
};

export default Header;
