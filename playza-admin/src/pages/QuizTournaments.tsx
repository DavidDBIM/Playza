import React, { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../lib/api-client";
import {
  MdAdd, MdRefresh, MdPlayArrow, MdQuestionMark,
  MdUpload, MdDelete, MdEdit, MdClose,
  MdCheckCircle, MdTimer, MdBolt, MdWarning,
} from "react-icons/md";
import { Trophy, Crown, ChevronDown, Zap, Shield, Flame, Star, Users, Calendar, Eye } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface PrizeTier {
  rank: number;
  percentage: number;
}

interface QuizTournament {
  id: string;
  title: string;
  description: string;
  entry_fee: number;
  prize_pool: number;
  max_players: number | null;
  prize_distribution: PrizeTier[] | null;
  status: "draft" | "registration" | "lobby" | "active" | "completed" | "cancelled";
  scheduled_at: string | null;
  started_at: string | null;
  player_count: number;
  question_count: number;
  current_round: number;
}

interface QuizQuestion {
  id: string;
  round_number: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  difficulty: string;
  time_limit_secs: number;
  order_index: number;
  image_url?: string | null;
}

// ─── Round config ─────────────────────────────────────────────────────────────
const ROUND_META = [
  { round: 1, name: "Warm Up",        color: "#22c55e", bg: "rgba(34,197,94,0.1)",   border: "rgba(34,197,94,0.3)",  secs: 45, icon: <Star  className="w-3 h-3" /> },
  { round: 2, name: "Rising",         color: "#3b82f6", bg: "rgba(59,130,246,0.1)",  border: "rgba(59,130,246,0.3)", secs: 35, icon: <Zap   className="w-3 h-3" /> },
  { round: 3, name: "Heat Up",        color: "#f97316", bg: "rgba(249,115,22,0.1)",  border: "rgba(249,115,22,0.3)", secs: 30, icon: <Flame className="w-3 h-3" /> },
  { round: 4, name: "Danger Zone",    color: "#ef4444", bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.3)",  secs: 25, icon: <Shield className="w-3 h-3" /> },
  { round: 5, name: "Final Showdown", color: "#a855f7", bg: "rgba(168,85,247,0.1)",  border: "rgba(168,85,247,0.3)", secs: 20, icon: <Crown className="w-3 h-3" /> },
];

const STATUS_CFG = {
  draft:        { label: "Draft",             color: "#64748b", glow: "rgba(100,116,139,0.3)",  dot: "#64748b" },
  registration: { label: "Registration Open", color: "#22c55e", glow: "rgba(34,197,94,0.35)",   dot: "#22c55e" },
  lobby:        { label: "Lobby Open",        color: "#3b82f6", glow: "rgba(59,130,246,0.35)",  dot: "#3b82f6" },
  active:       { label: "Live Now",          color: "#ef4444", glow: "rgba(239,68,68,0.4)",    dot: "#ef4444" },
  completed:    { label: "Completed",         color: "#10b981", glow: "rgba(16,185,129,0.3)",   dot: "#10b981" },
  cancelled:    { label: "Cancelled",         color: "#475569", glow: "rgba(71,85,105,0.2)",    dot: "#475569" },
} as const;

const RANK_MEDALS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

// ─── API ──────────────────────────────────────────────────────────────────────
const api = {
  listTournaments: async (): Promise<QuizTournament[]> => {
    const { data } = await apiClient.get("/admin/quiz/tournaments");
    return data.data ?? [];
  },
  createTournament: async (payload: Partial<QuizTournament>) => {
    const { data } = await apiClient.post("/admin/quiz/tournaments", payload);
    return data.data;
  },
  updateTournament: async ({ id, ...payload }: Partial<QuizTournament> & { id: string }) => {
    const { data } = await apiClient.patch(`/admin/quiz/tournaments/${id}`, payload);
    return data.data;
  },
  startTournament:  async (id: string) => { const { data } = await apiClient.post(`/admin/quiz/tournaments/${id}/start`);  return data; },
  launchTournament: async (id: string) => { const { data } = await apiClient.post(`/admin/quiz/tournaments/${id}/launch`); return data; },
  getQuestions:     async (id: string): Promise<QuizQuestion[]> => { const { data } = await apiClient.get(`/admin/quiz/tournaments/${id}/questions`); return data.data ?? []; },
  addQuestion:      async (tournamentId: string, q: Partial<QuizQuestion>) => { const { data } = await apiClient.post(`/admin/quiz/tournaments/${tournamentId}/questions`, q); return data.data; },
  bulkImport:       async (tournamentId: string, questions: Partial<QuizQuestion>[]) => { const { data } = await apiClient.post(`/admin/quiz/tournaments/${tournamentId}/questions/bulk`, { questions }); return data; },
  deleteQuestion:   async (qId: string) => { await apiClient.delete(`/admin/quiz/questions/${qId}`); },
  deleteTournament: async (id: string) => { const { data } = await apiClient.delete(`/admin/quiz/tournaments/${id}`); return data; },
  cancelTournament: async ({ id, reason }: { id: string; reason: string }) => { const { data } = await apiClient.patch(`/admin/quiz/tournaments/${id}`, { status: "cancelled", cancelled_reason: reason }); return data; },
  getLive:          async (id: string) => { const { data } = await apiClient.get(`/admin/quiz/tournaments/${id}/live`); return data.data; },
};

// ─── Shared styles ────────────────────────────────────────────────────────────
const inputCls = "w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/60 focus:border-violet-500/40 transition-all";
const labelCls = "block text-[10px] font-black text-white/40 uppercase tracking-widest mb-1.5";

// ─── Prize Distribution Builder ───────────────────────────────────────────────
function PrizeDistributionBuilder({
  tiers,
  onChange,
  platformFeePct,
}: {
  tiers: PrizeTier[];
  onChange: (t: PrizeTier[]) => void;
  platformFeePct: number;
}) {
  const maxAllocatable = 100 - platformFeePct;
  const totalPct  = tiers.reduce((s, t) => s + t.percentage, 0);
  const remaining = maxAllocatable - totalPct;
  const isValid   = totalPct <= maxAllocatable && tiers.length > 0;
  const previewPool = 1000;
  const distributablePreview = Math.round(previewPool * (1 - platformFeePct / 100));

  function addTier() {
    const nextRank = tiers.length > 0 ? Math.max(...tiers.map(t => t.rank)) + 1 : 1;
    onChange([...tiers, { rank: nextRank, percentage: 0 }]);
  }
  function removeTier(rank: number) {
    onChange(tiers.filter(t => t.rank !== rank));
  }
  function updatePct(rank: number, pct: number) {
    onChange(tiers.map(t => t.rank === rank ? { ...t, percentage: Math.max(0, Math.min(maxAllocatable, pct)) } : t));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className={labelCls} style={{ margin: 0 }}>
          Prize Distribution
          <span style={{ fontWeight: 400, textTransform: "none", opacity: 0.5, marginLeft: 4 }}>
            ({maxAllocatable}% distributable after {platformFeePct}% fee)
          </span>
        </label>
        <span className="text-[10px] font-black" style={{ color: totalPct > maxAllocatable ? "#f87171" : totalPct === maxAllocatable ? "#4ade80" : "#fbbf24" }}>
          {totalPct}% / {maxAllocatable}% allocated
        </span>
      </div>

      {/* Visual bar */}
      <div className="h-2 rounded-full overflow-hidden mb-3" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${Math.min(totalPct / maxAllocatable * 100, 100)}%`,
            background: totalPct > maxAllocatable ? "#ef4444" : "linear-gradient(90deg, #7c3aed, #a855f7)",
          }}
        />
      </div>

      {/* Tier rows */}
      <div className="space-y-2 mb-3">
        {tiers.length === 0 && (
          <p className="text-center text-xs text-white/25 py-3">No tiers yet — click Add Rank below</p>
        )}
        {tiers.map((tier) => (
          <div key={tier.rank} className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <span className="text-sm w-6 text-center shrink-0">{RANK_MEDALS[tier.rank] ?? `#${tier.rank}`}</span>
            <span className="text-xs font-black text-white/60 w-14 shrink-0">Rank {tier.rank}</span>
            <div className="relative flex-1">
              <input
                type="number"
                min={0}
                max={maxAllocatable}
                value={tier.percentage}
                onChange={e => updatePct(tier.rank, Number(e.target.value))}
                className={inputCls + " pr-8"}
                style={{ paddingTop: 6, paddingBottom: 6 }}
                placeholder="0"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-white/30">%</span>
            </div>
            <button
              onClick={() => removeTier(tier.rank)}
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all"
              style={{ background: "rgba(239,68,68,0.12)", color: "#f87171" }}
            >
              <MdClose className="text-sm" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={addTier}
          type="button"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white/60 hover:text-white transition-all"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          <MdAdd /> Add Rank
        </button>
        {tiers.length > 0 && remaining > 0 && (
          <span className="text-[10px] text-white/25">{remaining}% unallocated</span>
        )}
        {totalPct > maxAllocatable && (
          <span className="text-[10px] font-black text-red-400">⚠ Exceeds {maxAllocatable}% limit</span>
        )}
      </div>

      {isValid && totalPct > 0 && (
        <div className="mt-3 rounded-xl px-3 py-2 space-y-1" style={{ background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.15)" }}>
          <p className="text-[9px] font-black text-white/25 uppercase tracking-widest mb-1.5">
            Preview (based on 1,000 ZA pool · {distributablePreview} ZA after {platformFeePct}% fee)
          </p>
          {tiers.map(tier => (
            <div key={tier.rank} className="flex items-center justify-between">
              <span className="text-xs text-white/50">{RANK_MEDALS[tier.rank] ?? `#${tier.rank}`} Rank {tier.rank}</span>
              <span className="text-xs font-black text-white">
                {Math.round(distributablePreview * tier.percentage / 100).toLocaleString()} ZA
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Create Modal ─────────────────────────────────────────────────────────────
function CreateTournamentModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    title: "", description: "", entry_fee: 0,
    scheduled_at: "", registration_end: "",
    max_players: "" as string | number,
    platform_fee_percentage: 10,
    consolation_pza: 0,
  });
  const [tiers, setTiers] = useState<PrizeTier[]>([]);
  const [error, setError] = useState("");

  const totalPct = tiers.reduce((s, t) => s + t.percentage, 0);
  const maxAllocatable = 100 - form.platform_fee_percentage;

  const { mutate, isPending } = useMutation({
    mutationFn: () => api.createTournament({
      title: form.title,
      description: form.description,
      entry_fee: Number(form.entry_fee),
      scheduled_at: form.scheduled_at || null,
      registration_end: form.registration_end || null,
      max_players: form.max_players !== "" ? Number(form.max_players) : null,
      prize_distribution: tiers.length > 0 ? tiers : null,
      platform_fee_percentage: form.platform_fee_percentage,
      consolation_pza: form.consolation_pza,
    } as any),
    onSuccess: () => { onCreated(); onClose(); },
    onError: (err: any) => setError(err.response?.data?.message ?? "Failed to create"),
  });

  const canSubmit = !!form.title && totalPct <= maxAllocatable;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(16px)" }} onClick={onClose}>
      <div className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(30,20,60,0.98) 0%, rgba(15,10,40,0.98) 100%)", border: "1px solid rgba(139,92,246,0.3)", boxShadow: "0 0 60px rgba(139,92,246,0.2), inset 0 1px 0 rgba(255,255,255,0.05)" }} onClick={e => e.stopPropagation()}>
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)", boxShadow: "0 0 20px rgba(124,58,237,0.4)" }}>
              <Trophy className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-black text-white text-base tracking-tight">New Tournament</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"><MdClose /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && <div className="rounded-xl px-4 py-3 text-sm font-bold" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}>{error}</div>}

          {/* Basic fields */}
          <div className="space-y-4">
            {[
              { label: "Title *",                   key: "title",             type: "text",           placeholder: "Quiz Championship #1" },
              { label: "Description",               key: "description",       type: "text",           placeholder: "Test your knowledge..." },
              { label: "Entry Fee (ZA Tokens)",     key: "entry_fee",         type: "number",         placeholder: "0 = Free" },
              { label: "Registration Closes At",    key: "registration_end",  type: "datetime-local", placeholder: "" },
              { label: "Game Starts At (Scheduled)", key: "scheduled_at",     type: "datetime-local", placeholder: "" },
            ].map(f => (
              <div key={f.key}>
                <label className={labelCls}>{f.label}</label>
                <input type={f.type} placeholder={f.placeholder} value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} className={inputCls} />
              </div>
            ))}
            <div>
              <label className={labelCls}>Max Players <span style={{ fontWeight: 400, textTransform: "none", opacity: 0.5 }}>(leave blank = unlimited)</span></label>
              <input type="number" placeholder="e.g. 500" min={1} value={form.max_players} onChange={e => setForm(p => ({ ...p, max_players: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Platform Fee % <span style={{ fontWeight: 400, textTransform: "none", opacity: 0.5 }}>(taken before prize distribution)</span></label>
              <div className="relative">
                <input type="number" min={0} max={50} placeholder="10" value={form.platform_fee_percentage} onChange={e => setForm(p => ({ ...p, platform_fee_percentage: Math.max(0, Math.min(50, Number(e.target.value))) }))} className={inputCls + " pr-8"} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-white/30">%</span>
              </div>
            </div>
            <div>
              <label className={labelCls}>Consolation PZA <span style={{ fontWeight: 400, textTransform: "none", opacity: 0.5 }}>(awarded to ALL registered players at game end)</span></label>
              <div className="relative">
                <input type="number" min={0} placeholder="e.g. 50" value={form.consolation_pza} onChange={e => setForm(p => ({ ...p, consolation_pza: Math.max(0, Number(e.target.value)) }))} className={inputCls + " pr-12"} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-white/30">PZA</span>
              </div>
            </div>
          </div>

          <div style={{ height: 1, background: "rgba(255,255,255,0.06)" }} />

          <PrizeDistributionBuilder tiers={tiers} onChange={setTiers} platformFeePct={form.platform_fee_percentage} />
            {isPending ? <><MdRefresh className="animate-spin" /> Creating...</> : <><MdAdd /> Create Tournament</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────
function EditTournamentModal({ tournament, onClose, onSaved }: { tournament: QuizTournament; onClose: () => void; onSaved: (updated: QuizTournament) => void }) {
  const toLocalDT = (iso: string | null) => {
    if (!iso) return "";
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const [form, setForm] = useState({
    title: tournament.title,
    description: tournament.description ?? "",
    entry_fee: tournament.entry_fee,
    scheduled_at: toLocalDT(tournament.scheduled_at),
    registration_end: toLocalDT((tournament as any).registration_end),
    max_players: tournament.max_players ?? ("" as string | number),
    platform_fee_percentage: (tournament as any).platform_fee_percentage ?? 10,
    consolation_pza: (tournament as any).consolation_pza ?? 0,
  });
  const [tiers, setTiers] = useState<PrizeTier[]>(tournament.prize_distribution ?? []);
  const [error, setError] = useState("");

  const totalPct = tiers.reduce((s, t) => s + t.percentage, 0);
  const maxAllocatable = 100 - form.platform_fee_percentage;

  const { mutate, isPending } = useMutation({
    mutationFn: () => api.updateTournament({
      id: tournament.id,
      title: form.title,
      description: form.description,
      entry_fee: Number(form.entry_fee),
      scheduled_at: form.scheduled_at || null,
      registration_end: form.registration_end || null,
      max_players: form.max_players !== "" ? Number(form.max_players) : null,
      prize_distribution: tiers.length > 0 ? tiers : null,
      platform_fee_percentage: form.platform_fee_percentage,
      consolation_pza: form.consolation_pza,
    } as any),
    onSuccess: (updated) => { onSaved(updated); onClose(); },
    onError: (err: any) => setError(err.response?.data?.message ?? "Failed to save"),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(16px)" }} onClick={onClose}>
      <div className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(20,30,60,0.98) 0%, rgba(10,15,40,0.98) 100%)", border: "1px solid rgba(59,130,246,0.3)", boxShadow: "0 0 60px rgba(59,130,246,0.15), inset 0 1px 0 rgba(255,255,255,0.05)" }} onClick={e => e.stopPropagation()}>
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #2563eb, #0ea5e9)", boxShadow: "0 0 20px rgba(37,99,235,0.4)" }}>
              <MdEdit className="text-white text-lg" />
            </div>
            <div>
              <h3 className="font-black text-white text-base tracking-tight">Edit Tournament</h3>
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider">{tournament.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"><MdClose /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && <div className="rounded-xl px-4 py-3 text-sm font-bold" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}>{error}</div>}

          <div className="space-y-4">
            {[
              { label: "Title *",                    key: "title",             type: "text",           placeholder: "Quiz Championship #1" },
              { label: "Description",                key: "description",       type: "text",           placeholder: "Test your knowledge..." },
              { label: "Entry Fee (ZA Tokens)",      key: "entry_fee",         type: "number",         placeholder: "0 = Free" },
              { label: "Registration Closes At",     key: "registration_end",  type: "datetime-local", placeholder: "" },
              { label: "Game Starts At (Scheduled)", key: "scheduled_at",      type: "datetime-local", placeholder: "" },
            ].map(f => (
              <div key={f.key}>
                <label className={labelCls}>{f.label}</label>
                <input type={f.type} placeholder={f.placeholder} value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} className={inputCls} />
              </div>
            ))}
            <div>
              <label className={labelCls}>Max Players <span style={{ fontWeight: 400, textTransform: "none", opacity: 0.5 }}>(leave blank = unlimited)</span></label>
              <input type="number" placeholder="e.g. 500" min={1} value={form.max_players} onChange={e => setForm(p => ({ ...p, max_players: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Platform Fee % <span style={{ fontWeight: 400, textTransform: "none", opacity: 0.5 }}>(taken before prize distribution)</span></label>
              <div className="relative">
                <input type="number" min={0} max={50} placeholder="10" value={form.platform_fee_percentage} onChange={e => setForm(p => ({ ...p, platform_fee_percentage: Math.max(0, Math.min(50, Number(e.target.value))) }))} className={inputCls + " pr-8"} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-white/30">%</span>
              </div>
            </div>
            <div>
              <label className={labelCls}>Consolation PZA <span style={{ fontWeight: 400, textTransform: "none", opacity: 0.5 }}>(awarded to ALL registered players at game end)</span></label>
              <div className="relative">
                <input type="number" min={0} placeholder="e.g. 50" value={form.consolation_pza} onChange={e => setForm(p => ({ ...p, consolation_pza: Math.max(0, Number(e.target.value)) }))} className={inputCls + " pr-12"} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-white/30">PZA</span>
              </div>
            </div>
          </div>

          <div style={{ height: 1, background: "rgba(255,255,255,0.06)" }} />

          <PrizeDistributionBuilder tiers={tiers} onChange={setTiers} platformFeePct={form.platform_fee_percentage} />
        </div>
        <div className="px-6 py-4 border-t border-white/5 shrink-0 flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white/60 hover:text-white transition-all" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>Cancel</button>
          <button onClick={() => mutate()} disabled={isPending || !form.title || totalPct > maxAllocatable} className="flex-1 py-2.5 rounded-xl font-black text-sm text-white disabled:opacity-40 flex items-center justify-center gap-2 transition-all hover:opacity-90" style={{ background: "linear-gradient(135deg, #2563eb, #0ea5e9)", boxShadow: "0 0 20px rgba(37,99,235,0.3)" }}>
            {isPending ? <><MdRefresh className="animate-spin" /> Saving...</> : <><MdCheckCircle /> Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Question Manager Modal ───────────────────────────────────────────────────
function QuestionManagerModal({ tournament, onClose }: { tournament: QuizTournament; onClose: () => void }) {
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [activeRound, setActiveRound] = useState(1);
  const [addMode, setAddMode] = useState(false);
  const [importError, setImportError] = useState("");
  const [importSuccess, setImportSuccess] = useState("");
  const [newQ, setNewQ] = useState({ question_text: "", option_a: "", option_b: "", option_c: "", option_d: "", correct_option: "A", image_url: "" });

  const { data: questions = [], refetch } = useQuery({ queryKey: ["admin-quiz-questions", tournament.id], queryFn: () => api.getQuestions(tournament.id) });
  const { mutate: addQ, isPending: adding } = useMutation({
    mutationFn: () => api.addQuestion(tournament.id, { ...newQ, round_number: activeRound, image_url: newQ.image_url?.trim() || null }),
    onSuccess: () => { refetch(); queryClient.invalidateQueries({ queryKey: ["admin-quiz-tournaments"] }); setNewQ({ question_text: "", option_a: "", option_b: "", option_c: "", option_d: "", correct_option: "A", image_url: "" }); setAddMode(false); },
  });
  const { mutate: deleteQ } = useMutation({
    mutationFn: api.deleteQuestion,
    onSuccess: () => { refetch(); queryClient.invalidateQueries({ queryKey: ["admin-quiz-tournaments"] }); },
  });
  const { mutate: bulkImport, isPending: importing } = useMutation({
    mutationFn: (qs: Partial<QuizQuestion>[]) => api.bulkImport(tournament.id, qs),
    onSuccess: (data) => { setImportSuccess(`Imported ${data.data?.length ?? 0} questions!`); setImportError(""); refetch(); queryClient.invalidateQueries({ queryKey: ["admin-quiz-tournaments"] }); setTimeout(() => setImportSuccess(""), 4000); },
    onError: (err: any) => setImportError(err.response?.data?.message ?? "Import failed"),
  });

  function handleFileImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        const qs = Array.isArray(parsed) ? parsed : parsed.questions;
        if (!Array.isArray(qs)) throw new Error("Expected an array of questions");
        bulkImport(qs);
      } catch (err: any) { setImportError(err.message ?? "Invalid JSON"); }
    };
    reader.readAsText(file); e.target.value = "";
  }

  const roundQuestions = questions.filter(q => q.round_number === activeRound);
  const rm = ROUND_META[activeRound - 1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(16px)" }} onClick={onClose}>
      <div className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden" style={{ background: "linear-gradient(160deg, rgba(15,10,35,0.99) 0%, rgba(5,5,20,0.99) 100%)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 0 80px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.04)" }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 shrink-0">
          <div>
            <h3 className="font-black text-white text-base">{tournament.title}</h3>
            <p className="text-white/30 text-xs font-bold">{questions.length} questions total</p>
          </div>
          <div className="flex items-center gap-2">
            <input ref={fileRef} type="file" accept=".json" onChange={handleFileImport} className="hidden" />
            <button onClick={() => fileRef.current?.click()} disabled={importing} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white/60 hover:text-white transition-all" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <MdUpload className={importing ? "animate-spin" : ""} />{importing ? "Importing..." : "Import JSON"}
            </button>
            <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"><MdClose /></button>
          </div>
        </div>
        {(importError || importSuccess) && (
          <div className="mx-6 mt-4 px-4 py-2.5 rounded-xl text-sm font-bold border shrink-0" style={importSuccess ? { background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", color: "#34d399" } : { background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}>
            {importSuccess || importError}
          </div>
        )}
        <div className="mx-6 mt-3 px-4 py-2.5 rounded-xl shrink-0" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
          <p className="text-[9px] font-black text-white/25 uppercase tracking-widest mb-1">JSON Format</p>
          <code className="text-[9px] text-white/30 font-mono">{`[{"round_number":1,"question_text":"...","option_a":"...","option_b":"...","option_c":"...","option_d":"...","correct_option":"A"}]`}</code>
        </div>
        <div className="flex gap-2 px-6 py-3 border-b border-white/5 shrink-0 overflow-x-auto">
          {ROUND_META.map(r => {
            const count = questions.filter(q => q.round_number === r.round).length;
            const active = activeRound === r.round;
            return (
              <button key={r.round} onClick={() => { setActiveRound(r.round); setAddMode(false); }} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all" style={active ? { background: r.bg, border: `1px solid ${r.border}`, color: r.color } : { background: "rgba(255,255,255,0.03)", border: "1px solid transparent", color: "rgba(255,255,255,0.3)" }}>
                <span style={active ? { color: r.color } : {}}>{r.icon}</span>
                <span>{r.name}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-md font-black" style={active ? { background: r.color, color: "#000" } : { background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.3)" }}>{count}</span>
              </button>
            );
          })}
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
          {roundQuestions.length === 0 && !addMode ? (
            <div className="py-12 text-center">
              <MdQuestionMark className="text-4xl mx-auto mb-2 opacity-10 text-white" />
              <p className="font-bold text-sm text-white/30">No questions for {rm?.name}</p>
            </div>
          ) : (
            roundQuestions.map((q, i) => (
              <div key={q.id} className="rounded-xl p-3.5 group transition-all" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-black text-white/30">Q{i + 1}</span>
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md" style={{ background: rm?.color, color: "#000" }}>{rm?.name}</span>
                      <span className="text-[9px] font-bold text-white/30 flex items-center gap-0.5"><MdTimer className="text-xs" />{q.time_limit_secs}s</span>
                    </div>
                    <p className="text-sm font-bold text-white mb-2 leading-snug">{q.question_text}</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(["A", "B", "C", "D"] as const).map(opt => (
                        <div key={opt} className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg" style={q.correct_option === opt ? { background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", color: "#4ade80" } : { color: "rgba(255,255,255,0.3)" }}>
                          <span className="font-black text-[10px]">{opt}</span>
                          {(q as any)[`option_${opt.toLowerCase()}`]}
                          {q.correct_option === opt && <MdCheckCircle className="ml-auto text-green-400 shrink-0" />}
                        </div>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => deleteQ(q.id)} className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center transition-all" style={{ background: "rgba(239,68,68,0.15)", color: "#f87171" }}>
                    <MdDelete className="text-sm" />
                  </button>
                </div>
              </div>
            ))
          )}
          {addMode && (
            <div className="rounded-2xl p-4 space-y-3" style={{ background: rm?.bg, border: `1px solid ${rm?.border}` }}>
              <p className="text-xs font-black uppercase tracking-wider" style={{ color: rm?.color }}>Add Question — {rm?.name}</p>
              <textarea rows={2} placeholder="Question text..." value={newQ.question_text} onChange={e => setNewQ(p => ({ ...p, question_text: e.target.value }))} className={inputCls + " resize-none"} />
              <div>
                <label className={labelCls}>Question Image <span style={{ fontWeight: 400, textTransform: "none", opacity: 0.5 }}>(optional)</span></label>
                <div className="flex gap-2 mb-2">
                  <input type="url" placeholder="Paste image URL..." value={newQ.image_url} onChange={e => setNewQ(p => ({ ...p, image_url: e.target.value }))} className={inputCls} style={{ flex: 1 }} />
                  <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl cursor-pointer shrink-0 text-xs font-bold text-white/60 hover:text-white transition-all" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", whiteSpace: "nowrap" }}>
                    <MdUpload className="text-sm" /> Upload
                    <input type="file" accept="image/*" className="hidden" onChange={e => { const file = e.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = ev => { setNewQ(p => ({ ...p, image_url: ev.target?.result as string })); }; reader.readAsDataURL(file); e.target.value = ""; }} />
                  </label>
                </div>
                {newQ.image_url && (
                  <div className="relative">
                    <img src={newQ.image_url} alt="preview" className="w-full max-h-32 object-cover rounded-xl" style={{ border: "1px solid rgba(255,255,255,0.1)" }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                    <button onClick={() => setNewQ(p => ({ ...p, image_url: "" }))} className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-black" style={{ background: "rgba(0,0,0,0.6)" }}>✕</button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(["a", "b", "c", "d"] as const).map(k => (
                  <div key={k} className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-white/30 uppercase">{k}</span>
                    <input type="text" placeholder={`Option ${k.toUpperCase()}`} value={(newQ as any)[`option_${k}`]} onChange={e => setNewQ(p => ({ ...p, [`option_${k}`]: e.target.value }))} className={inputCls + " pl-7"} />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <label className="text-[10px] font-black text-white/40 uppercase mr-2">Correct:</label>
                  <select value={newQ.correct_option} onChange={e => setNewQ(p => ({ ...p, correct_option: e.target.value }))} className="appearance-none px-3 py-2 pr-7 rounded-xl text-sm font-bold text-white focus:outline-none" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    {["A", "B", "C", "D"].map(o => <option key={o} value={o} style={{ background: "#1e1035" }}>{o}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30 pointer-events-none" />
                </div>
                <button onClick={() => addQ()} disabled={adding || !newQ.question_text || !newQ.option_a || !newQ.option_b || !newQ.option_c || !newQ.option_d} className="flex-1 py-2 rounded-xl font-black text-xs text-white disabled:opacity-40 flex items-center justify-center gap-1 transition-all" style={{ background: rm?.color, color: "#000" }}>
                  {adding ? <MdRefresh className="animate-spin" /> : <MdAdd />}{adding ? "Adding..." : "Add Question"}
                </button>
                <button onClick={() => setAddMode(false)} className="px-3 py-2 rounded-xl font-bold text-xs text-white/50 hover:text-white transition-all" style={{ background: "rgba(255,255,255,0.05)" }}>Cancel</button>
              </div>
            </div>
          )}
        </div>
        {!addMode && (
          <div className="px-6 py-4 border-t border-white/5 shrink-0">
            <button onClick={() => setAddMode(true)} className="w-full py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2" style={{ background: "rgba(255,255,255,0.03)", border: `1px dashed ${rm?.border}`, color: rm?.color }}>
              <MdAdd /> Add Question to {rm?.name}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Live Monitor Modal ───────────────────────────────────────────────────────
function LiveMonitorModal({ tournament, onClose }: { tournament: QuizTournament; onClose: () => void }) {
  const { data: live, isLoading, isError, error } = useQuery({
    queryKey: ["admin-quiz-live", tournament.id],
    queryFn: () => api.getLive(tournament.id),
    refetchInterval: 3000,
    retry: 2,
  });

  const isActive = tournament.status === "active";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(16px)" }} onClick={onClose}>
      <div className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl overflow-hidden" style={{ background: "linear-gradient(160deg, rgba(20,5,5,0.99) 0%, rgba(8,2,2,0.99) 100%)", border: "1px solid rgba(239,68,68,0.2)", boxShadow: "0 0 60px rgba(239,68,68,0.1)" }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" style={{ boxShadow: "0 0 8px #ef4444", animation: isActive ? "pulse 1.5s infinite" : "none" }} />
            <div>
              <h3 className="font-black text-white text-base">{tournament.title}</h3>
              <p className="text-white/30 text-xs font-bold uppercase tracking-wider mt-0.5">
                {isActive ? "🔴 Live Now" : tournament.status === "lobby" ? "🟡 In Lobby" : tournament.status === "registration" ? "🟢 Registration Open" : tournament.status}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all">
            <MdClose />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-white/40">
              <MdRefresh className="animate-spin text-3xl" />
              <p className="text-sm font-bold">Loading tournament data...</p>
            </div>
          ) : isError ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
                <MdWarning className="text-3xl text-red-400" />
              </div>
              <p className="font-black text-white text-base">Failed to load data</p>
              <p className="text-sm text-white/40 max-w-xs">{(error as any)?.response?.data?.message ?? (error as any)?.message ?? "Could not reach the server"}</p>
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Round",       value: isActive ? (live?.tournament?.current_round ?? 0) : "—",      color: "#a855f7" },
                  { label: "Registered",  value: live?.stats ? (live.stats.alive + live.stats.eliminated) : (tournament as any).player_count ?? 0, color: "#3b82f6" },
                  { label: isActive ? "Eliminated" : "Players", value: isActive ? (live?.stats?.eliminated ?? 0) : (tournament as any).max_players ? `${(tournament as any).player_count}/${(tournament as any).max_players}` : (tournament as any).player_count ?? 0, color: isActive ? "#ef4444" : "#22c55e" },
                ].map(s => (
                  <div key={s.label} className="rounded-2xl p-4 text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Alive count if active */}
              {isActive && (
                <div className="rounded-xl px-4 py-3 flex items-center justify-between" style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)" }}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-sm font-black text-green-400">Still Alive</span>
                  </div>
                  <span className="text-2xl font-black text-green-400">{live?.stats?.alive ?? 0}</span>
                </div>
              )}

              {/* Leaderboard / Players list */}
              <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                  <p className="text-xs font-black text-white/30 uppercase tracking-wider">
                    {isActive ? "Live Leaderboard" : "Registered Players"}
                  </p>
                  <span className="text-xs font-black text-white/20">
                    {live?.leaderboard?.length ?? 0} players
                  </span>
                </div>

                {!live?.leaderboard || live.leaderboard.length === 0 ? (
                  <div className="py-12 flex flex-col items-center gap-2 text-center px-4">
                    <p className="text-2xl">👥</p>
                    <p className="text-sm font-black text-white/30">
                      {isActive ? "No players in leaderboard yet" : "No players registered yet"}
                    </p>
                    <p className="text-xs text-white/20">
                      {isActive ? "Players appear here once they answer their first question" : "Share the tournament to get players to register"}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5 max-h-72 overflow-y-auto">
                    {live.leaderboard.slice(0, 50).map((entry: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                        <span className="text-sm font-black text-white/30 w-5 text-center shrink-0">
                          {i === 0 ? "👑" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                        </span>
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0" style={{ background: "rgba(124,58,237,0.3)" }}>
                          {entry.username?.[0]?.toUpperCase() ?? "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white truncate">{entry.username ?? "Unknown"}</p>
                          {isActive && <p className="text-[10px] text-white/30">{entry.correct_answers ?? 0} correct · {entry.avg_time_ms ? `${Math.round(entry.avg_time_ms / 1000)}s avg` : "—"}</p>}
                        </div>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full shrink-0"
                          style={
                            entry.status === "winner"    ? { background: "rgba(234,179,8,0.15)",    color: "#fbbf24" } :
                            entry.status === "alive"     ? { background: "rgba(34,197,94,0.15)",    color: "#4ade80" } :
                            entry.status === "eliminated"? { background: "rgba(239,68,68,0.15)",    color: "#f87171" } :
                                                           { background: "rgba(255,255,255,0.06)",   color: "rgba(255,255,255,0.3)" }
                          }>
                          {entry.status ?? "registered"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Entry fee collected */}
              {tournament.entry_fee > 0 && (
                <div className="rounded-xl px-4 py-3 flex items-center justify-between" style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.15)" }}>
                  <span className="text-xs font-black text-amber-400/70 uppercase tracking-wider">Prize Pool Collected</span>
                  <span className="text-base font-black text-amber-400">{tournament.prize_pool.toLocaleString()} ZA</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Tournament Card ──────────────────────────────────────────────────────────
function TournamentCard({ t, onManageQ, onEdit, onMonitor, onStart, onLaunch, onDisable, onDelete, startPending, launchPending }: {
  t: QuizTournament;
  onManageQ: () => void; onEdit: () => void; onMonitor: () => void;
  onStart: () => void; onLaunch: () => void; onDisable: () => void; onDelete: () => void;
  startPending: boolean; launchPending: boolean;
}) {
  const sc     = STATUS_CFG[t.status] ?? STATUS_CFG.draft;
  const isLive  = t.status === "active";
  const isReg   = t.status === "registration";
  const isLobby = t.status === "lobby";
  const isDraft = t.status === "draft";
  const isDone  = t.status === "completed" || t.status === "cancelled";

  return (
    <div className="relative rounded-2xl overflow-hidden flex flex-col transition-all duration-300 group" style={{ background: "linear-gradient(160deg, rgba(20,15,40,0.95) 0%, rgba(10,8,25,0.95) 100%)", border: `1px solid ${isLive ? "rgba(239,68,68,0.4)" : isReg ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.07)"}`, boxShadow: isLive ? "0 0 40px rgba(239,68,68,0.12), 0 8px 32px rgba(0,0,0,0.4)" : isReg ? "0 0 40px rgba(34,197,94,0.1), 0 8px 32px rgba(0,0,0,0.4)" : "0 8px 32px rgba(0,0,0,0.3)" }}>
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${sc.color}, transparent)`, opacity: isDone ? 0.2 : 0.7 }} />
      {isLive && <div className="absolute inset-0 opacity-5" style={{ background: "radial-gradient(circle at 50% 0%, #ef4444 0%, transparent 70%)" }} />}

      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-black text-white text-base leading-tight truncate">{t.title}</h3>
            {t.description && <p className="text-white/35 text-xs mt-1 line-clamp-1">{t.description}</p>}
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full shrink-0" style={{ background: `${sc.color}18`, border: `1px solid ${sc.color}40` }}>
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: sc.color, boxShadow: `0 0 6px ${sc.color}`, ...(isLive ? { animation: "pulse 1.5s infinite" } : {}) }} />
            <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: sc.color }}>{sc.label}</span>
          </div>
        </div>

        {t.scheduled_at && (
          <div className="flex items-center gap-1.5 mb-3">
            <Calendar className="w-3 h-3 text-white/25" />
            <span className="text-[11px] font-bold text-white/30">{new Date(t.scheduled_at).toLocaleDateString("en-NG", { weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: <Users className="w-3 h-3" />,        value: t.max_players ? `${t.player_count}/${t.max_players}` : t.player_count, label: "Players",   color: "#a855f7" },
            { icon: <MdQuestionMark className="text-xs"/>, value: t.question_count,  label: "Questions", color: "#3b82f6" },
            { icon: <Trophy className="w-3 h-3" />,        value: `${t.prize_pool.toLocaleString()} ZA`, label: "Prize", color: "#f59e0b" },
            { icon: <span className="text-[10px]">🎯</span>, value: t.prize_distribution?.length ? `${t.prize_distribution.length} tiers` : "—", label: "Payout", color: "#22c55e" },
          ].map(s => (
            <div key={s.label} className="rounded-xl px-2 py-2 text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="flex items-center justify-center gap-1 mb-0.5" style={{ color: s.color }}>{s.icon}</div>
              <p className="text-[11px] font-black text-white leading-none">{s.value}</p>
              <p className="text-[8px] text-white/25 font-bold uppercase mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Round bar */}
      <div className="px-5 py-3 border-t border-white/5">
        <div className="flex items-center gap-1">
          {ROUND_META.map(r => {
            const done    = t.status === "completed" || (isLive && t.current_round > r.round);
            const current = isLive && t.current_round === r.round;
            return (
              <div key={r.round} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full h-1 rounded-full transition-all" style={{ background: done || current ? r.color : "rgba(255,255,255,0.06)", boxShadow: current ? `0 0 8px ${r.color}` : "none" }} />
                <span className="text-[8px] font-bold hidden sm:block" style={{ color: current ? r.color : "rgba(255,255,255,0.2)" }}>{r.name.split(" ")[0]}</span>
              </div>
            );
          })}
        </div>
        {t.entry_fee > 0 && (
          <div className="flex items-center gap-1 mt-2">
            <MdBolt className="text-amber-400 text-xs" />
            <span className="text-[10px] font-bold text-white/30">{t.entry_fee} ZA entry fee</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 pt-1 flex flex-wrap gap-2 mt-auto">
        <button onClick={onManageQ} className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-white/60 hover:text-white transition-all" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <MdEdit className="text-sm" /> Questions
        </button>
        {!isDone && (
          <button onClick={onEdit} className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-all" style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", color: "#60a5fa" }}>
            <MdEdit className="text-sm" /> Edit
          </button>
        )}
        {(isLive || isReg || isLobby) && (
          <button onClick={onMonitor} className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-all" style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}>
            <Eye className="w-3 h-3" /> {isLive ? "Monitor Live" : "View Players"}
          </button>
        )}
        {isDraft && (
          <>
            {(t.question_count ?? 0) < 5 && (
              <div className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", color: "#fbbf24" }}>
                <MdWarning className="text-sm shrink-0" />
                <span>{(t.question_count ?? 0)} / 5 questions — add more to open registration</span>
              </div>
            )}
            <button onClick={onStart} disabled={startPending} className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-black text-white transition-all disabled:opacity-50" style={{ background: "linear-gradient(135deg, rgba(34,197,94,0.3), rgba(16,185,129,0.2))", border: "1px solid rgba(34,197,94,0.4)" }}>
              {startPending ? <MdRefresh className="animate-spin" /> : <MdPlayArrow />}
              {startPending ? "Opening..." : "Open Registration"}
            </button>
          </>
        )}
        {(isReg || isLobby) && (
          <button onClick={onLaunch} disabled={launchPending} className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-black text-white transition-all disabled:opacity-40 hover:opacity-90" style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)", boxShadow: "0 0 20px rgba(124,58,237,0.3)" }}>
            {launchPending ? <MdRefresh className="animate-spin" /> : <Zap className="w-3 h-3" />}
            {launchPending ? "Launching..." : "Launch Game Now"}
          </button>
        )}
        {isDone && (
          <button onClick={onDelete} className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-black transition-all ml-auto" style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}>
            <MdDelete className="text-sm" /> Delete
          </button>
        )}
        {!isDone && (
          <button onClick={onDisable} className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-all ml-auto" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
            <MdClose className="text-sm" /> Disable
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Revenue Tab ─────────────────────────────────────────────────────────────
function RevenueTab({ tournaments }: { tournaments: QuizTournament[] }) {
  const totalRevenue = tournaments.reduce((s, t) => {
    const feePct = (t as any).platform_fee_percentage ?? 10;
    return s + Math.round(t.prize_pool * feePct / 100);
  }, 0);
  const totalPool    = tournaments.reduce((s, t) => s + t.prize_pool, 0);
  const totalPlayers = tournaments.reduce((s, t) => s + t.player_count, 0);
  const totalPaid    = tournaments.reduce((s, t) => {
    const feePct = (t as any).platform_fee_percentage ?? 10;
    return s + Math.round(t.prize_pool * (1 - feePct / 100));
  }, 0);

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Revenue",    value: `${totalRevenue.toLocaleString()} ZA`, color: "#4ade80",  icon: "💰" },
          { label: "Total Entry Fees", value: `${totalPool.toLocaleString()} ZA`,    color: "#a855f7",  icon: "🎯" },
          { label: "Prizes Paid Out",  value: `${totalPaid.toLocaleString()} ZA`,    color: "#f87171",  icon: "🏆" },
          { label: "Total Players",    value: totalPlayers.toLocaleString(),          color: "#fbbf24",  icon: "👥" },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="text-2xl mb-2">{s.icon}</div>
            <p className="text-xl font-black text-white leading-none">{s.value}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider mt-1" style={{ color: s.color }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Per-tournament table */}
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between" style={{ background: "rgba(255,255,255,0.02)" }}>
          <p className="text-xs font-black text-white/40 uppercase tracking-widest">Per Tournament Breakdown</p>
          <p className="text-xs text-white/20 font-bold">{tournaments.length} total</p>
        </div>
        {tournaments.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-white/20 text-sm font-bold">No tournaments yet</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {/* Header row */}
            <div className="grid px-5 py-2" style={{ gridTemplateColumns: "1fr 60px 80px 60px 90px 80px" }}>
              {["Tournament", "Players", "Pool", "Fee %", "Revenue", "Status"].map(h => (
                <p key={h} className="text-[9px] font-black text-white/20 uppercase tracking-widest">{h}</p>
              ))}
            </div>
            {tournaments.map(t => {
              const feePct = (t as any).platform_fee_percentage ?? 10;
              const revenue = Math.round(t.prize_pool * feePct / 100);
              const sc = STATUS_CFG[t.status] ?? STATUS_CFG.draft;
              return (
                <div key={t.id} className="grid px-5 py-3 items-center hover:bg-white/[0.02] transition-all" style={{ gridTemplateColumns: "1fr 60px 80px 60px 90px 80px" }}>
                  <div className="min-w-0 pr-3">
                    <p className="text-sm font-bold text-white truncate">{t.title}</p>
                    {t.scheduled_at && <p className="text-[10px] text-white/25 mt-0.5">{new Date(t.scheduled_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</p>}
                  </div>
                  <p className="text-sm font-black text-white/70">{t.player_count}</p>
                  <p className="text-sm font-black text-white/70">{t.prize_pool.toLocaleString()} ZA</p>
                  <p className="text-sm font-black" style={{ color: "#fbbf24" }}>{feePct}%</p>
                  <p className="text-sm font-black" style={{ color: revenue > 0 ? "#4ade80" : "rgba(255,255,255,0.3)" }}>
                    {revenue > 0 ? `+${revenue.toLocaleString()} ZA` : "—"}
                  </p>
                  <span className="text-[10px] font-black px-2 py-1 rounded-full w-fit" style={{ background: `${sc.color}18`, color: sc.color }}>
                    {t.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Leaderboard Tab ──────────────────────────────────────────────────────────
function LeaderboardTab({ tournaments }: { tournaments: QuizTournament[] }) {
  const [lbTab, setLbTab] = useState<"global" | "per-tournament">("global");
  const [selectedT, setSelectedT] = useState<string>(tournaments[0]?.id ?? "");

  const { data: globalLb = [], isLoading: globalLoading } = useQuery({
    queryKey: ["admin-global-leaderboard"],
    queryFn: async () => {
      const { data } = await apiClient.get("/admin/quiz/leaderboard/global");
      return data.data ?? [];
    },
    retry: 1,
  });

  const { data: tournamentLb = [], isLoading: tLoading } = useQuery({
    queryKey: ["admin-tournament-leaderboard", selectedT],
    queryFn: async () => {
      if (!selectedT) return [];
      const { data } = await apiClient.get(`/admin/quiz/tournaments/${selectedT}/leaderboard`);
      return data.data ?? [];
    },
    enabled: !!selectedT && lbTab === "per-tournament",
    retry: 1,
  });

  const MEDALS: Record<number, string> = { 0: "👑", 1: "🥈", 2: "🥉" };

  return (
    <div className="space-y-4">
      {/* Sub-tabs */}
      <div className="flex gap-1 border-b border-white/10">
        {([
          { id: "global",         label: "🌍 All-Time Global" },
          { id: "per-tournament", label: "🏆 Per Tournament"  },
        ] as const).map(tab => (
          <button key={tab.id} onClick={() => setLbTab(tab.id)}
            className="px-4 py-2.5 text-xs font-black uppercase tracking-widest transition-all -mb-px"
            style={{ background: "none", border: "none", cursor: "pointer", borderBottom: lbTab === tab.id ? "2px solid #a855f7" : "2px solid transparent", color: lbTab === tab.id ? "#a855f7" : "rgba(255,255,255,0.3)" }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {lbTab === "per-tournament" && (
        <div className="relative">
          <select
            value={selectedT}
            onChange={e => setSelectedT(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl text-sm font-bold text-white appearance-none focus:outline-none"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            {tournaments.length === 0
              ? <option value="">No tournaments yet</option>
              : tournaments.map(t => <option key={t.id} value={t.id} style={{ background: "#1e1035" }}>{t.title} ({t.status})</option>)
            }
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
        </div>
      )}

      {/* Leaderboard table */}
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between" style={{ background: "rgba(255,255,255,0.02)" }}>
          <p className="text-xs font-black text-white/40 uppercase tracking-widest">
            {lbTab === "global" ? "All-Time Top Players" : "Tournament Leaderboard"}
          </p>
          {lbTab === "global" && globalLb.length > 0 && (
            <p className="text-xs text-white/20 font-bold">{globalLb.length} players</p>
          )}
        </div>

        {(lbTab === "global" ? globalLoading : tLoading) ? (
          <div className="py-12 flex items-center justify-center gap-2 text-white/30">
            <MdRefresh className="animate-spin text-xl" />
            <span className="text-sm font-bold">Loading...</span>
          </div>
        ) : (lbTab === "global" ? globalLb : tournamentLb).length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <p className="text-3xl">🏆</p>
            <p className="text-sm font-black text-white/30">
              {lbTab === "global" ? "No global data yet" : "No leaderboard data for this tournament"}
            </p>
            <p className="text-xs text-white/15">
              {lbTab === "global" ? "Complete a tournament to see all-time rankings" : "Players appear here once the game starts"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {/* Column headers */}
            <div className="grid px-5 py-2" style={{ gridTemplateColumns: "40px 1fr 80px 80px 80px" }}>
              {["#", "Player", "Correct", lbTab === "global" ? "Wins" : "Avg Time", "Status"].map(h => (
                <p key={h} className="text-[9px] font-black text-white/20 uppercase tracking-widest">{h}</p>
              ))}
            </div>
            {(lbTab === "global" ? globalLb : tournamentLb).map((entry: any, i: number) => (
              <div key={i} className="grid px-5 py-3 items-center hover:bg-white/[0.02] transition-all" style={{ gridTemplateColumns: "40px 1fr 80px 80px 80px", background: i === 0 ? "rgba(168,85,247,0.04)" : "transparent" }}>
                <span className="text-base">{MEDALS[i] ?? <span className="text-xs font-black text-white/30">{i + 1}</span>}</span>
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0" style={{ background: i === 0 ? "rgba(168,85,247,0.4)" : "rgba(255,255,255,0.08)" }}>
                    {entry.username?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <p className="text-sm font-bold text-white truncate">{entry.username ?? "Unknown"}</p>
                </div>
                <p className="text-sm font-black" style={{ color: "#4ade80" }}>{entry.correct_answers ?? 0}</p>
                <p className="text-sm font-black text-white/50">
                  {lbTab === "global"
                    ? (entry.total_wins ?? 0)
                    : entry.avg_time_ms ? `${(entry.avg_time_ms / 1000).toFixed(1)}s` : "—"}
                </p>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full w-fit"
                  style={
                    entry.status === "winner"     ? { background: "rgba(234,179,8,0.15)",   color: "#fbbf24" } :
                    entry.status === "alive"      ? { background: "rgba(34,197,94,0.15)",   color: "#4ade80" } :
                    entry.status === "eliminated" ? { background: "rgba(239,68,68,0.12)",   color: "#f87171" } :
                                                    { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.3)" }
                  }>
                  {entry.status ?? "—"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const QuizTournaments: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab,     setActiveTab]     = useState<"tournaments" | "revenue" | "leaderboard">("tournaments");
  const [createOpen,    setCreateOpen]    = useState(false);
  const [manageQ,       setManageQ]       = useState<QuizTournament | null>(null);
  const [monitor,       setMonitor]       = useState<QuizTournament | null>(null);
  const [editT,         setEditT]         = useState<QuizTournament | null>(null);
  const [confirmCancel, setConfirmCancel] = useState<QuizTournament | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<QuizTournament | null>(null);
  const [needsQuestions,setNeedsQuestions]= useState<QuizTournament | null>(null);
  const [cancelReason,  setCancelReason]  = useState("");
  const [startError,    setStartError]    = useState<string | null>(null);
  const [toast,         setToast]         = useState<{ msg: string; type: "ok" | "err" } | null>(null);
  const [pendingStart,  setPendingStart]  = useState<string | null>(null);
  const [pendingLaunch, setPendingLaunch] = useState<string | null>(null);

  const showToast = (msg: string, type: "ok" | "err" = "ok") => { setToast({ msg, type }); setTimeout(() => setToast(null), 4000); };

  const { data: tournaments = [], isLoading, refetch } = useQuery({ queryKey: ["admin-quiz-tournaments"], queryFn: api.listTournaments });

  const patchCache = (id: string, patch: Partial<QuizTournament>) => {
    queryClient.setQueryData<QuizTournament[]>(["admin-quiz-tournaments"], old => (old ?? []).map(t => t.id === id ? { ...t, ...patch } : t));
  };

  const { mutate: startT } = useMutation({
    mutationFn: api.startTournament,
    onMutate: (id) => { setPendingStart(id); patchCache(id, { status: "registration" }); },
    onSuccess: (_data, id) => { setPendingStart(null); patchCache(id, { status: "registration" }); showToast("Registration is now open!"); },
    onError: (err: any, _id) => { setPendingStart(null); queryClient.invalidateQueries({ queryKey: ["admin-quiz-tournaments"] }); setStartError(err?.response?.data?.message ?? err?.message ?? "Failed to open registration"); },
  });

  const { mutate: launchT } = useMutation({
    mutationFn: api.launchTournament,
    onMutate: (id) => { setPendingLaunch(id); patchCache(id, { status: "active" }); },
    onSuccess: (_data, id) => { setPendingLaunch(null); patchCache(id, { status: "active" }); showToast("🚀 Game launched!"); },
    onError: (err: any, _id) => { setPendingLaunch(null); queryClient.invalidateQueries({ queryKey: ["admin-quiz-tournaments"] }); showToast(err?.response?.data?.message ?? "Failed to launch game", "err"); },
  });

  const { mutate: cancelT } = useMutation({
    mutationFn: (id: string) => api.cancelTournament({ id, reason: cancelReason || "Tournament cancelled by admin" }),
    onMutate: (id) => { patchCache(id, { status: "cancelled" }); },
    onSuccess: () => { setConfirmCancel(null); setCancelReason(""); showToast("Tournament cancelled."); },
    onError: (err: any) => { queryClient.invalidateQueries({ queryKey: ["admin-quiz-tournaments"] }); showToast(err?.response?.data?.message ?? "Failed to cancel", "err"); },
  });

  const { mutate: deleteT } = useMutation({
    mutationFn: (id: string) => api.deleteTournament(id),
    onSuccess: (_data, id) => { queryClient.setQueryData<QuizTournament[]>(["admin-quiz-tournaments"], old => (old ?? []).filter(t => t.id !== id)); setConfirmDelete(null); showToast("Tournament deleted."); },
    onError: (err: any) => { const msg = err?.response?.status === 404 ? "Delete endpoint not found — redeploy backend." : err?.response?.data?.message ?? "Failed to delete"; showToast(msg, "err"); },
  });

  const stats = { total: tournaments.length, live: tournaments.filter(t => t.status === "active").length, reg: tournaments.filter(t => t.status === "registration" || t.status === "lobby").length, players: tournaments.reduce((s, t) => s + t.player_count, 0) };

  return (
    <div className="min-h-screen p-6" style={{ background: "linear-gradient(160deg, #0a0618 0%, #050310 50%, #080515 100%)" }}>
      {toast && (
        <div className="fixed top-6 right-6 z-[100] px-5 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all" style={toast.type === "ok" ? { background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.35)", color: "#34d399", boxShadow: "0 0 30px rgba(16,185,129,0.15)" } : { background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.35)", color: "#f87171", boxShadow: "0 0 30px rgba(239,68,68,0.15)" }}>
          {toast.type === "ok" ? <MdCheckCircle className="text-lg shrink-0" /> : <MdWarning className="text-lg shrink-0" />}
          {toast.msg}
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)", boxShadow: "0 0 30px rgba(124,58,237,0.5), inset 0 1px 0 rgba(255,255,255,0.2)" }}>
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Quiz Tournaments</h1>
              <p className="text-white/35 text-sm font-medium">Create, manage and monitor live quiz games</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => refetch()} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-white/60 hover:text-white transition-all" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <MdRefresh className={`text-lg ${isLoading ? "animate-spin" : ""}`} /> Refresh
            </button>
            <button onClick={() => setCreateOpen(true)} className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-black text-white transition-all hover:opacity-90" style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)", boxShadow: "0 0 24px rgba(124,58,237,0.4)" }}>
              <MdAdd className="text-lg" /> New Tournament
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total",         value: stats.total,   color: "#a855f7", icon: <Trophy className="w-4 h-4" /> },
            { label: "Live Now",      value: stats.live,    color: "#ef4444", icon: <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> },
            { label: "Registration",  value: stats.reg,     color: "#22c55e", icon: <MdPlayArrow className="text-base" /> },
            { label: "Total Players", value: stats.players, color: "#f59e0b", icon: <Users className="w-4 h-4" /> },
          ].map(s => (
            <div key={s.label} className="rounded-2xl px-4 py-3 flex items-center gap-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${s.color}18`, color: s.color }}>{s.icon}</div>
              <div>
                <p className="text-xl font-black text-white leading-none">{s.value}</p>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div className="border-b border-white/10">
          <div className="flex gap-0">
            {([
              { id: "tournaments", label: "🏟️ Tournaments" },
              { id: "revenue",     label: "💰 Revenue"     },
              { id: "leaderboard", label: "🏆 Leaderboard" },
            ] as const).map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="px-5 py-3 text-xs font-black uppercase tracking-widest transition-all -mb-px"
                style={{ background: "none", border: "none", cursor: "pointer", borderBottom: activeTab === tab.id ? "2px solid #7c3aed" : "2px solid transparent", color: activeTab === tab.id ? "#a855f7" : "rgba(255,255,255,0.3)" }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab content ── */}
        {activeTab === "revenue" ? (
          <RevenueTab tournaments={tournaments} />
        ) : activeTab === "leaderboard" ? (
          <LeaderboardTab tournaments={tournaments} />
        ) : isLoading ? (
          <div className="py-20 flex items-center justify-center text-white/30"><MdRefresh className="animate-spin text-3xl mr-3" /> Loading...</div>
        ) : tournaments.length === 0 ? (
          <div className="py-24 text-center rounded-2xl" style={{ border: "1px dashed rgba(255,255,255,0.08)" }}>
            <Trophy className="w-16 h-16 text-white/10 mx-auto mb-4" />
            <p className="font-black text-white text-xl mb-2">No tournaments yet</p>
            <button onClick={() => setCreateOpen(true)} className="px-6 py-3 rounded-xl font-black text-sm text-white" style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}><MdAdd className="inline mr-1" /> Create Tournament</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {tournaments.map(t => (
              <TournamentCard key={t.id} t={t}
                onManageQ={() => setManageQ(t)} onEdit={() => setEditT(t)} onMonitor={() => setMonitor(t)}
                onStart={() => { if ((t.question_count ?? 0) < 5) { setNeedsQuestions(t); } else { setStartError(null); startT(t.id); } }}
                onLaunch={() => launchT(t.id)} onDisable={() => setConfirmCancel(t)} onDelete={() => setConfirmDelete(t)}
                startPending={pendingStart === t.id} launchPending={pendingLaunch === t.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {createOpen && <CreateTournamentModal onClose={() => setCreateOpen(false)} onCreated={() => queryClient.invalidateQueries({ queryKey: ["admin-quiz-tournaments"] })} />}
      {manageQ    && <QuestionManagerModal  tournament={manageQ} onClose={() => setManageQ(null)} />}
      {monitor    && <LiveMonitorModal      tournament={monitor} onClose={() => setMonitor(null)} />}
      {editT      && <EditTournamentModal   tournament={editT}   onClose={() => setEditT(null)} onSaved={(updated) => {
        setEditT(updated);
        queryClient.setQueryData<QuizTournament[]>(["admin-quiz-tournaments"], old =>
          (old ?? []).map(t => t.id === updated.id ? { ...t, ...updated } : t)
        );
        showToast("Tournament updated!");
      }} />}

      {needsQuestions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(16px)" }} onClick={() => setNeedsQuestions(null)}>
          <div className="w-full max-w-sm rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(20,15,8,0.99), rgba(10,8,3,0.99))", border: "1px solid rgba(245,158,11,0.25)" }} onClick={e => e.stopPropagation()}>
            <div className="p-6 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)" }}><MdQuestionMark className="text-3xl text-amber-400" /></div>
              <h3 className="font-black text-white text-lg mb-2">Questions Needed</h3>
              <p className="text-sm text-white/40 mb-6">You have <span className="font-black text-amber-400">{needsQuestions.question_count ?? 0}</span> questions. You need at least <span className="font-black text-white">5</span> to open registration.</p>
              <div className="flex gap-3">
                <button onClick={() => setNeedsQuestions(null)} className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white/50" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>Cancel</button>
                <button onClick={() => { setManageQ(needsQuestions); setNeedsQuestions(null); }} className="flex-1 py-2.5 rounded-xl font-black text-sm text-white" style={{ background: "linear-gradient(135deg, #d97706, #b45309)" }}><MdAdd className="inline mr-1" /> Add Questions</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {startError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(16px)" }} onClick={() => setStartError(null)}>
          <div className="w-full max-w-sm rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(25,5,5,0.99), rgba(10,2,2,0.99))", border: "1px solid rgba(239,68,68,0.25)" }} onClick={e => e.stopPropagation()}>
            <div className="p-6 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)" }}><MdWarning className="text-3xl text-red-400" /></div>
              <h3 className="font-black text-white text-lg mb-3">Could Not Open Registration</h3>
              <p className="text-sm font-bold text-red-300 mb-6 px-2 leading-relaxed">{startError}</p>
              <button onClick={() => setStartError(null)} className="w-full py-2.5 rounded-xl font-black text-sm text-white" style={{ background: "linear-gradient(135deg, #dc2626, #b91c1c)" }}>Got It</button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(16px)" }} onClick={() => setConfirmDelete(null)}>
          <div className="w-full max-w-sm rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(25,5,5,0.99), rgba(10,2,2,0.99))", border: "1px solid rgba(239,68,68,0.3)" }} onClick={e => e.stopPropagation()}>
            <div className="p-6 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)" }}><MdDelete className="text-3xl text-red-400" /></div>
              <h3 className="font-black text-white text-lg mb-1">Delete Tournament?</h3>
              <p className="text-sm font-bold text-white/50 mb-1">"{confirmDelete.title}"</p>
              <p className="text-xs text-white/30 mb-6">Permanently deletes all questions, players, and leaderboard data. <span className="text-red-400 font-bold">Cannot be undone.</span></p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white/50" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>Keep It</button>
                <button onClick={() => deleteT(confirmDelete.id)} className="flex-1 py-2.5 rounded-xl font-black text-sm text-white" style={{ background: "linear-gradient(135deg, #dc2626, #991b1b)" }}><MdDelete className="inline mr-1" /> Yes, Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(16px)" }} onClick={() => { setConfirmCancel(null); setCancelReason(""); }}>
          <div className="w-full max-w-sm rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(25,8,8,0.99), rgba(10,3,3,0.99))", border: "1px solid rgba(239,68,68,0.2)" }} onClick={e => e.stopPropagation()}>
            <div className="p-6 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.25)" }}><MdWarning className="text-3xl text-red-400" /></div>
              <h3 className="font-black text-white text-lg mb-1">Disable Tournament?</h3>
              <p className="text-sm font-bold text-white/50 mb-3">"{confirmCancel.title}"</p>
              <div className="mb-5 text-left">
                <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-1.5">Reason <span style={{ opacity: 0.5, fontWeight: 400, textTransform: "none" }}>(optional)</span></label>
                <input type="text" placeholder="e.g. Event postponed" value={cancelReason} onChange={e => setCancelReason(e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder:text-white/25 focus:outline-none" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }} />
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setConfirmCancel(null); setCancelReason(""); }} className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white/50" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>Keep It</button>
                <button onClick={() => cancelT(confirmCancel.id)} className="flex-1 py-2.5 rounded-xl font-black text-sm text-white" style={{ background: "linear-gradient(135deg, #dc2626, #b91c1c)" }}>Yes, Disable</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizTournaments;
