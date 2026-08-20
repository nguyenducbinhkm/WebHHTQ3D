import React, { useState } from "react";
import PropTypes from "prop-types";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function RegisterForm({ onSubmit }) {
  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirmPassword) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }
    onSubmit(registerData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          Mật khẩu
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            required
            value={registerData.password}
            onChange={(e) =>
              setRegisterData({ ...registerData, password: e.target.value })
            }
            placeholder="••••••••"
            className="w-full bg-[#121315] border border-gray-700 rounded-lg px-4 py-2.5 pr-10 text-white focus:outline-none focus:border-sky-500 transition text-sm"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
          >
            {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Xác nhận lại mật khẩu
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
  );
}

RegisterForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
};
