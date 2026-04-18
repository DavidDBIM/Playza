import { apiClient } from "../lib/api-client";
import type { DashboardMetrics } from "../types/admin";

export const dashboardService = {
  getMetrics: async () => {
    const { data } = await apiClient.get<{ success: boolean; data: DashboardMetrics }>(
      "/admin/dashboard"
    );
    return data.data;
  },
};
