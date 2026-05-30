// src/services/api.js
import axios from "axios";

const PRODUCTION_API = "https://rashibazar.onrender.com/api";

// Dev: Vite proxies /api → http://localhost:5000 (see vite.config.js)
// Prod: set VITE_API_BASE_URL on Vercel, or falls back to Render
const baseURL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? "/api" : PRODUCTION_API);

const API = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
  timeout: Number(import.meta.env.VITE_API_TIMEOUT_MS) || 60000,
});

// Request interceptor to add token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (import.meta.env.DEV) {
      console.log(`   ${config.method.toUpperCase()} ${config.url}`, config.data || '');
    }

    return config;
  },
  (error) => {
    console.error("   Request error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
API.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`   ${response.config.method.toUpperCase()} ${response.config.url} - ${response.status}`);
    }
    return response;
  },
  (error) => {
    if (!error.response) {
      const isTimeout = error.code === "ECONNABORTED";
      const isLocalDev = import.meta.env.DEV && baseURL === "/api";

      let message = "Network error. Please check your connection.";
      if (isTimeout) {
        message = baseURL.startsWith("http")
          ? "The server is taking too long to respond. Wait a moment and try again (hosted APIs may need time to wake up)."
          : "Request timed out. Make sure the backend is running on port 5000.";
      } else if (isLocalDev) {
        message =
          "Cannot reach the local API. Start the backend with: cd backend && npm run dev";
      }

      console.error("   Network Error:", {
        code: error.code,
        message: error.message,
        baseURL,
      });

      return Promise.reject({
        response: { data: { message } },
        isNetworkError: true,
      });
    }

    console.error("   API Error:", {
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

/** Ping hosted API (e.g. Render cold start) before slow auth actions */
export const wakeServer = () =>
  API.get("/health", { timeout: 90000 }).catch(() => null);

export default API;