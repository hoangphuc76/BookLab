// src/apiClient.js
import axios from "axios";
import { store } from "../store/store";
import { refreshTokenThunk, logout } from "../features/Auth/AuthSlice";
import { showLoader, hideLoader } from "../utils/loaderSlice";

const apiClient = axios.create({
  baseURL: "https://booklab-demo.runasp.net/odata",
  withCredentials: true, // Cho phép gửi Cookie trong các request
});

// Remove loader dispatch
apiClient.interceptors.request.use(
  (config) => {
    // store.dispatch(showLoader()); // Removed
    return config;
  },
  (error) => {
    // store.dispatch(hideLoader()); // Removed
    return Promise.reject(error);
  }
);

// Remove loader dispatch in response handler too
apiClient.interceptors.response.use(
  (response) => {
    // store.dispatch(hideLoader()); // Removed
    return response;
  },
  async (error) => {
    // store.dispatch(hideLoader()); // Removed
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

export default apiClient;