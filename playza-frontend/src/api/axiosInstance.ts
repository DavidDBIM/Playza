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

    return Promise.reject(new Error(message));
  },
);

export default axiosInstance;
