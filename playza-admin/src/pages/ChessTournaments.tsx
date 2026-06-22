import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../lib/api-client";
import { Trophy, Users, Zap, Plus, Play, X, ChevronRight, Shield } from "lucide-react";
import { MdSportsEsports } from "react-icons/md";

// ── Types ─────────────────────────────────────────────────────────────────────
interface PrizeTier { rank: number; percentage: number; }

interface ChessTournament {
  id: string;
  title: string;
  description?: string;
  format: "knockout" | "group_knockout";
  bracket_size: 4 | 8 | 16 | 32 | 64;
  group_count?: number;
  advance_per_group?: number;
  time_control_secs: number;
  increment_secs: number;
  entry_fee: number;
  prize_pool: number;
  platform_fee_percentage: number;
  prize_distribution?: PrizeTier[];
  consolation_pza: number;
  status: "registration" | "lobby" | "active" | "completed" | "cancelled";
  current_round: number;
  registration_end?: string;
  scheduled_at?: string;
  player_count?: number;
}

interface Fixture {
  id: string;
  round_number: number;
  round_name: string;
  bracket_position: number;
  group_number?: number;
  player1_id?: string;
  player2_id?: string;
  chess_room_id?: string;
  winner_id?: string;
  is_bye: boolean;
  status: "pending" | "scheduled" | "active" | "completed" | "bye";
  player1?: { username: string; avatar_url?: string };
  player2?: { username: string; avatar_url?: string };
}

interface Standing {
  id: string;
  group_number: number;
  user_id: string;
  username: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  points: number;
  game_wins_margin: number;
  group_rank?: number;
  advanced: boolean;
}

// ── API ───────────────────────────────────────────────────────────────────────
const api = {
  list:    async (): Promise<ChessTournament[]> => { const { data } = await apiClient.get("/admin/chess-tournament/tournaments"); return data.data ?? []; },
  create:  async (payload: any) => { const { data } = await apiClient.post("/admin/chess-tournament/tournaments", payload); return data.data; },
  patch:   async ({ id, ...payload }: any) => { const { data } = await apiClient.patch(`/admin/chess-tournament/tournaments/${id}`, payload); return data.data; },
  launch:  async (id: string) => { const { data } = await apiClient.post(`/admin/chess-tournament/tournaments/${id}/launch`); return data; },
  cancel:  async (id: string) => { const { data } = await apiClient.post(`/admin/chess-tournament/tournaments/${id}/cancel`); return data; },
  fixtures:  async (id: string): Promise<Fixture[]> => { const { data } = await apiClient.get(`/api/chess-tournament/tournaments/${id}/fixtures`); return data.data ?? []; },
  standings: async (id: string): Promise<Standing[]> => { const { data } = await apiClient.get(`/api/chess-tournament/tournaments/${id}/standings`); return data.data ?? []; },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const STATUS_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  registration: { label: "Registration",  color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
  lobby:        { label: "Lobby",         color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  active:       { label: "Live",          color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
  completed:    { label: "Completed",     color: "#64748b", bg: "rgba(100,116,139,0.12)" },
  cancelled:    { label: "Cancelled",     color: "#475569", bg: "rgba(71,85,105,0.12)" },
};

const FIXTURE_STATUS_COLOR: Record<string, string> = {
  pending: "rgba(255,255,255,0.15)",
  active:  "#ef4444",
  completed: "#22c55e",
  bye: "#7c3aed",
};

function fmtTime(secs: number): string {
  if (secs >= 60) return `${Math.floor(secs / 60)}min${secs % 60 > 0 ? ` +${secs % 60}s` : ""}`;
  return `${secs}s`;
}

// ── Bracket Tree Visualiser ──────────────────────────────────────────────────
function BracketViewer({ fixtures }: { fixtures: Fixture[] }) {
  const byRound = fixtures
    .filter(f => !f.group_number)
    .reduce<Record<number, Fixture[]>>((acc, f) => {
      (acc[f.round_number] = acc[f.round_number] ?? []).push(f);
      return acc;
    }, {});

  const rounds = Object.keys(byRound).map(Number).sort((a, b) => a - b);
  if (!rounds.length) return (
    <div className="flex flex-col items-center justify-center py-16 text-white/20">
      <MdSportsEsports className="text-5xl mb-3" />
      <p className="text-sm font-bold">Bracket generates when tournament launches</p>
    </div>
  );

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-0 items-stretch min-w-max">
        {rounds.map((round, ri) => {
          const roundFixtures = (byRound[round] ?? []).sort((a, b) => a.bracket_position - b.bracket_position);
          const isLast = ri === rounds.length - 1;
          return (
            <div key={round} className="flex items-center">
              <div className="flex flex-col" style={{ gap: ri === 0 ? 8 : `${Math.pow(2, ri) * 16 + 8}px` }}>
                <p className="text-[9px] font-black uppercase tracking-widest text-white/25 text-center mb-2 px-3">
                  {roundFixtures[0]?.round_name ?? `Round ${round}`}
                </p>
                {roundFixtures.map(f => (
                  <FixtureCard key={f.id} fixture={f} />
                ))}
              </div>
              {!isLast && (
                <div className="flex flex-col items-center justify-center mx-1" style={{ alignSelf: "stretch" }}>
                  <div className="w-4 border-t border-white/10" style={{ flex: 1 }} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FixtureCard({ fixture }: { fixture: Fixture }) {
  const accentColor = FIXTURE_STATUS_COLOR[fixture.status] ?? "#fff";
  const p1 = fixture.player1?.username ?? (fixture.player1_id ? "Player" : "TBD");
  const p2 = fixture.player2?.username ?? (fixture.is_bye ? "— Bye —" : fixture.player2_id ? "Player" : "TBD");
  const p1Won = fixture.winner_id === fixture.player1_id;
  const p2Won = fixture.winner_id === fixture.player2_id;

  return (
    <div className="w-44 rounded-xl overflow-hidden" style={{ border: `1px solid ${accentColor}30`, background: "rgba(255,255,255,0.03)" }}>
      <div className="flex items-center gap-1 px-2 py-0.5" style={{ background: `${accentColor}18` }}>
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: accentColor }} />
        <span className="text-[8px] font-black uppercase tracking-widest" style={{ color: accentColor }}>
          {fixture.status === "bye" ? "Bye" : fixture.status === "active" ? "Live" : fixture.status === "completed" ? "Done" : "Pending"}
        </span>
      </div>
      {[{ name: p1, won: p1Won }, { name: p2, won: p2Won }].map((p, i) => (
        <div key={i} className={`flex items-center gap-2 px-2 py-1.5 ${i === 0 ? "border-b border-white/[0.06]" : ""}`}
          style={{ background: p.won ? "rgba(34,197,94,0.08)" : "transparent" }}>
          <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[8px] font-black text-white/60 shrink-0">
            {p.name[0]?.toUpperCase() ?? "?"}
          </div>
          <span className={`text-xs font-bold truncate flex-1 ${p.won ? "text-green-400" : fixture.is_bye && i === 1 ? "text-white/20 italic" : "text-white/60"}`}>
            {p.name}
          </span>
          {p.won && <span className="text-[8px] text-green-400">✓</span>}
        </div>
      ))}
    </div>
  );
}

// ── Group Standings Table ────────────────────────────────────────────────────
function StandingsTable({ standings }: { standings: Standing[] }) {
  const byGroup = standings.reduce<Record<number, Standing[]>>((acc, s) => {
    (acc[s.group_number] = acc[s.group_number] ?? []).push(s);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {Object.keys(byGroup).map(Number).sort().map(g => (
        <div key={g} className="rounded-xl overflow-hidden border border-white/[0.07]">
          <div className="px-4 py-2 flex items-center gap-2" style={{ background: "rgba(124,58,237,0.15)" }}>
            <span className="text-[10px] font-black uppercase tracking-widest text-violet-300">
              Group {String.fromCharCode(64 + g)}
            </span>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-white/25 text-[9px] uppercase tracking-wider border-b border-white/[0.06]">
                <th className="text-left px-4 py-2 font-black">Player</th>
                <th className="px-2 py-2 font-black">P</th>
                <th className="px-2 py-2 font-black">W</th>
                <th className="px-2 py-2 font-black">D</th>
                <th className="px-2 py-2 font-black">L</th>
                <th className="px-3 py-2 font-black text-violet-300">Pts</th>
              </tr>
            </thead>
            <tbody>
              {(byGroup[g] ?? []).sort((a, b) => b.points - a.points || b.game_wins_margin - a.game_wins_margin).map((s, i) => (
                <tr key={s.id} className={`border-b border-white/[0.04] ${s.advanced ? "bg-green-500/5" : ""}`}>
                  <td className="px-4 py-2 font-bold text-white/70 flex items-center gap-2">
                    <span className="text-white/20 w-3">{i + 1}</span>
                    {s.username}
                    {s.advanced && <span className="text-[8px] bg-green-500/20 text-green-400 px-1 rounded font-black">ADV</span>}
                  </td>
                  <td className="px-2 py-2 text-center text-white/40">{s.played}</td>
                  <td className="px-2 py-2 text-center text-green-400">{s.won}</td>
                  <td className="px-2 py-2 text-center text-yellow-400/70">{s.drawn}</td>
                  <td className="px-2 py-2 text-center text-red-400/60">{s.lost}</td>
                  <td className="px-3 py-2 text-center font-black text-violet-300">{s.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

// ── Create / Edit Form ───────────────────────────────────────────────────────
interface FormState {
  title: string;
  description: string;
  format: "knockout" | "group_knockout";
  bracket_size: number;
  group_count: number;
  advance_per_group: number;
  time_control_secs: number;
  increment_secs: number;
  entry_fee: number;
  platform_fee_percentage: number;
  consolation_pza: number;
  registration_end: string;
  scheduled_at: string;
  prize_distribution: PrizeTier[];
}

const DEFAULT_FORM: FormState = {
  title: "", description: "", format: "knockout", bracket_size: 8,
  group_count: 2, advance_per_group: 2, time_control_secs: 600,
  increment_secs: 5, entry_fee: 0, platform_fee_percentage: 10,
  consolation_pza: 0, registration_end: "", scheduled_at: "",
  prize_distribution: [{ rank: 1, percentage: 60 }, { rank: 2, percentage: 25 }, { rank: 3, percentage: 15 }],
};

function TournamentForm({ initial, onSave, onCancel, editId }: {
  initial?: FormState; onSave: (v: any) => void; onCancel: () => void; editId?: string;
}) {
  const [form, setForm] = useState<FormState>(initial ?? DEFAULT_FORM);
  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.type === "number" ? Number(e.target.value) : e.target.value }));

  const inputCls = "w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-violet-500/50";
  const labelCls = "block text-[10px] font-black uppercase tracking-widest text-white/40 mb-1.5";

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(15,10,30,0.95)", border: "1px solid rgba(124,58,237,0.25)" }}>
      <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MdSportsEsports className="text-violet-400 text-lg" />
          <h3 className="font-black text-white text-sm">{editId ? "Edit Tournament" : "New Chess Tournament"}</h3>
        </div>
        <button onClick={onCancel} className="text-white/30 hover:text-white transition-colors"><X size={16} /></button>
      </div>

      <div className="p-6 space-y-5">
        {/* Title + Description */}
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className={labelCls}>Title *</label>
            <input className={inputCls} placeholder="e.g. Playza Chess Cup — Round of 16" value={form.title} onChange={set("title")} />
          </div>
          <div>
            <label className={labelCls}>Description</label>
            <textarea className={inputCls + " resize-none h-16"} placeholder="Optional — shown to players in the tournament listing" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
        </div>

        {/* Format + Bracket Size */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Format</label>
            <select className={inputCls} value={form.format} onChange={e => setForm(f => ({ ...f, format: e.target.value as any }))}>
              <option value="knockout">Knockout — Single elimination</option>
              <option value="group_knockout">Group Stage → Knockout</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Bracket Size</label>
            <select className={inputCls} value={form.bracket_size} onChange={e => setForm(f => ({ ...f, bracket_size: Number(e.target.value) }))}>
              {[4, 8, 16, 32, 64].map(n => <option key={n} value={n}>{n} players</option>)}
            </select>
          </div>
        </div>

        {/* Group stage settings */}
        {form.format === "group_knockout" && (
          <div className="grid grid-cols-2 gap-4 p-4 rounded-xl border border-violet-500/20 bg-violet-500/5">
            <div>
              <label className={labelCls}>Number of Groups</label>
              <select className={inputCls} value={form.group_count} onChange={e => setForm(f => ({ ...f, group_count: Number(e.target.value) }))}>
                {[2, 4, 8].map(n => <option key={n} value={n}>{n} groups</option>)}
              </select>
              <p className="text-[9px] text-white/20 mt-1">{form.bracket_size / form.group_count} players per group</p>
            </div>
            <div>
              <label className={labelCls}>Advance per Group</label>
              <select className={inputCls} value={form.advance_per_group} onChange={e => setForm(f => ({ ...f, advance_per_group: Number(e.target.value) }))}>
                {[1, 2, 3].map(n => <option key={n} value={n}>Top {n}</option>)}
              </select>
              <p className="text-[9px] text-white/20 mt-1">{form.advance_per_group * form.group_count} advance to knockout</p>
            </div>
          </div>
        )}

        {/* Time control */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Time Per Side</label>
            <select className={inputCls} value={form.time_control_secs} onChange={e => setForm(f => ({ ...f, time_control_secs: Number(e.target.value) }))}>
              {[[60,"1 min (Bullet)"],[180,"3 min (Blitz)"],[300,"5 min (Blitz)"],[600,"10 min (Rapid)"],[900,"15 min (Rapid)"],[1800,"30 min (Classical)"]].map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Increment (seconds)</label>
            <input className={inputCls} type="number" min={0} max={60} value={form.increment_secs} onChange={set("increment_secs")} placeholder="0" />
          </div>
        </div>

        {/* Fees & Prize */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Entry Fee (ZA)</label>
            <input className={inputCls} type="number" min={0} value={form.entry_fee} onChange={set("entry_fee")} />
          </div>
          <div>
            <label className={labelCls}>Platform Fee %</label>
            <input className={inputCls} type="number" min={0} max={100} value={form.platform_fee_percentage} onChange={set("platform_fee_percentage")} />
          </div>
          <div>
            <label className={labelCls}>Consolation PZA</label>
            <input className={inputCls} type="number" min={0} value={form.consolation_pza} onChange={set("consolation_pza")} />
          </div>
        </div>

        {/* Prize distribution */}
        <div>
          <label className={labelCls}>Prize Distribution</label>
          <div className="space-y-2">
            {form.prize_distribution.map((tier, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs text-white/30 w-12 shrink-0">Rank #{tier.rank}</span>
                <input
                  className={inputCls + " flex-1"}
                  type="number" min={0} max={100}
                  value={tier.percentage}
                  onChange={e => {
                    const updated = [...form.prize_distribution];
                    updated[i] = { ...tier, percentage: Number(e.target.value) };
                    setForm(f => ({ ...f, prize_distribution: updated }));
                  }}
                />
                <span className="text-xs text-white/30">%</span>
              </div>
            ))}
          </div>
          <p className="text-[9px] text-white/20 mt-1.5">
            Total: {form.prize_distribution.reduce((s, t) => s + t.percentage, 0)}% — must equal 100
          </p>
        </div>

        {/* Schedule */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Registration Closes</label>
            <input className={inputCls} type="datetime-local" value={form.registration_end} onChange={set("registration_end")} />
          </div>
          <div>
            <label className={labelCls}>Scheduled Start</label>
            <input className={inputCls} type="datetime-local" value={form.scheduled_at} onChange={set("scheduled_at")} />
          </div>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-white/[0.06] flex justify-end gap-3">
        <button onClick={onCancel} className="px-4 py-2 rounded-xl text-sm font-bold text-white/40 hover:text-white transition-colors">Cancel</button>
        <button
          onClick={() => onSave(editId ? { id: editId, ...form } : form)}
          disabled={!form.title}
          className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-black text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-105"
          style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}>
          <Shield size={14} />
          {editId ? "Save Changes" : "Create Tournament"}
        </button>
      </div>
    </div>
  );
}

// ── Tournament Detail Panel ───────────────────────────────────────────────────
function TournamentDetail({ t, onClose, onLaunch, onCancel, isLaunching, isCancelling }: {
  t: ChessTournament;
  onClose: () => void;
  onLaunch: () => void;
  onCancel: () => void;
  isLaunching: boolean;
  isCancelling: boolean;
}) {
  const [tab, setTab] = useState<"bracket" | "standings">("bracket");
  const sc = STATUS_STYLES[t.status] ?? STATUS_STYLES.registration;

  const { data: fixtures = [] } = useQuery({
    queryKey: ["chess-fixtures", t.id],
    queryFn: () => api.fixtures(t.id),
    enabled: t.status === "active" || t.status === "completed",
    refetchInterval: t.status === "active" ? 10000 : false,
  });

  const { data: standings = [] } = useQuery({
    queryKey: ["chess-standings", t.id],
    queryFn: () => api.standings(t.id),
    enabled: t.format === "group_knockout" && (t.status === "active" || t.status === "completed"),
    refetchInterval: t.status === "active" ? 10000 : false,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)" }} onClick={onClose}>
      <div className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden" style={{ background: "rgba(12,8,24,0.99)", border: "1px solid rgba(124,58,237,0.2)" }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] shrink-0">
          <div className="flex items-center gap-3">
            <MdSportsEsports className="text-violet-400 text-xl" />
            <div>
              <h2 className="font-black text-white text-base">{t.title}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
                <span className="text-[9px] text-white/25 font-bold">{t.format === "group_knockout" ? "Group + Knockout" : "Single Elimination"} · {t.bracket_size} players · {fmtTime(t.time_control_secs)}{t.increment_secs > 0 ? ` +${t.increment_secs}s` : ""}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors"><X size={16} /></button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 divide-x divide-white/[0.05] border-b border-white/[0.06] shrink-0">
          {[
            { label: "Registered", value: `${t.player_count ?? 0}/${t.bracket_size}`, icon: <Users size={13} /> },
            { label: "Entry Fee", value: t.entry_fee > 0 ? `${t.entry_fee} ZA` : "Free", icon: <Zap size={13} /> },
            { label: "Prize Pool", value: `${t.prize_pool.toLocaleString()} ZA`, icon: <Trophy size={13} /> },
            { label: "Round", value: t.status === "active" ? String(t.current_round) : "—", icon: <ChevronRight size={13} /> },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-2 px-5 py-3">
              <span className="text-violet-400/60">{s.icon}</span>
              <div>
                <p className="text-xs font-black text-white">{s.value}</p>
                <p className="text-[9px] text-white/25 uppercase tracking-wider">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bracket / Standings tabs (active/completed only) */}
        {(t.status === "active" || t.status === "completed") && (
          <div className="flex border-b border-white/[0.06] shrink-0">
            {[{ id: "bracket" as const, label: "Bracket / Fixtures" }, ...(t.format === "group_knockout" ? [{ id: "standings" as const, label: "Group Standings" }] : [])].map(tab_ => (
              <button key={tab_.id} onClick={() => setTab(tab_.id)}
                className={`px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-colors ${tab === tab_.id ? "text-violet-400 border-violet-500" : "text-white/25 border-transparent hover:text-white/50"}`}>
                {tab_.label}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {(t.status === "registration" || t.status === "lobby") && (
            <div className="flex flex-col items-center justify-center py-10 gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl" style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.25)" }}>♟️</div>
              <div>
                <p className="font-black text-white text-base mb-1">{t.player_count ?? 0}/{t.bracket_size} players registered</p>
                <p className="text-xs text-white/30">Bracket generates automatically when you launch — {t.bracket_size - (t.player_count ?? 0)} spot{t.bracket_size - (t.player_count ?? 0) === 1 ? "" : "s"} remaining</p>
              </div>
              <div className="w-full bg-white/[0.05] rounded-full h-2 max-w-xs">
                <div className="h-2 rounded-full transition-all" style={{ width: `${Math.min(((t.player_count ?? 0) / t.bracket_size) * 100, 100)}%`, background: "linear-gradient(90deg,#7c3aed,#a855f7)" }} />
              </div>
            </div>
          )}

          {tab === "bracket" && <BracketViewer fixtures={fixtures} />}
          {tab === "standings" && standings.length > 0 && <StandingsTable standings={standings} />}
          {tab === "standings" && standings.length === 0 && (
            <div className="text-center py-10 text-white/20 text-sm">No standings data yet</div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-white/[0.06] flex justify-between items-center shrink-0">
          <div className="text-[9px] text-white/20 font-bold uppercase tracking-wider">
            Platform fee: {t.platform_fee_percentage}% · Consolation: {t.consolation_pza} PZA
          </div>
          <div className="flex gap-3">
            {t.status === "registration" && (
              <>
                <button onClick={onCancel} disabled={isCancelling}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-colors disabled:opacity-40">
                  <X size={12} /> Cancel Tournament
                </button>
                <button onClick={onLaunch} disabled={isLaunching || (t.player_count ?? 0) < 2}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-black text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-105"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}>
                  <Play size={12} /> {isLaunching ? "Launching…" : "Launch Tournament"}
                </button>
              </>
            )}
            {t.status === "active" && (
              <div className="flex items-center gap-2 text-xs text-red-400 font-bold">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Tournament in progress — Round {t.current_round}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ChessTournaments() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState<ChessTournament | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const { data: tournaments = [], isLoading } = useQuery({
    queryKey: ["chess-tournaments"],
    queryFn: api.list,
    refetchInterval: 15000,
  });

  const createM   = useMutation({ mutationFn: api.create,   onSuccess: () => { qc.invalidateQueries({ queryKey: ["chess-tournaments"] }); setShowCreate(false); } });
  const launchM   = useMutation({ mutationFn: (id: string) => api.launch(id),  onSuccess: () => { qc.invalidateQueries({ queryKey: ["chess-tournaments"] }); if (selected) setSelected(t => t ? { ...t, status: "active" } : null); } });
  const cancelM   = useMutation({ mutationFn: (id: string) => api.cancel(id),  onSuccess: () => { qc.invalidateQueries({ queryKey: ["chess-tournaments"] }); setSelected(null); } });

  const filtered = tournaments.filter(t => filterStatus === "all" || t.status === filterStatus);

  return (
    <div className="p-6 space-y-6 min-h-full" style={{ background: "var(--background)" }}>
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.25)" }}>
            <MdSportsEsports className="text-violet-400 text-xl" />
          </div>
          <div>
            <h1 className="font-black text-lg" style={{ color: "var(--foreground)" }}>Chess Tournaments</h1>
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Bracket & group-stage tournaments with real chess games</p>
          </div>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black text-white transition-all hover:scale-105"
          style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}>
          <Plus size={15} /> New Tournament
        </button>
      </div>

      {/* Create form */}
      {showCreate && <TournamentForm onSave={v => createM.mutate(v)} onCancel={() => setShowCreate(false)} />}

      {/* Filter tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: "var(--muted)" }}>
        {[["all", "All"], ["registration", "Registration"], ["active", "Live"], ["completed", "Completed"]].map(([v, l]) => (
          <button key={v} onClick={() => setFilterStatus(v)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterStatus === v ? "text-white" : "text-white/40 hover:text-white/60"}`}
            style={filterStatus === v ? { background: "rgba(124,58,237,0.5)" } : {}}>
            {l}
          </button>
        ))}
      </div>

      {/* Tournament list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-white/20">
          <div className="w-6 h-6 border-2 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <MdSportsEsports className="text-5xl text-white/10" />
          <p className="font-black text-white/30">No chess tournaments yet</p>
          <p className="text-xs text-white/15">Create one above to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(t => {
            const sc = STATUS_STYLES[t.status] ?? STATUS_STYLES.registration;
            const fillPct = Math.min(((t.player_count ?? 0) / t.bracket_size) * 100, 100);
            return (
              <button key={t.id} onClick={() => setSelected(t)}
                className="text-left rounded-2xl p-5 transition-all hover:scale-[1.02] hover:-translate-y-0.5"
                style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
                    {t.status === "active" && <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
                  </div>
                  <span className="text-[9px] text-white/20 font-bold uppercase">{t.format === "group_knockout" ? "Group+KO" : "Knockout"}</span>
                </div>
                <h3 className="font-black text-white text-sm mb-1 leading-snug">{t.title}</h3>
                <div className="flex items-center gap-3 text-[10px] text-white/30 mb-3">
                  <span><span className="font-bold text-white/50">{t.bracket_size}</span> players</span>
                  <span>·</span>
                  <span><span className="font-bold text-white/50">{fmtTime(t.time_control_secs)}</span></span>
                  <span>·</span>
                  <span><span className="font-bold text-yellow-400">{t.prize_pool.toLocaleString()} ZA</span> pool</span>
                </div>
                {/* Registration fill bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] text-white/20">
                    <span>{t.player_count ?? 0}/{t.bracket_size} registered</span>
                    {t.status === "active" && <span className="text-violet-400 font-black">Round {t.current_round}</span>}
                  </div>
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${fillPct}%`, background: "linear-gradient(90deg,#7c3aed,#a855f7)" }} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Detail panel */}
      {selected && (
        <TournamentDetail
          t={selected}
          onClose={() => setSelected(null)}
          onLaunch={() => launchM.mutate(selected.id)}
          onCancel={() => cancelM.mutate(selected.id)}
          isLaunching={launchM.isPending}
          isCancelling={cancelM.isPending}
        />
      )}
    </div>
  );
}
