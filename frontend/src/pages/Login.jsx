// src/pages/Login.jsx
import { useState } from "react";
import { loginUser } from "../services/auth";
import { useNavigate } from "react-router-dom";
import heroImage from "../assets/hero-cosmic.jpg";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Both fields are required");
      return;
    }

    try {
      const res = await loginUser(form);
      localStorage.setItem("token", res.data.token);
      alert("Login successful!");
      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    if (!resetEmail) {
      setError("Enter your email to reset password");
      return;
    }
    try {
      await forgotPassword({ email: resetEmail });
      alert("Password reset link sent to your email (mock)");
      setShowForgot(false);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-[#0a0a1a] via-[#1a0f3a] to-[#000000] text-white relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: `url(${heroImage})` }}
      ></div>

      <form
        onSubmit={handleSubmit}
        className="relative bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-96 border border-white/20"
      >
        <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-500 text-transparent bg-clip-text">
          🔮 Welcome Back
        </h2>

        {error && <div className="bg-red-500/20 text-red-300 p-2 rounded mb-4">{error}</div>}

        <input
          className="border border-purple-400 bg-transparent p-2 mb-4 w-full rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 outline-none"
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
        />

        <div className="relative mb-4">
          <input
            className="border border-purple-400 bg-transparent p-2 w-full rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 outline-none"
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            onChange={handleChange}
          />
          <span
            className="absolute right-3 top-2.5 cursor-pointer text-gray-400"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "🙈" : "👁️"}
          </span>
        </div>

        <div className="text-right text-sm mb-4">
          <button
            type="button"
            onClick={() => setShowForgot(!showForgot)}
            className="text-yellow-400 hover:text-pink-400"
          >
            Forgot Password?
          </button>
        </div>

        <button
          className="bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-400 text-white px-4 py-2 w-full rounded-md hover:scale-105 transition-transform duration-200"
          type="submit"
        >
          Login
        </button>

        {/* Google Login */}
        <button
          type="button"
          onClick={() => alert("Google login coming soon!")}
          className="w-full flex items-center justify-center gap-2 mt-3 bg-white text-black py-2 rounded-md font-semibold hover:bg-gray-200 transition"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="w-5 h-5"
          />
          Login with Google
        </button>

        {showForgot && (
          <div className="mt-6 border-t border-white/20 pt-4">
            <h3 className="text-md mb-2 text-center">🔐 Reset Password</h3>
            <input
              type="email"
              placeholder="Enter your email"
              className="border border-purple-400 bg-transparent p-2 mb-3 w-full rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 outline-none"
              onChange={(e) => setResetEmail(e.target.value)}
            />
            <button
              className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2 w-full rounded-md hover:scale-105 transition-transform"
              onClick={handleForgot}
            >
              Send Reset Link
            </button>
          </div>
        )}

        <p className="text-sm text-center mt-4 text-gray-300">
          Don’t have an account?{" "}
          <span
            className="text-yellow-400 hover:text-pink-400 cursor-pointer"
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </span>
        </p>

        {/* Back to Home */}
        <button
          onClick={() => navigate("/")}
          type="button"
          className="w-full mt-6 text-sm text-yellow-400 hover:text-pink-400 underline transition"
        >
          ⬅ Back to Home
        </button>
      </form>
    </div>
  );
}
