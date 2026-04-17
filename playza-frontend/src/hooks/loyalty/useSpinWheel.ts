import { useMutation, useQueryClient } from "@tanstack/react-query";
import { spinWheelApi } from "../../api/loyalty.api";

export const useSpinWheel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: spinWheelApi,
    onSuccess: () => {
      // Refresh loyalty data after a spin to update balance and spins left
      queryClient.invalidateQueries({ queryKey: ["loyalty", "me"] });
    },
  });
};
