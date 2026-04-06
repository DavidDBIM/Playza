import axios from "axios";

// ── Token storage helpers ──────────────────────────────────────────────────
export const TokenStorage = {
  getAccessToken: () => localStorage.getItem("playza_token"),
  getRefreshToken: () => localStorage.getItem("playza_refresh_token"),
  setTokens: (access: string, refresh: string) => {
    localStorage.setItem("playza_token", access);
    localStorage.setItem("playza_refresh_token", refresh);
  },
  clearTokens: () => {
    localStorage.removeItem("playza_token");
    localStorage.removeItem("playza_refresh_token");
  },
};

const axiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// ── Request interceptor: attach access token ───────────────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    const token = TokenStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Track in-flight refresh to avoid parallel refresh storms ──────────────
let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processPendingQueue(err: unknown, token: string | null) {
  pendingQueue.forEach(({ resolve, reject }) =>
    err ? reject(err) : resolve(token!),
  );
  pendingQueue = [];
}

// ── Response interceptor: silent refresh on 401 ────────────────────────────
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as typeof error.config & {
      _retry?: boolean;
    };

    // Parse a clean error message
    let message: string = error.message || "An unexpected error occurred.";
    if (error.response?.data) {
      const d = error.response.data;
      if (d.message) {
        message = d.message;
      } else if (d.errors) {
        message = `Validation Error: ${Object.entries(d.errors)
          .map(([f, m]) => `${f}: ${(m as string[]).join(", ")}`)
          .join(" | ")}`;
      }
    }

    const status = error.response?.status;

    // ── 401 handling ──────────────────────────────────────────────────────
    if (status === 401 && !originalRequest._retry) {
      const refreshToken = TokenStorage.getRefreshToken();

      // No refresh token available → clear & redirect
      if (!refreshToken) {
        TokenStorage.clearTokens();
        if (window.location.pathname !== "/") window.location.href = "/";
        return Promise.reject(new Error(message));
      }

      // If a refresh is already in progress, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        });
      }

      // First request to hit 401 — initiate the refresh
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data: refreshData } = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/auth/refresh`,
          { refresh_token: refreshToken },
          { headers: { "Content-Type": "application/json" } },
        );

        const { access_token, refresh_token: newRefresh } = refreshData.data;
        TokenStorage.setTokens(access_token, newRefresh);
        axiosInstance.defaults.headers.common.Authorization = `Bearer ${access_token}`;
        processPendingQueue(null, access_token);

        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processPendingQueue(refreshError, null);
        TokenStorage.clearTokens();
        console.warn("[Auth] Refresh failed. Clearing session.");
        if (window.location.pathname !== "/") window.location.href = "/";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    console.error("[AxiosResponseInterceptor] Error response:", error.response?.data);
    return Promise.reject(new Error(message));
  },
);

export default axiosInstance;

