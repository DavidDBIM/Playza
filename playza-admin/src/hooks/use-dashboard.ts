import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "../services/dashboard.service";

export const useDashboardMetrics = () => {
  return useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: dashboardService.getMetrics,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
