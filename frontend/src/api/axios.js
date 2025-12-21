import axios from "axios";

const api = axios.create({
  // baseURL: "http://localhost:8000/api",
  baseURL: "https://getadoc.onrender.com/api",
  withCredentials: true, // 🔑 REQUIRED for JWT cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Optional: global error handling (safe to keep)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired / not authenticated
      console.warn("Unauthorized request");
    }
    return Promise.reject(error);
  }
);

export default api;
