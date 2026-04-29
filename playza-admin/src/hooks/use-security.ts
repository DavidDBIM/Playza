import { useQuery } from "@tanstack/react-query";
import { adminService } from "../services/admin-service";

export function useAdminLogs({ page, limit = 20 }: { page: number; limit?: number }) {
  return useQuery({
    queryKey: ["admin-logs", page, limit],
    queryFn: () => adminService.getLogs(page, limit),
  });
}
