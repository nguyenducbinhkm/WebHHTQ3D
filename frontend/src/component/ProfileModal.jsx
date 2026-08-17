import React, { useState, useRef } from "react";
import { FaUser, FaLock, FaImage, FaTimes, FaCamera } from "react-icons/fa";
import { supabase } from "../supabaseClient";

export default function ProfileModal({
  isOpen,
  onClose,
  user,
  onUpdateSuccess,
}) {
  const [activeTab, setActiveTab] = useState("info");

  const getUserId = async () => {
    if (user?.id) return user.id;
    try {
      const localUser = JSON.parse(localStorage.getItem("user"));
      if (localUser?.id) return localUser.id;
    } catch (e) {}
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.user?.id;
  };

  const [newUsername, setNewUsername] = useState(user?.username || "");
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(
    user?.avatar || user?.avatar_url || "https://via.placeholder.com/150",
  );
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (avatarPreview && avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
      setSelectedFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateUsername = async (e) => {
    e.preventDefault();
    const userId = await getUserId();
    if (!userId) {
      alert("Không tìm thấy ID người dùng. Vui lòng đăng nhập lại!");
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from("users")
        .update({ username: newUsername })
        .eq("id", userId);

      if (error) throw error;

      const updatedUser = {
        ...(user || {}),
        id: userId,
        username: newUsername,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      onUpdateSuccess?.(updatedUser);
      alert("Đổi tên hiển thị thành công!");
      onClose();
    } catch (error) {
      alert("Lỗi: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Mật khẩu mới không khớp!");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      alert("Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }
    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });
      if (error) throw error;
      alert("Đổi mật khẩu thành công!");
      onClose();
    } catch (error) {
      alert("Lỗi: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAvatar = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert("Vui lòng chọn ảnh trước khi lưu!");
      return;
    }

    const userId = await getUserId();
    if (!userId) {
      alert("Lỗi xác thực người dùng! Không tìm thấy ID.");
      return;
    }

    try {
      setLoading(true);
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${userId}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, selectedFile, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;

      const { error: updateError } = await supabase
        .from("users")
        .update({ avatar_url: publicUrl })
        .eq("id", userId);

      if (updateError) throw updateError;

      const updatedUser = {
        ...(user || {}),
        id: userId,
        avatar_url: publicUrl,
        avatar: publicUrl,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      onUpdateSuccess?.(updatedUser);

      alert("Cập nhật ảnh đại diện thành công!");
      onClose();
    } catch (error) {
      alert("Không thể tải ảnh: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-[#181b20] border border-gray-700/80 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden relative text-gray-200">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-700/60 bg-[#1e2329]">
          <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2">
            <FaUser /> Quản lý thông tin cá nhân
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-6">
          {activeTab === "info" && (
            <div className="space-y-5">
              <div className="flex flex-col items-center pb-4 border-b border-gray-700/50">
                <img
                  src={
                    user?.avatar_url ||
                    user?.avatar ||
                    "https://via.placeholder.com/150"
                  }
                  alt="Avatar"
                  className="w-24 h-24 rounded-full object-cover border-4 border-amber-400/80 shadow-lg"
                />
                <h4 className="mt-3 font-bold text-white text-lg">
                  {user?.username || "Người dùng"}
                </h4>
                <p className="text-xs text-gray-400">{user?.email || ""}</p>
              </div>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setActiveTab("avatar")}
                  className="w-full flex items-center justify-between p-3.5 bg-black/30 hover:bg-white/5 rounded-xl border border-gray-700/50 transition"
                >
                  <div className="flex items-center gap-3 text-sky-400">
                    <FaImage /> Thay đổi Avatar
                  </div>
                  <span className="text-xs text-sky-400 font-semibold px-3 py-1 bg-sky-500/10 rounded-lg">
                    Chọn
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("username")}
                  className="w-full flex items-center justify-between p-3.5 bg-black/30 hover:bg-white/5 rounded-xl border border-gray-700/50 transition"
                >
                  <div className="flex items-center gap-3 text-emerald-400">
                    <FaUser /> Thay đổi Username
                  </div>
                  <span className="text-xs text-emerald-400 font-semibold px-3 py-1 bg-emerald-500/10 rounded-lg">
                    Đổi tên
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("password")}
                  className="w-full flex items-center justify-between p-3.5 bg-black/30 hover:bg-white/5 rounded-xl border border-gray-700/50 transition"
                >
                  <div className="flex items-center gap-3 text-amber-400">
                    <FaLock /> Thay đổi Mật khẩu
                  </div>
                  <span className="text-xs text-amber-400 font-semibold px-3 py-1 bg-amber-500/10 rounded-lg">
                    Cập nhật
                  </span>
                </button>
              </div>
            </div>
          )}

          {activeTab === "avatar" && (
            <form onSubmit={handleUpdateAvatar} className="space-y-4">
              <h4 className="text-sm font-semibold text-amber-400 mb-2">
                Cập nhật ảnh đại diện mới từ thiết bị
              </h4>
              <div className="flex flex-col items-center gap-4 py-2">
                <div className="relative">
                  <img
                    src={avatarPreview}
                    alt="Preview"
                    className="w-24 h-24 rounded-full object-cover border-4 border-amber-400/80 shadow-md"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    className="absolute bottom-0 right-0 p-2 bg-amber-500 rounded-full hover:bg-amber-400 transition shadow"
                  >
                    <FaCamera className="text-white text-xs" />
                  </button>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-xs text-gray-300 rounded-xl transition"
                >
                  Chọn ảnh từ máy tính
                </button>
                <p className="text-xs text-gray-400">
                  Định dạng hỗ trợ: JPG, PNG, WEBP
                </p>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("info")}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-xs font-semibold rounded-xl transition"
                >
                  Quay lại
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-xl transition disabled:opacity-50"
                >
                  {loading ? "Đang tải lên..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          )}

          {activeTab === "username" && (
            <form onSubmit={handleUpdateUsername} className="space-y-4">
              <h4 className="text-sm font-semibold text-amber-400 mb-2">
                Đổi tên hiển thị (Username)
              </h4>
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Tên tài khoản mới
                </label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full bg-black/40 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 transition"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("info")}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-xs font-semibold rounded-xl transition"
                >
                  Quay lại
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition disabled:opacity-50"
                >
                  {loading ? "Đang lưu..." : "Xác nhận đổi tên"}
                </button>
              </div>
            </form>
          )}

          {activeTab === "password" && (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <h4 className="text-sm font-semibold text-amber-400 mb-2">
                Thay đổi mật khẩu tài khoản
              </h4>
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  className="w-full bg-black/40 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Nhập lại mật khẩu mới
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full bg-black/40 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 transition"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("info")}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-xs font-semibold rounded-xl transition"
                >
                  Quay lại
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-xl transition disabled:opacity-50"
                >
                  {loading ? "Đang xử lý..." : "Cập nhật mật khẩu"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
