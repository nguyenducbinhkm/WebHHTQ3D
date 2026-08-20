import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import CommentItem from "./CommentItem";
import CommentForm from "./CommentForm";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function CommentSection({ movieId }) {
  const [comments, setComments] = useState([]);
  const [newContent, setNewContent] = useState("");
  const [loading, setLoading] = useState(false);

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
      fetchComments(1);
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

      <CommentForm
        newContent={newContent}
        setNewContent={setNewContent}
        onSubmit={handleSubmitComment}
        loading={loading}
      />

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
