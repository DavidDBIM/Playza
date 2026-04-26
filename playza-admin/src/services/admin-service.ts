import { authService } from "./auth.service";
import { dashboardService } from "./dashboard.service";
import { userService } from "./user.service";
import { transactionService } from "./transaction.service";
import { referralService } from "./referral.service";
import { leaderboardService } from "./leaderboard.service";
import { notificationService } from "./notification.service";

export const adminService = {
  ...authService,
  ...dashboardService,
  ...userService,
  ...transactionService,
  ...referralService,
  ...leaderboardService,
  ...notificationService,
  
  // Explicitly map names if they differ from old implementation
  getDashboardMetrics: dashboardService.getMetrics,
};
