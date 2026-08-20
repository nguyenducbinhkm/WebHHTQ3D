import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function Login({ isOpen, onClose, onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [savedUsername, setSavedUsername] = useState("");
  const [rememberMeDefault, setRememberMeDefault] = useState(false);

  useEffect(() => {
    const userStored = localStorage.getItem("saved_username");
    if (userStored) {
      setSavedUsername(userStored);
      setRememberMeDefault(true);
    }
  }, []);

  if (!isOpen) return null;

  // XỬ LÝ ĐĂNG NHẬP THẬT QUA BACKEND
  const handleLoginSubmit = async (loginData) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: loginData.username,
          password: loginData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Đăng nhập thất bại!");
      }

      // 1. Lấy hoặc giải mã user ID
      let userId = data.id || data.user_id;
      if (!userId && data.access_token) {
        try {
          const base64Url = data.access_token.split(".")[1];
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split("")
              .map(function (c) {
                return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
              })
              .join(""),
          );
          const payload = JSON.parse(jsonPayload);
          userId = payload.id || payload.sub || payload.user_id;
        } catch (err) {
          console.error("Không thể giải mã token:", err);
        }
      }

      // 2. Lấy avatar từ response hoặc fetch profile dự phòng
      let userAvatar = data.avatar || "";
      if (!userAvatar && data.access_token) {
        try {
          const profileRes = await fetch(
            `${API_URL}/api/users/profile/${loginData.username}`,
            {
              headers: { Authorization: `Bearer ${data.access_token}` },
            },
          );
          if (profileRes.ok) {
            const profileData = await profileRes.json();
            userAvatar = profileData.avatar || "";
          }
        } catch (err) {
          console.log("Không thể fetch thêm avatar:", err);
        }
      }

      // Lưu Token và thông tin user vào localStorage
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: userId || 1,
          username: loginData.username,
          avatar: userAvatar,
        }),
      );

      if (loginData.rememberMe) {
        localStorage.setItem("saved_username", loginData.username);
      } else {
        localStorage.removeItem("saved_username");
      }

      alert("Đăng nhập thành công!");
      onLoginSuccess();
      onClose();
      window.location.reload();
    } catch (error) {
      alert(error.message);
    }
  };

  // XỬ LÝ ĐĂNG KÝ THẬT QUA BACKEND
  const handleRegisterSubmit = async (registerData) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: registerData.username,
          email: registerData.email,
          password: registerData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Đăng ký thất bại!");
      }

      alert("Đăng ký tài khoản thành công! Hãy chuyển sang đăng nhập.");
      setIsLogin(true);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-[#1a1c23] border border-gray-800 rounded-xl overflow-hidden shadow-2xl p-8 text-white">
        {/* Nút Đóng (X) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-lg transition"
        >
          ✕
        </button>

        {/* Tiêu đề */}
        <h2 className="text-2xl font-bold text-center mb-6 text-sky-400">
          {isLogin ? "Đăng Nhập Tài Khoản" : "Đăng Ký Tài Khoản"}
        </h2>

        {/* Hiển thị form tương ứng */}
        {isLogin ? (
          <LoginForm
            onSubmit={handleLoginSubmit}
            initialUsername={savedUsername}
            rememberMeDefault={rememberMeDefault}
          />
        ) : (
          <RegisterForm onSubmit={handleRegisterSubmit} />
        )}

        {/* Chuyển đổi giữa Đăng nhập / Đăng ký */}
        <div className="text-center mt-6 text-sm text-gray-400">
          {isLogin ? (
            <p>
              Chưa có tài khoản?{" "}
              <button
                onClick={() => setIsLogin(false)}
                className="text-sky-400 font-medium hover:underline focus:outline-none ml-1"
              >
                Đăng ký ngay
              </button>
            </p>
          ) : (
            <p>
              Đã có tài khoản?{" "}
              <button
                onClick={() => setIsLogin(true)}
                className="text-sky-400 font-medium hover:underline focus:outline-none ml-1"
              >
                Đăng nhập
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

Login.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onLoginSuccess: PropTypes.func.isRequired,
};
