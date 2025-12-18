import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4444/api";

let accessToken: string | null = null;
export function setAccessToken(token?: string | null) {
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
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      (config.headers as any).Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let pendingQueue: Array<{ resolve: (t: string | null) => void; reject: (e: any) => void; }> = [];

function processQueue(error: any, token: string | null = null) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  pendingQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};
    const status = error.response?.status;

    const isAuthPath = (p: string | undefined) =>
      typeof p === "string" &&
      /^\/auth\/(login|register|refresh|google|logout)/.test(p);

    if (status === 401 && !originalRequest._retry && !isAuthPath(originalRequest.url)) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (token && originalRequest.headers)
              originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { getCsrfToken } = await import("../utils/auth");
        const csrf = getCsrfToken();
        const res = await api.post(
          "/auth/refresh",
          {},
          { headers: { "x-csrf-token": csrf || "" } }
        );
        const newToken = res.data?.data?.accessToken as string | undefined;
        setAccessToken(newToken || null);
        processQueue(null, newToken || null);
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        clearAccessToken();
        const publicPaths = ['/', '/explore', '/aboutus', '/auth'];
        const currentPath = window.location.pathname;
        const isPublicPage = publicPaths.some(path => 
          currentPath === path || currentPath.startsWith(path + '/')
        );
        if (!isPublicPage) {
          window.location.href = "/auth/login";
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
