// src/services/api.js
import axios from "axios";

// Create axios instance
const API = axios.create({
  baseURL: "https://rashibazar.onrender.com/api", // Make sure this matches your backend port
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json"
  },
  timeout: 30000,
});

// Request interceptor to add token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (import.meta.env.DEV) {
      console.log(`📤 ${config.method.toUpperCase()} ${config.url}`, config.data || '');
    }

    return config;
  },
  (error) => {
    console.error("❌ Request error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
API.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`✅ ${response.config.method.toUpperCase()} ${response.config.url} - ${response.status}`);
    }
    return response;
  },
  (error) => {
    if (!error.response) {
      console.error("❌ Network Error:", error.message);
      return Promise.reject({
        response: {
          data: {
            message: "Network error. Please check your connection."
          }
        }
      });
    }

    console.error("❌ API Error:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
    });

    if (error.response?.status === 401) {
      console.log("🔒 Unauthorized - clearing session");
      const isAuthEndpoint = error.config?.url?.includes('/auth/');
      if (!isAuthEndpoint) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("astrologer");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default API;