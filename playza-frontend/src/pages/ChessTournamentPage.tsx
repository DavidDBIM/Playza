import { useState, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/auth";
import SEO from "@/components/SEO";
import { Trophy, Users, Clock, Crown, ArrowLeft } from "lucide-react";
import {
  getChessTournaments, getChessTournament, registerChessTournament,
  getChessTournamentFixtures, getChessTournamentStandings, getChessTournamentResults,
  type ChessTournament, type TournamentFixture, type TournamentStanding, type TournamentResult,
} from "@/api/chess-tournament.api";

// ── Countdown ──────────────────────────────────────────────────────────────────
function useCountdown(targetIso: string | null | undefined) {
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(null);
  const [expired, setExpired] = useState(false);
  useEffect(() => {
    if (!targetIso) return;
    function calc() {
      const diff = new Date(targetIso!).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft(null); setExpired(true); return; }
      const s = Math.floor(diff / 1000);
      setTimeLeft({ d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 });
    }
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [targetIso]);
  return { timeLeft, expired };
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtTime(secs: number) {
  if (secs >= 60) return `${Math.floor(secs / 60)}m${secs % 60 > 0 ? `+${secs % 60}s` : ""}`;
  return `${secs}s`;
}

// Turns any URL or bare domain (facebook.com, https://x.com/foo, www.site.io)
// found inside admin-entered free text into a clickable "🔗 Click me" pill,
// leaving everything else exactly as written. Used anywhere a tournament
// description is rendered so admins can safely drop plain links in.
const LINK_PATTERN = /((?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,62}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,62}[a-zA-Z0-9])?)+(?:\/[^\s]*)?)/g;
function linkifyText(text: string): ReactNode {
  // split() with a single capturing group interleaves the matches into the
  // result: [text, match, text, match, ..., text] — so odd indices are
  // always the matched links, no regex.lastIndex statefulness to worry about.
  const parts = text.split(LINK_PATTERN);
  return parts.map((part, i) => {
    if (!part) return null;
    if (i % 2 === 0) return <span key={i}>{part}</span>;
    // Strip trailing punctuation that's clearly sentence punctuation, not
    // part of the URL (e.g. "...visit facebook.com." shouldn't link the dot)
    const trailingMatch = part.match(/[),.!?;:'"]+$/);
    const trailing = trailingMatch ? trailingMatch[0] : "";
    const core = trailing ? part.slice(0, -trailing.length) : part;
    if (!core || !/[a-zA-Z]{2,}$/.test(core.replace(/\/[^\s]*$/, ""))) return <span key={i}>{part}</span>;
    const href = /^https?:\/\//i.test(core) ? core : `https://${core}`;
    return (
      <span key={i}>
        <a href={href} target="_blank" rel="noopener noreferrer nofollow" onClick={e => e.stopPropagation()}
          className="inline-flex items-center gap-1 px-2 py-0.5 mx-0.5 rounded-full text-[10px] font-black align-middle transition-transform hover:scale-105"
          style={{ background: "rgba(124,58,237,0.18)", color: "#c084fc" }}>
          🔗 Click me
        </a>
        {trailing}
      </span>
    );
  });
}

const STATUS_CFG = {
  registration: { label: "Registration Open", dot: "#22c55e", glow: "rgba(34,197,94,0.25)" },
  lobby:        { label: "Starting Soon",     dot: "#f59e0b", glow: "rgba(245,158,11,0.25)" },
  active:       { label: "Live Now",          dot: "#ef4444", glow: "rgba(239,68,68,0.25)" },
  completed:    { label: "Completed",         dot: "#64748b", glow: "rgba(100,116,139,0.1)" },
  cancelled:    { label: "Cancelled",         dot: "#475569", glow: "rgba(71,85,105,0.1)" },
};

const FIXTURE_ACCENT: Record<string, string> = {
  pending: "#94a3b8",
  scheduled: "#f59e0b",
  active: "#ef4444",
  completed: "#22c55e",
  bye: "#7c3aed",
};

// ── Bracket tree ──────────────────────────────────────────────────────────────
const BRACKET_CARD_H = 104;  // fixed card height so connector math is exact — was 84, too small for the actual header (~20px) + two player rows (~40px each) content, causing the bottom row to clip against overflow-hidden
const BRACKET_CARD_W = 208;  // widened slightly for more breathing room around names
const BRACKET_GAP_Y = 14;    // vertical gap between round-1 cards
const BRACKET_GAP_X = 40;    // horizontal gap between round columns (connector space)

function BracketTree({ fixtures, userId, tournamentId }: { fixtures: TournamentFixture[]; userId?: string; tournamentId: string }) {
  const navigate = useNavigate();
  const knockout = fixtures.filter(f => !f.group_number);
  const byRound = knockout.reduce<Record<number, TournamentFixture[]>>((acc, f) => {
    (acc[f.round_number] = acc[f.round_number] ?? []).push(f);
    return acc;
  }, {});
  const roundNumbers = Object.keys(byRound).map(Number).sort((a, b) => a - b);

  if (!roundNumbers.length) return (
    <div className="text-center py-12 text-foreground/20 text-sm">
      <span className="text-4xl block mb-3">♟</span>
      Bracket generates when the tournament launches
    </div>
  );

  const rounds = roundNumbers.map(r => (byRound[r] ?? []).sort((a, b) => a.bracket_position - b.bracket_position));

  // Vertical center (in px, relative to the shared bracket canvas) of every
  // match in every round — round 0 spaced evenly, each later round centered
  // exactly between the pair of matches that feed into it. This is what
  // makes the connector lines meet the next round's card dead center,
  // exactly like a real World Cup knockout graphic tapering toward the final.
  const centers: number[][] = [];
  rounds.forEach((rf, r) => {
    centers[r] = rf.map((_, i) => {
      if (r === 0) return i * (BRACKET_CARD_H + BRACKET_GAP_Y) + BRACKET_CARD_H / 2;
      const a = centers[r - 1]![i * 2]!;
      const b = centers[r - 1]![i * 2 + 1];
      // Round sizes normally halve exactly, but group-stage advancement
      // (group_count × advance_per_group) isn't guaranteed to be a power of
      // 2, so an odd round can leave one match unpaired here — it just
      // carries its own center straight through rather than reading past
      // the end of the previous round's array.
      return b !== undefined ? (a + b) / 2 : a;
    });
  });

  const canvasHeight = rounds[0]!.length * (BRACKET_CARD_H + BRACKET_GAP_Y) - BRACKET_GAP_Y;
  const colWidth = BRACKET_CARD_W + BRACKET_GAP_X;
  const canvasWidth = rounds.length * colWidth - BRACKET_GAP_X;

  return (
    <div className="overflow-x-auto pb-6 px-2 pt-2">
      {/* Everything below — the connector SVG and every card — is positioned
          in one single coordinate space (0,0 = this div's top-left corner),
          so a connector line's endpoint always lands exactly on a card's
          edge instead of drifting off by whatever offset a wrapping
          className happened to add. */}
      <div className="relative" style={{ width: canvasWidth, height: canvasHeight + 28 }}>
        {/* Connector lines — drawn first so cards sit visually on top */}
        <svg className="absolute left-0 top-0 pointer-events-none" width={canvasWidth} height={canvasHeight + 28} style={{ overflow: "visible" }}>
          {rounds.slice(0, -1).map((rf, r) =>
            rf.map((_, i) => {
              if (i % 2 !== 0) return null; // draw once per pair
              const hasPartner = i + 1 < rf.length;
              const yTop = 28 + centers[r]![i]!;
              const yBot = 28 + (hasPartner ? centers[r]![i + 1]! : centers[r]![i]!);
              const yMid = 28 + centers[r + 1]![i / 2]!;
              const xStart = r * colWidth + BRACKET_CARD_W;
              const xMid = xStart + BRACKET_GAP_X / 2;
              const xEnd = xStart + BRACKET_GAP_X;
              const stroke = "color-mix(in srgb, var(--foreground) 18%, transparent)";
              if (!hasPartner) {
                // Odd leftover match — straight pass-through, no elbow needed
                return <line key={`${r}-${i}`} x1={xStart} y1={yTop} x2={xEnd} y2={yMid} stroke={stroke} strokeWidth={2} />;
              }
              return (
                <g key={`${r}-${i}`}>
                  <line x1={xStart} y1={yTop} x2={xMid} y2={yTop} stroke={stroke} strokeWidth={2} />
                  <line x1={xStart} y1={yBot} x2={xMid} y2={yBot} stroke={stroke} strokeWidth={2} />
                  <line x1={xMid} y1={yTop} x2={xMid} y2={yBot} stroke={stroke} strokeWidth={2} />
                  <line x1={xMid} y1={yMid} x2={xEnd} y2={yMid} stroke={stroke} strokeWidth={2} />
                </g>
              );
            })
          )}
        </svg>

        {/* Round labels + match cards, absolutely positioned in the exact
            same coordinate space as the connectors above */}
        {rounds.map((rf, r) => (
          <div key={r}>
            <p title={rf[0]?.round_name ?? `Round ${roundNumbers[r]}`}
              className="absolute text-[9px] font-black uppercase tracking-widest text-foreground/25 text-center truncate px-1"
              style={{ left: r * colWidth, top: 0, width: BRACKET_CARD_W }}>
              {rf[0]?.round_name ?? `Round ${roundNumbers[r]}`}
            </p>
            {rf.map((f, i) => {
              const accent = FIXTURE_ACCENT[f.status] ?? "#94a3b8";
              const p1 = f.player1?.username ?? (f.player1_id ? "Player" : "TBD");
              const p2 = f.player2?.username ?? (f.is_bye ? "— Bye —" : "TBD");
              const p1Won = f.winner_id === f.player1_id;
              const p2Won = f.winner_id === f.player2_id;
              const meInvolved = userId && (f.player1_id === userId || f.player2_id === userId);
              const isWatchable = f.status === "active" && !!f.chess_room_id;
              return (
                <div key={f.id} className={`absolute rounded-xl overflow-hidden transition-transform ${isWatchable ? "cursor-pointer hover:scale-[1.03]" : ""}`}
                  onClick={isWatchable ? () => navigate(`/chess-tournament/${tournamentId}/match/${f.chess_room_id}`) : undefined}
                  style={{
                    left: r * colWidth, width: BRACKET_CARD_W, height: BRACKET_CARD_H,
                    top: 28 + centers[r]![i]! - BRACKET_CARD_H / 2,
                    border: `1px solid ${meInvolved ? "#a855f7" : isWatchable ? "#ef4444" : accent}30`,
                    background: meInvolved ? "rgba(124,58,237,0.08)" : "var(--card)",
                    boxShadow: meInvolved ? "0 0 12px rgba(168,85,247,0.2)" : isWatchable ? "0 0 12px rgba(239,68,68,0.15)" : "none",
                  }}>
                  <div className="flex items-center justify-between px-2.5 py-1" style={{ background: `${accent}15` }}>
                    <div className="flex items-center gap-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${isWatchable ? "animate-pulse" : ""}`} style={{ background: accent }} />
                      <span className="text-[8px] font-black uppercase tracking-widest" style={{ color: accent }}>
                        {f.status === "bye" ? "Bye" : f.status === "active" ? "Live" : f.status === "scheduled" ? "Scheduled" : f.status === "completed" ? "Final" : "Pending"}
                      </span>
                    </div>
                    {meInvolved ? <span className="text-[8px] font-black text-violet-400">YOU</span> : isWatchable ? <span className="text-[8px] font-black text-red-400">👁 WATCH</span> : null}
                  </div>
                  {[{ name: p1, won: p1Won, id: f.player1_id }, { name: p2, won: p2Won, id: f.player2_id }].map((p, pi) => {
                    const isMe = p.id === userId;
                    return (
                    <div key={pi} className={`flex items-center gap-2 px-2.5 py-2 min-w-0 ${pi === 0 ? "border-b border-foreground/[0.06]" : ""}`}
                      style={{ background: p.won ? "rgba(34,197,94,0.06)" : isMe ? "rgba(124,58,237,0.06)" : "transparent" }}>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0"
                        style={{
                          background: isMe ? "linear-gradient(135deg,#7c3aed,#a855f7)" : p.won ? "rgba(34,197,94,0.18)" : "color-mix(in srgb, var(--foreground) 10%, transparent)",
                          color: isMe ? "#fff" : p.won ? "#4ade80" : "var(--foreground)",
                          opacity: isMe || p.won ? 1 : 0.5,
                          boxShadow: isMe ? "0 0 0 2px rgba(168,85,247,0.35)" : "none",
                        }}>
                        {p.name[0]?.toUpperCase() ?? "?"}
                      </div>
                      <span title={p.name} className={`text-xs font-bold truncate min-w-0 flex-1 ${p.won ? "text-green-400" : isMe ? "text-violet-300" : f.is_bye && pi === 1 ? "text-foreground/15 italic" : "text-foreground/50"}`}>
                        {p.name}
                      </span>
                      {p.won && <span className="text-[10px] shrink-0">🏆</span>}
                    </div>
                  );})}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── My Fixtures — this user's full match schedule, World-Cup-team-style:
// one row per round, opponent, kickoff time (or live/result), win/draw/loss ──
function MyFixtures({ fixtures, userId }: { fixtures: TournamentFixture[]; userId?: string }) {
  const mine = fixtures
    .filter(f => userId && (f.player1_id === userId || f.player2_id === userId))
    .sort((a, b) => {
      // Not-yet-decided matches (active/scheduled/pending) always sort
      // above completed/bye ones — that's "what do I need to do next."
      const aDone = a.status === "completed" || a.status === "bye";
      const bDone = b.status === "completed" || b.status === "bye";
      if (aDone !== bDone) return aDone ? 1 : -1;
      // Within the upcoming group: soonest round first.
      // Within the completed group: most recently played first.
      return aDone ? b.round_number - a.round_number : a.round_number - b.round_number;
    });

  if (!userId) return (
    <div className="text-center py-12 text-foreground/20 text-sm">Sign in to see your fixtures</div>
  );
  if (!mine.length) return (
    <div className="text-center py-12 text-foreground/20 text-sm">
      <span className="text-4xl block mb-3">🗓️</span>
      Your matches will appear here once the bracket is drawn
    </div>
  );

  const fmtWhen = (iso?: string) => {
    if (!iso) return null;
    const d = new Date(iso);
    const now = new Date();
    const sameDay = d.toDateString() === now.toDateString();
    // hour12 is explicit — without it, some locales/devices default to a
    // bare 24-hour clock with no AM/PM marker at all, which is exactly what
    // made kickoff times unreadable. Timezone is left to the browser's own
    // local zone (no timeZone override), so each player sees kickoff in
    // their own local time rather than someone else's.
    return d.toLocaleString(undefined, sameDay
      ? { hour: "numeric", minute: "2-digit", hour12: true }
      : { weekday: "short", hour: "numeric", minute: "2-digit", hour12: true });
  };

  return (
    <div className="space-y-2">
      {mine.map(f => {
        const isP1 = f.player1_id === userId;
        const opponent = f.is_bye ? null : (isP1 ? f.player2?.username : f.player1?.username) ?? "TBD";
        const iWon = f.winner_id === userId;
        const oppWon = !!f.winner_id && f.winner_id !== userId;
        const isDraw = f.status === "completed" && !f.winner_id;
        const accent = FIXTURE_ACCENT[f.status] ?? "#94a3b8";

        return (
          <div key={f.id} className="flex items-center gap-3 rounded-xl px-3.5 py-2.5"
            style={{ background: "color-mix(in srgb, var(--foreground) 3%, transparent)", border: `1px solid ${iWon ? "rgba(34,197,94,0.25)" : oppWon ? "rgba(239,68,68,0.15)" : "color-mix(in srgb, var(--foreground) 7%, transparent)"}` }}>
            <div className="w-14 shrink-0">
              <p className="text-[8px] font-black uppercase tracking-widest text-foreground/25 leading-tight">{f.round_name}</p>
            </div>

            <div className="flex-1 min-w-0">
              {f.is_bye ? (
                <p className="text-xs font-bold text-foreground/40 italic">Bye — automatic advance</p>
              ) : (
                <p className="text-sm font-bold text-foreground/70 truncate">vs {opponent}</p>
              )}
              {f.status === "scheduled" && f.scheduled_at && (
                <p className="text-[10px] text-foreground/30 font-medium">Kicks off {fmtWhen(f.scheduled_at)}</p>
              )}
              {f.status === "active" && <p className="text-[10px] font-black" style={{ color: accent }}>● Live now</p>}
              {f.status === "pending" && <p className="text-[10px] text-foreground/25">Waiting on earlier rounds</p>}
            </div>

            <div className="shrink-0">
              {f.is_bye ? (
                <span className="text-[9px] font-black px-2 py-1 rounded-full text-green-400" style={{ background: "rgba(34,197,94,0.1)" }}>ADVANCED</span>
              ) : f.status === "completed" ? (
                <span className="text-[9px] font-black px-2 py-1 rounded-full" style={{
                  color: iWon ? "#22c55e" : isDraw ? "#f59e0b" : "#ef4444",
                  background: iWon ? "rgba(34,197,94,0.1)" : isDraw ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)",
                }}>{iWon ? "WON" : isDraw ? "DRAW" : "LOST"}</span>
              ) : f.status === "active" ? (
                <span className="text-[9px] font-black px-2 py-1 rounded-full text-white animate-pulse" style={{ background: "linear-gradient(135deg,#dc2626,#ef4444)" }}>PLAY →</span>
              ) : f.status === "scheduled" ? (
                <span className="text-[9px] font-black px-2 py-1 rounded-full text-violet-400" style={{ background: "rgba(124,58,237,0.12)" }}>SCHEDULED</span>
              ) : (
                <span className="text-[9px] font-black px-2 py-1 rounded-full text-foreground/25" style={{ background: "color-mix(in srgb, var(--foreground) 5%, transparent)" }}>PENDING</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Group standings table ─────────────────────────────────────────────────────
function GroupStandings({ standings, userId }: { standings: TournamentStanding[]; userId?: string }) {
  const [openBreakdown, setOpenBreakdown] = useState<string | null>(null); // key: `${group}-${points}`

  const byGroup = standings.reduce<Record<number, TournamentStanding[]>>((acc, s) => {
    (acc[s.group_number] = acc[s.group_number] ?? []).push(s);
    return acc;
  }, {});

  if (!Object.keys(byGroup).length) return (
    <div className="text-center py-10 text-foreground/20 text-sm">Group standings will appear once the tournament starts</div>
  );

  return (
    <div className="space-y-4">
      {Object.keys(byGroup).map(Number).sort().map(g => (
        <div key={g} className="rounded-2xl overflow-hidden" style={{ border: "1px solid color-mix(in srgb, var(--foreground) 7%, transparent)" }}>
          <div className="px-4 py-2.5" style={{ background: "rgba(124,58,237,0.15)" }}>
            <span className="text-[10px] font-black uppercase tracking-widest text-violet-300">
              Group {String.fromCharCode(64 + g)}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse min-w-[380px]">
              <thead>
                <tr style={{ borderBottom: "1px solid color-mix(in srgb, var(--foreground) 6%, transparent)" }}>
                  {["#", "Player", "P", "W", "D", "L", "Pts"].map(h => (
                    <th key={h} className={`py-2 text-[9px] font-black uppercase tracking-widest text-foreground/25 ${h === "Player" ? "text-left px-3" : "text-center px-2"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(byGroup[g] ?? [])
                  .sort((a, b) => b.points - a.points || b.game_wins_margin - a.game_wins_margin)
                  .map((s, i) => (
                    <tr key={s.id} style={{
                      borderBottom: "1px solid color-mix(in srgb, var(--foreground) 4%, transparent)",
                      background: s.user_id === userId ? "rgba(124,58,237,0.08)" : s.advanced ? "rgba(34,197,94,0.04)" : "transparent",
                    }}>
                      <td className="text-center px-2 py-2.5 text-foreground/25 font-black text-[10px]">{i + 1}</td>
                      <td className="px-3 py-2.5 max-w-[140px]">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className={`font-bold truncate ${s.user_id === userId ? "text-violet-300" : "text-foreground/60"}`}>{s.username}</span>
                          {s.user_id === userId && <span className="shrink-0 text-[8px] bg-violet-500/20 text-violet-400 px-1.5 py-0.5 rounded-full font-black">YOU</span>}
                          {s.advanced && <span className="shrink-0 text-[8px] bg-green-500/15 text-green-400 px-1.5 py-0.5 rounded-full font-black">ADV</span>}
                          {/* Only rendered for players who were actually tied
                              with someone — everyone else was ranked on
                              points alone, nothing to explain */}
                          {s.tiebreak_breakdown && s.tiebreak_breakdown.length > 1 && (
                            <button
                              onClick={() => setOpenBreakdown(k => k === `${g}-${s.points}` ? null : `${g}-${s.points}`)}
                              className="shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 transition-colors"
                              title="Why this rank? Tap for the tiebreak breakdown"
                            >
                              ?
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="text-center px-2 py-2.5 text-foreground/35">{s.played}</td>
                      <td className="text-center px-2 py-2.5 text-green-400 font-bold">{s.won}</td>
                      <td className="text-center px-2 py-2.5 text-yellow-400/70">{s.drawn}</td>
                      <td className="text-center px-2 py-2.5 text-red-400/50">{s.lost}</td>
                      <td className="text-center px-3 py-2.5 font-black text-violet-300 text-sm">{s.points}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Tiebreak breakdown panel — same numbers sent in the email,
              shown inline so anyone can check it without digging through
              their inbox. Opens below the table rather than inline in a
              row, so the table itself never has to resize/reflow. */}
          {openBreakdown?.startsWith(`${g}-`) && (() => {
            const tiedPlayer = (byGroup[g] ?? []).find(s => `${g}-${s.points}` === openBreakdown && s.tiebreak_breakdown);
            const breakdown = tiedPlayer?.tiebreak_breakdown;
            if (!breakdown) return null;
            return (
              <div className="px-3 sm:px-4 py-3 border-t" style={{ borderColor: "color-mix(in srgb, var(--foreground) 6%, transparent)", background: "rgba(245,158,11,0.05)" }}>
                <p className="text-[9px] font-black uppercase tracking-widest text-amber-400 mb-2">
                  Tiebreak breakdown — {breakdown.length} players tied on {tiedPlayer.points} pts
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-[10px] border-collapse min-w-[320px]">
                    <thead>
                      <tr>
                        {["Rank", "Player", "H2H Pts", "H2H Margin", "Overall Margin"].map(h => (
                          <th key={h} className="py-1 px-2 text-left text-[8px] font-black uppercase tracking-widest text-foreground/30">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[...breakdown].sort((a, b) => a.final_group_rank - b.final_group_rank).map(row => (
                        <tr key={row.user_id} style={{ background: row.user_id === userId ? "rgba(124,58,237,0.1)" : "transparent" }}>
                          <td className="py-1 px-2 font-black text-foreground/40">{row.final_group_rank}</td>
                          <td className="py-1 px-2 font-bold truncate max-w-[100px]" style={{ color: row.user_id === userId ? "#c084fc" : undefined }}>{row.username}{row.user_id === userId ? " (you)" : ""}</td>
                          <td className="py-1 px-2">{row.head_to_head_points}</td>
                          <td className="py-1 px-2">{row.head_to_head_margin > 0 ? "+" : ""}{row.head_to_head_margin}</td>
                          <td className="py-1 px-2">{row.overall_margin > 0 ? "+" : ""}{row.overall_margin}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-[9px] text-foreground/30 font-medium mt-2 leading-relaxed">
                  H2H = results only from games these players played against each other, checked first. Overall margin (whole group) is the next tiebreak if H2H is also level.
                </p>
              </div>
            );
          })()}
        </div>
      ))}
    </div>
  );
}

// ── Live matches spectator picker ─────────────────────────────────────────────
// Anyone without a game of their own to play right now — a visitor who never
// registered, a registered player still waiting on their next round, or a
// registered player who's already been eliminated — lands here instead of an
// empty state. If several matches are live at once, this is the "which one
// do you want to watch" picker rather than making them dig through the
// bracket to find a live card.
function LiveMatchesPanel({ fixtures, userId, tournamentId }: { fixtures: TournamentFixture[]; userId?: string; tournamentId: string }) {
  const navigate = useNavigate();
  const live = fixtures.filter(f => f.status === "active" && !!f.chess_room_id);

  if (!live.length) return null;

  return (
    <div className="mb-4 rounded-2xl overflow-hidden" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.22)" }}>
      <div className="flex items-center gap-2 px-4 pt-3.5 pb-2.5">
        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        <p className="text-xs font-black text-foreground">
          {live.length === 1 ? "1 match live right now" : `${live.length} matches live right now`}
        </p>
        <span className="text-[9px] text-foreground/30 font-bold">— pick one to watch</span>
      </div>
      <div className="px-3 pb-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {live.map(f => {
          const meInvolved = userId && (f.player1_id === userId || f.player2_id === userId);
          const p1 = f.player1?.username ?? "Player";
          const p2 = f.player2?.username ?? "Player";
          return (
            <button key={f.id} onClick={() => navigate(`/chess-tournament/${tournamentId}/match/${f.chess_room_id}`)}
              className="flex items-center justify-between gap-2 rounded-xl px-3.5 py-2.5 text-left transition-transform hover:scale-[1.02]"
              style={{ background: "var(--card)", border: `1px solid ${meInvolved ? "rgba(168,85,247,0.4)" : "rgba(239,68,68,0.25)"}` }}>
              <div className="min-w-0">
                <p className="text-[8px] font-black uppercase tracking-widest text-foreground/25 mb-0.5">{f.round_name}</p>
                <p className="text-xs font-bold text-foreground/70 truncate">{p1} <span className="text-foreground/25">vs</span> {p2}</p>
              </div>
              <span className="shrink-0 text-[9px] font-black px-2.5 py-1.5 rounded-full text-white animate-pulse" style={{ background: "linear-gradient(135deg,#dc2626,#ef4444)" }}>
                👁 WATCH
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Final results podium — shown once a tournament completes ─────────────────
function FinalResults({ results, userId }: { results: TournamentResult[]; userId?: string }) {
  if (!results.length) return (
    <div className="text-center py-10 text-foreground/20 text-sm">Final results will appear once the tournament completes</div>
  );

  // Group by rank — ties (e.g. two semifinal losers both placed 3rd) share a
  // slot and split the prize, rather than assuming one recipient per rank.
  const byRank = results.reduce<Record<number, TournamentResult[]>>((acc, r) => {
    (acc[r.final_rank] = acc[r.final_rank] ?? []).push(r);
    return acc;
  }, {});
  const ranks = Object.keys(byRank).map(Number).sort((a, b) => a - b);
  const podiumRanks = ranks.slice(0, 3);
  const restRanks = ranks.slice(3);

  const medal: Record<number, { emoji: string; color: string; bg: string; label: string }> = {
    1: { emoji: "🥇", color: "#fbbf24", bg: "linear-gradient(135deg,#fbbf24,#f59e0b)", label: "Champion" },
    2: { emoji: "🥈", color: "#cbd5e1", bg: "linear-gradient(135deg,#cbd5e1,#94a3b8)", label: "Runner-up" },
    3: { emoji: "🥉", color: "#d97706", bg: "linear-gradient(135deg,#d97706,#b45309)", label: "3rd Place" },
  };

  // Podium display order: 2nd (left), 1st (center, taller), 3rd (right) —
  // the classic podium arrangement, built from whichever ranks actually
  // have recipients (a tiny bracket might only have rank 1 + 2, no 3rd).
  const podiumOrder = [2, 1, 3].filter(r => podiumRanks.includes(r));

  return (
    <div className="space-y-6">
      {/* Podium */}
      <div className="flex items-end justify-center gap-2 md:gap-4 px-2">
        {podiumOrder.map(rank => {
          const recipients = byRank[rank];
          const m = medal[rank];
          const height = rank === 1 ? "h-36" : rank === 2 ? "h-28" : "h-24";
          const iAmHere = recipients.some(r => r.user_id === userId);
          return (
            <div key={rank} className={`flex flex-col items-center justify-end min-w-0 ${rank === 1 ? "flex-[1.15]" : "flex-1"} max-w-[150px]`}>
              <div className="text-3xl mb-1">{m.emoji}</div>
              {recipients.map((r) => (
                <div key={r.user_id} className="w-full text-center mb-1">
                  <p className={`text-xs font-black truncate ${r.user_id === userId ? "text-violet-400" : "text-foreground"}`}>{r.username}</p>
                  {r.prize_won > 0 && <p className="text-[10px] font-bold" style={{ color: m.color }}>+{r.prize_won.toLocaleString()} ZA</p>}
                </div>
              ))}
              <div className={`w-full ${height} rounded-t-xl flex items-start justify-center pt-2 relative overflow-hidden`}
                style={{ background: m.bg, boxShadow: iAmHere ? `0 0 0 3px rgba(124,58,237,0.6), 0 0 24px ${m.color}55` : `0 0 20px ${m.color}33` }}>
                <span className="text-white/90 font-black text-lg">{rank}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Everyone else */}
      {restRanks.length > 0 && (
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid color-mix(in srgb, var(--foreground) 7%, transparent)" }}>
          {restRanks.map(rank => (
            <div key={rank}>
              {byRank[rank].map((r) => (
                <div key={r.user_id} className="flex items-center gap-3 px-4 py-2.5"
                  style={{
                    borderBottom: "1px solid color-mix(in srgb, var(--foreground) 4%, transparent)",
                    background: r.user_id === userId ? "rgba(124,58,237,0.08)" : "transparent",
                  }}>
                  <span className="w-8 text-center text-[11px] font-black text-foreground/30 shrink-0">#{rank}</span>
                  <span className={`flex-1 min-w-0 truncate text-xs font-bold ${r.user_id === userId ? "text-violet-300" : "text-foreground/60"}`}>{r.username}</span>
                  {r.user_id === userId && <span className="text-[8px] bg-violet-500/20 text-violet-400 px-1.5 py-0.5 rounded-full font-black shrink-0">YOU</span>}
                  {r.prize_won > 0 && <span className="text-xs font-black text-green-400 shrink-0">+{r.prize_won.toLocaleString()} ZA</span>}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Tournament detail — full page ─────────────────────────────────────────────
function TournamentDetailPage({ tournamentId, initialDetailTab }: {
  tournamentId: string;
  /** Opens straight onto a specific tab — used when arriving via a "View
   * Table" link from a just-finished match, or a "Results" link from the
   * tournament listing page for an already-completed tournament. */
  initialDetailTab?: "bracket" | "standings" | "results";
}) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: t, isLoading: tLoading } = useQuery({
    queryKey: ["ct-detail", tournamentId],
    queryFn: () => getChessTournament(tournamentId),
    refetchInterval: 15000,
  });

  const registerM = useMutation({
    mutationFn: () => registerChessTournament(tournamentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ct-detail", tournamentId] });
      qc.invalidateQueries({ queryKey: ["chess-tournaments"] });
    },
  });

  const [tab, setTab] = useState<"bracket" | "standings" | "fixtures" | "results">(
    initialDetailTab === "results" ? "results"
      : initialDetailTab === "standings" && t?.format === "group_knockout" ? "standings"
      : "fixtures"
  );
  const [showRules, setShowRules] = useState(false);

  const { data: fixtures = [] } = useQuery({
    queryKey: ["ct-fixtures", tournamentId],
    queryFn: () => getChessTournamentFixtures(tournamentId),
    enabled: !!t && (t.status === "active" || t.status === "completed"),
    refetchInterval: t?.status === "active" ? 8000 : false,
  });

  const { data: standings = [] } = useQuery({
    queryKey: ["ct-standings", tournamentId],
    queryFn: () => getChessTournamentStandings(tournamentId),
    enabled: !!t && t.format === "group_knockout" && (t.status === "active" || t.status === "completed"),
    refetchInterval: t?.status === "active" ? 8000 : false,
  });

  const { data: results = [] } = useQuery({
    queryKey: ["ct-results", tournamentId],
    queryFn: () => getChessTournamentResults(tournamentId),
    enabled: !!t && t.status === "completed",
  });

  // Find this user's active fixture — the game they need to play right now
  const myActiveFixture = fixtures.find(f =>
    f.status === "active" && (f.player1_id === user?.id || f.player2_id === user?.id)
  );

  // The instant we know the player has a live game, drop them straight into
  // it — no "Play Now" click needed, no bracket tab to find it on.
  const autoRedirectedRef = useRef(false);
  useEffect(() => {
    if (myActiveFixture?.chess_room_id && !autoRedirectedRef.current) {
      autoRedirectedRef.current = true;
      navigate(`/chess-tournament/${tournamentId}/match/${myActiveFixture.chess_room_id}`);
    }
  }, [myActiveFixture?.chess_room_id, tournamentId, navigate]);

  const { timeLeft: regTimeLeft, expired: regExpired } = useCountdown(t?.status === "registration" ? t?.registration_end : null);

  if (tLoading || !t) {
    return (
      <div className="dark min-h-screen flex items-center justify-center" style={{ background: "radial-gradient(ellipse at top, rgba(124,58,237,0.1), transparent 60%), #0a0a12" }}>
        <div className="w-8 h-8 border-2 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  const sc = STATUS_CFG[t.status as keyof typeof STATUS_CFG] ?? STATUS_CFG.registration;
  const registered = !!t.user_registered;

  return (
    <div className="dark min-h-screen pb-28" style={{ background: "radial-gradient(ellipse at top, rgba(124,58,237,0.1), transparent 60%), #0a0a12" }}>
      <div className="max-w-3xl mx-auto px-4 pt-6">
        <button onClick={() => navigate("/chess-tournament")}
          className="flex items-center gap-1.5 text-xs font-bold text-foreground/40 hover:text-foreground/70 transition-colors mb-4">
          <ArrowLeft size={14} /> All tournaments
        </button>

        {/* Hero header — checkerboard motif matching the list card design */}
        <div className="relative rounded-3xl overflow-hidden mb-4"
          style={{ background: t.status === "active" ? "linear-gradient(135deg,rgba(239,68,68,0.14),rgba(124,58,237,0.08))" : "linear-gradient(135deg,rgba(124,58,237,0.16),rgba(168,85,247,0.06))" }}>
          <div className="absolute -right-8 -top-8 w-40 h-40 rotate-12 grid grid-cols-4 grid-rows-4 overflow-hidden rounded-2xl opacity-[0.12] pointer-events-none select-none">
            {Array.from({ length: 16 }).map((_, i) => {
              const row = Math.floor(i / 4);
              const isLight = (row + i) % 2 === 0;
              return <div key={i} style={{ background: isLight ? "var(--foreground)" : "transparent" }} />;
            })}
          </div>
          <div className="relative px-6 pt-7 pb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full" style={{ background: sc.dot, boxShadow: `0 0 8px ${sc.dot}` }} />
              <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: sc.dot }}>{sc.label}</span>
              <span className="text-[10px] text-foreground/20">·</span>
              <span className="text-[10px] text-foreground/40 font-bold">{t.format === "group_knockout" ? "Group Stage → Knockout" : "Single Elimination"}</span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <Crown className="w-5 h-5 shrink-0 text-amber-400/70" />
              <h1 className="font-black text-foreground text-2xl leading-snug">{t.title}</h1>
            </div>
            {t.description && (
              <p className="text-sm text-foreground/50 font-medium leading-relaxed mt-2 max-w-lg">
                {linkifyText(t.description)}
              </p>
            )}
            <div className="flex items-center gap-3 flex-wrap mt-3">
              <span className="flex items-center gap-1.5 text-xs font-bold text-foreground/50"><Users size={13} /> {t.bracket_size} players</span>
              <span className="flex items-center gap-1.5 text-xs font-bold text-foreground/50"><Clock size={13} /> {fmtTime(t.time_control_secs)}{t.increment_secs > 0 ? ` +${t.increment_secs}s` : ""}</span>
            </div>
          </div>
        </div>

        {/* Prize pool hero card */}
        <div className="relative rounded-2xl p-4 mb-4 overflow-hidden"
          style={{ background: "linear-gradient(135deg, rgba(251,191,36,0.14), rgba(245,158,11,0.05))", border: "1px solid rgba(251,191,36,0.25)" }}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "linear-gradient(135deg,#fbbf24,#f59e0b)", boxShadow: "0 2px 10px rgba(245,158,11,0.35)" }}>
                <Trophy className="w-5 h-5 text-white" strokeWidth={2.25} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/40 mb-0.5">Prize Pool</p>
                <p className="text-2xl font-black leading-none truncate" style={{ background: "linear-gradient(135deg,#fbbf24,#f59e0b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  {t.prize_pool.toLocaleString()} <span className="text-sm">ZA</span>
                </p>
              </div>
            </div>
            <div className="text-right shrink-0 pl-3 border-l" style={{ borderColor: "rgba(251,191,36,0.25)" }}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/40 mb-0.5">Entry</p>
              <p className="text-base font-black text-foreground/70">{t.entry_fee > 0 ? `${t.entry_fee} ZA` : "FREE"}</p>
            </div>
          </div>
        </div>

        {/* Active match banner */}
        {myActiveFixture && (
          <div className="mb-4 rounded-2xl overflow-hidden" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}>
            <div className="flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <div>
                  <p className="text-sm font-black text-foreground">Your match is live now!</p>
                  <p className="text-[10px] text-foreground/40">{myActiveFixture.round_name} — vs {myActiveFixture.player1_id === user?.id ? myActiveFixture.player2?.username : myActiveFixture.player1?.username}</p>
                </div>
              </div>
              <button
                onClick={() => navigate(`/chess-tournament/${t.id}/match/${myActiveFixture.chess_room_id}`)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-white shrink-0"
                style={{ background: "linear-gradient(135deg,#dc2626,#ef4444)" }}>
                ♟ Play Now
              </button>
            </div>
          </div>
        )}

        {/* Live matches — anyone without a game of their own right now (never
            registered, eliminated already, or just waiting on their next
            round) gets a picker for whichever matches are currently live. */}
        {t.status === "active" && !myActiveFixture && (
          <LiveMatchesPanel fixtures={fixtures} userId={user?.id} tournamentId={tournamentId} />
        )}

        {/* Registration state: countdown or progress */}
        {(t.status === "registration" || t.status === "lobby") && (
          <div className="rounded-2xl p-6 mb-4 text-center" style={{ border: "1px solid color-mix(in srgb, var(--foreground) 7%, transparent)" }}>
            <p className="text-foreground/40 text-xs mb-4">{t.player_count ?? 0} of {t.bracket_size} spots filled</p>
            <div className="w-full max-w-xs mx-auto bg-foreground/[0.06] rounded-full h-2 mb-5">
              <div className="h-2 rounded-full transition-all" style={{ width: `${Math.min(((t.player_count ?? 0) / t.bracket_size) * 100, 100)}%`, background: "linear-gradient(90deg,#7c3aed,#a855f7)" }} />
            </div>
            {t.format === "group_knockout" && (
              <p className="text-[11px] text-foreground/25 mb-3">{t.group_count} groups · top {t.advance_per_group} per group advance to knockout</p>
            )}
            {t.status === "registration" && t.registration_end && !regExpired && regTimeLeft ? (
              <div className="w-full max-w-xs mx-auto rounded-2xl p-4" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)" }}>
                <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: "#ef4444" }}>⏳ Registration closes in</p>
                <div className="flex items-center justify-center gap-4">
                  {regTimeLeft.d > 0 && (
                    <div className="text-center"><p className="text-2xl font-black leading-none" style={{ color: "#ef4444" }}>{regTimeLeft.d}</p><p className="text-[9px] mt-1" style={{ color: "rgba(239,68,68,0.6)" }}>DAYS</p></div>
                  )}
                  <div className="text-center"><p className="text-2xl font-black leading-none" style={{ color: "#ef4444" }}>{String(regTimeLeft.h).padStart(2, "0")}</p><p className="text-[9px] mt-1" style={{ color: "rgba(239,68,68,0.6)" }}>HRS</p></div>
                  <div className="text-center"><p className="text-2xl font-black leading-none" style={{ color: "#ef4444" }}>{String(regTimeLeft.m).padStart(2, "0")}</p><p className="text-[9px] mt-1" style={{ color: "rgba(239,68,68,0.6)" }}>MIN</p></div>
                  <div className="text-center"><p className="text-2xl font-black leading-none" style={{ color: "#ef4444" }}>{String(regTimeLeft.s).padStart(2, "0")}</p><p className="text-[9px] mt-1" style={{ color: "rgba(239,68,68,0.6)" }}>SEC</p></div>
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-foreground/20">Bracket generates automatically when registration closes</p>
            )}
          </div>
        )}

        {/* Tabs */}
        {(t.status === "active" || t.status === "completed") && (
          <div className="flex gap-1 p-1 rounded-xl w-fit mb-5" style={{ background: "color-mix(in srgb, var(--foreground) 4%, transparent)" }}>
            {[
              { id: "fixtures" as const, label: "My Fixtures" },
              { id: "bracket" as const, label: "Bracket" },
              ...(t.format === "group_knockout" ? [{ id: "standings" as const, label: "Standings" }] : []),
              ...(t.status === "completed" ? [{ id: "results" as const, label: "🏆 Results" }] : []),
            ].map(tb => (
              <button key={tb.id} onClick={() => setTab(tb.id)}
                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${tab === tb.id ? "text-foreground" : "text-foreground/30 hover:text-foreground/50"}`}
                style={tab === tb.id ? { background: "rgba(124,58,237,0.5)" } : {}}>
                {tb.label}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="mb-6">
          {tab === "bracket" && (t.status === "active" || t.status === "completed") && (
            <BracketTree fixtures={fixtures} userId={user?.id} tournamentId={tournamentId} />
          )}
          {tab === "fixtures" && (t.status === "active" || t.status === "completed") && (
            <MyFixtures fixtures={fixtures} userId={user?.id} />
          )}
          {tab === "standings" && <GroupStandings standings={standings} userId={user?.id} />}
          {tab === "results" && <FinalResults results={results} userId={user?.id} />}
        </div>

        {/* CTA */}
        <div className="rounded-2xl p-5" style={{ border: "1px solid color-mix(in srgb, var(--foreground) 7%, transparent)" }}>
          <button onClick={() => setShowRules(true)}
            className="w-full flex items-center justify-center gap-1.5 mb-3 text-xs font-bold text-foreground/40 hover:text-violet-400 transition-colors">
            📜 How this tournament works — rules, time control & tiebreaks
          </button>
          {t.status === "registration" && !registered && (
            <button onClick={() => registerM.mutate()} disabled={registerM.isPending || (t.player_count ?? 0) >= t.bracket_size}
              className="w-full py-3.5 rounded-2xl font-black text-sm text-white transition-all hover:scale-[1.01] disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", boxShadow: "0 0 24px rgba(124,58,237,0.35)" }}>
              {registerM.isPending ? "Registering…" : (t.player_count ?? 0) >= t.bracket_size ? "Tournament Full" : t.entry_fee > 0 ? `Register — Pay ${t.entry_fee} ZA` : "Register Free"}
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
            <div className="flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-sm text-foreground/30" style={{ background: "color-mix(in srgb, var(--foreground) 4%, transparent)", border: "1px solid color-mix(in srgb, var(--foreground) 7%, transparent)" }}>
              ✓ Tournament complete — prizes paid out
            </div>
          )}
        </div>
      </div>

      {showRules && <ChessRulesModal t={t} onClose={() => setShowRules(false)} />}
    </div>
  );
}

// ── Rules modal — explains format, time control, and how draws/tiebreaks work ──
function ChessRulesModal({ t, onClose }: { t: ChessTournament; onClose: () => void }) {
  const rows: { icon: string; title: string; body: string }[] = [
    {
      icon: "📐",
      title: t.format === "group_knockout" ? "Group Stage → Knockout" : "Single Elimination Knockout",
      body: t.format === "group_knockout"
        ? `Players are split into ${t.group_count} groups. Everyone plays everyone else in their group once. The top ${t.advance_per_group} from each group advance to a knockout bracket — lose in the knockout stage and you're out.`
        : "Players are randomly paired into a bracket. Win and you advance to the next round; lose and you're eliminated. If the number of players isn't a perfect power of 2, some players get a bye (automatic advance) in Round 1.",
    },
    {
      icon: "⏱",
      title: `${fmtTime(t.time_control_secs)}${t.increment_secs > 0 ? ` + ${t.increment_secs}s increment` : ""} per game`,
      body: "Each player gets this much time on their clock for the whole game. Run out of time and you lose the game automatically, same as any timed chess match.",
    },
    {
      icon: "🤝",
      title: "What happens if a game is drawn?",
      body: "A draw can't decide a knockout match, so the same two players replay immediately with colors swapped. Each time you draw, the time control drops by 1 minute — so games get faster the more you draw. If a game at the fastest 1-minute speed is still drawn, the next game becomes a sudden-death decider: one player is randomly given slightly less time but wins outright if that game ends in a draw, guaranteeing a result.",
    },
    {
      icon: "💰",
      title: t.entry_fee > 0 ? `${t.entry_fee} ZA entry fee` : "Free to enter",
      body: t.entry_fee > 0
        ? `Entry fees form the prize pool (currently ${t.prize_pool.toLocaleString()} ZA). Everyone who registers pays this once — no fee for individual matches.`
        : `This tournament is free to enter. The ${t.prize_pool.toLocaleString()} ZA prize pool is funded by Playza.`,
    },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(16px)" }} onClick={onClose}>
      <div className="w-full sm:max-w-lg max-h-[85vh] flex flex-col rounded-t-3xl sm:rounded-3xl overflow-hidden"
        style={{ background: "var(--card)", border: "1px solid rgba(124,58,237,0.25)" }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-foreground/[0.06] shrink-0">
          <h3 className="font-black text-foreground text-base flex items-center gap-2">📜 Tournament Rules</h3>
          <button onClick={onClose} className="text-foreground/30 hover:text-foreground transition-colors text-xl">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {rows.map((r, i) => (
            <div key={i} className="rounded-2xl p-4" style={{ background: "color-mix(in srgb, var(--foreground) 3%, transparent)", border: "1px solid color-mix(in srgb, var(--foreground) 7%, transparent)" }}>
              <p className="text-sm font-black text-foreground flex items-center gap-2 mb-1.5"><span>{r.icon}</span>{r.title}</p>
              <p className="text-xs text-foreground/50 leading-relaxed">{r.body}</p>
            </div>
          ))}
        </div>
        <div className="px-5 py-4 border-t border-foreground/[0.06] shrink-0">
          <button onClick={onClose}
            className="w-full py-3 rounded-2xl font-black text-sm text-white transition-all hover:scale-[1.01]"
            style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}>
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Tournament card ───────────────────────────────────────────────────────────
function TCard({ t, onOpen }: { t: ChessTournament; onOpen: () => void }) {
  const sc = STATUS_CFG[t.status as keyof typeof STATUS_CFG] ?? STATUS_CFG.registration;
  const fill = Math.min(((t.player_count ?? 0) / t.bracket_size) * 100, 100);
  const { timeLeft: regTimeLeft, expired: regExpired } = useCountdown(t.status === "registration" ? t.registration_end : null);
  const spotsLeft = t.bracket_size - (t.player_count ?? 0);
  const isHot = t.status === "registration" && spotsLeft > 0 && spotsLeft <= Math.max(2, Math.ceil(t.bracket_size * 0.15));

  return (
    <button onClick={onOpen} className="group relative text-left w-full rounded-2xl overflow-hidden transition-all hover:scale-[1.02] hover:-translate-y-0.5"
      style={{
        background: "color-mix(in srgb, var(--foreground) 2.5%, transparent)",
        border: `1px solid ${t.status === "active" ? "rgba(239,68,68,0.35)" : t.status === "registration" ? "rgba(124,58,237,0.3)" : "color-mix(in srgb, var(--foreground) 7%, transparent)"}`,
        boxShadow: t.status === "active" ? "0 0 24px rgba(239,68,68,0.12)" : t.status === "registration" ? "0 0 24px rgba(124,58,237,0.08)" : "none",
      }}>
      {/* Header strip — checkerboard motif (the game's own visual language) + status */}
      <div className="relative px-4 pt-3.5 pb-3 overflow-hidden"
        style={{ background: t.status === "active" ? "linear-gradient(135deg,rgba(239,68,68,0.14),rgba(124,58,237,0.08))" : "linear-gradient(135deg,rgba(124,58,237,0.14),rgba(168,85,247,0.06))" }}>
        {/* Corner checkerboard swatch — a literal chessboard corner, tilted, standing in for the generic chess-piece emoji */}
        <div className="absolute -right-4 -top-4 w-20 h-20 rotate-12 grid grid-cols-4 grid-rows-4 overflow-hidden rounded-md opacity-[0.14] pointer-events-none select-none">
          {Array.from({ length: 16 }).map((_, i) => {
            const row = Math.floor(i / 4);
            const isLight = (row + i) % 2 === 0;
            return <div key={i} style={{ background: isLight ? "var(--foreground)" : "transparent" }} />;
          })}
        </div>
        <div className="relative flex items-start justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: sc.dot, boxShadow: `0 0 6px ${sc.dot}` }} />
            <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: sc.dot }}>{sc.label}</span>
            {t.status === "active" && <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
            {isHot && (
              <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full text-white" style={{ background: "linear-gradient(135deg,#f97316,#ef4444)" }}>🔥 Filling fast</span>
            )}
          </div>
          <span className="text-[9px] text-foreground/25 font-bold shrink-0">{t.format === "group_knockout" ? "Group+KO" : "Knockout"}</span>
        </div>
        <div className="relative flex items-center gap-1.5">
          <Crown className="w-3.5 h-3.5 shrink-0 text-amber-400/70" />
          <h3 className="font-black text-foreground text-[15px] leading-snug line-clamp-2">{t.title}</h3>
        </div>
        {t.description && (
          <p className="relative text-[11px] text-foreground/40 font-medium leading-snug line-clamp-2 mt-1.5">
            {linkifyText(t.description)}
          </p>
        )}
      </div>

      {/* Thin alternating divider — a one-row chessboard rank, the card's connective tissue between header and stats */}
      <div className="flex h-[3px]">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="flex-1" style={{ background: i % 2 === 0 ? "#7c3aed" : "#a855f7", opacity: t.status === "active" ? 0.55 : 0.4 }} />
        ))}
      </div>

      <div className="px-4 pt-3 pb-4">
        {/* Prize pool — the hero element, now a proper card with a coin badge
            instead of a bare emoji, so it reads as the headline stat it is */}
        <div className="relative rounded-xl p-3 mb-2.5 overflow-hidden"
          style={{ background: "linear-gradient(135deg, rgba(251,191,36,0.14), rgba(245,158,11,0.05))", border: "1px solid rgba(251,191,36,0.25)" }}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: "linear-gradient(135deg,#fbbf24,#f59e0b)", boxShadow: "0 2px 10px rgba(245,158,11,0.35)" }}>
                <Trophy className="w-[18px] h-[18px] text-white" strokeWidth={2.25} />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-bold uppercase tracking-wider text-foreground/40 mb-0.5">Prize Pool</p>
                <p className="text-xl font-black leading-none truncate" style={{ background: "linear-gradient(135deg,#fbbf24,#f59e0b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  {t.prize_pool.toLocaleString()} <span className="text-xs">ZA</span>
                </p>
              </div>
            </div>
            <div className="text-right shrink-0 pl-2 border-l" style={{ borderColor: "rgba(251,191,36,0.25)" }}>
              <p className="text-[9px] font-bold uppercase tracking-wider text-foreground/40 mb-0.5">Entry</p>
              <p className="text-sm font-black text-foreground/70">{t.entry_fee > 0 ? `${t.entry_fee} ZA` : "FREE"}</p>
            </div>
          </div>
        </div>

        {/* Players + time control — icon chips instead of a plain emoji line */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5" style={{ background: "color-mix(in srgb, var(--foreground) 4%, transparent)" }}>
            <Users className="w-3.5 h-3.5 text-violet-400 shrink-0" strokeWidth={2.25} />
            <span className="text-[10.5px] font-bold text-foreground/60 truncate">{t.bracket_size} players</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5" style={{ background: "color-mix(in srgb, var(--foreground) 4%, transparent)" }}>
            <Clock className="w-3.5 h-3.5 text-violet-400 shrink-0" strokeWidth={2.25} />
            <span className="text-[10.5px] font-bold text-foreground/60 truncate">{fmtTime(t.time_control_secs)}{t.increment_secs ? ` +${t.increment_secs}s` : ""}</span>
          </div>
        </div>

        {t.status === "registration" && t.registration_end && !regExpired && regTimeLeft && (
          <div className="flex items-center justify-between gap-1.5 mb-3 px-2.5 py-1.5 rounded-lg" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
            <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: "#ef4444" }}>⏳ Closes in</span>
            <span className="text-[11px] font-black tabular-nums" style={{ color: "#ef4444" }}>
              {regTimeLeft.d > 0 ? `${regTimeLeft.d}d ` : ""}{String(regTimeLeft.h).padStart(2, "0")}:{String(regTimeLeft.m).padStart(2, "0")}:{String(regTimeLeft.s).padStart(2, "0")}
            </span>
          </div>
        )}

        <div className="mb-1">
          <div className="flex justify-between text-[9px] text-foreground/25 mb-1 font-bold">
            <span>{t.player_count ?? 0}/{t.bracket_size} registered</span>
            {t.status === "active" && <span className="text-violet-400 font-black">Round {t.current_round}</span>}
            {t.status === "registration" && spotsLeft > 0 && <span>{spotsLeft} spot{spotsLeft === 1 ? "" : "s"} left</span>}
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "color-mix(in srgb, var(--foreground) 6%, transparent)" }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${fill}%`, background: "linear-gradient(90deg,#7c3aed,#a855f7)" }} />
          </div>
        </div>

        {/* CTA pill — reinforces the action; whole card is clickable regardless */}
        <div className="mt-3 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-black transition-all"
          style={
            t.status === "active" ? { background: "linear-gradient(135deg,#dc2626,#ef4444)", color: "#fff" }
            : t.status === "registration" ? { background: "linear-gradient(135deg,#7c3aed,#a855f7)", color: "#fff" }
            : { background: "color-mix(in srgb, var(--foreground) 6%, transparent)", color: "var(--muted-foreground)" }
          }>
          {t.status === "active" ? "🔴 Watch / Play Live" : t.status === "registration" ? (t.entry_fee > 0 ? `Register — ${t.entry_fee} ZA →` : "Register Free →") : t.status === "completed" ? "View Results" : "View Bracket"}
        </div>
      </div>
    </button>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ChessTournamentPage() {
  const { tournamentId } = useParams<{ tournamentId?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedDetailTab = searchParams.get("tab") === "standings" ? "standings"
    : searchParams.get("tab") === "results" ? "results"
    : undefined;

  // A tournament ID in the URL now renders a full, dedicated page instead of
  // a modal overlaying the list — more room for the bracket, fixtures, and
  // (new) final results podium, and it's a real deep-linkable page.
  if (tournamentId) {
    return (
      <>
        <SEO title="Chess Tournament — Playza" description="Bracket, fixtures, standings, and results for this Playza chess tournament." />
        <TournamentDetailPage tournamentId={tournamentId} initialDetailTab={requestedDetailTab} />
      </>
    );
  }

  const validFilterTabs = ["registration", "active", "completed"] as const;
  const initialFilterTab = validFilterTabs.includes(searchParams.get("filter") as any)
    ? (searchParams.get("filter") as typeof validFilterTabs[number])
    : "registration";
  const [tab, setTabState] = useState<"registration" | "active" | "completed">(initialFilterTab);
  const setTab = (next: "registration" | "active" | "completed") => {
    setTabState(next);
    setSearchParams(prev => {
      const p = new URLSearchParams(prev);
      p.set("filter", next);
      return p;
    }, { replace: true });
  };
  const navigate = useNavigate();

  const { data: tournaments = [], isLoading } = useQuery({
    queryKey: ["chess-tournaments"],
    queryFn: getChessTournaments,
    refetchInterval: 15000,
  });

  const filtered = tournaments
    .filter(t =>
      tab === "registration" ? t.status === "registration" || t.status === "lobby"
      : tab === "active" ? t.status === "active"
      : t.status === "completed" || t.status === "cancelled"
    )
    .sort((a, b) => {
      if (tab === "completed") {
        return new Date(b.ended_at ?? b.created_at ?? 0).getTime() - new Date(a.ended_at ?? a.created_at ?? 0).getTime();
      }
      return 0; // preserve backend order (created_at desc) for other tabs
    });

  const openCount = tournaments.filter(t => t.status === "registration" || t.status === "lobby").length;
  const liveCount = tournaments.filter(t => t.status === "active").length;
  const completedCount = tournaments.filter(t => t.status === "completed" || t.status === "cancelled").length;
  const TABS: { id: typeof tab; label: string; count: number }[] = [
    { id: "registration", label: "Open", count: openCount },
    { id: "active", label: "🔴 Live", count: liveCount },
    { id: "completed", label: "Completed", count: completedCount },
  ];

  return (
    <>
      <SEO title="Chess Tournaments — Playza" description="Compete in Playza chess tournaments. Bracket and group-stage formats, real prizes." />

      <div className="dark min-h-screen pb-28" style={{ background: "radial-gradient(ellipse at top, rgba(124,58,237,0.1), transparent 60%), #0a0a12" }}>
        {/* Hero */}
        <div className="px-4 pt-8 pb-6 max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
              style={{ background: "linear-gradient(135deg,rgba(124,58,237,0.3),rgba(88,28,135,0.2))", border: "1px solid rgba(124,58,237,0.3)" }}>♟</div>
            <div>
              <h1 className="text-2xl font-black text-foreground leading-none">Chess Tournaments</h1>
              <p className="text-xs text-foreground/30 mt-0.5">Brackets, groups, real prizes. Your move.</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-4 max-w-2xl mx-auto">
          <div className="flex gap-1 p-1 rounded-xl w-fit mb-5" style={{ background: "color-mix(in srgb, var(--foreground) 4%, transparent)" }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${tab === t.id ? "text-foreground" : "text-foreground/30 hover:text-foreground/50"}`}
                style={tab === t.id ? { background: "rgba(124,58,237,0.5)" } : {}}>
                {t.label}
                <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: tab === t.id ? "rgba(255,255,255,0.2)" : "color-mix(in srgb, var(--foreground) 8%, transparent)" }}>
                  {t.count}
                </span>
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
              <span className="text-5xl text-foreground/10">♟</span>
              <p className="font-black text-foreground/20">No {tab} chess tournaments</p>
              <p className="text-xs text-foreground/10">Check back soon</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filtered.map(t => (
                <TCard key={t.id} t={t} onOpen={() => navigate(`/chess-tournament/${t.id}`)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}