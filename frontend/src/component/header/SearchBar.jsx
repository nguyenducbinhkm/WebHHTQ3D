import React, { useState, useEffect, useRef } from "react";
import { FaSearch, FaTimes, FaSpinner, FaPlayCircle } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const SearchBar = ({ isMobileSearchOpen, setIsMobileSearchOpen }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
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

  return (
    <div className="relative w-full" ref={searchRef}>
      {/* Thanh tìm kiếm Desktop */}
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
          <button
            type="submit"
            className="bg-[#4b5563] hover:bg-[#374151] text-white text-xs px-3 py-1 rounded transition-colors font-medium flex items-center gap-1 shrink-0"
          >
            <FaSearch className="text-xs" />
            <span>Tìm</span>
          </button>
        </form>
      </div>

      {/* Thanh tìm kiếm Mobile */}
      {isMobileSearchOpen && (
        <div className="block md:hidden bg-[#1c1e22] px-3 py-2 border-t border-gray-800 absolute top-full left-0 right-0 z-50">
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center bg-white rounded-sm pl-3 pr-2 py-1.5 shadow-inner"
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

      {/* Dropdown Kết Quả Tìm Kiếm */}
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
    </div>
  );
};

export default SearchBar;
