import { apiClient } from "../lib/api-client";
import type { 
  UserAdmin, 
  UserDetails, 
  PaginatedResponse 
} from "../types/admin";

export const userService = {
  getUsers: async (params: { 
    page?: number; 
    limit?: number; 
    search?: string; 
    status?: string; 
    period?: string;
  }) => {
    const { data } = await apiClient.get<PaginatedResponse<UserAdmin, "users">>(
      "/admin/users", 
      { params }
    );
    return data.data;
  },

  getUserDetails: async (userId: string) => {
    const { data } = await apiClient.get<{ success: boolean; data: UserDetails }>(
      `/admin/users/${userId}`
    );
    return data.data;
  },

  updateUserStatus: async (
    userId: string, 
    action: "activate" | "deactivate" | "ban",
    mfa_code?: string
  ) => {
    const { data } = await apiClient.patch<{ 
      success: boolean; 
      data: { message: string };
      mfa_required?: boolean;
    }>(
      `/admin/users/${userId}/status`, 
      { action, mfa_code }
    );
    return data;
  },
};
