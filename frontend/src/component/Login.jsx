import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function Login({ isOpen, onClose, onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);

  // States ẩn/hiện mật khẩu
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // States cho form Đăng Nhập
  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
    rememberMe: false,
  });

  // States cho form Đăng Ký
  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const savedUsername = localStorage.getItem("saved_username");
    if (savedUsername) {
      setLoginData((prev) => ({
        ...prev,
        username: savedUsername,
        rememberMe: true,
      }));
    }
  }, []);

  if (!isOpen) return null;

  const handleLoginSubmit = (e) => {
    e.preventDefault();

    if (loginData.rememberMe) {
      localStorage.setItem("saved_username", loginData.username);
    } else {
      localStorage.removeItem("saved_username");
    }

    console.log("Login data:", loginData);

    // Gọi hàm báo đăng nhập thành công để đổi giao diện ở Header
    onLoginSuccess();

    alert("Đăng nhập thành công!");
    onClose();
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirmPassword) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }
    console.log("Register data:", registerData);
    alert("Đăng ký thành công!");
    setIsLogin(true);
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

        {/* FORM ĐĂNG NHẬP */}
        {isLogin ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Tên đăng nhập
              </label>
              <input
                type="text"
                required
                value={loginData.username}
                onChange={(e) =>
                  setLoginData({ ...loginData, username: e.target.value })
                }
                placeholder="Nhập tên đăng nhập..."
                className="w-full bg-[#121315] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-sky-500 transition text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={loginData.password}
                  onChange={(e) =>
                    setLoginData({ ...loginData, password: e.target.value })
                  }
                  placeholder="••••••••"
                  className="w-full bg-[#121315] border border-gray-700 rounded-lg px-4 py-2.5 pr-10 text-white focus:outline-none focus:border-sky-500 transition text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                >
                  {showPassword ? (
                    <FaEyeSlash size={16} />
                  ) : (
                    <FaEye size={16} />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-gray-300 select-none">
                <input
                  type="checkbox"
                  checked={loginData.rememberMe}
                  onChange={(e) =>
                    setLoginData({ ...loginData, rememberMe: e.target.checked })
                  }
                  className="w-4 h-4 rounded bg-[#121315] border-gray-700 text-sky-500 focus:ring-sky-500 focus:ring-offset-[#1a1c23] cursor-pointer"
                />
                <span>Ghi nhớ đăng nhập</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2.5 rounded-lg transition shadow-lg shadow-sky-500/30 mt-2"
            >
              Đăng Nhập
            </button>
          </form>
        ) : (
          /* FORM ĐĂNG KÝ */
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Tên đăng nhập
              </label>
              <input
                type="text"
                required
                value={registerData.username}
                onChange={(e) =>
                  setRegisterData({ ...registerData, username: e.target.value })
                }
                placeholder="Chọn tên đăng nhập..."
                className="w-full bg-[#121315] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-sky-500 transition text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Địa chỉ email
              </label>
              <input
                type="email"
                required
                value={registerData.email}
                onChange={(e) =>
                  setRegisterData({ ...registerData, email: e.target.value })
                }
                placeholder="name@example.com"
                className="w-full bg-[#121315] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-sky-500 transition text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Mật khẩu email
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={registerData.password}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      password: e.target.value,
                    })
                  }
                  placeholder="••••••••"
                  className="w-full bg-[#121315] border border-gray-700 rounded-lg px-4 py-2.5 pr-10 text-white focus:outline-none focus:border-sky-500 transition text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                >
                  {showPassword ? (
                    <FaEyeSlash size={16} />
                  ) : (
                    <FaEye size={16} />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Xác nhận lại mật khẩu email
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={registerData.confirmPassword}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      confirmPassword: e.target.value,
                    })
                  }
                  placeholder="••••••••"
                  className="w-full bg-[#121315] border border-gray-700 rounded-lg px-4 py-2.5 pr-10 text-white focus:outline-none focus:border-sky-500 transition text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                >
                  {showConfirmPassword ? (
                    <FaEyeSlash size={16} />
                  ) : (
                    <FaEye size={16} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2.5 rounded-lg transition shadow-lg shadow-sky-500/30 mt-2"
            >
              Đăng Ký
            </button>
          </form>
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
