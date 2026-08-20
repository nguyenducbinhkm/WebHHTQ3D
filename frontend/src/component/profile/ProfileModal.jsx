import React, { useState, useRef } from "react";
import PropTypes from "prop-types";
import { FaUser, FaTimes } from "react-icons/fa";
import { supabase } from "../../supabaseClient";

import ProfileInfoTab from "./ProfileInfoTab";
import AvatarTab from "./AvatarTab";
import UsernameTab from "./UsernameTab";
import PasswordTab from "./PasswordTab";

export default function ProfileModal({
  isOpen,
  onClose,
  user,
  onUpdateSuccess,
}) {
  const [activeTab, setActiveTab] = useState("info");
  const [loading, setLoading] = useState(false);

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

  if (!isOpen) return null;

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
            <ProfileInfoTab user={user} onSelectTab={setActiveTab} />
          )}

          {activeTab === "avatar" && (
            <AvatarTab
              avatarPreview={avatarPreview}
              fileInputRef={fileInputRef}
              loading={loading}
              onFileChange={handleFileChange}
              onBack={() => setActiveTab("info")}
              onSubmit={handleUpdateAvatar}
            />
          )}

          {activeTab === "username" && (
            <UsernameTab
              newUsername={newUsername}
              onChangeUsername={setNewUsername}
              loading={loading}
              onBack={() => setActiveTab("info")}
              onSubmit={handleUpdateUsername}
            />
          )}

          {activeTab === "password" && (
            <PasswordTab
              passwordData={passwordData}
              onChangePasswordData={setPasswordData}
              loading={loading}
              onBack={() => setActiveTab("info")}
              onSubmit={handleUpdatePassword}
            />
          )}
        </div>
      </div>
    </div>
  );
}

ProfileModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  user: PropTypes.object,
  onUpdateSuccess: PropTypes.func,
};
