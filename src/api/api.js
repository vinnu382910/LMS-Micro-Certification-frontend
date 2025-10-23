// src/api/api.js
import axios from "axios";

// Create axios instance
const API = axios.create({
  baseURL: "https://lms-micro-certification-backend.onrender.com/",
  timeout: 10000, // 10 seconds timeout
});

// ------------------------
// Request interceptor
// ------------------------
API.interceptors.request.use(
  (req) => {
    const token = localStorage.getItem("token");
    if (token) {
      req.headers.Authorization = `Bearer ${token}`;
    }
    req.headers["Content-Type"] = "application/json"; // ensure JSON
    return req;
  },
  (error) => {
    console.error("⚠️ Request error:", error);
    return Promise.reject(error);
  }
);

// ------------------------
// Response interceptor
// ------------------------
API.interceptors.response.use(
  (res) => {
    // ✅ You can do global success handling here if needed
    console.log("✅ API Response:", res);
    return res;
  },
  (error) => {
    // Global error handling
    if (error.response) {
      // Server responded with a status code outside 2xx
      console.error(
        `❌ API Error [${error.response.status}]:`,
        error.response.data
      );
      return Promise.reject(error.response.data);
    } else if (error.request) {
      // Request was made but no response
      console.error("❌ No response received:", error.request);
      return Promise.reject({ message: "No response from server" });
    } else {
      // Something happened setting up the request
      console.error("❌ API setup error:", error.message);
      return Promise.reject({ message: error.message });
    }
  }
);

export default API;
