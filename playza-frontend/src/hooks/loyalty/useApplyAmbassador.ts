import { useMutation, useQueryClient } from "@tanstack/react-query";
import { applyAmbassadorApi, type AmbassadorApplyPayload } from "../../api/loyalty.api";

export const useApplyAmbassador = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AmbassadorApplyPayload) => applyAmbassadorApi(payload),
    onSuccess: () => {
      // Refresh status after application
      queryClient.invalidateQueries({ queryKey: ["loyalty", "ambassador", "status"] });
    },
  });
};
