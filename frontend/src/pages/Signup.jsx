// src/pages/Signup.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { registerUser, registerAstrologer } from "../services/auth";
import heroImage from "../assets/hero-cosmic.jpg";
import toast from "react-hot-toast";
import Layout from "../components/Layout";

const Signup = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("user");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeAstrologerTerms, setAgreeAstrologerTerms] = useState(false);

  // User form data
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: ""
  });

  // Astrologer form data
  const [astrologerForm, setAstrologerForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    experience: "",
    pricePerSession: ""
  });

  const handleUserChange = (e) => {
    setUserForm({
      ...userForm,
      [e.target.name]: e.target.value
    });
  };

  const handleAstrologerChange = (e) => {
    const { name, value } = e.target;
    setAstrologerForm({
      ...astrologerForm,
      [name]: value
    });
  };

  const validatePassword = (password) => {
    return /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/.test(password);
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const { name, email, password, confirmPassword, phone } = userForm;

    if (!name || !email || !password || !confirmPassword || !phone) {
      setError("All fields are required");
      return;
    }

    if (!validatePassword(password)) {
      setError("Password must be at least 8 characters with a number and special character");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!agreeTerms) {
      setError("Please agree to the Terms & Conditions");
      return;
    }

    setLoading(true);
    try {
      const response = await registerUser(userForm);

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      toast.success("Registration successful!");
      navigate("/login");
    } catch (error) {
      setError(error.response?.data?.message || "Registration failed");
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleAstrologerSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const { name, email, password, confirmPassword, phone, experience, pricePerSession } = astrologerForm;

    if (!name || !email || !password || !confirmPassword || !phone) {
      setError("All fields are required");
      return;
    }

    if (!validatePassword(password)) {
      setError("Password must be at least 8 characters with a number and special character");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!experience || experience <= 0) {
      setError("Please enter valid years of experience");
      return;
    }

    if (!pricePerSession || pricePerSession <= 0) {
      setError("Please enter a valid price per session");
      return;
    }

    if (!agreeAstrologerTerms) {
      setError("Please agree to the Astrologer Terms & Conditions");
      return;
    }

    setLoading(true);
    try {
      const response = await registerAstrologer(astrologerForm);

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("astrologer", JSON.stringify(response.data.astrologer));

      toast.success("Registration successful! Your profile is pending admin approval.");
      navigate("/login");
    } catch (error) {
      setError(error.response?.data?.message || "Registration failed");
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[80vh] relative z-10 w-full px-4 py-8">
        <div className="relative bg-white/10 backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-2xl border border-white/20">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-500 text-transparent bg-clip-text">
            Join RashiBazar
          </h2>
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-2 mb-6 bg-black/30 rounded-lg p-1">
          <button
            onClick={() => {
              setActiveTab("user");
              setError("");
            }}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all ${activeTab === "user"
                ? "bg-gradient-to-r from-yellow-400 to-pink-500 text-black"
                : "text-gray-300 hover:text-white hover:bg-white/10"
              }`}
          >
            User
          </button>
          <button
            onClick={() => {
              setActiveTab("astrologer");
              setError("");
            }}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all ${activeTab === "astrologer"
                ? "bg-gradient-to-r from-yellow-400 to-pink-500 text-black"
                : "text-gray-300 hover:text-white hover:bg-white/10"
              }`}
          >
            Astrologer
          </button>
        </div>

        {/* User Signup Form */}
        {activeTab === "user" && (
          <>
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-yellow-300 mb-2">Create Account</h3>
              <p className="text-sm text-gray-300">Join thousands of users exploring their cosmic journey</p>
            </div>

            <form onSubmit={handleUserSubmit} className="space-y-4">
              {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-lg text-sm">{error}</div>}

              <div>
                <label className="block text-sm text-gray-300 mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={userForm.name}
                  onChange={handleUserChange}
                  className="w-full px-4 py-3 bg-black/50 border border-purple-400 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter your phone number"
                  value={userForm.phone}
                  onChange={handleUserChange}
                  className="w-full px-4 py-3 bg-black/50 border border-purple-400 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={userForm.email}
                  onChange={handleUserChange}
                  className="w-full px-4 py-3 bg-black/50 border border-purple-400 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    value={userForm.password}
                    onChange={handleUserChange}
                    className="w-full px-4 py-3 bg-black/50 border border-purple-400 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 outline-none"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">Minimum 8 chars, 1 number & 1 special character</p>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={userForm.confirmPassword}
                    onChange={handleUserChange}
                    className="w-full px-4 py-3 bg-black/50 border border-purple-400 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 outline-none"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="terms" className="text-sm text-gray-300">
                  I agree to the <span className="text-yellow-400">Terms & Conditions</span> and <span className="text-yellow-400">Privacy Policy</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-400 text-white py-3 rounded-lg font-semibold hover:scale-105 transition-transform duration-200 disabled:opacity-50"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            <p className="text-sm text-center mt-6 text-gray-300">
              Already have an account?{" "}
              <span
                className="text-yellow-400 hover:text-pink-400 cursor-pointer transition font-semibold"
                onClick={() => navigate("/login")}
              >
                Sign In
              </span>
            </p>
          </>
        )}

        {/* Astrologer Signup Form */}
        {activeTab === "astrologer" && (
          <>
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-yellow-300 mb-2">Join as Astrologer</h3>
              <p className="text-sm text-gray-300">Share your expertise and help people find their path</p>
              <p className="text-xs text-yellow-400 mt-2">⚠️ Your profile will be reviewed by admin before activation</p>
            </div>

            <form onSubmit={handleAstrologerSubmit} className="space-y-4">
              {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-lg text-sm">{error}</div>}

              <div>
                <label className="block text-sm text-gray-300 mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={astrologerForm.name}
                  onChange={handleAstrologerChange}
                  className="w-full px-4 py-3 bg-black/50 border border-purple-400 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Years of Experience</label>
                <input
                  type="number"
                  name="experience"
                  placeholder="Enter years of experience"
                  value={astrologerForm.experience}
                  onChange={handleAstrologerChange}
                  min="0"
                  step="1"
                  className="w-full px-4 py-3 bg-black/50 border border-purple-400 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter your phone number"
                  value={astrologerForm.phone}
                  onChange={handleAstrologerChange}
                  className="w-full px-4 py-3 bg-black/50 border border-purple-400 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={astrologerForm.email}
                  onChange={handleAstrologerChange}
                  className="w-full px-4 py-3 bg-black/50 border border-purple-400 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Price Per Session (Npr)</label>
                <input
                  type="number"
                  name="pricePerSession"
                  placeholder="Enter price per session"
                  value={astrologerForm.pricePerSession}
                  onChange={handleAstrologerChange}
                  min="0"
                  step="100"
                  className="w-full px-4 py-3 bg-black/50 border border-purple-400 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    value={astrologerForm.password}
                    onChange={handleAstrologerChange}
                    className="w-full px-4 py-3 bg-black/50 border border-purple-400 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 outline-none"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">Minimum 8 chars, 1 number & 1 special character</p>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={astrologerForm.confirmPassword}
                    onChange={handleAstrologerChange}
                    className="w-full px-4 py-3 bg-black/50 border border-purple-400 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 outline-none"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="astrologerTerms"
                  checked={agreeAstrologerTerms}
                  onChange={(e) => setAgreeAstrologerTerms(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="astrologerTerms" className="text-sm text-gray-300">
                  I agree to the <span className="text-yellow-400">Astrologer Terms & Conditions</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-400 text-white py-3 rounded-lg font-semibold hover:scale-105 transition-transform duration-200 disabled:opacity-50"
              >
                {loading ? "Registering..." : "Register as Astrologer"}
              </button>
            </form>

            <p className="text-sm text-center mt-6 text-gray-300">
              Already registered?{" "}
              <span
                className="text-yellow-400 hover:text-pink-400 cursor-pointer transition font-semibold"
                onClick={() => navigate("/login")}
              >
                Sign In
              </span>
            </p>
          </>
        )}

        {/* Back to Home */}
        <button
          onClick={() => navigate("/")}
          className="w-full mt-4 text-sm text-yellow-400 hover:text-pink-400 underline transition"
        >
          Back to Home
        </button>
      </div>
      </div>
    </Layout>
  );
};

export default Signup;