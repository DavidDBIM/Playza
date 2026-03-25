import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateMeApi, type UpdateUserPayload } from "../../api/users.api";

export const useUpdateMe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateUserPayload) => updateMeApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", "me"] });
    },
  });
};
