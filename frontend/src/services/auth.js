// src/services/auth.js
import API from "./api";

// REGISTER
export const registerUser = (data) => {
  console.log("📤 Registering user:", data.email);
  return API.post("/auth/register", data);
};

// LOGIN
export const loginUser = (data) => {
  console.log("📤 Logging in user:", data.email);
  return API.post("/auth/login", data);
};

// FORGOT PASSWORD
export const forgotPassword = (data) => {
  console.log("📤 Requesting password reset for:", data.email);
  return API.post("/auth/forgot-password", data);
};

// RESET PASSWORD
export const resetPassword = (token, data) => {
  console.log("📤 Resetting password with token");
  return API.post(`/auth/reset-password/${token}`, data);
};

// GET CURRENT USER FROM TOKEN
export const getCurrentUser = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    console.log("🔍 No token found");
    return null;
  }
  
  try {
    // Decode JWT token to get user info
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    const user = JSON.parse(jsonPayload);
    console.log("👤 Current user from token:", user);
    return user;
  } catch (err) {
    console.error("❌ Error decoding token:", err);
    return null;
  }
};

// GET USER PROFILE FROM API
export const getUserProfile = () => {
  console.log("📥 Fetching user profile");
  return API.get("/auth/profile");
};

// LOGOUT
export const logout = () => {
  console.log("👋 Logging out user");
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login";
};