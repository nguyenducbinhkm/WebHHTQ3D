import React, { useState } from "react";
import PropTypes from "prop-types";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function LoginForm({
  onSubmit,
  initialUsername,
  rememberMeDefault,
}) {
  const [loginData, setLoginData] = useState({
    username: initialUsername || "",
    password: "",
    rememberMe: rememberMeDefault || false,
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(loginData);
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
            {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
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
  );
}

LoginForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  initialUsername: PropTypes.string,
  rememberMeDefault: PropTypes.bool,
};
