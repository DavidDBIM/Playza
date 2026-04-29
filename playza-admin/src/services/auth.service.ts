import { apiClient } from "../lib/api-client";
import type { AdminLoginResponse } from "../types/admin";

export const authService = {
  login: async (credentials: { identifier: string; password: string }) => {
    const { data } = await apiClient.post<{ success: boolean; data: AdminLoginResponse }>(
      "/auth/admin/signin", 
      credentials
    );
    return data.data;
  },

  logout: () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    localStorage.removeItem("admin_login_time");
    window.location.href = "/signin";
  },
};
