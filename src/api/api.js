import axios from "axios";

const API = axios.create({
  baseURL: "https://lms-micro-certification-backend.onrender.com/api", // Adjust this according to your backend
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

export default API;
