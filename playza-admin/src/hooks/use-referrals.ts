import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { referralService } from "../services/referral.service";

export const useAdminPayoutRequests = (params: { 
  page?: number; 
  limit?: number; 
  status?: string; 
  search?: string; 
}) => {
  return useQuery({
    queryKey: ["admin", "referral-payouts", params],
    queryFn: () => referralService.getPayoutRequests(params),
  });
};

export const useAdminReviewPayoutRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { action: "approved" | "rejected"; admin_note?: string } }) =>
      referralService.reviewPayoutRequest(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "referral-payouts"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });
};

export const useAdminAmbassadors = (params: { 
  page?: number; 
  limit?: number; 
  status?: string; 
  search?: string; 
  qualification?: string;
}) => {
  return useQuery({
    queryKey: ["admin", "ambassadors", params],
    queryFn: () => referralService.getAmbassadors(params),
  });
};

export const useAdminReviewAmbassador = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { action: "approve" | "reject"; admin_note?: string } }) =>
      referralService.reviewAmbassador(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "ambassadors"] });
    },
  });
};
