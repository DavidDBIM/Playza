import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../lib/api-client";
import {
  MdSearch,
  MdRefresh,
  MdCheckCircle,
  MdCancel,
  MdPending,
  MdOpenInNew,
  MdZoomIn,
} from "react-icons/md";
import { Share2, ChevronDown } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SocialTaskSubmission {
  id: string;
  user_id: string;
  task_id: string;
  screenshot_url: string;
  status: "pending" | "approved" | "rejected";
  admin_note: string | null;
  created_at: string;
  reviewed_at: string | null;
  users?: {
    username: string;
    email: string;
  };
}

interface SubmissionsResponse {
  submissions: SocialTaskSubmission[];
  total: number;
  page: number;
  pages: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TASK_LABELS: Record<string, string> = {
  FOLLOW_INSTAGRAM: "Instagram Follow",
  FOLLOW_TWITTER: "X (Twitter) Follow",
  FOLLOW_TIKTOK: "TikTok Follow",
  FOLLOW_FACEBOOK: "Facebook Like",
  FOLLOW_YOUTUBE: "YouTube Subscribe",
  FOLLOW_TELEGRAM: "Telegram Join",
};

const TASK_COLORS: Record<string, string> = {
  FOLLOW_INSTAGRAM: "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300",
  FOLLOW_TWITTER: "bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300",
  FOLLOW_TIKTOK: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
  FOLLOW_FACEBOOK: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
  FOLLOW_YOUTUBE: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
  FOLLOW_TELEGRAM: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300",
};

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; cls: string }> = {
  pending: {
    label: "Pending",
    icon: <MdPending />,
    cls: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
  },
  approved: {
    label: "Approved",
    icon: <MdCheckCircle />,
    cls: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
  },
  rejected: {
    label: "Rejected",
    icon: <MdCancel />,
    cls: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300",
  },
};

// ─── API helpers ──────────────────────────────────────────────────────────────

async function fetchSubmissions(params: {
  page: number;
  limit: number;
  search: string;
  status: string;
  task_id: string;
}): Promise<SubmissionsResponse> {
  const query = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
    ...(params.search && { search: params.search }),
    ...(params.status && { status: params.status }),
    ...(params.task_id && { task_id: params.task_id }),
  });
  const { data } = await apiClient.get(`/admin/social-tasks?${query}`);
  return data.data;
}

async function reviewSubmission(payload: {
  id: string;
  action: "approve" | "reject";
  admin_note?: string;
}) {
  const { data } = await apiClient.post(`/admin/social-tasks/${payload.id}/review`, {
    action: payload.action,
    admin_note: payload.admin_note,
  });
  return data.data;
}

// ─── Component ────────────────────────────────────────────────────────────────

const SocialTasks: React.FC = () => {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [taskFilter, setTaskFilter] = useState("");
  const [selected, setSelected] = useState<SocialTaskSubmission | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin", "social-tasks", { page, search, statusFilter, taskFilter }],
    queryFn: () =>
      fetchSubmissions({ page, limit: 15, search, status: statusFilter, task_id: taskFilter }),
  });

  const { mutate: doReview, isPending: reviewing } = useMutation({
    mutationFn: reviewSubmission,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "social-tasks"] });
      setSelected(null);
      setAdminNote("");
      setReviewError("");
    },
    onError: (err: unknown) => {
      setReviewError(err instanceof Error ? err.message : "Action failed.");
    },
  });

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  function handleReview(action: "approve" | "reject") {
    if (!selected) return;
    setReviewError("");
    doReview({ id: selected.id, action, admin_note: adminNote.trim() || undefined });
  }

  // Derived stats
  const pending = data?.submissions.filter((s) => s.status === "pending").length ?? 0;
  const approved = data?.submissions.filter((s) => s.status === "approved").length ?? 0;
  const rejected = data?.submissions.filter((s) => s.status === "rejected").length ?? 0;

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-md shadow-rose-400/30">
            <Share2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">
              Social Task Reviews
            </h1>
            <p className="text-sm text-muted-foreground font-medium">
              Verify follow screenshots and award 200 PZA per approval
            </p>
          </div>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-xl text-sm font-bold text-foreground transition-all"
        >
          <MdRefresh className={`text-lg ${isLoading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total", value: data?.total ?? 0, color: "text-foreground" },
          { label: "Pending", value: pending, color: "text-amber-600 dark:text-amber-400" },
          { label: "Approved", value: approved, color: "text-emerald-600 dark:text-emerald-400" },
          { label: "Rejected", value: rejected, color: "text-red-500 dark:text-red-400" },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-card border border-border rounded-2xl px-4 py-3 shadow-sm"
          >
            <p className="text-xs text-muted-foreground font-black uppercase tracking-wider">
              {s.label}
            </p>
            <p className={`text-3xl font-number mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-2xl p-4 flex flex-wrap gap-3 items-center shadow-sm">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-0">
          <div className="relative flex-1">
            <MdSearch className="-translate-y-1/2 absolute left-3 top-1/2 text-muted-foreground text-lg" />
            <input
              type="text"
              placeholder="Search username or email…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 transition-all"
          >
            Search
          </button>
        </form>

        <div className="flex gap-2 flex-wrap">
          {/* Status filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="appearance-none pl-3 pr-8 py-2.5 rounded-xl bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer transition-all"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          </div>

          {/* Platform filter */}
          <div className="relative">
            <select
              value={taskFilter}
              onChange={(e) => { setTaskFilter(e.target.value); setPage(1); }}
              className="appearance-none pl-3 pr-8 py-2.5 rounded-xl bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer transition-all"
            >
              <option value="">All Platforms</option>
              {Object.entries(TASK_LABELS).map(([id, label]) => (
                <option key={id} value={id}>{label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex items-center justify-center">
            <div className="flex items-center gap-3 text-muted-foreground">
              <MdRefresh className="animate-spin text-2xl" />
              <span className="font-medium">Loading submissions…</span>
            </div>
          </div>
        ) : !data?.submissions.length ? (
          <div className="p-12 text-center">
            <Share2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground font-bold">No submissions found</p>
            <p className="text-muted-foreground/60 text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    {["User", "Platform", "Screenshot", "Status", "Submitted", "Actions"].map((h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 text-xs font-black text-muted-foreground uppercase tracking-wider whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.submissions.map((sub) => {
                    const sc = STATUS_CONFIG[sub.status];
                    return (
                      <tr key={sub.id} className="hover:bg-muted/30 transition-colors group">
                        <td className="px-4 py-3.5">
                          <div>
                            <p className="font-bold text-foreground text-sm">
                              {sub.users?.username ?? "Unknown"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {sub.users?.email ?? "—"}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`text-[10px] font-black px-2 py-1 rounded-lg ${TASK_COLORS[sub.task_id] ?? "bg-muted text-muted-foreground"}`}
                          >
                            {TASK_LABELS[sub.task_id] ?? sub.task_id}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          {sub.screenshot_url ? (
                            <button
                              onClick={() => setLightboxImg(sub.screenshot_url)}
                              className="relative group/thumb"
                            >
                              <img
                                src={sub.screenshot_url}
                                alt="screenshot"
                                className="w-14 h-10 object-cover rounded-lg border border-border group-hover/thumb:opacity-70 transition-opacity"
                              />
                              <MdZoomIn className="absolute inset-0 m-auto text-white text-xl opacity-0 group-hover/thumb:opacity-100 transition-opacity drop-shadow" />
                            </button>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg ${sc.cls}`}
                          >
                            {sc.icon} {sc.label}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(sub.created_at).toLocaleDateString("en-NG", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <button
                            onClick={() => {
                              setSelected(sub);
                              setAdminNote(sub.admin_note ?? "");
                              setReviewError("");
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-xs font-bold transition-all"
                          >
                            <MdOpenInNew className="text-sm" /> Review
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {(data?.pages ?? 0) > 1 && (
              <div className="px-4 py-3 border-t border-border flex items-center justify-between">
                <p className="text-xs text-muted-foreground font-medium">
                  Page {data?.page} of {data?.pages} · {data?.total} total
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-muted hover:bg-muted/80 text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    ← Prev
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(data?.pages ?? 1, p + 1))}
                    disabled={page === (data?.pages ?? 1)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-muted hover:bg-muted/80 text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Review Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-card z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center">
                  <Share2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-foreground text-base">
                    {selected.users?.username ?? "User"}
                  </h3>
                  <p className="text-xs text-muted-foreground">{selected.users?.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="w-8 h-8 rounded-xl bg-muted hover:bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
              >
                <MdCancel className="text-lg" />
              </button>
            </div>

            <div className="px-5 py-5 space-y-4">
              {/* Status + platform */}
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-lg ${STATUS_CONFIG[selected.status].cls}`}
                >
                  {STATUS_CONFIG[selected.status].icon} {STATUS_CONFIG[selected.status].label}
                </span>
                <span
                  className={`text-[10px] font-black px-2.5 py-1 rounded-lg ${TASK_COLORS[selected.task_id] ?? "bg-muted text-muted-foreground"}`}
                >
                  {TASK_LABELS[selected.task_id] ?? selected.task_id}
                </span>
                <span className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400">
                  +200 PZA on approval
                </span>
              </div>

              {/* Screenshot */}
              {selected.screenshot_url && (
                <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-2">
                    Submitted Screenshot
                  </p>
                  <button
                    onClick={() => setLightboxImg(selected.screenshot_url)}
                    className="w-full relative group/shot"
                  >
                    <img
                      src={selected.screenshot_url}
                      alt="submitted screenshot"
                      className="w-full max-h-64 object-contain rounded-xl border border-border bg-muted group-hover/shot:opacity-80 transition-opacity"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/shot:opacity-100 transition-opacity">
                      <span className="flex items-center gap-1.5 px-3 py-1.5 bg-black/70 text-white rounded-lg text-xs font-bold">
                        <MdZoomIn className="text-base" /> View Full Size
                      </span>
                    </div>
                  </button>
                </div>
              )}

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/50 rounded-xl p-3">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-1">
                    Submitted
                  </p>
                  <p className="text-sm font-bold text-foreground">
                    {new Date(selected.created_at).toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                {selected.reviewed_at && (
                  <div className="bg-muted/50 rounded-xl p-3">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-1">
                      Reviewed
                    </p>
                    <p className="text-sm font-bold text-foreground">
                      {new Date(selected.reviewed_at).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                )}
              </div>

              {/* Admin note */}
              <div>
                <label className="block text-xs font-black text-muted-foreground uppercase tracking-wider mb-2">
                  Admin Note (optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Add a note visible to the user if rejected…"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
                />
              </div>

              {reviewError && (
                <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl px-4 py-2.5">
                  <p className="text-red-600 dark:text-red-400 text-xs font-medium">{reviewError}</p>
                </div>
              )}

              {/* Action buttons */}
              {selected.status === "pending" ? (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleReview("reject")}
                    disabled={reviewing}
                    className="flex-1 py-3 rounded-xl border-2 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 font-black text-sm hover:bg-red-50 dark:hover:bg-red-950/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <MdCancel className="text-lg" />
                    {reviewing ? "…" : "Reject"}
                  </button>
                  <button
                    onClick={() => handleReview("approve")}
                    disabled={reviewing}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white font-black text-sm transition-all shadow-md shadow-emerald-500/30 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95"
                  >
                    <MdCheckCircle className="text-lg" />
                    {reviewing ? "…" : "Approve (+200 PZA)"}
                  </button>
                </div>
              ) : (
                <div
                  className={`py-3 rounded-xl text-center text-sm font-black ${STATUS_CONFIG[selected.status].cls}`}
                >
                  This submission has been{" "}
                  <span className="uppercase">{selected.status}</span>
                  {selected.reviewed_at && (
                    <span className="font-normal text-xs block mt-0.5">
                      on {new Date(selected.reviewed_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4"
          onClick={() => setLightboxImg(null)}
        >
          <button
            onClick={() => setLightboxImg(null)}
            className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <MdCancel className="text-xl" />
          </button>
          <img
            src={lightboxImg}
            alt="screenshot full view"
            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default SocialTasks;
