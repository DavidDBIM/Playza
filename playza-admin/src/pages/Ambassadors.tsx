import React, { useState } from "react";
import axios from "axios";
import {
  MdSearch,
  MdRefresh,
  MdCheckCircle,
  MdCancel,
  MdPending,
  MdOpenInNew,
  MdVerified,
} from "react-icons/md";
import { Crown, ChevronDown } from "lucide-react";
import {
  useAdminAmbassadors,
  useAdminReviewAmbassador,
} from "../hooks/use-admin";
import { type AmbassadorApplicationAdmin } from "../types/admin";

const QUAL_LABELS: Record<string, string> = {
  social_influencer: "Social Influencer",
  gold_badge: "Gold Badge",
  referral_100: "100+ Referrals",
};
const QUAL_COLORS: Record<string, string> = {
  social_influencer:
    "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
  gold_badge:
    "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300",
  referral_100:
    "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
};
const STATUS_CONFIG = {
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

const Ambassadors: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [qualFilter, setQualFilter] = useState("");
  const [selectedApp, setSelectedApp] =
    useState<AmbassadorApplicationAdmin | null>(null);
  const [reviewNote, setReviewNote] = useState("");

  const {
    data: res,
    isLoading: loading,
    refetch: fetchData,
  } = useAdminAmbassadors({
    page,
    limit: 15,
    search,
    status: statusFilter,
    qualification: qualFilter,
  });

  const data = res;

  const { mutate: reviewAmbassador, isPending: reviewLoading } =
    useAdminReviewAmbassador();
  const [reviewError, setReviewError] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  function handleReview(action: "approve" | "reject") {
    if (!selectedApp) return;
    setReviewError("");
    reviewAmbassador(
      {
        id: selectedApp.id,
        payload: { action, admin_note: reviewNote.trim() || undefined },
      },
      {
        onSuccess: () => {
          setSelectedApp(null);
          setReviewNote("");
        },
        onError: (err: unknown) => {
          let errorMessage = "Action failed.";
          if (axios.isAxiosError(err)) {
            errorMessage = err.response?.data?.message ?? errorMessage;
          }
          setReviewError(errorMessage);
        },
      },
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md shadow-orange-400/30">
            <Crown className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">
              Ambassador Applications
            </h1>
            <p className="text-sm text-muted-foreground font-medium">
              Review and manage brand ambassador requests
            </p>
          </div>
        </div>
        <button
          onClick={() => fetchData()}
          className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-xl text-sm font-bold text-foreground transition-all"
        >
          <MdRefresh className={`text-lg ${loading ? "animate-spin" : ""}`} />{" "}
          Refresh
        </button>
      </div>

      {/* ── Stats strip ── */}
      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total", value: data.total, color: "text-foreground" },
            {
              label: "Pending",
              value: data.applications.filter((a) => a.status === "pending")
                .length,
              color: "text-amber-600 dark:text-amber-400",
            },
            {
              label: "Approved",
              value: data.applications.filter((a) => a.status === "approved")
                .length,
              color: "text-emerald-600 dark:text-emerald-400",
            },
            {
              label: "Rejected",
              value: data.applications.filter((a) => a.status === "rejected")
                .length,
              color: "text-red-500 dark:text-red-400",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-card border border-border rounded-2xl px-4 py-3 shadow-sm"
            >
              <p className="text-xs text-muted-foreground font-black uppercase tracking-wider">
                {s.label}
              </p>
              <p className={`text-3xl font-number mt-1 ${s.color}`}>
                {s.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ── Filters ── */}
      <div className="bg-card border border-border rounded-2xl p-4 flex flex-wrap gap-3 items-center shadow-sm">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-0">
          <div className="relative flex-1">
            <MdSearch className="-translate-y-1/2 absolute left-3 top-1/2 text-muted-foreground text-lg" />
            <input
              type="text"
              placeholder="Search name or email…"
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
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="appearance-none pl-3 pr-8 py-2.5 rounded-xl bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer transition-all"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          </div>

          {/* Qualification filter */}
          <div className="relative">
            <select
              value={qualFilter}
              onChange={(e) => {
                setQualFilter(e.target.value);
                setPage(1);
              }}
              className="appearance-none pl-3 pr-8 py-2.5 rounded-xl bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer transition-all"
            >
              <option value="">All Types</option>
              <option value="social_influencer">Social Influencer</option>
              <option value="gold_badge">Gold Badge</option>
              <option value="referral_100">100+ Referrals</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex items-center justify-center">
            <div className="flex items-center gap-3 text-muted-foreground">
              <MdRefresh className="animate-spin text-2xl" />
              <span className="font-medium">Loading applications…</span>
            </div>
          </div>
        ) : !data?.applications.length ? (
          <div className="p-12 text-center">
            <Crown className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground font-bold">
              No applications found
            </p>
            <p className="text-muted-foreground/60 text-sm mt-1">
              Try adjusting your filters
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    {[
                      "Applicant",
                      "Qualification",
                      "Followers",
                      "Platforms",
                      "Status",
                      "Applied",
                      "Actions",
                    ].map((h) => (
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
                  {data.applications.map((app) => {
                    const sc = STATUS_CONFIG[app.status];
                    return (
                      <tr
                        key={app.id}
                        className="hover:bg-muted/30 transition-colors group"
                      >
                        <td className="px-4 py-3.5">
                          <div>
                            <p className="font-bold text-foreground text-sm">
                              {app.full_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {app.email}
                            </p>
                            {app.users?.username && (
                              <p className="text-[10px] text-primary font-bold mt-0.5">
                                @{app.users.username}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`text-[10px] font-black px-2 py-1 rounded-lg ${QUAL_COLORS[app.qualification_type]}`}
                          >
                            {QUAL_LABELS[app.qualification_type]}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-foreground font-number text-sm">
                            {app.follower_count
                              ? app.follower_count.toLocaleString()
                              : "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex flex-wrap gap-1 max-w-35">
                            {app.platforms?.map((p) => (
                              <span
                                key={p}
                                className="text-[9px] font-black px-1.5 py-0.5 bg-muted rounded-md text-muted-foreground uppercase"
                              >
                                {p}
                              </span>
                            )) ?? (
                              <span className="text-muted-foreground text-xs">
                                —
                              </span>
                            )}
                          </div>
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
                            {new Date(app.created_at).toLocaleDateString(
                              "en-NG",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <button
                            onClick={() => {
                              setSelectedApp(app);
                              setReviewNote(app.admin_note ?? "");
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
            {data.pages > 1 && (
              <div className="px-4 py-3 border-t border-border flex items-center justify-between">
                <p className="text-xs text-muted-foreground font-medium">
                  Page {data.page} of {data.pages} · {data.total} total
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
                    onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
                    disabled={page === data.pages}
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

      {/* ── Review Detail Modal ── */}
      {selectedApp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedApp(null)}
        >
          <div
            className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-card z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-linear-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                  <Crown className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-foreground text-base">
                    {selectedApp.full_name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedApp.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="w-8 h-8 rounded-xl bg-muted hover:bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
              >
                <MdCancel className="text-lg" />
              </button>
            </div>

            <div className="px-5 py-5 space-y-4">
              {/* Status + type */}
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-lg ${STATUS_CONFIG[selectedApp.status].cls}`}
                >
                  {STATUS_CONFIG[selectedApp.status].icon}{" "}
                  {STATUS_CONFIG[selectedApp.status].label}
                </span>
                <span
                  className={`text-[10px] font-black px-2.5 py-1 rounded-lg ${QUAL_COLORS[selectedApp.qualification_type]}`}
                >
                  {QUAL_LABELS[selectedApp.qualification_type]}
                </span>
                {selectedApp.users?.username && (
                  <span className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-primary/10 text-primary flex items-center gap-1">
                    <MdVerified className="text-sm" /> @
                    {selectedApp.users.username}
                  </span>
                )}
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-3">
                {selectedApp.phone && (
                  <div className="bg-muted/50 rounded-xl p-3">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-1">
                      Phone
                    </p>
                    <p className="text-sm font-bold text-foreground">
                      {selectedApp.phone}
                    </p>
                  </div>
                )}
                {selectedApp.follower_count && (
                  <div className="bg-muted/50 rounded-xl p-3">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-1">
                      Followers
                    </p>
                    <p className="text-sm font-bold text-foreground">
                      {selectedApp.follower_count.toLocaleString()}
                    </p>
                  </div>
                )}
                {selectedApp.content_niche && (
                  <div className="bg-muted/50 rounded-xl p-3">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-1">
                      Content Niche
                    </p>
                    <p className="text-sm font-bold text-foreground">
                      {selectedApp.content_niche}
                    </p>
                  </div>
                )}
                <div className="bg-muted/50 rounded-xl p-3">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-1">
                    Applied
                  </p>
                  <p className="text-sm font-bold text-foreground">
                    {new Date(selectedApp.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Platforms & handles */}
              {selectedApp.platforms && selectedApp.platforms.length > 0 && (
                <div className="bg-muted/50 rounded-xl p-3">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-2">
                    Platforms & Handles
                  </p>
                  <div className="space-y-1.5">
                    {selectedApp.platforms.map((p) => (
                      <div
                        key={p}
                        className="flex items-center justify-between"
                      >
                        <span className="text-xs font-black text-foreground uppercase">
                          {p}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">
                          {selectedApp.social_handles?.[p] ?? "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Motivation */}
              <div className="bg-muted/50 rounded-xl p-3">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-2">
                  Motivation
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  {selectedApp.motivation}
                </p>
              </div>

              {/* Admin note */}
              <div>
                <label className="block text-xs font-black text-muted-foreground uppercase tracking-wider mb-2">
                  Admin Note (optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Add a note for the applicant (will be shown if rejected)…"
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
                />
              </div>

              {reviewError && (
                <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl px-4 py-2.5">
                  <p className="text-red-600 dark:text-red-400 text-xs font-medium">
                    {reviewError}
                  </p>
                </div>
              )}

              {/* Action buttons */}
              {selectedApp.status === "pending" ? (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleReview("reject")}
                    disabled={reviewLoading}
                    className="flex-1 py-3 rounded-xl border-2 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 font-black text-sm hover:bg-red-50 dark:hover:bg-red-950/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <MdCancel className="text-lg" />
                    {reviewLoading ? "…" : "Reject"}
                  </button>
                  <button
                    onClick={() => handleReview("approve")}
                    disabled={reviewLoading}
                    className="flex-1 py-3 rounded-xl bg-linear-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white font-black text-sm transition-all shadow-md shadow-emerald-500/30 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95"
                  >
                    <MdCheckCircle className="text-lg" />
                    {reviewLoading ? "…" : "Approve"}
                  </button>
                </div>
              ) : (
                <div
                  className={`py-3 rounded-xl text-center text-sm font-black ${STATUS_CONFIG[selectedApp.status].cls}`}
                >
                  This application has been{" "}
                  <span className="uppercase">{selectedApp.status}</span>
                  {selectedApp.reviewed_at && (
                    <span className="font-normal text-xs block mt-0.5">
                      on{" "}
                      {new Date(selectedApp.reviewed_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ambassadors;
