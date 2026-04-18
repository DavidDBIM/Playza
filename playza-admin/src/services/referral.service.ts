import { apiClient } from "../lib/api-client";
import type { 
  PayoutRequestAdmin, 
  AmbassadorApplicationAdmin, 
  PaginatedResponse 
} from "../types/admin";

export const referralService = {
  getPayoutRequests: async (params: { 
    page?: number; 
    limit?: number; 
    status?: string; 
    search?: string; 
  }) => {
    const { data } = await apiClient.get<PaginatedResponse<PayoutRequestAdmin, 'requests'>>(
      "/admin/referral-payouts", 
      { params }
    );
    return data.data;
  },

  reviewPayoutRequest: async (
    id: string, 
    payload: { action: "approved" | "rejected"; admin_note?: string }
  ) => {
    const { data } = await apiClient.patch<{ success: boolean; data: { success: boolean; action: string } }>(
      `/admin/referral-payouts/${id}/review`, 
      payload
    );
    return data.data;
  },

  getAmbassadors: async (params: { 
    page?: number; 
    limit?: number; 
    status?: string; 
    search?: string; 
    qualification?: string;
  }) => {
    const { data } = await apiClient.get<PaginatedResponse<AmbassadorApplicationAdmin, 'applications'>>(
      "/admin/ambassadors", 
      { params }
    );
    return data.data;
  },

  reviewAmbassador: async (
    id: string, 
    payload: { action: "approve" | "reject"; admin_note?: string }
  ) => {
    const { data } = await apiClient.patch<{ success: boolean; data: AmbassadorApplicationAdmin }>(
      `/admin/ambassadors/${id}/review`, 
      payload
    );
    return data.data;
  },
};
