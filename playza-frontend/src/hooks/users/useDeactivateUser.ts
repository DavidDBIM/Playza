import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deactivateUserApi } from "../../api/users.api";

export const useDeactivateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => deactivateUserApi(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", "me"] });
    },
  });
};
