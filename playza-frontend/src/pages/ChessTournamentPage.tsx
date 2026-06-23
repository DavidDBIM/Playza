import { useState } from "react";
import { useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/auth";
import SEO from "@/components/SEO";
import {
  getChessTournaments, registerChessTournament,
  getChessTournamentFixtures, getChessTournamentStandings,
  type ChessTournament, type TournamentFixture, type TournamentStanding,
} from "@/api/chess-tournament.api";

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtTime(secs: number) {
  if (secs >= 60) return `${Math.floor(secs / 60)}m${secs % 60 > 0 ? `+${secs % 60}s` : ""}`;
  return `${secs}s`;
}

const STATUS_CFG = {
  registration: { label: "Registration Open", dot: "#22c55e", glow: "rgba(34,197,94,0.25)" },
  lobby:        { label: "Starting Soon",     dot: "#f59e0b", glow: "rgba(245,158,11,0.25)" },
  active:       { label: "Live Now",          dot: "#ef4444", glow: "rgba(239,68,68,0.25)" },
  completed:    { label: "Completed",         dot: "#64748b", glow: "rgba(100,116,139,0.1)" },
  cancelled:    { label: "Cancelled",         dot: "#475569", glow: "rgba(71,85,105,0.1)" },
};

const FIXTURE_ACCENT: Record<string, string> = {
  pending: "rgba(255,255,255,0.12)",
  active: "#ef4444",
  completed: "#22c55e",
  bye: "#7c3aed",
};

// ── Bracket tree ──────────────────────────────────────────────────────────────
function BracketTree({ fixtures, userId }: { fixtures: TournamentFixture[]; userId?: string }) {
  const knockout = fixtures.filter(f => !f.group_number);
  const byRound = knockout.reduce<Record<number, TournamentFixture[]>>((acc, f) => {
    (acc[f.round_number] = acc[f.round_number] ?? []).push(f);
    return acc;
  }, {});
  const rounds = Object.keys(byRound).map(Number).sort((a, b) => a - b);

  if (!rounds.length) return (
    <div className="text-center py-12 text-white/20 text-sm">
      <span className="text-4xl block mb-3">♟</span>
      Bracket generates when the tournament launches
    </div>
  );

  return (
    <div className="overflow-x-auto pb-6">
      <div className="flex gap-6 items-start min-w-max px-2 pt-2">
        {rounds.map((round) => {
          const rf = (byRound[round] ?? []).sort((a, b) => a.bracket_position - b.bracket_position);
          return (
            <div key={round} className="flex flex-col gap-3">
              <p className="text-[9px] font-black uppercase tracking-widest text-white/25 text-center">
                {rf[0]?.round_name ?? `Round ${round}`}
              </p>
              {rf.map(f => {
                const accent = FIXTURE_ACCENT[f.status] ?? "#fff";
                const p1 = f.player1?.username ?? (f.player1_id ? "Player" : "TBD");
                const p2 = f.player2?.username ?? (f.is_bye ? "— Bye —" : "TBD");
                const p1Won = f.winner_id === f.player1_id;
                const p2Won = f.winner_id === f.player2_id;
                const meInvolved = userId && (f.player1_id === userId || f.player2_id === userId);
                return (
                  <div key={f.id} className="w-48 rounded-xl overflow-hidden"
                    style={{ border: `1px solid ${meInvolved ? "#a855f7" : accent}30`, background: meInvolved ? "rgba(124,58,237,0.08)" : "rgba(255,255,255,0.025)", boxShadow: meInvolved ? "0 0 12px rgba(168,85,247,0.2)" : "none" }}>
                    <div className="flex items-center justify-between px-2.5 py-1" style={{ background: `${accent}15` }}>
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: accent }} />
                        <span className="text-[8px] font-black uppercase tracking-widest" style={{ color: accent }}>
                          {f.status === "bye" ? "Bye" : f.status === "active" ? "Live" : f.status === "completed" ? "Final" : "Pending"}
                        </span>
                      </div>
                      {meInvolved && <span className="text-[8px] font-black text-violet-400">YOU</span>}
                    </div>
                    {[{ name: p1, won: p1Won, id: f.player1_id }, { name: p2, won: p2Won, id: f.player2_id }].map((p, pi) => (
                      <div key={pi} className={`flex items-center gap-2 px-2.5 py-2 ${pi === 0 ? "border-b border-white/[0.06]" : ""}`}
                        style={{ background: p.won ? "rgba(34,197,94,0.06)" : p.id === userId ? "rgba(124,58,237,0.06)" : "transparent" }}>
                        <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[9px] font-black text-white/50 shrink-0">
                          {p.name[0]?.toUpperCase() ?? "?"}
                        </div>
                        <span className={`text-xs font-bold truncate flex-1 ${p.won ? "text-green-400" : p.id === userId ? "text-violet-300" : f.is_bye && pi === 1 ? "text-white/15 italic" : "text-white/50"}`}>
                          {p.name}
                        </span>
                        {p.won && <span className="text-[8px] text-green-400 shrink-0">✓</span>}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Group standings table ─────────────────────────────────────────────────────
function GroupStandings({ standings, userId }: { standings: TournamentStanding[]; userId?: string }) {
  const byGroup = standings.reduce<Record<number, TournamentStanding[]>>((acc, s) => {
    (acc[s.group_number] = acc[s.group_number] ?? []).push(s);
    return acc;
  }, {});

  if (!Object.keys(byGroup).length) return (
    <div className="text-center py-10 text-white/20 text-sm">Group standings will appear once the tournament starts</div>
  );

  return (
    <div className="space-y-4">
      {Object.keys(byGroup).map(Number).sort().map(g => (
        <div key={g} className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="px-4 py-2.5" style={{ background: "rgba(124,58,237,0.15)" }}>
            <span className="text-[10px] font-black uppercase tracking-widest text-violet-300">
              Group {String.fromCharCode(64 + g)}
            </span>
          </div>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                {["#", "Player", "P", "W", "D", "L", "Pts"].map(h => (
                  <th key={h} className={`py-2 text-[9px] font-black uppercase tracking-widest text-white/25 ${h === "Player" ? "text-left px-3" : "text-center px-2"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(byGroup[g] ?? [])
                .sort((a, b) => b.points - a.points || b.game_wins_margin - a.game_wins_margin)
                .map((s, i) => (
                  <tr key={s.id} style={{
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    background: s.user_id === userId ? "rgba(124,58,237,0.08)" : s.advanced ? "rgba(34,197,94,0.04)" : "transparent",
                  }}>
                    <td className="text-center px-2 py-2.5 text-white/25 font-black text-[10px]">{i + 1}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${s.user_id === userId ? "text-violet-300" : "text-white/60"}`}>{s.username}</span>
                        {s.user_id === userId && <span className="text-[8px] bg-violet-500/20 text-violet-400 px-1.5 py-0.5 rounded-full font-black">YOU</span>}
                        {s.advanced && <span className="text-[8px] bg-green-500/15 text-green-400 px-1.5 py-0.5 rounded-full font-black">ADV</span>}
                      </div>
                    </td>
                    <td className="text-center px-2 py-2.5 text-white/35">{s.played}</td>
                    <td className="text-center px-2 py-2.5 text-green-400 font-bold">{s.won}</td>
                    <td className="text-center px-2 py-2.5 text-yellow-400/70">{s.drawn}</td>
                    <td className="text-center px-2 py-2.5 text-red-400/50">{s.lost}</td>
                    <td className="text-center px-3 py-2.5 font-black text-violet-300 text-sm">{s.points}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

// ── Tournament detail modal ───────────────────────────────────────────────────
function TournamentModal({ t, onClose, onRegister, isRegistering, registered }: {
  t: ChessTournament;
  onClose: () => void;
  onRegister: () => void;
  isRegistering: boolean;
  registered: boolean;
}) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tab, setTab] = useState<"bracket" | "standings">("bracket");
  const sc = STATUS_CFG[t.status] ?? STATUS_CFG.registration;

  const { data: fixtures = [] } = useQuery({
    queryKey: ["ct-fixtures", t.id],
    queryFn: () => getChessTournamentFixtures(t.id),
    enabled: t.status === "active" || t.status === "completed",
    refetchInterval: t.status === "active" ? 8000 : false,
  });

  const { data: standings = [] } = useQuery({
    queryKey: ["ct-standings", t.id],
    queryFn: () => getChessTournamentStandings(t.id),
    enabled: t.format === "group_knockout" && (t.status === "active" || t.status === "completed"),
    refetchInterval: t.status === "active" ? 8000 : false,
  });

  // Find this user's active fixture — the game they need to play right now
  const myActiveFixture = fixtures.find(f =>
    f.status === "active" && (f.player1_id === user?.id || f.player2_id === user?.id)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(16px)" }} onClick={onClose}>
      <div className="w-full sm:max-w-2xl max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-3xl overflow-hidden"
        style={{ background: "linear-gradient(160deg,rgba(12,8,24,0.99),rgba(6,4,16,0.99))", border: "1px solid rgba(124,58,237,0.2)" }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-white/[0.06] shrink-0">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
              style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.25)" }}>♟</div>
            <div>
              <h2 className="font-black text-white text-base leading-snug">{t.title}</h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: sc.dot, boxShadow: `0 0 6px ${sc.dot}` }} />
                  <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: sc.dot }}>{sc.label}</span>
                </div>
                <span className="text-[9px] text-white/20">·</span>
                <span className="text-[9px] text-white/30 font-bold">{t.format === "group_knockout" ? "Group Stage → Knockout" : "Single Elimination"}</span>
                <span className="text-[9px] text-white/20">·</span>
                <span className="text-[9px] text-white/30 font-bold">{t.bracket_size} players</span>
                <span className="text-[9px] text-white/20">·</span>
                <span className="text-[9px] text-white/30 font-bold">{fmtTime(t.time_control_secs)}{t.increment_secs > 0 ? ` +${t.increment_secs}s` : ""}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors text-xl shrink-0 ml-2">✕</button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 divide-x divide-white/[0.05] border-b border-white/[0.06] shrink-0">
          {[
            { v: t.entry_fee > 0 ? `${t.entry_fee} ZA` : "FREE", l: "Entry Fee" },
            { v: `${t.prize_pool.toLocaleString()} ZA`, l: "Prize Pool" },
            { v: `${t.player_count ?? 0}/${t.bracket_size}`, l: "Registered" },
          ].map((s, i) => (
            <div key={i} className="px-4 py-3 text-center">
              <p className="font-black text-white text-sm">{s.v}</p>
              <p className="text-[9px] text-white/25 uppercase tracking-wider mt-0.5">{s.l}</p>
            </div>
          ))}
        </div>

        {/* Active match banner — shows only when user has a live game in progress */}
        {myActiveFixture && (
          <div className="mx-4 mt-3 shrink-0 rounded-2xl overflow-hidden" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}>
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <div>
                  <p className="text-xs font-black text-white">Your match is live now!</p>
                  <p className="text-[9px] text-white/40">{myActiveFixture.round_name} — vs {myActiveFixture.player1_id === user?.id ? myActiveFixture.player2?.username : myActiveFixture.player1?.username}</p>
                </div>
              </div>
              <button
                onClick={() => navigate(`/chess-tournament/${t.id}/match/${myActiveFixture.chess_room_id}`)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-black text-white"
                style={{ background: "linear-gradient(135deg,#dc2626,#ef4444)" }}>
                ♟ Play Now
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        {(t.status === "active" || t.status === "completed") && (
          <div className="flex border-b border-white/[0.06] mt-3 shrink-0">
            {[{ id: "bracket" as const, label: "Bracket" }, ...(t.format === "group_knockout" ? [{ id: "standings" as const, label: "Group Standings" }] : [])].map(tb => (
              <button key={tb.id} onClick={() => setTab(tb.id)}
                className={`px-5 py-2.5 text-xs font-black uppercase tracking-wider border-b-2 transition-colors ${tab === tb.id ? "text-violet-400 border-violet-500" : "text-white/25 border-transparent"}`}>
                {tb.label}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {(t.status === "registration" || t.status === "lobby") && (
            <div className="text-center py-8">
              <p className="text-white/30 text-xs mb-4">
                {t.player_count ?? 0} of {t.bracket_size} spots filled
              </p>
              <div className="w-full max-w-xs mx-auto bg-white/[0.05] rounded-full h-2 mb-4">
                <div className="h-2 rounded-full transition-all" style={{ width: `${Math.min(((t.player_count ?? 0) / t.bracket_size) * 100, 100)}%`, background: "linear-gradient(90deg,#7c3aed,#a855f7)" }} />
              </div>
              {t.format === "group_knockout" && (
                <p className="text-[10px] text-white/20 mb-2">{t.group_count} groups · top {t.advance_per_group} per group advance to knockout</p>
              )}
              <p className="text-[10px] text-white/20">Bracket generates automatically when admin launches</p>
            </div>
          )}
          {tab === "bracket" && (t.status === "active" || t.status === "completed") && (
            <BracketTree fixtures={fixtures} userId={user?.id} />
          )}
          {tab === "standings" && <GroupStandings standings={standings} userId={user?.id} />}
        </div>

        {/* CTA */}
        <div className="px-5 py-4 border-t border-white/[0.06] shrink-0">
          {t.status === "registration" && !registered && (
            <button onClick={onRegister} disabled={isRegistering || (t.player_count ?? 0) >= t.bracket_size}
              className="w-full py-3.5 rounded-2xl font-black text-sm text-white transition-all hover:scale-[1.01] disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", boxShadow: "0 0 24px rgba(124,58,237,0.35)" }}>
              {isRegistering ? "Registering…" : (t.player_count ?? 0) >= t.bracket_size ? "Tournament Full" : t.entry_fee > 0 ? `Register — Pay ${t.entry_fee} ZA` : "Register Free"}
            </button>
          )}
          {t.status === "registration" && registered && (
            <div className="flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-sm" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", color: "#22c55e" }}>
              <span>✓</span> You're registered — bracket generates at launch
            </div>
          )}
          {t.status === "active" && !myActiveFixture && registered && (
            <div className="flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-sm" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", color: "#f59e0b" }}>
              ⏳ Waiting for your next match…
            </div>
          )}
          {t.status === "completed" && (
            <div className="flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-sm text-white/30" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
              ✓ Tournament complete — prizes paid out
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Tournament card ───────────────────────────────────────────────────────────
function TCard({ t, onOpen }: { t: ChessTournament; onOpen: () => void }) {
  const sc = STATUS_CFG[t.status] ?? STATUS_CFG.registration;
  const fill = Math.min(((t.player_count ?? 0) / t.bracket_size) * 100, 100);

  return (
    <button onClick={onOpen} className="text-left w-full rounded-2xl p-4 transition-all hover:scale-[1.02]"
      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: sc.dot, boxShadow: `0 0 6px ${sc.dot}` }} />
          <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: sc.dot }}>{sc.label}</span>
          {t.status === "active" && <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
        </div>
        <span className="text-[9px] text-white/20 font-bold">{t.format === "group_knockout" ? "Group+KO" : "Knockout"}</span>
      </div>
      <h3 className="font-black text-white text-sm mb-2 leading-snug line-clamp-2">{t.title}</h3>
      <div className="flex items-center gap-2 text-[10px] text-white/30 mb-3 flex-wrap">
        <span>{t.bracket_size} players</span>
        <span>·</span>
        <span>{fmtTime(t.time_control_secs)}{t.increment_secs ? ` +${t.increment_secs}s` : ""}</span>
        <span>·</span>
        <span className="text-yellow-400 font-bold">{t.prize_pool.toLocaleString()} ZA</span>
        {t.entry_fee > 0 && <><span>·</span><span>{t.entry_fee} ZA entry</span></>}
      </div>
      <div>
        <div className="flex justify-between text-[9px] text-white/20 mb-1">
          <span>{t.player_count ?? 0}/{t.bracket_size} registered</span>
          {t.status === "active" && <span className="text-violet-400 font-black">Round {t.current_round}</span>}
        </div>
        <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
          <div className="h-full rounded-full" style={{ width: `${fill}%`, background: "linear-gradient(90deg,#7c3aed,#a855f7)" }} />
        </div>
      </div>
    </button>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ChessTournamentPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [selected, setSelected] = useState<ChessTournament | null>(null);
  const [tab, setTab] = useState<"registration" | "active" | "completed">("registration");

  const { data: tournaments = [], isLoading } = useQuery({
    queryKey: ["chess-tournaments"],
    queryFn: getChessTournaments,
    refetchInterval: 15000,
  });

  // Track which tournaments this user is registered in
  useQuery({
    queryKey: ["chess-my-tournaments", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return getChessTournaments();
    },
    enabled: !!user,
  });

  const registerM = useMutation({
    mutationFn: (id: string) => registerChessTournament(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["chess-tournaments"] }),
  });

  const filtered = tournaments.filter(t =>
    tab === "registration" ? t.status === "registration" || t.status === "lobby"
    : tab === "active" ? t.status === "active"
    : t.status === "completed" || t.status === "cancelled"
  );

  // Update selected tournament when query data refreshes
  const selectedFresh = selected ? (tournaments.find(t => t.id === selected.id) ?? selected) : null;

  const TABS: { id: typeof tab; label: string }[] = [
    { id: "registration", label: "Open" },
    { id: "active", label: "🔴 Live" },
    { id: "completed", label: "Completed" },
  ];

  return (
    <>
      <SEO title="Chess Tournaments — Playza" description="Compete in Playza chess tournaments. Bracket and group-stage formats, real prizes." />

      <div className="min-h-screen pb-28" style={{ background: "var(--background)" }}>
        {/* Hero */}
        <div className="px-4 pt-8 pb-6 max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
              style={{ background: "linear-gradient(135deg,rgba(124,58,237,0.3),rgba(88,28,135,0.2))", border: "1px solid rgba(124,58,237,0.3)" }}>♟</div>
            <div>
              <h1 className="text-2xl font-black text-white leading-none">Chess Tournaments</h1>
              <p className="text-xs text-white/30 mt-0.5">Brackets, groups, real prizes. Your move.</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-4 max-w-2xl mx-auto">
          <div className="flex gap-1 p-1 rounded-xl w-fit mb-5" style={{ background: "rgba(255,255,255,0.04)" }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${tab === t.id ? "text-white" : "text-white/30 hover:text-white/50"}`}
                style={tab === t.id ? { background: "rgba(124,58,237,0.5)" } : {}}>
                {t.label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
              <span className="text-5xl text-white/10">♟</span>
              <p className="font-black text-white/20">No {tab} chess tournaments</p>
              <p className="text-xs text-white/10">Check back soon</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filtered.map(t => (
                <TCard key={t.id} t={t} onOpen={() => setSelected(t)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedFresh && (
        <TournamentModal
          t={selectedFresh}
          onClose={() => setSelected(null)}
          onRegister={() => registerM.mutate(selectedFresh.id)}
          isRegistering={registerM.isPending}
          registered={false} // TODO: wire real registration status per user
        />
      )}
    </>
  );
}
