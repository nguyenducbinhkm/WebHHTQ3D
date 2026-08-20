import React from "react";
import PropTypes from "prop-types";

export default function CommentForm({
  newContent,
  setNewContent,
  onSubmit,
  loading,
}) {
  return (
    <form onSubmit={onSubmit} className="mb-6">
      <textarea
        rows="3"
        value={newContent}
        onChange={(e) => setNewContent(e.target.value)}
        placeholder="Viết bình luận của bạn..."
        className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500 text-sm resize-none"
        required
      />
      <div className="flex justify-end mt-2">
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2 bg-red-600 hover:bg-red-700 text-sm font-semibold rounded-lg transition duration-200 disabled:opacity-50"
        >
          {loading ? "Đang gửi..." : "Gửi bình luận"}
        </button>
      </div>
    </form>
  );
}

CommentForm.propTypes = {
  newContent: PropTypes.string.isRequired,
  setNewContent: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
};
