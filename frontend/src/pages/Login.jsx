// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, forgotPassword, redirectBasedOnRole } from "../services/auth";
import heroImage from "../assets/hero-cosmic.jpg";
import toast from "react-hot-toast";

export default function Login() {
  const [activeTab, setActiveTab] = useState("user");
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  //
  // =========================
  // LOGIN
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Both fields are required");
      return;
    }

    setLoading(true);

    try {
      await loginUser({
        email: form.email,
        password: form.password,
        role: activeTab,
      });

      // ✅ Centralized redirect (handles admin/user/astrologer)
      const redirectPath = redirectBasedOnRole();
      navigate(redirectPath);

    } catch (err) {
      const message =
        err.response?.data?.message || "Invalid credentials";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  //
  // =========================
  // FORGOT PASSWORD
  // =========================
  const handleForgot = async (e) => {
    e.preventDefault();
    setError("");

    if (!resetEmail) {
      setError("Enter your email to reset password");
      return;
    }

    setLoading(true);

    try {
      await forgotPassword({
        email: resetEmail,
        role: activeTab,
      });

      toast.success("Password reset link sent!");
      setShowForgot(false);
      setResetEmail("");
    } catch (err) {
      const message =
        err.response?.data?.message || "Something went wrong";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0a0a1a] via-[#1a0f3a] to-[#000000] text-white relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: `url(${heroImage})` }}
      />

      <div className="relative bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-[450px] border border-white/20">

        {/* HEADER */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-500 text-transparent bg-clip-text">
            Welcome to RashiBazar
          </h2>
        </div>

        {/* TABS */}
        <div className="flex gap-2 mb-8 bg-black/30 rounded-lg p-1">
          {["user", "astrologer"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setError("");
                setForm({ email: "", password: "" });
              }}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                activeTab === tab
                  ? "bg-gradient-to-r from-yellow-400 to-pink-500 text-black"
                  : "text-gray-300 hover:text-white hover:bg-white/10"
              }`}
            >
              {tab === "user" ? "User" : "Astrologer"}
            </button>
          ))}
        </div>

        {!showForgot ? (
          <>
            {/* TITLE */}
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-yellow-300 mb-2">
                {activeTab === "user" ? "Sign In" : "Astrologer Sign In"}
              </h3>
              <p className="text-sm text-gray-300">
                {activeTab === "user"
                  ? "Continue your astrological journey"
                  : "Access your professional dashboard"}
              </p>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-500/20 text-red-300 p-3 rounded mb-4 text-sm">
                  {error}
                </div>
              )}

              {/* EMAIL */}
              <div className="mb-4">
                <label className="block text-sm text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="border border-purple-400 bg-transparent p-3 w-full rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 outline-none"
                  required
                />
              </div>

              {/* PASSWORD */}
              <div className="mb-4">
                <label className="block text-sm text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="border border-purple-400 bg-transparent p-3 w-full rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-yellow-400"
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {/* FORGOT */}
              <div className="text-right mb-6">
                <button
                  type="button"
                  onClick={() => setShowForgot(true)}
                  className="text-sm text-yellow-400 hover:text-pink-400"
                >
                  Forgot Password?
                </button>
              </div>

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-400 py-3 rounded-lg font-semibold hover:scale-105 transition disabled:opacity-50"
              >
                {loading ? "Signing In..." : "Sign In"}
              </button>
            </form>

            {/* SIGNUP */}
            <p className="text-sm text-center mt-6 text-gray-300">
              Don't have an account?{" "}
              <span
                onClick={() => navigate("/signup")}
                className="text-yellow-400 hover:text-pink-400 cursor-pointer font-semibold"
              >
                Sign Up
              </span>
            </p>

          </>
        ) : (
          /* FORGOT PASSWORD */
          <form onSubmit={handleForgot}>
            <h3 className="text-xl font-semibold text-center text-yellow-400 mb-2">
              Reset Password
            </h3>

            {error && (
              <div className="bg-red-500/20 text-red-300 p-2 rounded mb-4 text-sm">
                {error}
              </div>
            )}

            <input
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="Enter your email"
              className="border border-purple-400 bg-transparent p-3 mb-4 w-full rounded-lg"
              required
            />

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowForgot(false)}
                className="flex-1 bg-gray-600 py-2 rounded-lg"
              >
                Back
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 py-2 rounded-lg"
              >
                {loading ? "Sending..." : "Send Link"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}