import { useQuery, useMutation } from "@tanstack/react-query";
import { getActiveBannerApi, registerPushTokenApi } from "../../api/notifications.api";
import type { RegisterPushPayload } from "../../api/notifications.api";

export const useActiveBanner = () => {
  return useQuery({
    queryKey: ["notifications", "banner"],
    queryFn: getActiveBannerApi,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
};

export const useRegisterPush = () => {
  return useMutation({
    mutationFn: (payload: RegisterPushPayload) => registerPushTokenApi(payload),
  });
};
