import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const CommentSection = ({ movieId }) => {
  const [comments, setComments] = useState([]);
  const [newContent, setNewContent] = useState("");
  const [loading, setLoading] = useState(false);

  // 1. Lấy danh sách bình luận khi component được load hoặc movieId thay đổi
  useEffect(() => {
    if (!movieId) return;
    const fetchComments = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/api/movies/${movieId}/comments`,
        );
        setComments(response.data);
      } catch (error) {
        console.error("Lỗi khi tải bình luận:", error);
      }
    };
    fetchComments();
  }, [movieId]);

  // 2. Gửi bình luận mới
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    setLoading(true);
    try {
      // Lấy token đăng nhập từ localStorage (nếu có) để xác thực người dùng thật
      const token = localStorage.getItem("access_token");
      const headers = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      await axios.post(
        `${API_URL}/api/movies/${movieId}/comments?content=${encodeURIComponent(newContent)}`,
        {},
        { headers },
      );

      setNewContent(""); // Xóa ô nhập
      // Tải lại danh sách bình luận ngay lập tức
      const response = await axios.get(
        `${API_URL}/api/movies/${movieId}/comments`,
      );
      setComments(response.data);
    } catch (error) {
      console.error("Lỗi khi gửi bình luận:", error);
      alert(
        error.response?.data?.detail || "Có lỗi xảy ra khi đăng bình luận!",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 bg-gray-900 p-6 rounded-xl text-white shadow-lg">
      <h3 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">
        Bình luận ({comments.length})
      </h3>

      {/* Form viết bình luận */}
      <form onSubmit={handleSubmitComment} className="mb-6">
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

      {/* Danh sách bình luận */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-gray-400 text-sm italic text-center py-4">
            Chưa có bình luận nào cho bộ phim này. Hãy là người đầu tiên bình
            luận!
          </p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-gray-800/60 p-4 rounded-lg border border-gray-700/50"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-red-400 text-sm">
                  {comment.username}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(comment.created_at).toLocaleDateString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </span>
              </div>
              <p className="text-gray-200 text-sm mt-1 whitespace-pre-line">
                {comment.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

CommentSection.propTypes = {
  movieId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default CommentSection;
