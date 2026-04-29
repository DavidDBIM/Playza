import { apiClient } from "../lib/api-client";
import type { PaginatedResponse } from "../types/admin";

export interface AdminLog {
  id: string;
  admin_id: string;
  action: string;
  target_id: string | null;
  details: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
  admin: {
    username: string;
    email: string;
    avatar_url: string | null;
  };
}

export const securityService = {
  getLogs: async (page = 1, limit = 20) => {
    const { data } = await apiClient.get<PaginatedResponse<AdminLog, 'logs'>>(
      `/admin/logs?page=${page}&limit=${limit}`
    );
    return data.data;
  },
};
