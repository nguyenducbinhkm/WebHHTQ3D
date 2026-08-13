import React, { useState, useEffect } from "react";
import axios from "axios";

// Lấy base URL từ biến môi trường của Vite
const API_URL = import.meta.env.VITE_API_URL;

const daysOfWeek = [
  { key: "mon", label: "Thứ Hai", sub: "Mon", jsDay: 1 },
  { key: "tue", label: "Thứ Ba", sub: "Tue", jsDay: 2 },
  { key: "wed", label: "Thứ Tư", sub: "Wed", jsDay: 3 },
  { key: "thu", label: "Thứ Năm", sub: "Thu", jsDay: 4 },
  { key: "fri", label: "Thứ Sáu", sub: "Fri", jsDay: 5 },
  { key: "sat", label: "Thứ Bảy", sub: "Sat", jsDay: 6 },
  { key: "sun", label: "Chủ Nhật", sub: "Sun", jsDay: 0 },
];

export default function ScheduleSection() {
  // Hàm xác định key của ngày hôm nay theo hệ thống
  const getTodayKey = () => {
    const todayIndex = new Date().getDay(); // 0: Chủ Nhật, 1: Thứ Hai,...
    const current = daysOfWeek.find((d) => d.jsDay === todayIndex);
    return current ? current.key : "mon";
  };

  const [activeDay, setActiveDay] = useState(getTodayKey);
  const [movies, setMovies] = useState([]);
  const [todayString, setTodayString] = useState("");

  // Tự động tạo chuỗi hiển thị ngày tháng năm hiện tại (Ví dụ: Thứ Sáu, ngày 14/08/2026)
  useEffect(() => {
    const now = new Date();
    const options = {
      weekday: "long",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "Asia/Ho_Chi_Minh",
    };

    // Format tiếng Việt chuẩn
    const formatter = new Intl.DateTimeFormat("vi-VN", options);
    setTodayString(formatter.format(now));
  }, []);

  useEffect(() => {
    let isMounted = true;

    axios
      .get(`${API_URL}/api/movies/schedule/${activeDay}`)
      .then((res) => {
        if (!isMounted) return;
        const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setMovies(data);
      })
      .catch((err) => {
        console.error("Lỗi lấy lịch phim:", err);
        if (isMounted) setMovies([]);
      });

    return () => {
      isMounted = false;
    };
  }, [activeDay]);

  return (
    <div className="bg-[#0b0f19] text-white p-6 my-6 rounded-2xl max-w-7xl mx-auto">
      {/* Header Lịch Phim */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-yellow-500 tracking-wide">
          Lịch Phim
        </h2>
        <div className="bg-[#2d2342] text-purple-200 px-4 py-1.5 rounded-full text-sm font-medium border border-purple-500/30 capitalize">
          Hôm nay: {todayString || "Đang cập nhật..."}
        </div>
      </div>

      {/* Thanh chọn ngày */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 mb-8">
        {daysOfWeek.map((day) => {
          const isActive = activeDay === day.key;
          return (
            <button
              key={day.key}
              onClick={() => setActiveDay(day.key)}
              className={`flex flex-col items-center justify-center py-3 px-4 rounded-xl transition-all duration-200 border ${
                isActive
                  ? "bg-sky-400 text-slate-950 font-bold border-sky-400 shadow-lg shadow-sky-500/20"
                  : "bg-[#182232] text-gray-300 hover:bg-[#223048] border-transparent"
              }`}
            >
              <span className="text-base">{day.label}</span>
              <span
                className={`text-xs mt-0.5 uppercase ${isActive ? "text-slate-800 font-semibold" : "text-gray-400"}`}
              >
                {day.sub}
              </span>
            </button>
          );
        })}
      </div>

      {/* Danh sách phim theo ngày */}
      {movies.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          Chưa có lịch phát sóng cho ngày này.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {movies.map((m) => (
            <a
              key={m.id || m.slug}
              href={`/watch/${m.slug}`}
              className="group bg-[#151c2d] rounded-2xl overflow-hidden border border-gray-800 hover:border-sky-500/50 transition-all duration-300 shadow-lg flex flex-col"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-gray-900">
                <img
                  src={m.poster_url || m.backdrop_url}
                  alt={m.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-orange-600/90 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-md">
                  {m.status || "Ongoing"}
                </div>
              </div>
              <div className="p-3">
                <p className="text-white font-medium text-sm truncate group-hover:text-sky-400 transition-colors">
                  {m.title}
                </p>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
