import React, { useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { FaHeart, FaRegHeart, FaReply } from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function CommentItem({ comment, movieId, onActionSuccess }) {
  const [likes, setLikes] = useState(comment.likes_count || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

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
      onActionSuccess();
    } catch (error) {
      alert(error.response?.data?.detail || "Lỗi khi gửi phản hồi!");
    }
  };

  const defaultAvatar =
    "https://i.pinimg.com/originals/c6/e5/65/c6e56503cfdd87da299f72dc416023d4.jpg";

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
}

CommentItem.propTypes = {
  comment: PropTypes.object.isRequired,
  movieId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onActionSuccess: PropTypes.func.isRequired,
};
