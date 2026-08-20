import React from "react";

export default function AdminDescriptionModal({
  editingMovie,
  modalDescription,
  setModalDescription,
  onClose,
  onSave,
}) {
  if (!editingMovie) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1f2126] border border-gray-700 rounded-lg w-full max-w-lg p-6 shadow-2xl text-white">
        <h2 className="text-xl font-bold mb-4 text-sky-400">
          Chỉnh Sửa Nội Dung: {editingMovie.title}
        </h2>

        <div className="mb-4">
          <label className="block text-xs uppercase text-gray-400 mb-2">
            Nội Dung Mô Tả (Description)
          </label>
          <textarea
            rows="6"
            value={modalDescription}
            onChange={(e) => setModalDescription(e.target.value)}
            className="w-full bg-[#121315] border border-gray-700 rounded p-3 text-sm text-white focus:outline-none focus:border-sky-500"
            placeholder="Nhập nội dung mô tả phim..."
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm font-semibold transition"
          >
            Hủy
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-black rounded text-sm font-bold transition"
          >
            Lưu Thay Đổi
          </button>
        </div>
      </div>
    </div>
  );
}
