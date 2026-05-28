// src/services/auth.js
import API, { wakeServer } from "./api";
import toast from "react-hot-toast";

//
// =========================
// REGISTER USER
// =========================
export const registerUser = async (data) => {
  try {
    console.log("📤 Registering user:", data.email);
    const response = await API.post("/auth/register/user", data);

    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.removeItem("astrologer");
      toast.success("Registration successful!");
    }

    return response;
  } catch (error) {
    console.error("❌ Registration error:", error.response?.data || error.message);
    toast.error(error.response?.data?.message || "Registration failed");
    throw error;
  }
};

//
// =========================
// REGISTER ASTROLOGER
// =========================
export const registerAstrologer = async (data) => {
  try {
    console.log("📤 Registering astrologer:", data.email);
    const response = await API.post("/auth/register/astrologer", data);

    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("astrologer", JSON.stringify(response.data.astrologer));
      localStorage.removeItem("user");
      toast.success("Registration successful! Waiting for admin approval.");
    }

    return response;
  } catch (error) {
    console.error("❌ Astrologer registration error:", error.response?.data || error.message);
    toast.error(error.response?.data?.message || "Registration failed");
    throw error;
  }
};

//
// =========================
// LOGIN (USER / ADMIN / ASTROLOGER)
// =========================
export const loginUser = async (data) => {
  try {
    console.log("📤 Logging in:", data.email, "as", data.role);
    const response = await API.post("/auth/login", data);

    if (response.data.token) {
      localStorage.setItem("token", response.data.token);

      if (response.data.user) {
        // Handles both user + admin
        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.removeItem("astrologer");
        console.log("👤 User/Admin logged in:", response.data.user);
      } else if (response.data.astrologer) {
        localStorage.setItem("astrologer", JSON.stringify(response.data.astrologer));
        localStorage.removeItem("user");
        console.log("👤 Astrologer logged in:", response.data.astrologer);
      }

      toast.success("Login successful!");
    }

    return response;
  } catch (error) {
    console.error("❌ Login error:", error.response?.data || error.message);
    toast.error(error.response?.data?.message || "Login failed");
    throw error;
  }
};

//
// =========================
// FORGOT PASSWORD
// =========================
const FORGOT_PASSWORD_TIMEOUT_MS = 120000;

export const forgotPassword = async (data) => {
  console.log("📤 Requesting password reset for:", data.email);

  const requestOpts = { timeout: FORGOT_PASSWORD_TIMEOUT_MS };
  let lastError;

  for (let attempt = 0; attempt < 2; attempt++) {
    if (attempt > 0) {
      toast.loading("Waking up server, retrying…", { id: "forgot-retry" });
      await wakeServer();
    }

    try {
      const response = await API.post("/auth/forgot-password", data, requestOpts);
      toast.dismiss("forgot-retry");
      toast.success("Password reset email sent!");
      return response;
    } catch (error) {
      lastError = error;
      const hasApiResponse = error.response && !error.isNetworkError;
      if (hasApiResponse || attempt === 1) break;
    }
  }

  const errData = lastError?.response?.data;
  const msg =
    errData?.message ||
    errData?.error ||
    lastError?.message ||
    "Failed to send reset email";
  console.error("❌ Forgot password error:", msg, errData || "");
  toast.dismiss("forgot-retry");
  toast.error(msg);
  throw lastError;
};

//
// =========================
// RESET PASSWORD
// =========================
export const resetPassword = async (token, data) => {
  try {
    console.log("📤 Resetting password");
    const response = await API.post(`/auth/reset-password/${token}`, data);
    toast.success("Password reset successful!");
    return response;
  } catch (error) {
    console.error("❌ Reset password error:", error.response?.data || error.message);
    toast.error(error.response?.data?.message || "Password reset failed");
    throw error;
  }
};

//
// =========================
// CHANGE PASSWORD (logged in)
// =========================
export const changePassword = async (data) => {
  try {
    const response = await API.put("/auth/change-password", data);
    toast.success("Password changed successfully");
    return response;
  } catch (error) {
    const msg = error.response?.data?.message || "Failed to change password";
    toast.error(msg);
    throw error;
  }
};

//
// =========================
// GET PROFILE FROM API
// =========================
export const getUserProfile = async () => {
  try {
    console.log("📥 Fetching profile");
    return await API.get("/auth/profile");
  } catch (error) {
    console.error("❌ Profile fetch error:", error.response?.data || error.message);
    throw error;
  }
};

//
// =========================
// STORAGE HELPERS
// =========================
export const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};

export const getCurrentAstrologer = () => {
  try {
    return JSON.parse(localStorage.getItem("astrologer"));
  } catch {
    return null;
  }
};

//
// =========================
// ROLE HELPERS
// =========================
export const getCurrentRole = () => {
  const user = getCurrentUser();
  if (user) return user.role === "admin" ? "admin" : "user";

  const astrologer = getCurrentAstrologer();
  if (astrologer) return "astrologer";

  return null;
};

export const hasRole = (role) => {
  return getCurrentRole() === role;
};

export const isAdmin = () => {
  return getCurrentRole() === "admin";
};

//
// =========================
// AUTH CHECK
// =========================
export const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  if (!token) return false;

  const decoded = decodeToken();
  if (!decoded?.exp) return false;

  return decoded.exp * 1000 > Date.now();
};

//
// =========================
// LOGOUT
// =========================
export const logout = () => {
  console.log("👋 Logging out");

  localStorage.clear();

  toast.success("Logged out successfully");

  setTimeout(() => {
    window.location.href = "/login";
  }, 500);
};

//
// =========================
// AUTH HEADER
// =========================
export const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

//
// =========================
// DECODE JWT
// =========================
export const decodeToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error("❌ Token decode error:", err);
    return null;
  }
};

//
// =========================
// REDIRECT BASED ON ROLE
// =========================
export const redirectBasedOnRole = () => {
  const role = getCurrentRole();

  switch (role) {
    case "admin":
      return "/admin/dashboard";
    case "user":
      return "/home";
    case "astrologer":
      return "/astrologer/dashboard";
    default:
      return "/login";
  }
};

//
// =========================
// EXPORT DEFAULT
// =========================
export default {
  registerUser,
  registerAstrologer,
  loginUser,
  forgotPassword,
  resetPassword,
  changePassword,
  getUserProfile,
  getCurrentUser,
  getCurrentAstrologer,
  getCurrentRole,
  hasRole,
  isAdmin,
  isAuthenticated,
  logout,
  getAuthHeader,
  decodeToken,
  redirectBasedOnRole,
};