import axios from "axios";

const axiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("playza_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(
      "[AxiosResponseInterceptor] Error response:",
      error.response?.data,
    );

    let message = error.message || "An unexpected error occurred.";

    if (error.response?.data) {
      const data = error.response.data;

      if (data.message) {
        message = data.message;
      } else if (data.errors) {
        const errorDetails = Object.entries(data.errors)
          .map(([field, msgs]) => `${field}: ${(msgs as string[]).join(", ")}`)
          .join(" | ");
        message = `Validation Error: ${errorDetails}`;
      }
    }

    // Direct fix for token expiration loop
    if (error.response?.status === 401) {
      const sensitivePages = ["/profile", "/wallet", "/my-games"];
      const isSensitivePage = sensitivePages.some((page) =>
        window.location.pathname.startsWith(page)
      );

      if (localStorage.getItem("playza_token")) {
        console.warn("[Auth] Token expired or invalid. Redirecting to home...");
        localStorage.removeItem("playza_token");
        
        if (window.location.pathname !== "/") {
          window.location.href = "/";
        } else {
          window.location.reload();
        }
      } else if (isSensitivePage) {
        window.location.href = "/";
      }
    }

    return Promise.reject(new Error(message));
  },
);

export default axiosInstance;
