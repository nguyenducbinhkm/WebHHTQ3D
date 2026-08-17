import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { FaHeart, FaRegHeart, FaReply } from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const CommentItem = ({ comment, movieId, onActionSuccess }) => {
  const [likes, setLikes] = useState(comment.likes_count || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  // Lấy thông tin user hiện tại từ localStorage để dự phòng hiển thị avatar nếu trùng khớp
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  // Xử lý thả tym / hủy tym
  const handleLike = async () => {
    try {
      const res = await axios.post(
        `${API_URL}/api/comments/${comment.id}/like`,
      );
      setLikes(res.data.likes_count);
      setIsLiked(!isLiked);
    } catch (error) {
      console.error("Lỗi thả tym:", error);
    }
  };

  // Xử lý gửi trả lời bình luận
  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    try {
      const token = localStorage.getItem("access_token");
      const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      };

      await axios.post(
        `${API_URL}/api/movies/${movieId}/comments`,
        { content: replyContent, parent_id: comment.id },
        { headers },
      );

      setReplyContent("");
      setShowReplyBox(false);
      onActionSuccess(); // Load lại danh sách bình luận
    } catch (error) {
      alert(error.response?.data?.detail || "Lỗi khi gửi phản hồi!");
    }
  };

  // Link avatar mặc định nếu user chưa có ảnh
  const defaultAvatar = "https://via.placeholder.com/150";

  // Hàm helper để lấy avatar chuẩn (ưu tiên dữ liệu từ comment, nếu trùng user hiện tại lấy từ localStorage, không thì dùng mặc định)
  const getAvatar = (item) => {
    if (item.avatar_url) return item.avatar_url;
    if (item.avatar) return item.avatar;
    if (
      currentUser &&
      currentUser.username === item.username &&
      currentUser.avatar
    ) {
      return currentUser.avatar;
    }
    return defaultAvatar;
  };

  return (
    <div className="bg-gray-800/60 p-4 rounded-lg border border-gray-700/50 space-y-2">
      {/* Thông tin user: Avatar tròn + Tên + Thời gian */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img
            src={getAvatar(comment)}
            alt={comment.username}
            className="w-7 h-7 rounded-full object-cover border border-gray-600"
          />
          <span className="font-semibold text-red-400 text-sm">
            {comment.username}
          </span>
        </div>
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

      <p className="text-gray-200 text-sm whitespace-pre-line pl-9">
        {comment.content}
      </p>

      {/* Thanh tương tác: Tym & Trả lời */}
      <div className="flex items-center gap-4 text-xs text-gray-400 pt-1 pl-9">
        <button
          onClick={handleLike}
          className="flex items-center gap-1 hover:text-red-500 transition"
        >
          {isLiked ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
          <span>{likes}</span>
        </button>

        <button
          onClick={() => setShowReplyBox(!showReplyBox)}
          className="flex items-center gap-1 hover:text-sky-400 transition"
        >
          <FaReply />
          <span>Trả lời</span>
        </button>
      </div>

      {/* Ô nhập phản hồi */}
      {showReplyBox && (
        <form
          onSubmit={handleSendReply}
          className="mt-3 pl-9 border-l-2 border-sky-500 space-y-2"
        >
          <textarea
            rows="2"
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder={`Phản hồi ${comment.username}...`}
            className="w-full p-2 bg-gray-900 border border-gray-700 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500 resize-none"
            required
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowReplyBox(false)}
              className="px-3 py-1 bg-gray-700 text-xs rounded hover:bg-gray-600 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-3 py-1 bg-sky-500 text-xs rounded hover:bg-sky-600 font-semibold transition"
            >
              Gửi
            </button>
          </div>
        </form>
      )}

      {/* Hiển thị các câu trả lời con (nested replies) */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 pl-6 border-l border-gray-700 space-y-3">
          {comment.replies.map((reply) => (
            <div
              key={reply.id}
              className="bg-gray-900/50 p-3 rounded-md text-xs space-y-1"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <img
                    src={getAvatar(reply)}
                    alt={reply.username}
                    className="w-6 h-6 rounded-full object-cover border border-gray-700"
                  />
                  <span className="font-semibold text-sky-400">
                    {reply.username}
                  </span>
                </div>
                <span className="text-gray-500 font-normal">
                  {new Date(reply.created_at).toLocaleDateString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    day: "2-digit",
                    month: "2-digit",
                  })}
                </span>
              </div>
              <p className="text-gray-300 pl-8">{reply.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

CommentItem.propTypes = {
  comment: PropTypes.object.isRequired,
  movieId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onActionSuccess: PropTypes.func.isRequired,
};

export default function CommentSection({ movieId }) {
  const [comments, setComments] = useState([]);
  const [newContent, setNewContent] = useState("");
  const [loading, setLoading] = useState(false);

  // States phân trang
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchComments = async (currentPage = 1) => {
    if (!movieId) return;
    try {
      const res = await axios.get(
        `${API_URL}/api/movies/${movieId}/comments?page=${currentPage}&limit=5`,
      );
      setComments(res.data.comments);
      setTotalPages(res.data.total_pages);
      setPage(res.data.page);
    } catch (error) {
      console.error("Lỗi tải bình luận:", error);
    }
  };

  useEffect(() => {
    fetchComments(1);
  }, [movieId]);

  // Gửi bình luận gốc mới
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      };

      await axios.post(
        `${API_URL}/api/movies/${movieId}/comments`,
        { content: newContent, parent_id: null },
        { headers },
      );

      setNewContent("");
      fetchComments(1); // Tải lại danh sách ở trang đầu tiên
    } catch (error) {
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
        Bình luận
      </h3>

      {/* Form viết bình luận gốc */}
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
            <CommentItem
              key={comment.id}
              comment={comment}
              movieId={movieId}
              onActionSuccess={() => fetchComments(page)}
            />
          ))
        )}
      </div>

      {/* Thanh phân trang */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-6">
          <button
            disabled={page === 1}
            onClick={() => fetchComments(page - 1)}
            className="px-3 py-1 bg-gray-800 rounded text-xs disabled:opacity-40 hover:bg-gray-700 transition"
          >
            Trang trước
          </button>
          <span className="text-xs text-gray-400">
            Trang {page} / {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => fetchComments(page + 1)}
            className="px-3 py-1 bg-gray-800 rounded text-xs disabled:opacity-40 hover:bg-gray-700 transition"
          >
            Trang sau
          </button>
        </div>
      )}
    </div>
  );
}

CommentSection.propTypes = {
  movieId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};
