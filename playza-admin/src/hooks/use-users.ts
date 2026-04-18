import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "../services/user.service";

export const useAdminUsers = (params: { 
  page?: number; 
  limit?: number; 
  search?: string; 
  status?: string; 
}) => {
  return useQuery({
    queryKey: ["admin", "users", params],
    queryFn: () => userService.getUsers(params),
  });
};

export const useAdminUserDetails = (userId: string) => {
  return useQuery({
    queryKey: ["admin", "users", userId],
    queryFn: () => userService.getUserDetails(userId),
    enabled: !!userId,
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, action }: { userId: string; action: "activate" | "deactivate" | "ban" }) =>
      userService.updateUserStatus(userId, action),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "users", userId] });
    },
  });
};
