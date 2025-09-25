import axios from "axios";
import Cookies from "js-cookie";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4444/api";

// In-memory access token for Authorization header
let accessToken = null;
export function setAccessToken(token) {
  accessToken = token || null;
}
export function clearAccessToken() {
  accessToken = null;
}
export function getAccessToken() {
  return accessToken;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // send/receive cookies
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let pendingQueue = [];

function processQueue(error, token = null) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  pendingQueue = [];
}

// Response interceptor to handle 401 with refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    const isAuthPath = (p) =>
      typeof p === "string" &&
      /^\/auth\/(login|signup|refresh|google-id|logout)/.test(p);

    if (
      status === 401 &&
      !originalRequest._retry &&
      !isAuthPath(originalRequest.url)
    ) {
      if (isRefreshing) {
        // Queue requests while refreshing
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (token)
              originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const csrf = Cookies.get("csrf_token");
        const res = await api.post(
          "/auth/refresh",
          {},
          {
            headers: { "x-csrf-token": csrf || "" },
          }
        );
        const newToken = res.data?.accessToken;
        setAccessToken(newToken);
        processQueue(null, newToken);
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        clearAccessToken();
        // optional: redirect to login
        window.location.href = "/auth/login";
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
