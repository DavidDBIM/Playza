import type { WithdrawalRecord } from "../types/withdrawal";

export type { WithdrawalRecord };

export const withdrawalsData: WithdrawalRecord[] = [];

export const withdrawalsStats = [
  { label: "Pending Total", value: "0", change: "0%", trend: "down" },
  { label: "Successful Today", value: "0", change: "0%", trend: "up" },
  { label: "Total Payouts", value: "0", change: "0%", trend: "up" },
  { label: "Failed Requests", value: "0", change: "0%", trend: "down" },
];
