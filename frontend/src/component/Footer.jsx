import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaTelegram, FaPaperPlane, FaArrowUp } from "react-icons/fa";

const Footer = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Hiển thị nút cuộn lên đầu khi cuộn xuống dưới
  useEffect(() => {
    const checkScrollTop = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener("scroll", checkScrollTop);
    return () => window.removeEventListener("scroll", checkScrollTop);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className="bg-[#1a1c20] text-gray-400 border-t border-gray-800 pt-10 pb-6 px-6 relative mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {/* Cột 1: Logo và Mô tả */}
        <div>
          <Link
            to="/"
            className="text-2xl font-black tracking-tight cursor-pointer select-none leading-none inline-block mb-3"
          >
            <span className="text-[#3b82f6]">DUC</span>
            <span className="text-[#60a5fa]">BINH</span>
            <span className="text-[#d97706] -ml-0.5">.ME</span>
          </Link>
          <p className="text-xs text-gray-400 leading-relaxed mb-4">
            Nền tảng xem phim hoạt hình 3D, Donghua thuyết minh và Vietsub chất
            lượng cao hàng đầu. Cập nhật các bộ phim mới nhất mỗi ngày.
          </p>
          <div className="text-xs text-gray-500">
            © 2026 <span className="text-gray-300 font-medium">DUCBINH.ME</span>
            . All rights reserved.
          </div>
        </div>

        {/* Cột 2: Liên kết nhanh */}
        <div>
          <h4 className="text-sm font-semibold text-gray-200 uppercase tracking-wider mb-3">
            Khám phá
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link to="/" className="hover:text-sky-400 transition-colors">
                Trang chủ
              </Link>
            </li>
            <li>
              <Link
                to="/lich-su"
                className="hover:text-sky-400 transition-colors"
              >
                Lịch sử xem
              </Link>
            </li>
            <li>
              <Link
                to="/favorites"
                className="hover:text-sky-400 transition-colors"
              >
                Phim yêu thích
              </Link>
            </li>
          </ul>
        </div>

        {/* Cột 3: Hỗ trợ & Liên hệ */}
        <div>
          <h4 className="text-sm font-semibold text-gray-200 uppercase tracking-wider mb-3">
            Hỗ trợ & Liên hệ
          </h4>
          <p className="text-xs text-gray-400 mb-3">
            Mọi thắc mắc, báo lỗi tập phim hoặc hợp tác xin vui lòng liên hệ
            qua:
          </p>
          <div className="flex items-center gap-2 text-xs text-sky-400 mb-2">
            <FaTelegram className="text-sm" />
            <span>
              Telegram / Signal:{" "}
              <strong className="text-gray-200">@DucBinh020806</strong>
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-300">
            <FaPaperPlane className="text-sm text-sky-400" />
            <span>Hỗ trợ trực tuyến 24/7</span>
          </div>
        </div>
      </div>

      {/* Dòng phân cách dưới */}
      <div className="max-w-7xl mx-auto pt-4 border-t border-gray-800/60 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500">
        <p>DUCBINH.ME | Hoạt Hình Trung Quốc Thuyết Minh Vietsub 4K</p>
        <p className="mt-2 sm:mt-0">Design & Developed with passion.</p>
      </div>

      {/* Nút Back to Top */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-[#22252a] hover:bg-sky-500 text-white p-3 rounded-full shadow-lg border border-gray-700 transition-all duration-300 group z-50 flex items-center justify-center"
          title="Lên đầu trang"
        >
          <FaArrowUp className="text-xs group-hover:-translate-y-0.5 transition-transform" />
        </button>
      )}
    </footer>
  );
};

export default Footer;
