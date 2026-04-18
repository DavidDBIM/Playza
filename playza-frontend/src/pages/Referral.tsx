import { useState, useMemo } from "react";
import { Link } from "react-router";
import {
  MdContentCopy,
  MdShare,
  MdCheckCircle,
  MdPending,
  MdCancel,
  MdSearch,
  MdClose,
  MdEmojiEvents,
  MdGroupAdd,
  MdArrowForward,
} from "react-icons/md";
import { FaWhatsapp, FaTwitter, FaTelegram } from "react-icons/fa";
import { useAuth } from "@/context/auth";
import { ZASymbol } from "@/components/currency/ZASymbol";
import { useReferralStats } from "@/hooks/referral/useReferralStats";
import { useRequestReferralPayout, useReferralPayoutRequests } from "../hooks/referral/useRequestReferralPayout";
import { ReferralSkeleton } from "@/components/skeletons/ReferralSkeleton";
import { type ReferralRecord } from "@/api/referral.api";
import { MdAccountBalanceWallet, MdHourglassEmpty, MdInfoOutline } from "react-icons/md";

/* ─── Share Modal ──────────────────────────────────────────────────────────── */
function ShareModal({ referralLink, onClose }: { referralLink: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const shareText = encodeURIComponent("Join me on Playza and compete for real cash: ");

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="glass-card w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl p-5 relative"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-900 dark:text-white font-black text-sm uppercase tracking-widest">Share Link</h3>
          <button onClick={onClose} className="size-8 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500">
            <MdClose />
          </button>
        </div>

        {/* Link row */}
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 mb-4">
          <span className="flex-1 text-[11px] text-slate-500 truncate font-mono">{referralLink}</span>
          <button
            onClick={handleCopy}
            className={`shrink-0 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${copied ? "bg-green-500 text-white" : "bg-primary text-white"}`}
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        {/* Social */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { href: `https://wa.me/?text=${shareText}${referralLink}`, Icon: FaWhatsapp, label: "WhatsApp", color: "#25D366" },
            { href: `https://twitter.com/intent/tweet?text=${shareText}&url=${referralLink}`, Icon: FaTwitter, label: "Twitter", color: "#1DA1F2" },
            { href: `https://t.me/share/url?url=${referralLink}&text=${shareText}`, Icon: FaTelegram, label: "Telegram", color: "#0088cc" },
          ].map(({ href, Icon, label, color }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 hover:border-primary/30 transition-all"
              style={{ "--c": color } as React.CSSProperties}
            >
              <Icon className="text-lg" style={{ color }} />
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Referral Page ────────────────────────────────────────────────────────── */
const Referral = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { data: stats, isLoading: statsLoading } = useReferralStats();
  const { mutateAsync: requestPayout, isPending: requestingPayout } = useRequestReferralPayout();
  const { data: payoutRequests } = useReferralPayoutRequests();
  const [shareOpen, setShareOpen] = useState(false);
  const [payoutError, setPayoutError] = useState<string | null>(null);
  const [payoutSuccess, setPayoutSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PER_PAGE = 6;

  /* ── Referral list processing ── */
  const rows = useMemo(() => {
    return (stats?.referrals ?? []).map((r: ReferralRecord) => ({
      id: r.id,
      name: r.users?.username || "Unknown",
      initial: (r.users?.username || "U").charAt(0).toUpperCase(),
      date: new Date(r.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" }),
      status: r.status === "email_verified" ? "done" : r.status === "pending" ? "pending" : "failed",
      reward: r.status === "email_verified" ? 15 : 0,
    }));
  }, [stats?.referrals]);

  const filtered = useMemo(() => {
    return rows.filter(r => {
      const matchStatus = filter === "All" || (filter === "Verified" ? r.status === "done" : filter === "Pending" ? r.status === "pending" : true);
      return matchStatus && r.name.toLowerCase().includes(search.toLowerCase());
    });
  }, [rows, filter, search]);

  if (authLoading || (user && statsLoading)) return <ReferralSkeleton />;

  const referralLink = `${window.location.origin}/registration?referral_code=${stats?.referral_code || user?.referralCode || ""}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };


  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const pendingZa = stats?.pending_za ?? 0;
  const totalZaEarned = stats?.total_za_earned ?? 0;
  // Check if there is already a pending payout request
  const hasPendingRequest = (payoutRequests ?? []).some(r => r.status === "pending");

  async function handleRequestPayout() {
    if (pendingZa <= 0 || hasPendingRequest || requestingPayout) return;
    setPayoutError(null);
    setPayoutSuccess(false);
    try {
      await requestPayout();
      setPayoutSuccess(true);
      setTimeout(() => setPayoutSuccess(false), 5000);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setPayoutError(e.response?.data?.message ?? "Request failed. Please try again.");
    }
  }

  /* ── Unauthenticated view ── */
  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[70vh]">
        <div className="glass-card rounded-2xl p-8 max-w-sm w-full text-center flex flex-col items-center gap-5">
          <div className="size-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <MdGroupAdd className="text-2xl text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">
              Refer & Earn
            </h1>
            <p className="text-slate-500 text-xs mt-1 font-bold">
              Get <ZASymbol className="inline text-[10px]" /> 500 per verified friend
            </p>
          </div>
          <div className="flex flex-col gap-2 w-full">
            <Link to="/registration?view=signup" className="w-full h-11 bg-primary text-white rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center">
              Create Account
            </Link>
            <Link to="/registration?view=login" className="w-full h-11 border border-primary/30 text-primary rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center hover:bg-primary/5 transition-all">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ── Authenticated view ── */
  return (
    <div className="flex-1 w-full pb-16 md:pb-10 flex flex-col gap-3">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">
            Refer & Earn
          </h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">
            <ZASymbol className="inline text-[9px]" /> 500 per verified friend
          </p>
        </div>
        <Link
          to="/leaderboard?tab=Referral"
          className="flex items-center gap-1.5 text-primary text-[10px] font-black uppercase tracking-widest bg-primary/10 border border-primary/20 px-3 py-2 rounded-xl hover:bg-primary/20 transition-all"
        >
          <MdEmojiEvents className="text-sm" /> Leaderboard <MdArrowForward className="text-xs" />
        </Link>
      </div>

      {/* ── Invite bar ── */}
      <div className="glass-card rounded-xl p-3 flex items-center gap-2">
        <div className="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 overflow-hidden">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Your link</p>
          <p className="text-xs text-slate-600 dark:text-slate-300 truncate font-mono">{referralLink}</p>
        </div>
        <button
          onClick={handleCopy}
          className={`shrink-0 h-12 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 ${copied ? "bg-green-500 text-white" : "bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"}`}
        >
          <MdContentCopy className="text-sm" />
          {copied ? "Copied" : "Copy"}
        </button>
        <button
          onClick={() => setShareOpen(true)}
          className="shrink-0 size-12 rounded-xl bg-primary text-white flex items-center justify-center hover:brightness-110 transition-all shadow-md glow-accent"
        >
          <MdShare className="text-lg" />
        </button>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "Total", value: stats?.total_referrals ?? 0 },
          { label: "Verified", value: stats?.verified_referrals ?? 0 },
          { label: "Pending", value: (stats?.total_referrals ?? 0) - (stats?.verified_referrals ?? 0) },
          { label: "Earned", value: (stats?.verified_referrals ?? 0) * 15, currency: true },
        ].map((s, i) => (
          <div key={i} className="glass-card rounded-xl p-2.5 flex flex-col gap-0.5">
            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{s.label}</p>
            <p className={`font-black text-base md:text-xl leading-none flex items-center gap-0.5 ${i === 3 ? "text-primary" : "text-slate-900 dark:text-white"}`}>
              {s.currency && <ZASymbol className="text-xs" />}
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Referral ZA Available ── */}
      <div className="glass-card rounded-xl overflow-hidden border border-primary/20">
        {/* Header strip */}
        <div className="bg-primary/8 dark:bg-primary/10 px-4 py-3 border-b border-primary/10 flex items-center gap-2">
          <MdAccountBalanceWallet className="text-primary text-base" />
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">Referral Earnings</p>
        </div>

        <div className="p-4 space-y-4">
          {/* Balance row */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-[9px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest">Available to Request</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-1">
                <ZASymbol className="text-lg" />{pendingZa.toLocaleString()}
              </p>
              <p className="text-[9px] text-slate-400 font-bold">All-time earned: <span className="text-primary"><ZASymbol className="inline text-[8px]" />{totalZaEarned.toLocaleString()}</span></p>
            </div>
            <div className="size-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <MdAccountBalanceWallet className="text-primary text-2xl" />
            </div>
          </div>

          {/* Info note */}
          <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-lg px-3 py-2">
            <MdInfoOutline className="text-amber-500 text-sm shrink-0 mt-0.5" />
            <p className="text-[10px] text-amber-700 dark:text-amber-400 font-medium leading-relaxed">
              Referral ZA is credited to your main wallet after admin review. Requests are usually processed within 24 hours.
            </p>
          </div>

          {/* Error / success feedback */}
          {payoutError && (
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 rounded-lg px-3 py-2">
              <MdCancel className="text-red-500 text-sm shrink-0" />
              <p className="text-[10px] text-red-600 dark:text-red-400 font-medium">{payoutError}</p>
            </div>
          )}
          {payoutSuccess && (
            <div className="flex items-center gap-2 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/40 rounded-lg px-3 py-2">
              <MdCheckCircle className="text-green-500 text-sm shrink-0" />
              <p className="text-[10px] text-green-600 dark:text-green-400 font-bold">Request submitted! We'll review and credit your wallet shortly.</p>
            </div>
          )}

          {/* Request button */}
          {hasPendingRequest ? (
            <div className="flex items-center gap-2 h-11 px-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-700/40">
              <MdHourglassEmpty className="text-amber-500 text-sm shrink-0" />
              <p className="text-[10px] text-amber-700 dark:text-amber-400 font-black uppercase tracking-widest">Request pending review…</p>
            </div>
          ) : (
            <button
              onClick={handleRequestPayout}
              disabled={pendingZa <= 0 || requestingPayout}
              className={`w-full h-11 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                pendingZa > 0 && !requestingPayout
                  ? "bg-primary text-white hover:brightness-110 shadow-md glow-accent active:scale-95"
                  : "bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-slate-200 dark:border-white/10"
              }`}
            >
              <MdAccountBalanceWallet className="text-sm" />
              {requestingPayout
                ? "Submitting…"
                : pendingZa <= 0
                ? "No ZA available yet"
                : `Request ${pendingZa.toLocaleString()} ZA`}
            </button>
          )}

          {/* Past payout requests mini-log */}
          {(payoutRequests ?? []).length > 0 && (
            <div className="space-y-1.5 pt-1">
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Request History</p>
              {(payoutRequests ?? []).slice(0, 3).map(r => (
                <div key={r.id} className="flex items-center justify-between py-1.5 border-t border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-2">
                    {r.status === "approved" && <MdCheckCircle className="text-green-500 text-sm" />}
                    {r.status === "pending"  && <MdHourglassEmpty className="text-amber-500 text-sm" />}
                    {r.status === "rejected" && <MdCancel className="text-red-500 text-sm" />}
                    <span className="text-[10px] text-slate-600 dark:text-slate-400 font-bold">
                      {new Date(r.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-xs text-slate-900 dark:text-white flex items-center gap-0.5">
                      <ZASymbol className="text-[9px]" />{r.amount.toLocaleString()}
                    </span>
                    <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md ${
                      r.status === "approved" ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                      : r.status === "pending"  ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                      : "bg-red-100 dark:bg-red-900/30 text-red-500"
                    }`}>{r.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── How it works ── vertical steps ── */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="px-4 pt-4 pb-2">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">How it works</p>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-white/5">
          {[
            {
              n: "1",
              emoji: "🔗",
              title: "Share",
              desc: "Send your unique referral link to friends and family via WhatsApp, Telegram, or any platform.",
            },
            {
              n: "2",
              emoji: "📲",
              title: "Join",
              desc: "They sign up using your referral link and make a minimum deposit of ₦1,000 ZA to activate their account.",
            },
            {
              n: "3",
              emoji: "💰",
              title: "Earn",
              desc: "You get paid once your referral plays 5 games in the Games section or Tournaments. Note: H2H duels do not count.",
            },
          ].map((s, i, arr) => (
            <div key={s.n} className="flex items-start gap-4 px-4 py-4">
              {/* Step number + connector line */}
              <div className="flex flex-col items-center shrink-0" style={{ minWidth: 32 }}>
                <span className="size-8 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-black flex items-center justify-center">
                  {s.emoji}
                </span>
                {i < arr.length - 1 && (
                  <div className="w-px flex-1 bg-primary/20 mt-1" style={{ minHeight: 20 }} />
                )}
              </div>
              {/* Content */}
              <div className="flex-1 pb-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] font-black text-primary uppercase tracking-widest">Step {s.n}</span>
                </div>
                <p className="text-slate-900 dark:text-white text-sm font-black mb-0.5">{s.title}</p>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-medium leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Referral history ── */}
      {rows.length > 0 && (
        <div className="glass-card rounded-xl overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center gap-2 p-3 border-b border-slate-100 dark:border-white/5">
            {/* Filter pills — no heading */}
            <div className="flex gap-1 flex-1">
              {["All", "Verified", "Pending"].map(f => (
                <button
                  key={f}
                  onClick={() => { setFilter(f); setPage(1); }}
                  className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${filter === f ? "bg-primary text-white" : "bg-slate-100 dark:bg-white/5 text-slate-500 border border-slate-200 dark:border-white/10"}`}
                >
                  {f}
                </button>
              ))}
            </div>
            {/* Search */}
            <div className="relative">
              <MdSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
              <input
                type="text"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search…"
                className="h-8 pl-8 pr-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-[11px] font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-primary/40 w-28"
              />
            </div>
          </div>

          {/* Rows */}
          {paginated.length === 0 ? (
            <div className="py-10 text-center text-slate-500 text-xs font-bold uppercase tracking-widest">
              No recruits yet
            </div>
          ) : (
            paginated.map(r => (
              <div key={r.id} className="flex items-center gap-3 px-3 py-2.5 border-b border-slate-50 dark:border-white/5 last:border-0 hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                {/* Avatar */}
                <div className="size-8 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-black flex items-center justify-center shrink-0">
                  {r.initial}
                </div>
                {/* Name + date */}
                <div className="flex-1 min-w-0">
                  <p className="text-slate-900 dark:text-white text-xs font-black truncate">{r.name}</p>
                  <p className="text-slate-400 text-[9px] font-bold">{r.date}</p>
                </div>
                {/* Status */}
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${r.status === "done" ? "bg-green-500/10 text-green-500" : r.status === "pending" ? "bg-amber-500/10 text-amber-500" : "bg-slate-100 dark:bg-white/5 text-slate-400"}`}>
                  {r.status === "done" && <MdCheckCircle className="text-xs" />}
                  {r.status === "pending" && <MdPending className="text-xs" />}
                  {r.status === "failed" && <MdCancel className="text-xs" />}
                  {r.status === "done" ? "Done" : r.status === "pending" ? "Pending" : "Failed"}
                </div>
                {/* Reward */}
                <div className={`text-xs font-black w-12 text-right ${r.reward > 0 ? "text-primary" : "text-slate-400"}`}>
                  {r.reward > 0 ? <span className="flex items-center gap-0.5 justify-end"><ZASymbol className="text-[9px]" />{r.reward}</span> : "—"}
                </div>
              </div>
            ))
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-3 py-2 border-t border-slate-100 dark:border-white/5">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{page}/{totalPages}</span>
              <div className="flex gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="size-7 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-500 text-xs font-black disabled:opacity-30 border border-slate-200 dark:border-white/10 flex items-center justify-center">
                  ‹
                </button>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="size-7 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-500 text-xs font-black disabled:opacity-30 border border-slate-200 dark:border-white/10 flex items-center justify-center">
                  ›
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Empty state ── */}
      {rows.length === 0 && (
        <div className="glass-card rounded-xl p-8 text-center flex flex-col items-center gap-3">
          <div className="size-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <MdGroupAdd className="text-xl text-primary" />
          </div>
          <p className="text-slate-900 dark:text-white font-black text-sm uppercase tracking-tight">No recruits yet</p>
          <p className="text-slate-500 text-xs font-bold">Share your link and start earning</p>
          <button
            onClick={() => setShareOpen(true)}
            className="mt-1 h-10 px-6 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest hover:brightness-110 transition-all flex items-center gap-2 shadow-md glow-accent"
          >
            <MdShare className="text-sm" /> Share Now
          </button>
        </div>
      )}

      {shareOpen && <ShareModal referralLink={referralLink} onClose={() => setShareOpen(false)} />}
    </div>
  );
};

export default Referral;
