import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || 'https://api.playza.games';
const API_BASE_URL = `${API_URL}/api`;

if (!import.meta.env.VITE_API_URL) {
  console.warn("VITE_API_URL is not defined. Using fallback: " + API_URL);
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add interceptor to include auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    // console.log(`[API Request] Token found in localStorage. Length: ${token.length}`);
  } else {
    // console.warn("[API Request] No admin_token found in localStorage");
  }
  return config;
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url;
      console.error(`[Auth Interceptor] 401 Unauthorized: ${url}`);
      
      // If we're getting 401 on every page, something is fundamentally wrong with the session
      if (url?.includes('/admin/dashboard')) {
        console.warn("[Auth] Session appears invalid. You may need to log out and log back in.");
      }
    }
    return Promise.reject(error);
  },
);
