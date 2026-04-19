import React, { useState } from "react";
import { 
  MdSearch, 
  MdRefresh, 
  MdCheckCircle, 
  MdCancel, 
  MdPending, 
  MdInfoOutline,
  MdAccountBalanceWallet,
  MdFilterList,
  MdKeyboardArrowDown
} from "react-icons/md";
import { Wallet } from "lucide-react";
import { useAdminPayoutRequests, useAdminReviewPayoutRequest } from "../hooks/use-admin";
import type { PayoutRequestAdmin } from "../types/admin";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "../components/ui/dropdown-menu";

const STATUS_CONFIG = {
  pending: { 
    label: "Pending Review", 
    icon: <MdPending className="text-amber-500 animate-pulse" />, 
    cls: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/40" 
  },
  approved: { 
    label: "Approved & Paid", 
    icon: <MdCheckCircle className="text-emerald-500" />, 
    cls: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40" 
  },
  rejected: { 
    label: "Rejected", 
    icon: <MdCancel className="text-red-500" />, 
    cls: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 border-red-200 dark:border-red-800/40" 
  },
};

const ReferralPayouts: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All Status");
  
  const { data, isLoading, refetch } = useAdminPayoutRequests({
    page,
    limit: 15,
    search,
    status: statusFilter === "All Status" ? "" : statusFilter.toLowerCase(),
  });

  const { mutate: reviewRequest, isPending: isReviewing } = useAdminReviewPayoutRequest();
  
  const [selectedRequest, setSelectedRequest] = useState<PayoutRequestAdmin | null>(null);
  const [adminNote, setAdminNote] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleReview = (id: string, action: "approved" | "rejected") => {
    reviewRequest(
      { id, payload: { action, admin_note: adminNote || undefined } },
      {
        onSuccess: () => {
          setSelectedRequest(null);
          setAdminNote("");
        }
      }
    );
  };

  return (
    <div className="p-4 space-y-4">
      {/* ── Header Section ── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-primary to-indigo-600 flex items-center justify-center shadow-md shadow-primary/30">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight uppercase">Referral Payouts</h1>
            <p className="text-xs text-muted-foreground font-medium">Authorize and monitor referral bonus withdrawals</p>
          </div>
        </div>
        <button 
          onClick={() => refetch()} 
          className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-xl text-xs font-black uppercase tracking-widest text-foreground transition-all border border-border"
        >
          <MdRefresh className={`text-lg ${isLoading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {/* ── Stats Strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Requests", value: data?.total ?? 0, color: "text-foreground" },
          { label: "Pending Value", value: `₦${(data?.requests?.filter(r=>r.status === 'pending').reduce((sum, r) => sum + r.amount, 0) ?? 0).toLocaleString()}`, color: "text-amber-500" },
          { label: "Total Paid", value: `₦${(data?.requests?.filter(r=>r.status === 'approved').reduce((sum, r) => sum + r.amount, 0) ?? 0).toLocaleString()}`, color: "text-emerald-500" },
          { label: "Total Rejected", value: data?.requests?.filter(r=>r.status === 'rejected').length ?? 0, color: "text-rose-500" },
        ].map((stat, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-4 shadow-sm group relative overflow-hidden">
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className={`text-xl font-black ${stat.color} tracking-tight font-number`}>{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* ── Filter Bar ── */}
      <div className="bg-card border border-border rounded-2xl p-4 flex flex-wrap gap-3 items-center shadow-sm">
        <form onSubmit={handleSearch} className="relative flex-1 min-w-50">
          <MdSearch className="-translate-y-1/2 absolute left-3 top-1/2 text-muted-foreground text-lg" />
          <input 
            type="text" 
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search username or email..." 
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all font-medium"
          />
        </form>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="h-10 px-4 bg-muted border border-border rounded-xl flex items-center justify-between gap-3 text-xs font-black uppercase tracking-wider text-foreground hover:bg-muted/80 transition-all shadow-sm min-w-44">
              <span className="flex items-center gap-2">
                <MdFilterList className="text-primary text-base" />
                {statusFilter}
              </span>
              <MdKeyboardArrowDown className="text-primary text-lg" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-card border border-border shadow-xl rounded-xl p-2 z-50 min-w-44">
            {["All Status", "Pending", "Approved", "Rejected"].map(s => (
              <DropdownMenuItem 
                key={s} 
                onClick={() => { setStatusFilter(s); setPage(1); }}
                className={`text-[10px] font-black uppercase tracking-widest py-3 px-4 rounded-lg cursor-pointer hover:bg-primary/5 ${statusFilter === s ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}
              >
                {s === "Pending" ? "Pending Review" : s === "Approved" ? "Approved & Paid" : s}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ── Main Data Table ── */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden relative min-h-[400px]">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-20">
             <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <MdRefresh className="animate-spin text-2xl" />
              <span className="font-black uppercase text-[10px] tracking-widest">Syncing treasury…</span>
            </div>
          </div>
        ) : !data?.requests?.length ? (
          <div className="p-20 text-center opacity-30">
            <MdAccountBalanceWallet className="text-5xl mx-auto mb-4" />
            <p className="text-lg font-heading font-black uppercase tracking-tight">No Requests Found</p>
            <p className="text-xs">The referral system is currently quiet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-muted/30 border-b border-border">
                  {["User", "Amount", "Balance", "Status", "Date", "Actions"].map(h => (
                    <th key={h} className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.requests.map((req) => {
                  const config = STATUS_CONFIG[req.status as keyof typeof STATUS_CONFIG];
                  return (
                    <tr key={req.id} className="hover:bg-muted/30 transition-all duration-300 group">
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-foreground italic">@{req.users?.username}</span>
                          <span className="text-[10px] font-bold text-muted-foreground truncate max-w-[150px]">{req.users?.email}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-base font-black text-primary font-number">₦{req.amount.toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-xs font-bold text-muted-foreground font-number">₦{(req.users?.wallet?.balance ?? 0).toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase border border-transparent ${config.cls}`}>
                          {config.icon}
                          {config.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">
                          {new Date(req.created_at).toLocaleDateString("en-NG", { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        {req.status === 'pending' ? (
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => setSelectedRequest(req)}
                              className="px-4 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary/90 active:scale-95 transition-all shadow-md shadow-primary/20"
                            >
                              Process
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 group/info relative">
                            <MdInfoOutline className="text-muted-foreground text-lg cursor-help" />
                            {req.admin_note && (
                              <div className="absolute bottom-full right-0 mb-2 w-48 p-3 bg-card border border-border rounded-xl shadow-2xl opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all z-10">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1 underline">Admin Note:</p>
                                <p className="text-[11px] text-foreground font-medium leading-relaxed">{req.admin_note}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination ── */}
        {data && data.pages > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-between bg-muted/20">
            <span className="text-xs font-bold text-muted-foreground">
              Page {data.page} of {data.pages}
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-xl bg-muted border border-border text-xs font-bold text-foreground hover:bg-muted/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </button>
              <button 
                onClick={() => setPage(p => Math.min(data.pages, p + 1))}
                disabled={page === data.pages}
                className="px-3 py-1.5 rounded-xl bg-muted border border-border text-xs font-bold text-foreground hover:bg-muted/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Review Modal ── */}
      {selectedRequest && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
          onClick={() => setSelectedRequest(null)}
        >
          <div 
            className="bg-card border border-border/50 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-primary/10 px-6 py-5 border-b border-primary/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg glow-accent">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-foreground uppercase italic tracking-tighter">Review Payout</h3>
                  <p className="text-[10px] text-primary font-bold">REQ-{selectedRequest.id.slice(0, 8)}</p>
                </div>
              </div>
              <button onClick={() => setSelectedRequest(null)} className="text-muted-foreground hover:text-foreground">
                <MdCancel className="text-2xl" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border/50">
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Amount to Pay</p>
                    <p className="text-2xl font-black text-primary tracking-tight">₦{selectedRequest.amount.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">User Balance</p>
                    <p className="text-sm font-black text-foreground">₦{(selectedRequest.users?.wallet?.balance ?? 0).toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Admin Note (Internal)</label>
                  <textarea 
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="Provide reason for approval or rejection..."
                    className="w-full p-4 bg-muted/30 border border-border/50 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none min-h-[100px] resize-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button 
                  onClick={() => handleReview(selectedRequest.id, "rejected")}
                  disabled={isReviewing}
                  className="flex-1 py-4 bg-rose-500/10 border-2 border-rose-500/20 text-rose-500 text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-rose-500 hover:text-white transition-all disabled:opacity-50"
                >
                  Reject Request
                </button>
                <button 
                  onClick={() => handleReview(selectedRequest.id, "approved")}
                  disabled={isReviewing}
                  className="flex-1 py-4 bg-emerald-500 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:brightness-110 shadow-lg shadow-emerald-500/30 transition-all disabled:opacity-50 active:scale-95"
                >
                  Approve & Pay
                </button>
              </div>

              <div className="flex items-start gap-2 text-muted-foreground">
                <MdInfoOutline className="text-base shrink-0 mt-0.5" />
                <p className="text-[10px] font-bold leading-relaxed">
                  Approving this will instantly credit ₦{selectedRequest.amount.toLocaleString()} to @{selectedRequest.users?.username}'s wallet. This action is irreversible.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralPayouts;
