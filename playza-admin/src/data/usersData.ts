import type {
  UserRecord,
  MatchRecord,
  TransactionRecord,
  ReferralRecord,
} from "../types/user";
import type { UserStat } from "../components/users/UsersStats";

export type { UserRecord, MatchRecord, TransactionRecord, ReferralRecord };

export const usersData: UserRecord[] = [];

export const userStats: UserStat[] = [
  { label: "Total Players", value: "0", change: "0", trend: "up" },
  { label: "Active Today", value: "0", change: "0", trend: "up" },
  { label: "Banned Users", value: "0", change: "0", trend: "down" },
  { label: "KYC Pending", value: "0", change: "0", trend: "up" },
];

export const matchHistory: MatchRecord[] = [];
export const transactionHistory: TransactionRecord[] = [];
export const referralHistory: ReferralRecord[] = [];
