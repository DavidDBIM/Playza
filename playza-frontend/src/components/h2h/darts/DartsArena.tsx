import { useState, useEffect, useRef, useCallback } from "react";
import { submitDartsThrow, resignDartsGame } from "@/api/darts.api";
import { useToast } from "@/context/toast";
import { Flag, ListOrdered, Volume2, VolumeX, X } from "lucide-react";
import H2HWinner from "../H2HWinner";
import { ZASymbol } from "@/components/currency/ZASymbol";
import type { UserProfile } from "@/context/auth";
import { buildBoardImage, boardHalf, drawWall, drawDart3D, drawStuckDart, drawHitHighlight, drawImpact, type Tint } from "./dartsRenderer";

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
const HAND_SCALE = 1.4; // the dart you hold is drawn large — the camera sits right behind it

// One place for the layout so the canvas and the HTML overlays always agree.
function layoutFor(W: number, H: number) {
  const R = Math.max(56, Math.min(W * 0.4, (H - 76) / 3.85));
  const u = R / 170;
  return { R, u, cx: W / 2, cy: R * 1.25 + 8, sx: W / 2, sy: H - 150 * u * HAND_SCALE - 40 };
}

// ── Checkout helper: the shortest route that finishes on a double ──────────
interface Opt { s: number; l: string; dbl: boolean }
const OPTS: Opt[] = (() => {
  const o: Opt[] = [];
  for (let n = 20; n >= 1; n--) o.push({ s: n * 3, l: `T${n}`, dbl: false }, { s: n * 2, l: `D${n}`, dbl: true }, { s: n, l: `${n}`, dbl: false });
  o.push({ s: 50, l: "BULL", dbl: true }, { s: 25, l: "25", dbl: false });
  return o.sort((a, b) => b.s - a.s);
})();
function checkoutRoute(rem: number, maxDarts: number): string[] | null {
  if (rem < 2 || rem > 170 || maxDarts < 1) return null;
  const fin = OPTS.filter((o) => o.dbl);
  const f1 = fin.find((o) => o.s === rem);
  if (f1) return [f1.l];
  if (maxDarts >= 2) {
    for (const a of OPTS) { if (a.s >= rem) continue; const f = fin.find((o) => o.s === rem - a.s); if (f) return [a.l, f.l]; }
  }
  if (maxDarts >= 3) {
    for (const a of OPTS) for (const b of OPTS) { if (a.s + b.s >= rem) continue; const f = fin.find((o) => o.s === rem - a.s - b.s); if (f) return [a.l, b.l, f.l]; }
  }
  return null;
}

interface DartHit { dx: number; dy: number; score: number; label: string; isDouble: boolean }
interface LastTurn { by: "host" | "guest"; darts: DartHit[]; busted: boolean; turnNumber: number }
interface HistoryEntry { by: "host" | "guest"; turnNumber: number; darts: { score: number; label: string }[]; busted: boolean; remaining: number }
interface DartsGameState {
  hostScore: number;
  guestScore: number;
  turnStartScore: number;
  turnDarts: DartHit[];
  turnNumber: number;
  lastEvent: { by: "host" | "guest"; label: string; score: number; busted: boolean; checkout: boolean; dx: number; dy: number } | null;
  lastTurn?: LastTurn;
  history?: HistoryEntry[];
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

interface Mark { dx: number; dy: number; tint: Tint; until?: number }
interface Hit { dx: number; dy: number; x: number; y: number; t0: number; big: boolean }
interface Fly { x0: number; y0: number; x1: number; y1: number; t0: number; dur: number; mine: boolean; s0: number; onLand: () => void }

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
  const [showBoard, setShowBoard] = useState(false);
  const [soundOn, setSoundOn] = useState(() => { try { return localStorage.getItem("playza_darts_sound") !== "0"; } catch { return true; } });
  const [showTip, setShowTip] = useState(() => { try { return localStorage.getItem("playza_darts_tip_v2") !== "1"; } catch { return true; } });

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
  const hits = useRef<Hit[]>([]);
  const ghost = useRef<{ x: number; y: number } | null>(null);
  const prevTurnDarts = useRef<DartHit[]>([]);
  const replayUntil = useRef(0);
  const seenTurn = useRef<string | null>(null);
  const seenEvent = useRef<DartsGameState["lastEvent"]>(null);
  const timers = useRef<number[]>([]);
  const popId = useRef(0);
  const handScale = useRef(HAND_SCALE);
  const audioRef = useRef<AudioContext | null>(null);
  const soundRef = useRef(soundOn);
  useEffect(() => { soundRef.current = soundOn; try { localStorage.setItem("playza_darts_sound", soundOn ? "1" : "0"); } catch { /* ignore */ } }, [soundOn]);

  // Small synthesised sound effects (no audio files to load). Created on the first touch (iOS requires it).
  const ensureAudio = () => {
    if (!audioRef.current) {
      try {
        const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (AC) audioRef.current = new AC();
      } catch { /* no audio */ }
    }
    if (audioRef.current?.state === "suspended") void audioRef.current.resume();
  };
  const sfx = useCallback((kind: "whoosh" | "thud" | "ping" | "bust") => {
    const ac = audioRef.current;
    if (!ac || !soundRef.current) return;
    const t = ac.currentTime;
    const noise = (dur: number) => {
      const buf = ac.createBuffer(1, Math.floor(ac.sampleRate * dur), ac.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
      const src = ac.createBufferSource(); src.buffer = buf; return src;
    };
    const env = (g: GainNode, peak: number, dur: number) => { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); };
    if (kind === "whoosh") {
      const n = noise(0.28), f = ac.createBiquadFilter(), g = ac.createGain();
      f.type = "bandpass"; f.frequency.setValueAtTime(500, t); f.frequency.exponentialRampToValueAtTime(2400, t + 0.26); f.Q.value = 0.8;
      env(g, 0.12, 0.28); n.connect(f); f.connect(g); g.connect(ac.destination); n.start(t);
    } else if (kind === "thud") {
      const n = noise(0.12), f = ac.createBiquadFilter(), g = ac.createGain();
      f.type = "lowpass"; f.frequency.value = 900; env(g, 0.5, 0.12); n.connect(f); f.connect(g); g.connect(ac.destination); n.start(t);
      const o = ac.createOscillator(), og = ac.createGain();
      o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(55, t + 0.12); env(og, 0.5, 0.14);
      o.connect(og); og.connect(ac.destination); o.start(t); o.stop(t + 0.15);
    } else if (kind === "ping") {
      [988, 1480].forEach((fr, i) => {
        const o = ac.createOscillator(), g = ac.createGain();
        o.type = "sine"; o.frequency.value = fr; g.gain.setValueAtTime(0.0001, t + i * 0.07);
        g.gain.exponentialRampToValueAtTime(0.18, t + i * 0.07 + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.07 + 0.35);
        o.connect(g); g.connect(ac.destination); o.start(t + i * 0.07); o.stop(t + i * 0.07 + 0.4);
      });
    } else {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = "sawtooth"; o.frequency.setValueAtTime(240, t); o.frequency.exponentialRampToValueAtTime(70, t + 0.35);
      env(g, 0.16, 0.36); o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + 0.4);
    }
  }, []);
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
    const { R, cx, cy, sx, sy } = layoutFor(W, H);
    geom.current = { cx, cy, R, W, H, dpr, sx, sy };
    boardImg.current = buildBoardImage(R, RING, dpr);
  }, [dims]);

  // ── Server marks / lingering darts ──
  useEffect(() => {
    const next = room.game_state.turnDarts || [];
    const prev = prevTurnDarts.current;
    if (next.length < prev.length) {
      // a turn just ended — keep its darts (including my last, still pending) on the board for a moment
      const until = performance.now() + 1400;
      const prevTint: Tint = serverMarks.current[0]?.tint ?? "me";
      linger.current = [
        ...prev.map((d) => ({ dx: d.dx, dy: d.dy, tint: prevTint, until })),
        ...pending.current.map((d) => ({ ...d, until })),
      ];
    }
    prevTurnDarts.current = next;
    serverMarks.current = next.map((d) => ({ dx: d.dx, dy: d.dy, tint: (live.current.myTurn ? "me" : "opp") as Tint }));
    pending.current = [];
  }, [room.game_state.turnDarts, room.game_state.turnNumber]);

  // ── Opponent's darts ──
  const flyOpponentDart = useCallback((dx: number, dy: number, delay: number, label: string, score: number, last: { busted?: boolean }) => {
    const id = window.setTimeout(() => {
      const g = geom.current;
      fly.current = {
        x0: g.W / 2 + (Math.random() - 0.5) * g.W * 0.25, y0: -20,
        x1: g.cx + dx * g.R, y1: g.cy + dy * g.R,
        t0: performance.now(), dur: 420, mine: false, s0: 0.9,
        onLand: () => {
          replayMarks.current.push({ dx, dy, tint: "opp" });
          const g2 = geom.current; hits.current.push({ dx, dy, x: g2.cx + dx * g2.R, y: g2.cy + dy * g2.R, t0: performance.now(), big: score >= 40 });
          showPop(`${oppName}: ${label}${score ? ` +${score}` : ""}`, popColor(score, label));
          if (last.busted) window.setTimeout(() => { setBanner("BUST!"); window.setTimeout(() => setBanner(null), 1400); }, 450);
          if (navigator.vibrate) navigator.vibrate(12);
          sfx("thud");
        },
      };
    }, delay);
    timers.current.push(id);
  }, [oppName, showPop, sfx]);

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
    pending.current.push({ dx, dy, tint: "me" });
    hits.current.push({ dx, dy, x, y, t0: performance.now(), big: res.score >= 40 });
    ghost.current = { x, y };
    showPop(res.score ? `${res.label}  +${res.score}` : "MISS", popColor(res.score, res.label));
    if (navigator.vibrate) navigator.vibrate(res.score >= 40 ? [15, 30, 15] : 12);
    sfx("thud"); if (res.score >= 40) window.setTimeout(() => sfx("ping"), 90);
    try { localStorage.setItem("playza_darts_tip_v2", "1"); } catch { /* ignore */ }
    setShowTip(false);
    setPhase("submit");
    submitDartsThrow(room.id, dx, dy)
      .then((data) => {
        const evt = data?.game_state?.lastEvent;
        if (evt?.busted && evt.by === myKey) { sfx("bust"); setBanner("BUST!"); window.setTimeout(() => setBanner(null), 1500); }
      })
      .catch((err) => toast.error(err instanceof Error ? err.message : "Throw failed"))
      .finally(() => setPhase("idle"));
  }, [room.id, toast, showPop, myKey, sfx]);
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
    ensureAudio();
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
    fly.current = { x0: sx + (d.x - d.x0), y0: sy + Math.max(-geom.current.H * 0.5, Math.min(geom.current.H * 0.025, d.y - d.y0)), x1, y1, t0: performance.now(), dur: 380, mine: true, s0: handScale.current, onLand: () => onLandMine.current(x1, y1) };
    sfx("whoosh");
    setPhase("fly");
  };

  // ── Render loop ──
  useEffect(() => {
    let raf = 0;
    const loop = (now: number) => {
      const canvas = canvasRef.current;
      const bi = boardImg.current;
      const { cx, cy, R, W, H, dpr, sx, sy } = geom.current;
      if (canvas && bi && W > 0) {
        if (canvas.width !== Math.round(W * dpr)) { canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr); }
        const ctx = canvas.getContext("2d")!;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, W, H);

        drawWall(ctx, W, H, cx, cy, R);
        const half = boardHalf(bi, dpr);
        ctx.drawImage(bi, cx - half, cy - half, half * 2, half * 2);

        // flash the region that was just hit
        hits.current = hits.current.filter((h) => now - h.t0 < 1000);
        hits.current.forEach((h) => {
          drawHitHighlight(ctx, cx, cy, R, RING, h.dx, h.dy, (now - h.t0) / 1000);
          drawImpact(ctx, h.x, h.y, R, (now - h.t0) / 650, h.big);
        });

        // previous throw marker so you can calibrate
        if (ghost.current && live.current.myTurn && (phaseRef.current === "idle" || phaseRef.current === "drag")) {
          ctx.strokeStyle = "rgba(255,255,255,.55)"; ctx.lineWidth = 1.2; ctx.setLineDash([3, 3]);
          ctx.beginPath(); ctx.arc(ghost.current.x, ghost.current.y, R * 0.035, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
        }

        // darts stuck in the board (tip exactly on the landing point)
        const stuck = (m: Mark, alpha: number) => drawStuckDart(ctx, cx + m.dx * R, cy + m.dy * R, R, alpha, m.tint);
        serverMarks.current.forEach((m) => stuck(m, 1));
        pending.current.forEach((m) => stuck(m, 1));
        replayMarks.current.forEach((m) => stuck(m, 1));
        linger.current = linger.current.filter((m) => (m.until ?? 0) > now);
        linger.current.forEach((m) => stuck(m, Math.min(1, ((m.until ?? 0) - now) / 400)));

        // flying dart (with a short motion trail)
        const f = fly.current;
        if (f) {
          const k = Math.min((now - f.t0) / f.dur, 1);
          const at = (kk: number) => {
            const e = 1 - Math.pow(1 - kk, 2.2);
            return { e, x: f.x0 + (f.x1 - f.x0) * e, y: f.y0 + (f.y1 - f.y0) * e - (f.mine ? Math.sin(Math.PI * kk) * H * 0.07 : 0) };
          };
          const tint: Tint = f.mine ? "me" : "opp";
          const sc = (e: number) => (f.mine ? f.s0 - (f.s0 - 0.36) * e : 0.9 - 0.5 * e);
          const ang = (kk: number) => (f.mine ? ((f.x1 - f.x0) / W) * 0.3 * kk : Math.PI);
          [0.16, 0.08].forEach((lag, i) => {
            if (k - lag <= 0) return;
            const t = at(k - lag);
            ctx.globalAlpha = 0.16 - i * 0.07;
            drawDart3D(ctx, t.x, t.y, sc(t.e), ang(k - lag), R, tint, false);
            ctx.globalAlpha = 1;
          });
          const cur = at(k);
          drawDart3D(ctx, cur.x, cur.y, sc(cur.e), ang(k), R, tint);
          if (k >= 1) { fly.current = null; f.onLand(); }
        }

        // dart in hand
        if (live.current.myTurn && (phaseRef.current === "idle" || phaseRef.current === "drag") && now >= replayUntil.current) {
          let x = sx, y = sy, sc = HAND_SCALE, tilt = 0;
          const d = drag.current;
          if (phaseRef.current === "drag" && d) {
            x = sx + (d.x - d.x0); y = sy + Math.max(-H * 0.5, Math.min(H * 0.025, d.y - d.y0));
            // pulling back brings the dart toward the camera; flicking forward sends it away
            const pull = Math.max(0, Math.min(1, (d.y - d.y0) / (H * 0.18)));
            sc = HAND_SCALE + pull * 0.3; tilt = ((d.x - d.x0) / W) * 0.35;
          } else {
            // gentle idle sway so the dart feels held, not pasted
            const t = now / 1000; x = sx + Math.sin(t * 1.6) * 2.2; y = sy + Math.sin(t * 2.1) * 1.8; tilt = Math.sin(t * 1.3) * 0.015;
          }
          handScale.current = sc;
          drawDart3D(ctx, x, y, sc, tilt, R, "me");
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

  const history = room.game_state.history ?? [];
  const dartsLeft = Math.max(0, 3 - dartsThrownThisTurn);
  const route = myTurnLive ? checkoutRoute(myScore, dartsLeft) : null;
  const avgFor = (by: "host" | "guest") => {
    const turns = history.filter((h) => h.by === by);
    if (!turns.length) return "–";
    const pts = turns.reduce((sum, h) => sum + (h.busted ? 0 : h.darts.reduce((a, d) => a + d.score, 0)), 0);
    return (pts / turns.length).toFixed(1);
  };
  const lay = layoutFor(dims.w, dims.h);
  const handTipY = lay.sy;
  const dartChipColor = (score: number, label: string) =>
    label === "MISS" ? "bg-slate-700 text-slate-300" : label.startsWith("TREBLE") || label === "BULLSEYE" ? "bg-amber-400/20 text-amber-300" : label.startsWith("DOUBLE") ? "bg-rose-500/20 text-rose-300" : score >= 25 ? "bg-emerald-500/20 text-emerald-300" : "bg-white/10 text-white";

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
    <div className="relative overflow-hidden w-full max-w-[460px] mx-auto rounded-[28px] p-3 sm:p-4 space-y-3 select-none text-white bg-linear-to-b from-[#141c36] to-[#070914] border border-white/10 shadow-[0_24px_60px_-24px_rgba(15,23,42,0.7)]">
      <style>{`@keyframes dartsPop{0%{opacity:0;transform:translate(-50%,10px) scale(.7)}18%{opacity:1;transform:translate(-50%,0) scale(1.08)}100%{opacity:0;transform:translate(-50%,-34px) scale(1)}}
@keyframes dartsRise{0%{opacity:0;transform:translateY(14px)}35%{opacity:1}100%{opacity:0;transform:translateY(-30px)}}
@keyframes dartsSheet{0%{transform:translateY(100%)}100%{transform:translateY(0)}}
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

      {/* Checkout helper */}
      <div className="h-5 -mt-1 flex items-center justify-center">
      {myTurnLive && myScore <= 170 && (
        <div className="flex items-center justify-center gap-2">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Checkout</span>
          {route ? route.map((r, i) => (
            <span key={i} className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-[11px] font-black tabular-nums">{r}</span>
          )) : <span className="text-[10px] font-bold text-slate-400">{myScore <= 1 ? "Set up your finish" : myScore > 100 ? "Go for T20" : "Set up a double"}</span>}
        </div>
      )}
      </div>

      {/* Board */}
      <div ref={wrapRef} className="relative w-full h-[min(68dvh,600px)] min-h-[380px] rounded-2xl overflow-hidden bg-[#070912] border border-white/10 ring-1 ring-black/40">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full touch-none"
          style={{ cursor: myTurn && phase === "idle" ? "grab" : "default", width: "100%", height: "100%" }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        />

        <button onClick={() => setShowBoard(true)} aria-label="Open scoreboard"
          className="absolute left-2 top-2 z-10 flex items-center gap-1 h-8 px-2.5 rounded-full bg-black/50 backdrop-blur-md border border-white/15 text-white text-[9px] font-black uppercase tracking-widest active:scale-95 transition-transform">
          <ListOrdered className="w-3.5 h-3.5" /><span className="hidden min-[360px]:inline">Scores</span>
        </button>
        <button onClick={() => { ensureAudio(); setSoundOn((v) => !v); }} aria-label={soundOn ? "Mute sound" : "Unmute sound"}
          className="absolute right-2 top-2 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-black/50 backdrop-blur-md border border-white/15 text-white active:scale-95 transition-transform">
          {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
        </button>

        {showTip && myTurnLive && phase === "idle" && (
          <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 flex flex-col items-center -space-y-3 text-emerald-300" style={{ top: Math.max(8, handTipY - 58) }}>
            {[0, 1, 2].map((i) => (
              <svg key={i} width="30" height="18" viewBox="0 0 30 18" fill="none" style={{ animation: `dartsRise 1.4s ease-out ${i * 0.22}s infinite` }}>
                <path d="M3 15 L15 4 L27 15" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ))}
          </div>
        )}

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

        <div className={`pointer-events-none absolute left-0 right-0 bottom-2 text-center text-[11px] font-black uppercase tracking-[0.14em] ${showTip ? "text-emerald-300" : "text-slate-300"}`} style={{ textShadow: "0 1px 3px #000" }}>
          {myTurnLive && phase === "idle" ? (showTip ? "Swipe the dart up the screen to throw" : "Flick the dart up to throw") : ""}
        </div>
      </div>

      <div className="flex justify-center">
        <button onClick={handleResign} className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-400 transition-colors py-2 px-4">
          <Flag className="w-3 h-3" /> Resign Match
        </button>
      </div>

      {showBoard && (
        <div className="absolute inset-0 z-30 flex flex-col justify-end bg-black/55" onClick={() => setShowBoard(false)}>
          <div className="max-h-[82%] overflow-y-auto rounded-t-3xl bg-[#0d1226] border-t border-white/15 p-4 pb-6" style={{ animation: "dartsSheet .28s ease-out" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-headline text-lg font-black italic uppercase text-white">Scoreboard</h3>
              <button onClick={() => setShowBoard(false)} aria-label="Close scoreboard" className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white"><X className="w-4 h-4" /></button>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              {[{ n: "You", sc: myScore, av: avgFor(myKey), you: true }, { n: oppName, sc: oppScore, av: avgFor(myKey === "host" ? "guest" : "host"), you: false }].map((c) => (
                <div key={c.n} className={`rounded-2xl p-3 border ${c.you ? "bg-indigo-500/15 border-indigo-400/40" : "bg-white/5 border-white/10"}`}>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 truncate">{c.n}</p>
                  <p className="text-3xl font-black text-white tabular-nums leading-tight">{c.sc}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Avg / turn <span className="text-white">{c.av}</span></p>
                </div>
              ))}
            </div>

            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Turn by turn · race to 0 (finish on a double)</p>
            {history.length === 0 && dartsThrownThisTurn === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center">No darts thrown yet — your first turn is waiting.</p>
            ) : (
              <div className="space-y-1.5">
                {dartsThrownThisTurn > 0 && (
                  <div className="flex items-center gap-2 rounded-xl bg-white/5 border border-dashed border-white/15 px-3 py-2">
                    <span className="w-14 shrink-0 text-[10px] font-black uppercase tracking-widest text-indigo-300 truncate">{myTurn ? "You" : oppName}</span>
                    <div className="flex flex-wrap gap-1 flex-1">
                      {room.game_state.turnDarts.map((d, i) => <span key={i} className={`px-1.5 py-0.5 rounded text-[11px] font-black tabular-nums ${dartChipColor(d.score, d.label)}`}>{d.score}</span>)}
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">live</span>
                  </div>
                )}
                {[...history].reverse().map((h, i) => {
                  const mine = h.by === myKey;
                  return (
                    <div key={`${h.turnNumber}-${i}`} className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2">
                      <span className={`w-14 shrink-0 text-[10px] font-black uppercase tracking-widest truncate ${mine ? "text-indigo-300" : "text-slate-300"}`}>{mine ? "You" : oppName}</span>
                      <div className="flex flex-wrap gap-1 flex-1">
                        {h.darts.map((d, j) => <span key={j} className={`px-1.5 py-0.5 rounded text-[11px] font-black tabular-nums ${dartChipColor(d.score, d.label)}`}>{d.score}</span>)}
                        {h.busted && <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase bg-red-500/25 text-red-300">Bust</span>}
                      </div>
                      <span className="text-sm font-black text-white tabular-nums">{h.remaining}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}