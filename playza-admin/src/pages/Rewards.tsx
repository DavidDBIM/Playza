import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../lib/api-client";
import {
  MdSearch,
  MdCheckCircle,
  MdRefresh,
  MdToken,
  MdHistory,
  MdPerson,
  MdClose,
} from "react-icons/md";
import { Gift, Coins, Zap, ChevronDown } from "lucide-react";

// ─── Types ────────────────────────────────────────────────
interface UserSearchResult {
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
}

interface GrantLog {
  id: string;
  admin_id: string;
  target_user_id: string;
  type: "pza" | "za_token";
  amount: number;
  reason: string;
  created_at: string;
  target_user?: { username: string; email: string };
  admin?: { username: string };
}

// ─── API ──────────────────────────────────────────────────
async function searchUsers(q: string): Promise<UserSearchResult[]> {
  if (!q.trim()) return [];
  const { data } = await apiClient.get(`/admin/rewards/search-users?q=${encodeURIComponent(q)}`);
  return data.data ?? [];
}

async function grantReward(payload: {
  user_id: string;
  type: "pza" | "za_token";
  amount: number;
  reason: string;
}) {
  const { data } = await apiClient.post("/admin/rewards/grant", payload);
  return data;
}

async function fetchGrantHistory(page: number, type: string): Promise<{ logs: GrantLog[]; total: number; pages: number }> {
  const { data } = await apiClient.get(`/admin/rewards/history?page=${page}&limit=20&type=${type}`);
  return data.data;
}

// ─── Component ────────────────────────────────────────────
const Rewards: React.FC = () => {
  const queryClient = useQueryClient();

  // Grant form state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);
  const [rewardType, setRewardType] = useState<"pza" | "za_token">("pza");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  // History state
  const [histPage, setHistPage] = useState(1);
  const [histType, setHistType] = useState("");

  // User search
  const { data: searchResults = [], isFetching: searching } = useQuery({
    queryKey: ["reward-user-search", searchQuery],
    queryFn: () => searchUsers(searchQuery),
    enabled: searchQuery.length >= 2,
  });

  // Grant history
  const { data: history, isLoading: histLoading, refetch: refetchHistory } = useQuery({
    queryKey: ["reward-history", histPage, histType],
    queryFn: () => fetchGrantHistory(histPage, histType),
  });

  // Grant mutation
  const { mutate: doGrant, isPending: granting } = useMutation({
    mutationFn: grantReward,
    onSuccess: (data) => {
      setSuccessMsg(data.message ?? "Reward granted successfully!");
      setErrorMsg("");
      setSelectedUser(null);
      setSearchQuery("");
      setAmount("");
      setReason("");
      queryClient.invalidateQueries({ queryKey: ["reward-history"] });
      setTimeout(() => setSuccessMsg(""), 5000);
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message ?? err.message ?? "Failed to grant reward");
      setSuccessMsg("");
    },
  });

  function handleSelectUser(u: UserSearchResult) {
    setSelectedUser(u);
    setSearchQuery(u.username);
    setShowDropdown(false);
  }

  function handleGrant() {
    if (!selectedUser) { setErrorMsg("Please select a user"); return; }
    const amt = parseInt(amount);
    if (!amt || amt <= 0) { setErrorMsg("Enter a valid amount"); return; }
    if (!reason.trim()) { setErrorMsg("Please enter a reason"); return; }
    setErrorMsg("");
    doGrant({ user_id: selectedUser.id, type: rewardType, amount: amt, reason: reason.trim() });
  }

  const PRESET_AMOUNTS = rewardType === "pza"
    ? [100, 200, 500, 1000, 5000]
    : [10, 50, 100, 500, 1000];

  return (
    <div className="p-4 space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center shadow-md shadow-violet-400/30">
          <Gift className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">Reward Center</h1>
          <p className="text-sm text-muted-foreground font-medium">
            Grant PZA points or ZA tokens to any user
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Grant Panel ─────────────────────────────── */}
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border bg-gradient-to-r from-violet-500/5 to-purple-500/5">
            <h2 className="font-black text-foreground text-base flex items-center gap-2">
              <Zap className="w-4 h-4 text-violet-500" /> Grant Reward
            </h2>
          </div>

          <div className="p-5 space-y-4">
            {/* Success / Error banners */}
            {successMsg && (
              <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-3">
                <MdCheckCircle className="text-emerald-500 text-lg shrink-0" />
                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{successMsg}</p>
              </div>
            )}
            {errorMsg && (
              <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
                <MdClose className="text-red-500 text-lg shrink-0" />
                <p className="text-sm font-bold text-red-600 dark:text-red-400">{errorMsg}</p>
              </div>
            )}

            {/* Reward Type Toggle */}
            <div>
              <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-2">
                Reward Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "pza", label: "PZA Points", icon: <Coins className="w-4 h-4" />, color: "violet" },
                  { value: "za_token", label: "ZA Token", icon: <MdToken className="text-base" />, color: "amber" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { setRewardType(opt.value as "pza" | "za_token"); setAmount(""); }}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 font-bold text-sm transition-all ${
                      rewardType === opt.value
                        ? opt.value === "pza"
                          ? "border-violet-500 bg-violet-500/10 text-violet-700 dark:text-violet-300"
                          : "border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                        : "border-border bg-muted/30 text-muted-foreground hover:border-muted-foreground"
                    }`}
                  >
                    {opt.icon} {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* User Search */}
            <div className="relative">
              <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-2">
                Recipient
              </label>
              <div className="relative">
                <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg" />
                <input
                  type="text"
                  placeholder="Search username or email…"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSelectedUser(null);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
                {searching && (
                  <MdRefresh className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground animate-spin" />
                )}
              </div>

              {/* Dropdown */}
              {showDropdown && searchResults.length > 0 && !selectedUser && (
                <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-xl overflow-hidden">
                  {searchResults.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => handleSelectUser(u)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/60 transition-colors text-left border-b border-border last:border-b-0"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-xs font-black shrink-0">
                        {u.username[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{u.username}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected user chip */}
            {selectedUser && (
              <div className="flex items-center gap-3 px-3 py-2.5 bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 rounded-xl">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-xs font-black shrink-0">
                  {selectedUser.username[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">{selectedUser.username}</p>
                  <p className="text-xs text-muted-foreground truncate">{selectedUser.email}</p>
                </div>
                <button
                  onClick={() => { setSelectedUser(null); setSearchQuery(""); }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <MdClose />
                </button>
              </div>
            )}

            {/* Amount */}
            <div>
              <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-2">
                Amount
              </label>
              {/* Preset buttons */}
              <div className="flex flex-wrap gap-2 mb-2">
                {PRESET_AMOUNTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setAmount(String(p))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all border ${
                      amount === String(p)
                        ? rewardType === "pza"
                          ? "bg-violet-500 text-white border-violet-500"
                          : "bg-amber-500 text-white border-amber-500"
                        : "bg-muted border-border text-muted-foreground hover:border-foreground"
                    }`}
                  >
                    {p.toLocaleString()}
                  </button>
                ))}
              </div>
              <input
                type="number"
                placeholder="Or enter custom amount…"
                value={amount}
                min={1}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>

            {/* Reason */}
            <div>
              <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-2">
                Reason / Note
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Bug bounty reward, Contest winner, Manual correction…"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
              />
            </div>

            {/* Preview */}
            {selectedUser && amount && (
              <div className={`rounded-xl px-4 py-3 border text-sm font-medium ${
                rewardType === "pza"
                  ? "bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300"
                  : "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300"
              }`}>
                You are about to grant <span className="font-black">{parseInt(amount || "0").toLocaleString()} {rewardType === "pza" ? "PZA Points" : "ZA Tokens"}</span> to <span className="font-black">@{selectedUser.username}</span>
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleGrant}
              disabled={granting || !selectedUser || !amount || !reason.trim()}
              className={`w-full py-3 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 ${
                rewardType === "pza"
                  ? "bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500 text-white shadow-violet-500/30"
                  : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-amber-500/30"
              }`}
            >
              {granting ? (
                <><MdRefresh className="animate-spin" /> Granting…</>
              ) : (
                <><Gift className="w-4 h-4" /> Grant {rewardType === "pza" ? "PZA Points" : "ZA Tokens"}</>
              )}
            </button>
          </div>
        </div>

        {/* ── Grant History ────────────────────────────── */}
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-gradient-to-r from-slate-500/5 to-slate-500/0">
            <h2 className="font-black text-foreground text-base flex items-center gap-2">
              <MdHistory className="text-lg text-muted-foreground" /> Grant History
            </h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={histType}
                  onChange={(e) => { setHistType(e.target.value); setHistPage(1); }}
                  className="appearance-none pl-3 pr-7 py-1.5 rounded-lg bg-muted border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                >
                  <option value="">All Types</option>
                  <option value="pza">PZA Only</option>
                  <option value="za_token">ZA Only</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
              </div>
              <button
                onClick={() => refetchHistory()}
                className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground transition-colors"
              >
                <MdRefresh className={`text-base ${histLoading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-border">
            {histLoading ? (
              <div className="p-8 flex items-center justify-center text-muted-foreground">
                <MdRefresh className="animate-spin text-2xl mr-2" /> Loading…
              </div>
            ) : !history?.logs?.length ? (
              <div className="p-8 text-center">
                <Gift className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-muted-foreground text-sm font-bold">No grants yet</p>
              </div>
            ) : (
              history.logs.map((log) => (
                <div key={log.id} className="px-4 py-3.5 hover:bg-muted/30 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-foreground text-xs font-black shrink-0">
                        {log.target_user?.username?.[0]?.toUpperCase() ?? <MdPerson />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground leading-tight">
                          @{log.target_user?.username ?? "unknown"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate max-w-[160px]">
                          {log.reason}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-sm font-black ${log.type === "pza" ? "text-violet-600 dark:text-violet-400" : "text-amber-600 dark:text-amber-400"}`}>
                        +{log.amount.toLocaleString()}
                      </p>
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${
                        log.type === "pza"
                          ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
                          : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                      }`}>
                        {log.type === "pza" ? "PZA" : "ZA TOKEN"}
                      </span>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground/60 mt-1.5 pl-10">
                    by @{log.admin?.username ?? "admin"} · {new Date(log.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {(history?.pages ?? 0) > 1 && (
            <div className="px-4 py-3 border-t border-border flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Page {histPage} of {history?.pages}</p>
              <div className="flex gap-2">
                <button onClick={() => setHistPage(p => Math.max(1, p - 1))} disabled={histPage === 1}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-muted hover:bg-muted/80 disabled:opacity-40 transition-all">
                  ← Prev
                </button>
                <button onClick={() => setHistPage(p => Math.min(history?.pages ?? 1, p + 1))} disabled={histPage === (history?.pages ?? 1)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-muted hover:bg-muted/80 disabled:opacity-40 transition-all">
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Rewards;
