import { useMutation, useQueryClient } from "@tanstack/react-query";
import { claimTaskApi } from "../../api/loyalty.api";

export const useClaimTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => claimTaskApi(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loyalty", "me"] });
    },
  });
};
