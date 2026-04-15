import { apiClient } from '../lib/api-client';
import type { 
  DashboardMetrics, 
  UserAdmin, 
  UserDetails, 
  TransactionAdmin, 
  PaginatedResponse 
} from '../types/admin';

export const adminService = {
  login: async (credentials: { identifier: string; password: string }) => {
    const { data } = await apiClient.post<{ success: boolean; data: { access_token: string; user: UserAdmin } }>('/auth/signin', credentials);
    return data.data;
  },

  getDashboardMetrics: async () => {
    const { data } = await apiClient.get<{ success: boolean; data: DashboardMetrics }>('/admin/dashboard');
    return data.data;
  },

  getUsers: async (params: { page?: number; limit?: number; search?: string; status?: string }) => {
    const { data } = await apiClient.get<PaginatedResponse<UserAdmin>>('/admin/users', { params });
    return data.data;
  },

  getUserDetails: async (userId: string) => {
    const { data } = await apiClient.get<{ success: boolean; data: UserDetails }>(`/admin/users/${userId}`);
    return data.data;
  },

  updateUserStatus: async (userId: string, action: 'activate' | 'deactivate' | 'ban') => {
    const { data } = await apiClient.patch<{ success: boolean; data: { message: string } }>(
      `/admin/users/${userId}/status`, 
      { action }
    );
    return data.data;
  },

  getTransactions: async (params: { page?: number; limit?: number; type?: string; status?: string }) => {
    const { data } = await apiClient.get<PaginatedResponse<TransactionAdmin>>('/admin/transactions', { params });
    return data.data;
  },
};
