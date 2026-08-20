import React from "react";

export default function AdminToolbar({
  bannerCount,
  rankingCount,
  savingBanner,
  savingRanking,
  searchTerm,
  setSearchTerm,
  onSaveBanner,
  onSaveRanking,
  onSearch,
}) {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
      <h1 className="text-2xl font-bold text-sky-400">
        Quản Lý Phim & Đánh Giá (Admin)
      </h1>

      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
        <button
          onClick={onSaveBanner}
          disabled={savingBanner}
          className="px-4 py-1.5 bg-amber-500 text-black font-bold rounded text-sm hover:bg-amber-400 transition disabled:opacity-50"
        >
          {savingBanner ? "Đang lưu..." : `Lưu Banner Top 5 (${bannerCount}/5)`}
        </button>

        <button
          onClick={onSaveRanking}
          disabled={savingRanking}
          className="px-4 py-1.5 bg-purple-500 text-black font-bold rounded text-sm hover:bg-purple-400 transition disabled:opacity-50"
        >
          {savingRanking ? "Đang lưu..." : `Lưu BXH Top 8 (${rankingCount}/8)`}
        </button>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Tìm theo tên phim..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-[#1f2126] border border-gray-700 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-sky-500 w-48"
          />
          <button
            onClick={onSearch}
            className="px-4 py-1.5 bg-sky-500 text-black font-semibold rounded text-sm hover:bg-sky-400 transition"
          >
            Tìm
          </button>
        </div>
      </div>
    </div>
  );
}
