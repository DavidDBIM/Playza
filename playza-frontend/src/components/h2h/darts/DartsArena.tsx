import { useState, useEffect, useRef, useCallback } from "react";
import { submitDartsThrow, resignDartsGame } from "@/api/darts.api";
import { useToast } from "@/context/toast";
import { Flag } from "lucide-react";
import H2HWinner from "../H2HWinner";
import { ZASymbol } from "@/components/currency/ZASymbol";
import type { UserProfile } from "@/context/auth";

// ── Board geometry — identical to the server's scoring (darts.service.ts) ──
const SYSTEM_BOT_ID = "00000000-0000-0000-0000-000000000000";
const SEGMENT_ORDER = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];
const RING = { innerBull: 0.045, outerBull: 0.11, tripleIn: 0.56, tripleOut: 0.64, doubleIn: 0.92, doubleOut: 1.0 };

// ── Throw physics — the same flick as Solo Earn Darts ──────────────────────
// Swipe direction aims left/right, swipe speed sets height. No randomness:
// the same swipe always lands in the same place.
const SWEET_SPEED = 2.0; // screen-heights per second that lands at bullseye height
const HEIGHT_GAIN = 0.55; // board radii of height per 1 screen-height/s
const MIN_SPEED = 0.6;

interface DartHit { dx: number; dy: number; score: number; label: string; isDouble: boolean }
interface LastTurn { by: "host" | "guest"; darts: DartHit[]; busted: boolean; turnNumber: number }
interface DartsGameState {
  hostScore: number;
  guestScore: number;
  turnStartScore: number;
  turnDarts: DartHit[];
  turnNumber: number;
  lastEvent: { by: "host" | "guest"; label: string; score: number; busted: boolean; checkout: boolean; dx: number; dy: number } | null;
  lastTurn?: LastTurn;
}
interface DartsRoom {
  id: string;
  code: string;
  status: string;
  stake: number;
  starting_score: number;
  current_turn: string | null;
  winner_id: string | null;
  host_id: string;
  guest_id: string | null;
  host: { id: string; username: string; avatar_url: string | null };
  guest?: { id: string; username: string; avatar_url: string | null } | null;
  game_state: DartsGameState;
}
interface DartsArenaProps { room: DartsRoom; user: UserProfile | null }

interface Mark { dx: number; dy: number; until?: number }
interface Fly { x0: number; y0: number; x1: number; y1: number; t0: number; dur: number; mine: boolean; onLand: () => void }

function scoreAt(dx: number, dy: number) {
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist > RING.doubleOut) return { score: 0, label: "MISS" };
  if (dist <= RING.innerBull) return { score: 50, label: "BULLSEYE" };
  if (dist <= RING.outerBull) return { score: 25, label: "OUTER BULL" };
  let angle = (Math.atan2(dx, -dy) * 180) / Math.PI;
  if (angle < 0) angle += 360;
  const num = SEGMENT_ORDER[Math.floor(((angle + 9) % 360) / 18)];
  if (dist >= RING.tripleIn && dist <= RING.tripleOut) return { score: num * 3, label: `TREBLE ${num}` };
  if (dist >= RING.doubleIn && dist <= RING.doubleOut) return { score: num * 2, label: `DOUBLE ${num}` };
  return { score: num, label: `${num}` };
}

const popColor = (score: number, label: string) =>
  label === "MISS" ? "#94a3b8" : label === "BULLSEYE" || label.startsWith("TREBLE") ? "#fbbf24" : label.startsWith("DOUBLE") || score >= 25 ? "#fb7185" : "#ffffff";

export default function DartsArena({ room, user }: DartsArenaProps) {
  const toast = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 360, h: 520 });

  const isHost = room.host_id === user?.id;
  const myKey: "host" | "guest" = isHost ? "host" : "guest";
  const myScore = isHost ? room.game_state.hostScore : room.game_state.guestScore;
  const oppScore = isHost ? room.game_state.guestScore : room.game_state.hostScore;
  const opponent = isHost ? room.guest : room.host;
  const isBotOpponent = room.guest_id === SYSTEM_BOT_ID;
  const oppName = opponent?.username || (isBotOpponent ? "Bot" : "Opponent");
  const myTurn = room.current_turn === user?.id && room.status === "active";
  const dartsThrownThisTurn = room.game_state.turnDarts?.length || 0;
  const turnPoints = (room.game_state.turnDarts || []).reduce((s, d) => s + d.score, 0);

  const [phase, setPhaseState] = useState<"idle" | "drag" | "fly" | "submit">("idle");
  const [replaying, setReplaying] = useState(false);
  const [pop, setPop] = useState<{ id: number; text: string; color: string } | null>(null);
  const [banner, setBanner] = useState<string | null>(null);

  // everything the animation loop needs lives in refs so it never reads stale state
  const phaseRef = useRef<"idle" | "drag" | "fly" | "submit">("idle");
  const setPhase = (p: "idle" | "drag" | "fly" | "submit") => { phaseRef.current = p; setPhaseState(p); };
  const live = useRef({ myTurn: false, active: false });
  const geom = useRef({ cx: 0, cy: 0, R: 0, sx: 0, sy: 0, W: 0, H: 0, dpr: 1 });
  const boardImg = useRef<HTMLCanvasElement | null>(null);
  const drag = useRef<{ x0: number; y0: number; x: number; y: number; samples: { x: number; y: number; t: number }[] } | null>(null);
  const liveSpeed = useRef(0);
  const fly = useRef<Fly | null>(null);
  const serverMarks = useRef<Mark[]>([]);
  const pending = useRef<Mark[]>([]);
  const linger = useRef<Mark[]>([]);
  const replayMarks = useRef<Mark[]>([]);
  const ghost = useRef<{ x: number; y: number } | null>(null);
  const prevTurnDarts = useRef<DartHit[]>([]);
  const replayUntil = useRef(0);
  const seenTurn = useRef<string | null>(null);
  const seenEvent = useRef<DartsGameState["lastEvent"]>(null);
  const timers = useRef<number[]>([]);
  const popId = useRef(0);
  const onLandMine = useRef<(x: number, y: number) => void>(() => {});

  const showPop = useCallback((text: string, color: string) => {
    popId.current += 1;
    setPop({ id: popId.current, text, color });
  }, []);

  useEffect(() => { live.current = { myTurn, active: room.status === "active" }; }, [myTurn, room.status]);
  useEffect(() => () => { timers.current.forEach(clearTimeout); }, []);

  // ── Size ──
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => setDims({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ── Layout + pre-rendered board (drawn once at device resolution = razor sharp) ──
  useEffect(() => {
    const { w: W, h: H } = dims;
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const R = Math.min(W * 0.375, H * 0.3);
    const cx = W / 2, cy = Math.max(R * 1.2, H * 0.34);
    const u = Math.max(R, 120) / 170;
    geom.current = { cx, cy, R, W, H, dpr, sx: W / 2, sy: H - 145 * u - 14 };

    const pad = R * 0.28, size = Math.ceil((R + pad) * 2);
    const bc = document.createElement("canvas");
    bc.width = Math.ceil(size * dpr); bc.height = Math.ceil(size * dpr);
    const b = bc.getContext("2d")!;
    b.scale(dpr, dpr);
    const c = size / 2;
    const wedge = (r0: number, r1: number, a0: number, a1: number, fill: string) => {
      b.beginPath(); b.arc(c, c, R * r1, a0, a1); b.arc(c, c, R * r0, a1, a0, true); b.closePath(); b.fillStyle = fill; b.fill();
    };
    b.beginPath(); b.arc(c, c, R * 1.2, 0, Math.PI * 2); b.fillStyle = "#0a0a10"; b.fill();
    b.lineWidth = 2; b.strokeStyle = "#2c3350"; b.stroke();
    for (let i = 0; i < 20; i++) {
      const a0 = ((-90 - 9 + i * 18) * Math.PI) / 180, a1 = a0 + (18 * Math.PI) / 180, dark = i % 2 === 0;
      const base = dark ? "#16161f" : "#eadfc4", ring = dark ? "#d3314c" : "#1b9a5e";
      wedge(RING.outerBull, RING.tripleIn, a0, a1, base);
      wedge(RING.tripleIn, RING.tripleOut, a0, a1, ring);
      wedge(RING.tripleOut, RING.doubleIn, a0, a1, base);
      wedge(RING.doubleIn, RING.doubleOut, a0, a1, ring);
    }
    b.beginPath(); b.arc(c, c, R * RING.outerBull, 0, Math.PI * 2); b.fillStyle = "#1b9a5e"; b.fill();
    b.beginPath(); b.arc(c, c, R * RING.innerBull, 0, Math.PI * 2); b.fillStyle = "#d3314c"; b.fill();
    b.strokeStyle = "rgba(205,212,235,.75)"; b.lineWidth = Math.max(0.8, R / 260);
    [RING.innerBull, RING.outerBull, RING.tripleIn, RING.tripleOut, RING.doubleIn, RING.doubleOut].forEach((r) => { b.beginPath(); b.arc(c, c, R * r, 0, Math.PI * 2); b.stroke(); });
    for (let i = 0; i < 20; i++) {
      const a = ((-90 - 9 + i * 18) * Math.PI) / 180;
      b.beginPath(); b.moveTo(c + Math.cos(a) * R * RING.outerBull, c + Math.sin(a) * R * RING.outerBull);
      b.lineTo(c + Math.cos(a) * R, c + Math.sin(a) * R); b.stroke();
    }
    b.fillStyle = "#f2f4ff"; b.font = `800 ${Math.max(10, R * 0.085)}px system-ui, sans-serif`; b.textAlign = "center"; b.textBaseline = "middle";
    for (let i = 0; i < 20; i++) {
      const am = ((-90 + i * 18) * Math.PI) / 180;
      b.fillText(String(SEGMENT_ORDER[i]), c + Math.cos(am) * R * 1.1, c + Math.sin(am) * R * 1.1);
    }
    boardImg.current = bc;
  }, [dims]);

  // ── Server marks / lingering darts ──
  useEffect(() => {
    const next = room.game_state.turnDarts || [];
    const prev = prevTurnDarts.current;
    if (next.length < prev.length) {
      // a turn just ended — keep its darts (including my last, still pending) on the board for a moment
      const until = performance.now() + 1400;
      linger.current = [...prev, ...pending.current].map((d) => ({ dx: d.dx, dy: d.dy, until }));
    }
    prevTurnDarts.current = next;
    serverMarks.current = next.map((d) => ({ dx: d.dx, dy: d.dy }));
    pending.current = [];
  }, [room.game_state.turnDarts, room.game_state.turnNumber]);

  // ── Opponent's darts ──
  const flyOpponentDart = useCallback((dx: number, dy: number, delay: number, label: string, score: number, last: { busted?: boolean }) => {
    const id = window.setTimeout(() => {
      const g = geom.current;
      fly.current = {
        x0: g.W / 2 + (Math.random() - 0.5) * g.W * 0.25, y0: -20,
        x1: g.cx + dx * g.R, y1: g.cy + dy * g.R,
        t0: performance.now(), dur: 420, mine: false,
        onLand: () => {
          replayMarks.current.push({ dx, dy });
          showPop(`${oppName}: ${label}${score ? ` +${score}` : ""}`, popColor(score, label));
          if (last.busted) window.setTimeout(() => { setBanner("BUST!"); window.setTimeout(() => setBanner(null), 1400); }, 450);
          if (navigator.vibrate) navigator.vibrate(12);
        },
      };
    }, delay);
    timers.current.push(id);
  }, [oppName, showPop]);

  // Bot plays a whole turn at once on the server — replay its darts one by one.
  useEffect(() => {
    const lt = room.game_state.lastTurn;
    if (!lt) return;
    const key = `${lt.turnNumber}-${lt.by}`;
    if (seenTurn.current === null) { seenTurn.current = key; return; } // don't replay on first load
    if (seenTurn.current === key) return;
    seenTurn.current = key;
    if (!isBotOpponent || lt.by === myKey) return;

    const STEP = 900;
    replayMarks.current = [];
    lt.darts.forEach((d, i) => flyOpponentDart(d.dx, d.dy, 350 + i * STEP, d.label, d.score, { busted: lt.busted && i === lt.darts.length - 1 }));
    const total = 350 + lt.darts.length * STEP + 600;
    replayUntil.current = performance.now() + total;
    setReplaying(true);
    const id = window.setTimeout(() => {
      setReplaying(false);
      const until = performance.now() + 900;
      linger.current = replayMarks.current.map((m) => ({ ...m, until }));
      replayMarks.current = [];
    }, total);
    timers.current.push(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.game_state.lastTurn]);

  // Human opponent: replay each dart as it arrives.
  useEffect(() => {
    const evt = room.game_state.lastEvent;
    if (!evt) return;
    if (seenEvent.current === null) { seenEvent.current = evt; return; }
    if (seenEvent.current === evt) return;
    seenEvent.current = evt;
    if (isBotOpponent || evt.by === myKey) return;
    flyOpponentDart(evt.dx, evt.dy, 0, evt.label, evt.score, { busted: evt.busted });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.game_state.lastEvent]);

  // ── Throwing ──
  const handleLand = useCallback((x: number, y: number) => {
    const { cx, cy, R } = geom.current;
    const dx = (x - cx) / R, dy = (y - cy) / R;
    const res = scoreAt(dx, dy);
    pending.current.push({ dx, dy });
    ghost.current = { x, y };
    showPop(res.score ? `${res.label}  +${res.score}` : "MISS", popColor(res.score, res.label));
    if (navigator.vibrate) navigator.vibrate(res.score >= 40 ? [15, 30, 15] : 12);
    setPhase("submit");
    submitDartsThrow(room.id, dx, dy)
      .then((data) => {
        const evt = data?.game_state?.lastEvent;
        if (evt?.busted && evt.by === myKey) { setBanner("BUST!"); window.setTimeout(() => setBanner(null), 1500); }
      })
      .catch((err) => toast.error(err instanceof Error ? err.message : "Throw failed"))
      .finally(() => setPhase("idle"));
  }, [room.id, toast, showPop, myKey]);
  useEffect(() => { onLandMine.current = handleLand; }, [handleLand]);

  const flickVelocity = (samples: { x: number; y: number; t: number }[]) => {
    if (samples.length < 2) return { vx: 0, vy: 0, speed: 0 };
    const last = samples[samples.length - 1];
    let first = samples[0];
    for (let i = samples.length - 2; i >= 0; i--) { first = samples[i]; if (last.t - samples[i].t >= 110) break; }
    const dt = Math.max(16, last.t - first.t) / 1000;
    const H = geom.current.H || 1;
    const vx = (last.x - first.x) / dt / H, vy = (last.y - first.y) / dt / H;
    return { vx, vy, speed: Math.hypot(vx, vy) };
  };

  const canThrow = () => live.current.myTurn && live.current.active && phaseRef.current === "idle" && performance.now() >= replayUntil.current;
  const pt = (e: React.PointerEvent) => { const r = canvasRef.current!.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top, t: performance.now() }; };

  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canThrow()) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const p = pt(e);
    drag.current = { x0: p.x, y0: p.y, x: p.x, y: p.y, samples: [p] };
    liveSpeed.current = 0;
    setPhase("drag");
  };
  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const d = drag.current;
    if (phaseRef.current !== "drag" || !d) return;
    const p = pt(e);
    d.x = p.x; d.y = p.y; d.samples.push(p);
    if (d.samples.length > 40) d.samples.shift();
    liveSpeed.current = flickVelocity(d.samples).speed;
  };
  const onUp = () => {
    const d = drag.current;
    if (phaseRef.current !== "drag" || !d) return;
    drag.current = null;
    const v = flickVelocity(d.samples);
    if (v.speed < MIN_SPEED || v.vy >= 0) { showPop("Flick UP faster", "#94a3b8"); setPhase("idle"); return; }
    const { cy, R, sx, sy } = geom.current;
    const theta = Math.atan2(v.vx, -v.vy);
    const x1 = sx + Math.tan(Math.max(-1.2, Math.min(1.2, theta))) * (sy - cy);
    const y1 = cy + (SWEET_SPEED - v.speed) * HEIGHT_GAIN * R;
    fly.current = { x0: sx, y0: sy, x1, y1, t0: performance.now(), dur: 380, mine: true, onLand: () => onLandMine.current(x1, y1) };
    setPhase("fly");
  };

  // ── Render loop ──
  useEffect(() => {
    let raf = 0;
    const draw = (ctx: CanvasRenderingContext2D, x: number, y: number, s: number, angle: number) => {
      const { R } = geom.current;
      const u = Math.max(R, 120) / 170;
      ctx.save(); ctx.translate(x, y); ctx.rotate(angle); ctx.scale(s, s);
      ctx.lineCap = "round";
      ctx.strokeStyle = "#e9edf7"; ctx.lineWidth = 2.2 * u; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 26 * u); ctx.stroke();
      const g = ctx.createLinearGradient(-5 * u, 0, 5 * u, 0);
      g.addColorStop(0, "#7b8499"); g.addColorStop(0.5, "#e6eaf3"); g.addColorStop(1, "#6a7388");
      ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(-4.6 * u, 24 * u, 9.2 * u, 44 * u, 3 * u); ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,.35)"; ctx.lineWidth = 0.8 * u;
      for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.moveTo(-4.6 * u, (30 + i * 5.2) * u); ctx.lineTo(4.6 * u, (30 + i * 5.2) * u); ctx.stroke(); }
      ctx.strokeStyle = "#cfd5e4"; ctx.lineWidth = 2 * u; ctx.beginPath(); ctx.moveTo(0, 68 * u); ctx.lineTo(0, 86 * u); ctx.stroke();
      const fl = (sign: number, col: string) => { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, 84 * u); ctx.lineTo(sign * 17 * u, 100 * u); ctx.lineTo(sign * 13 * u, 122 * u); ctx.lineTo(0, 112 * u); ctx.closePath(); ctx.fill(); };
      fl(-1, "#c9254a"); fl(1, "#ff4f78");
      ctx.fillStyle = "#2de6aa"; ctx.beginPath(); ctx.moveTo(0, 84 * u); ctx.lineTo(2.2 * u, 84 * u); ctx.lineTo(2.2 * u, 118 * u); ctx.lineTo(0, 112 * u); ctx.closePath(); ctx.fill();
      ctx.restore();
    };

    const loop = (now: number) => {
      const canvas = canvasRef.current;
      const bi = boardImg.current;
      const { cx, cy, R, W, H, dpr, sx, sy } = geom.current;
      if (canvas && bi && W > 0) {
        if (canvas.width !== Math.round(W * dpr)) { canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr); }
        const ctx = canvas.getContext("2d")!;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, W, H);

        ctx.save(); ctx.shadowColor = "rgba(70,110,255,.38)"; ctx.shadowBlur = 36;
        const half = bi.width / dpr / 2;
        ctx.drawImage(bi, cx - half, cy - half, half * 2, half * 2);
        ctx.restore();

        // previous throw marker so you can calibrate
        if (ghost.current && live.current.myTurn && (phaseRef.current === "idle" || phaseRef.current === "drag")) {
          ctx.strokeStyle = "rgba(255,255,255,.5)"; ctx.lineWidth = 1.2; ctx.setLineDash([3, 3]);
          ctx.beginPath(); ctx.arc(ghost.current.x, ghost.current.y, R * 0.035, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
        }

        // darts stuck in the board (tip exactly on the landing point)
        const stuck = (m: Mark, alpha: number) => { ctx.globalAlpha = alpha; draw(ctx, cx + m.dx * R, cy + m.dy * R, 0.42, 0); ctx.globalAlpha = 1; };
        serverMarks.current.forEach((m) => stuck(m, 1));
        pending.current.forEach((m) => stuck(m, 1));
        replayMarks.current.forEach((m) => stuck(m, 1));
        linger.current = linger.current.filter((m) => (m.until ?? 0) > now);
        linger.current.forEach((m) => stuck(m, Math.min(1, ((m.until ?? 0) - now) / 400)));

        // flying dart
        const f = fly.current;
        if (f) {
          const k = Math.min((now - f.t0) / f.dur, 1), e = 1 - Math.pow(1 - k, 2.2);
          const x = f.x0 + (f.x1 - f.x0) * e;
          const y = f.y0 + (f.y1 - f.y0) * e - (f.mine ? Math.sin(Math.PI * k) * H * 0.07 : 0);
          if (f.mine) draw(ctx, x, y, 1.05 - 0.63 * e, ((f.x1 - f.x0) / W) * 0.25);
          else draw(ctx, x, y, 0.9 - 0.48 * e, Math.PI);
          if (k >= 1) { fly.current = null; f.onLand(); }
        }

        // dart in hand
        if (live.current.myTurn && (phaseRef.current === "idle" || phaseRef.current === "drag") && now >= replayUntil.current) {
          let x = sx, y = sy;
          const d = drag.current;
          if (phaseRef.current === "drag" && d) {
            x = sx + (d.x - d.x0); y = sy + Math.max(-H * 0.5, Math.min(H * 0.06, d.y - d.y0));
          }
          draw(ctx, x, y, 1.05, 0);
          if (phaseRef.current === "drag") {
            const gw = Math.min(W * 0.5, 240), gh = 8, gx = (W - gw) / 2, gy = H - 16, max = SWEET_SPEED * 2;
            ctx.fillStyle = "rgba(255,255,255,.1)"; ctx.beginPath(); ctx.roundRect(gx, gy, gw, gh, 4); ctx.fill();
            ctx.fillStyle = "rgba(45,230,170,.45)"; ctx.fillRect(gx + gw * ((SWEET_SPEED - 0.12) / max), gy, gw * (0.24 / max), gh);
            const frac = Math.min(1, liveSpeed.current / max);
            ctx.fillStyle = Math.abs(liveSpeed.current - SWEET_SPEED) < 0.12 ? "#2de6aa" : "#fff";
            ctx.beginPath(); ctx.roundRect(gx, gy, Math.max(4, gw * frac), gh, 4); ctx.fill();
          }
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleResign = async () => {
    try { await resignDartsGame(room.id); } catch (err) { toast.error(err instanceof Error ? err.message : "Failed to resign"); }
  };

  if (room.status === "finished") {
    return <H2HWinner room={room as never} user={user} localWinnerId={room.winner_id} isSyncing={false} />;
  }

  // while the opponent's darts are being replayed it is visually THEIR turn, even though the server already passed it back
  const myTurnLive = myTurn && !replaying;
  const oppActive = room.status === "active" && !myTurnLive;
  const statusText = myTurnLive
    ? phase === "submit" ? "Throwing…" : "Your throw"
    : replaying ? `${oppName} is throwing…` : `${oppName}'s turn`;
  const prize = Math.round(room.stake * 1.8 * 100) / 100;

  const PlayerCard = ({ name, score, active, you, avatar }: { name: string; score: number; active: boolean; you?: boolean; avatar?: string | null }) => (
    <div className={`flex-1 min-w-0 rounded-2xl p-3 border transition-all ${active ? "bg-indigo-500/15 border-indigo-400/60 shadow-[0_0_24px_rgba(99,102,241,0.35)]" : "bg-white/5 border-white/10"}`}>
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-7 h-7 shrink-0 rounded-full overflow-hidden bg-slate-700 flex items-center justify-center text-[11px] font-black text-white">
          {avatar ? <img src={avatar} alt="" className="w-full h-full object-cover" /> : (isBotOpponent && !you ? "🤖" : name.charAt(0).toUpperCase())}
        </div>
        <p className={`text-[10px] font-black uppercase tracking-widest truncate ${you ? "text-indigo-300" : "text-slate-300"}`}>{you ? "You" : name}</p>
      </div>
      <p className="font-headline text-3xl font-black text-white leading-none tabular-nums">{score}</p>
    </div>
  );

  return (
    <div className="w-full max-w-md mx-auto space-y-3 select-none">
      <style>{`@keyframes dartsPop{0%{opacity:0;transform:translate(-50%,10px) scale(.7)}18%{opacity:1;transform:translate(-50%,0) scale(1.08)}100%{opacity:0;transform:translate(-50%,-34px) scale(1)}}
@keyframes dartsBanner{0%{opacity:0;transform:translate(-50%,-50%) scale(.6) rotate(-6deg)}20%{opacity:1;transform:translate(-50%,-50%) scale(1.1) rotate(-3deg)}100%{opacity:0;transform:translate(-50%,-50%) scale(1) rotate(-3deg)}}`}</style>

      {/* Scoreboard */}
      <div className="flex items-stretch gap-2">
        <PlayerCard name="You" score={myScore} active={myTurnLive} you avatar={user?.avatarUrl} />
        <div className="flex flex-col items-center justify-center shrink-0 px-1">
          <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Pot</span>
          <span className="font-black text-sm text-white flex items-center gap-0.5"><ZASymbol className="text-xs" />{prize}</span>
          <span className="text-[8px] font-bold uppercase tracking-widest text-slate-500 mt-0.5">to win</span>
        </div>
        <PlayerCard name={oppName} score={oppScore} active={oppActive} avatar={opponent?.avatar_url} />
      </div>

      {/* Turn strip */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span key={i} className={`h-1.5 w-7 rounded-full transition-colors ${myTurnLive ? (i < dartsThrownThisTurn ? "bg-slate-600" : "bg-indigo-400") : "bg-slate-700"}`} />
          ))}
        </div>
        <span className={`text-[10px] font-black uppercase tracking-widest ${myTurnLive ? "text-indigo-300" : "text-slate-400"}`}>{statusText}</span>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 tabular-nums">{myTurn && dartsThrownThisTurn > 0 ? `+${turnPoints}` : `Rd ${room.game_state.turnNumber}`}</span>
      </div>

      {/* Board */}
      <div ref={wrapRef} className="relative w-full h-[min(64vh,540px)] min-h-[420px] rounded-3xl overflow-hidden bg-[#05060f] border border-white/10">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full touch-none"
          style={{ cursor: myTurn && phase === "idle" ? "grab" : "default", width: "100%", height: "100%" }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        />

        {pop && (
          <div key={pop.id} className="pointer-events-none absolute left-1/2 top-[42%] whitespace-nowrap text-2xl md:text-3xl font-black italic"
            style={{ color: pop.color, textShadow: "0 0 18px currentColor, 0 2px 0 rgba(0,0,0,.6)", animation: "dartsPop 1s ease-out forwards" }}>
            {pop.text}
          </div>
        )}
        {banner && (
          <div className="pointer-events-none absolute left-1/2 top-1/2 px-6 py-2 rounded-xl bg-red-600 text-white text-3xl font-black italic tracking-wider shadow-2xl"
            style={{ animation: "dartsBanner 1.4s ease-out forwards" }}>{banner}</div>
        )}

        <div className="pointer-events-none absolute left-0 right-0 bottom-2 text-center text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
          {myTurn && phase === "idle" && !replaying ? "Flick the dart up to throw" : ""}
        </div>
      </div>

      <div className="flex justify-center">
        <button onClick={handleResign} className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-400 transition-colors py-2 px-4">
          <Flag className="w-3 h-3" /> Resign Match
        </button>
      </div>
    </div>
  );
}