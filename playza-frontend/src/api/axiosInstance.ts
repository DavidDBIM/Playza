import axios from "axios";
import { queryClient } from "../lib/queryClient";

// ── Token storage (localStorage) ─────────────────────────────────────────────
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
  timeout: 15000,
});

// ── Attach token to every request ─────────────────────────────────────────────
axiosInstance.interceptors.request.use((config) => {
  const token = TokenStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Track in-flight refresh to avoid parallel refresh storms
let isRefreshing = false;
let pendingQueue: Array<{
  resolve: () => void;
  reject: (err: unknown) => void;
}> = [];

function processPendingQueue(err: unknown) {
  pendingQueue.forEach(({ resolve, reject }) => (err ? reject(err) : resolve()));
  pendingQueue = [];
}

// ── Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    const url = response.config.url || "";
    const method = response.config.method?.toLowerCase();
    if (method === "post" || method === "put" || method === "delete") {
      const endpointsThatAffectWallet = [
        "/soloearn", "/gamesession", "/chess", "/ludo", "/pool", "/soccer", "/speedbattle", "/wordscramble"
      ];
      if (endpointsThatAffectWallet.some(ep => url.includes(ep))) {
        Promise.all([
          queryClient.invalidateQueries({ queryKey: ["users", "me"] }),
          queryClient.invalidateQueries({ queryKey: ["wallet", "balance"] }),
          queryClient.invalidateQueries({ queryKey: ["profile"] })
        ]).catch(() => {});
      }
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config as typeof error.config & {
      _retry?: boolean;
    };

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

    // ── 401: only attempt refresh if we actually have a refresh token
    if (
      status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh") &&
      TokenStorage.getRefreshToken()
    ) {
      if (isRefreshing) {
        return new Promise<void>((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        }).then(() => axiosInstance(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/auth/refresh`,
          { refresh_token: TokenStorage.getRefreshToken() },
          { withCredentials: true },
        );

        if (data?.data?.access_token) {
          TokenStorage.setTokens(data.data.access_token, data.data.refresh_token || TokenStorage.getRefreshToken()!);
        }

        processPendingQueue(null);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processPendingQueue(refreshError);
        TokenStorage.clearTokens();
        queryClient.removeQueries({ queryKey: ["users", "me"] });
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(new Error(message));
  },
);

export default axiosInstance;
