import { format } from "date-fns";
import type { TransactionUI } from "@/types/types";

/**
 * Single source of truth for every transaction `type` the backend can write
 * to the `transactions` table, across every game module (chess, chess
 * tournaments, ludo, quiz, soccer, pool, word scramble, speed battle,
 * emojipop, referrals, wallet deposits/withdrawals, admin grants, etc).
 *
 * This used to be duplicated (and out of sync) across RecentTransactions.tsx
 * and Transactions.tsx, each with their own small, incomplete list. Several
 * real types weren't in either list — most importantly `chess_tournament_entry`
 * and `chess_tournament_prize` — so entry-fee deductions and, worse,
 * tournament PRIZE WINS rendered with the wrong (negative/red) sign and
 * silently vanished under the "Entries" / "Wins" filter tabs, since those
 * filters only matched an exact label these types never produced.
 *
 * If a new transaction type is added on the backend, add it here once and
 * both the recent-activity widget and the full ledger page pick it up.
 */
export type TransactionBucket = "Deposits" | "Withdrawals" | "Entries" | "Wins";

interface TypeMeta {
  label: string;
  positive: boolean;
  bucket: TransactionBucket;
}

export const TRANSACTION_TYPE_META: Record<string, TypeMeta> = {
  deposit: { label: "Deposit", positive: true, bucket: "Deposits" },
  withdrawal: { label: "Withdrawal", positive: false, bucket: "Withdrawals" },
  game_entry: { label: "Game Stake", positive: false, bucket: "Entries" },
  bet: { label: "Game Entry", positive: false, bucket: "Entries" },
  stake: { label: "Game Stake", positive: false, bucket: "Entries" },
  quiz_entry: { label: "Quiz Entry", positive: false, bucket: "Entries" },
  chess_tournament_entry: { label: "Tournament Entry", positive: false, bucket: "Entries" },
  purchase: { label: "Purchase", positive: false, bucket: "Entries" },
  winnings: { label: "Match Prize", positive: true, bucket: "Wins" },
  quiz_prize: { label: "Quiz Prize", positive: true, bucket: "Wins" },
  chess_tournament_prize: { label: "Tournament Prize", positive: true, bucket: "Wins" },
  refund: { label: "Stake Refund", positive: true, bucket: "Wins" },
  chess_tournament_refund: { label: "Tournament Refund", positive: true, bucket: "Wins" },
  bonus: { label: "Bonus", positive: true, bucket: "Wins" },
  signup_bonus: { label: "Signup Bonus", positive: true, bucket: "Wins" },
  referral_payout: { label: "Referral Payout", positive: true, bucket: "Wins" },
  admin_grant: { label: "Admin Credit", positive: true, bucket: "Wins" },
};

const STATUS_LABEL_MAP: Record<string, string> = {
  successful: "Completed",
  completed: "Completed",
  pending: "Pending",
  failed: "Failed",
  cancelled: "Cancelled",
};

export interface RawTransaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  reference: string;
  created_at: string;
  meta?: Record<string, unknown>;
}

/** Maps a raw backend transaction row into the shape the UI renders. */
export function toTransactionUI(t: RawTransaction): TransactionUI {
  const meta = TRANSACTION_TYPE_META[t.type];
  // Fallback keeps unknown future types visible (auto-capitalized) instead
  // of silently disappearing, while known types always get this right.
  const isPositive = meta?.positive ?? ["deposit", "winnings", "refund", "win"].includes(t.type);
  const label = meta?.label ?? (t.type.charAt(0).toUpperCase() + t.type.slice(1));

  return {
    id: `#${t.id.slice(-5).toUpperCase()}`,
    type: label,
    amount: `${isPositive ? "+" : "-"}ZA${t.amount.toLocaleString()}`,
    status: STATUS_LABEL_MAP[t.status] || (t.status.charAt(0).toUpperCase() + t.status.slice(1)),
    reference: t.reference,
    meta: t.meta,
    // "h:mm a" gives a real 12-hour clock with AM/PM (e.g. "12:50 AM"),
    // instead of a bare 24-hour "0:50" with no AM/PM marker.
    date: format(new Date(t.created_at), "MMM dd, yyyy · h:mm a"),
    // The filter bucket (Deposits/Withdrawals/Entries/Wins), not the raw
    // label, so every known type reliably lands under the right tab.
    typeKey: meta?.bucket ?? label,
  };
}