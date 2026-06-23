import axios from "axios";
import { queryClient } from "../lib/queryClient";

// Tokens now live in httpOnly cookies set by the backend — JavaScript can no
// longer read or store them, which is the point (protects against XSS token
// theft). The browser attaches cookies automatically on every request as
// long as withCredentials is true, so there's no token-attaching logic needed.

const axiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
  timeout: 15000, // 15s timeout — prevents requests hanging forever
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

// ── Response interceptor: silent refresh on 401, wallet invalidation on mutations
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

    // ── 401 handling — try a cookie-based refresh once, then retry the request
    if (status === 401 && !originalRequest._retry && !originalRequest.url?.includes("/auth/refresh")) {
      // If a refresh is already in progress, queue this request behind it
      if (isRefreshing) {
        return new Promise<void>((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        }).then(() => axiosInstance(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/auth/refresh`,
          {},
          { withCredentials: true },
        );

        // If the server returned a non-2xx (e.g. 400 bad token, 429 rate limited)
        // axios won't throw for these in some configs — handle explicitly
        if (refreshResponse.status === 400 || refreshResponse.status === 429) {
          throw new Error(`Refresh failed with status ${refreshResponse.status}`);
        }

        processPendingQueue(null);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processPendingQueue(refreshError);
        // Refresh truly failed — clear user state via the query cache so
        // AuthContext detects it cleanly without triggering another loop.
        // Remove only the ["users","me"] entry (not the whole cache) so the
        // settled "not logged in" state is preserved.
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
