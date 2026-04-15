import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || 'https://api.playza.games';
const API_BASE_URL = `${API_URL}/api`;

if (!import.meta.env.VITE_API_URL) {
  console.warn("VITE_API_URL is not defined. Using fallback: " + API_URL);
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add interceptor to include auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");
      window.location.href = "/signin";
    }
    return Promise.reject(error);
  },
);
