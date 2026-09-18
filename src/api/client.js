import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

let isRefreshing = false;
let refreshQueue = [];

const processQueue = (error) => {
  refreshQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve()));
  refreshQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isStaffRequest = originalRequest.url?.startsWith("/staff") || originalRequest.url?.startsWith("/admin") || originalRequest.url?.startsWith("/superadmin");
    const refreshEndpoint = isStaffRequest ? "/staff/refresh-token" : "/users/refresh-token";

    // Do not trigger refresh token loops for login endpoints or the refresh
    // call itself (either flavor). current-user/current-staff are NOT
    // excluded — an expired access token there should trigger a silent
    // refresh too, otherwise a page reload after token expiry forces a
    // needless re-login even though a valid refresh token exists.
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/login") &&
      !originalRequest.url?.includes("/refresh-token")
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post(refreshEndpoint);
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const unwrap = (axiosPromise) =>
  axiosPromise
    .then((res) => res.data)
    .catch((err) => {
      const message =
        err.response?.data?.message || err.message || "Something went wrong. Please try again.";
      throw new Error(message);
    });

export default api;
