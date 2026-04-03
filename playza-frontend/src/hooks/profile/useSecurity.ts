import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getPinStatusApi, 
  createPinApi, 
  changePinApi, 
  changePasswordApi, 
  updateSecurityPreferencesApi,
} from "@/api/security.api";
import type { PinStatus } from "@/api/security.api";
import { useToast } from "@/context/toast";

export const useSecurity = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  const { data: pinStatus, isLoading: isLoadingPinStatus } = useQuery<PinStatus>({
    queryKey: ["pinStatus"],
    queryFn: getPinStatusApi,
  });

  const createPinMutation = useMutation({
    mutationFn: (pin: string) => createPinApi(pin),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pinStatus"] });
      toast.success("Security PIN created successfully!");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to create PIN.");
    },
  });

  const changePinMutation = useMutation({
    mutationFn: ({ oldPin, newPin }: { oldPin: string; newPin: string }) => 
      changePinApi(oldPin, newPin),
    onSuccess: () => {
      toast.success("Security PIN updated successfully!");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to change PIN.");
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (payload: { current_password: string; new_password: string }) => 
      changePasswordApi(payload),
    onSuccess: () => {
      toast.success("Password updated successfully!");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to update password.");
    },
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: (payload: { match_alerts?: boolean; marketing_emails?: boolean; show_activity?: boolean }) => updateSecurityPreferencesApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Security preferences updated!");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to update preferences.");
    },
  });

  return {
    pinStatus,
    isLoadingPinStatus,
    createPin: createPinMutation.mutate,
    isCreatingPin: createPinMutation.status === "pending",
    changePin: changePinMutation.mutate,
    isChangingPin: changePinMutation.status === "pending",
    changePassword: changePasswordMutation.mutate,
    isChangingPassword: changePasswordMutation.status === "pending",
    updatePreferences: updatePreferencesMutation.mutate,
    isUpdatingPreferences: updatePreferencesMutation.status === "pending",
  };
};
