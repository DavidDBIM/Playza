import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateMeApi, type UpdateUserPayload, type User } from "../../api/users.api";

export const useUpdateMe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateUserPayload) => updateMeApi(payload),
    onMutate: async (newPayload) => {
      await queryClient.cancelQueries({ queryKey: ["users", "me"] });
      
      const previousUser = queryClient.getQueryData<User>(["users", "me"]);
      
      if (previousUser) {
        queryClient.setQueryData<User>(["users", "me"], {
          ...previousUser,
          ...newPayload
        });
      }
      
      return { previousUser };
    },
    onError: (_err, _newPayload, context) => {
      if (context?.previousUser) {
        queryClient.setQueryData(["users", "me"], context.previousUser);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users", "me"] });
    },
  });
};
