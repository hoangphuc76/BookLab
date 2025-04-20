// src/apiClient.js
import axios from "axios";
import { store } from "../store/store";
import { refreshTokenThunk, logout } from "../features/Auth/AuthSlice";
import { showLoader, hideLoader } from "../utils/loaderSlice";

const apiClient = axios.create({
  baseURL: "https://booklab-demo.runasp.net/odata",
  withCredentials: true, // Cho phép gửi Cookie trong các request
});

// Hiển thị loader trước mỗi request
apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Tự động refresh Access Token khi gặp lỗi 401
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await store.dispatch(refreshTokenThunk()).unwrap();
        return apiClient(originalRequest);
      } catch (err) {
        store.dispatch(logout());
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);
export const getApiUrl = (endpoint) => {
  const baseURL = "https://booklab-demo.runasp.net/odata"; // Base URL mặc định
  return baseURL.replace('/odata', '') + endpoint; // Loại bỏ /odata và nối với endpoint
};
export default apiClient;