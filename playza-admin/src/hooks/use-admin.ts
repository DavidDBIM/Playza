import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../services/admin-service';

export const useDashboardMetrics = () => {
  return useQuery({
    queryKey: ['admin', 'dashboard-metrics'],
    queryFn: adminService.getDashboardMetrics,
  });
};

export const useAdminUsers = (params: { page?: number; limit?: number; search?: string; status?: string }) => {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: () => adminService.getUsers(params),
  });
};

export const useAdminUserDetails = (userId: string) => {
  return useQuery({
    queryKey: ['admin', 'user', userId],
    queryFn: () => adminService.getUserDetails(userId),
    enabled: !!userId,
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, action }: { userId: string, action: 'activate' | 'deactivate' | 'ban' }) => 
      adminService.updateUserStatus(userId, action),
    onSuccess: (_, variables) => {
      // Invalidate both the list and specific user details
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'user', variables.userId] });
    },
  });
};

export const useAdminTransactions = (params: { page?: number; limit?: number; type?: string; status?: string }) => {
  return useQuery({
    queryKey: ['admin', 'transactions', params],
    queryFn: () => adminService.getTransactions(params),
  });
};
