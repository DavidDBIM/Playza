import { apiClient } from "../lib/api-client";
import type { UserAdmin } from "../types/admin";

export const authService = {
  login: async (credentials: { identifier: string; password: string }) => {
    const { data } = await apiClient.post<{ success: boolean; data: { access_token: string; user: UserAdmin } }>(
      "/auth/signin", 
      credentials
    );
    return data.data;
  },

  logout: () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    window.location.href = "/signin";
  },
};
