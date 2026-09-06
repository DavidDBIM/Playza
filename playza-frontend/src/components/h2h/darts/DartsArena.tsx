import { useState, useEffect, useRef, useCallback } from "react";
import { submitDartsThrow, resignDartsGame } from "@/api/darts.api";
import { useToast } from "@/context/toast";
import { Loader2, Flag } from "lucide-react";
import H2HWinner from "../H2HWinner";
import { ZASymbol } from "@/components/currency/ZASymbol";
import type { UserProfile } from "@/context/auth";

const SYSTEM_BOT_ID = "00000000-0000-0000-0000-000000000bot";
const SEGMENT_ORDER = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];
const RING = { innerBull: 0.045, outerBull: 0.11, tripleIn: 0.56, tripleOut: 0.64, doubleIn: 0.92, doubleOut: 1.0 };

interface DartHit { dx: number; dy: number; score: number; label: string; isDouble: boolean }
interface DartsGameState {
  hostScore: number;
  guestScore: number;
  turnStartScore: number;
  turnDarts: DartHit[];
  turnNumber: number;
  lastEvent: { by: "host" | "guest"; label: string; score: number; busted: boolean; checkout: boolean; dx: number; dy: number } | null;
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

interface DartsArenaProps {
  room: DartsRoom;
  user: UserProfile | null;
}

// Same normalized scoring geometry as the Solo Earn game and the backend —
// used here purely for the LOCAL aim/animation preview. The score that
// actually counts always comes back from the server's own recomputation.
function scoreAt(dx: number, dy: number) {
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist > RING.doubleOut) return { score: 0, label: "MISS", isDouble: false };
  if (dist <= RING.innerBull) return { score: 50, label: "BULLSEYE", isDouble: true };
  if (dist <= RING.outerBull) return { score: 25, label: "OUTER BULL", isDouble: false };
  let angle = (Math.atan2(dx, -dy) * 180) / Math.PI;
  if (angle < 0) angle += 360;
  const idx = Math.floor(((angle + 9) % 360) / 18);
  const num = SEGMENT_ORDER[idx];
  if (dist >= RING.tripleIn && dist <= RING.tripleOut) return { score: num * 3, label: `TRIPLE ${num}`, isDouble: false };
  if (dist >= RING.doubleIn && dist <= RING.doubleOut) return { score: num * 2, label: `DOUBLE ${num}`, isDouble: true };
  return { score: num, label: `SINGLE ${num}`, isDouble: false };
}

function polar(cx: number, cy: number, r: number, deg: number): [number, number] {
  const rad = (deg * Math.PI) / 180;
  return [cx + r * Math.sin(rad), cy - r * Math.cos(rad)];
}

export default function DartsArena({ room, user }: DartsArenaProps) {
  const toast = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 320, h: 420 });

  const isHost = room.host_id === user?.id;
  const myScore = isHost ? room.game_state.hostScore : room.game_state.guestScore;
  const oppScore = isHost ? room.game_state.guestScore : room.game_state.hostScore;
  const opponent = isHost ? room.guest : room.host;
  const isBotOpponent = room.guest_id === SYSTEM_BOT_ID;
  const myTurn = room.current_turn === user?.id && room.status === "active";
  const dartsThrownThisTurn = room.game_state.turnDarts?.length || 0;

  const [phase, setPhase] = useState<"aiming" | "timing" | "flying">("aiming");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; kind: string } | null>(null);
  const aimPointer = useRef<{ x: number; y: number } | null>(null);
  const flyingDart = useRef<{ startX: number; startY: number; endX: number; endY: number; t0: number; dur: number } | null>(null);
  const precisionPos = useRef(50);
  const precisionStart = useRef(0);
  const lastSeenEvent = useRef<DartsGameState["lastEvent"]>(null);
  const stuckMarks = useRef<{ dx: number; dy: number }[]>([]);

  // ── Resize ──
  useEffect(() => {
    const resize = () => {
      const el = wrapRef.current;
      if (!el) return;
      setDims({ w: el.clientWidth, h: el.clientHeight });
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const boardGeometry = useCallback(() => {
    const { w, h } = dims;
    const cx = w / 2;
    const cy = h * 0.42;
    const R = Math.min(w * 0.42, h * 0.32);
    return { cx, cy, R };
  }, [dims]);

  // ── Reflect my own thrown darts this turn as stuck markers ──
  useEffect(() => {
    if (room.current_turn === user?.id || dartsThrownThisTurn === 0) {
      // My turn just started, or the turn just reset — clear old marks.
    }
    stuckMarks.current = room.game_state.turnDarts?.map((d) => ({ dx: d.dx, dy: d.dy })) || [];
  }, [room.game_state.turnDarts, room.current_turn, user?.id, dartsThrownThisTurn]);

  // ── Show a toast + replay the opponent's dart when a new event arrives ──
  useEffect(() => {
    const evt = room.game_state.lastEvent;
    if (!evt) return;
    if (lastSeenEvent.current === evt) return;
    lastSeenEvent.current = evt;

    const mine = (evt.by === "host") === isHost;
    if (mine) return; // I already saw my own throw animate locally when I threw it

    const { cx, cy, R } = boardGeometry();
    flyingDart.current = {
      startX: dims.w / 2, startY: dims.h - 60,
      endX: cx + evt.dx * R, endY: cy + evt.dy * R,
      t0: performance.now(), dur: 300,
    };
    setTimeout(() => {
      setToastMsg({
        text: evt.checkout ? `${evt.label}! CHECKOUT!` : evt.busted ? "OPPONENT BUST!" : `${evt.label} = ${evt.score}`,
        kind: evt.checkout ? "perfect" : evt.busted ? "bad" : evt.score >= 40 ? "perfect" : evt.score > 0 ? "good" : "bad",
      });
      setTimeout(() => setToastMsg(null), 1000);
    }, 320);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.game_state.lastEvent]);

  // ── Drawing ──
  const drawWedge = (ctx: CanvasRenderingContext2D, cx: number, cy: number, rInner: number, rOuter: number, startDeg: number, endDeg: number, color: string) => {
    ctx.beginPath();
    const steps = 5;
    for (let s = 0; s <= steps; s++) {
      const deg = startDeg + ((endDeg - startDeg) * s) / steps;
      const [x, y] = polar(cx, cy, rOuter, deg);
      s === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    for (let s = 0; s <= steps; s++) {
      const deg = endDeg - ((endDeg - startDeg) * s) / steps;
      const [x, y] = polar(cx, cy, rInner, deg);
      ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  };

  const drawDartIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, angleDeg: number, scale: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((angleDeg * Math.PI) / 180);
    ctx.scale(scale, scale);
    ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 16); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -4); ctx.lineTo(-3, 3); ctx.lineTo(3, 3); ctx.closePath();
    ctx.fillStyle = "#e5e7eb"; ctx.fill();
    ctx.fillStyle = "#3b82f6";
    ctx.beginPath(); ctx.moveTo(-6, 14); ctx.lineTo(0, 8); ctx.lineTo(6, 14); ctx.lineTo(0, 22); ctx.closePath(); ctx.fill();
    ctx.restore();
  };

  useEffect(() => {
    let rafId: number;
    const loop = (now: number) => {
      const canvas = canvasRef.current;
      if (canvas) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        if (canvas.width !== dims.w * dpr) {
          canvas.width = dims.w * dpr;
          canvas.height = dims.h * dpr;
          canvas.style.width = dims.w + "px";
          canvas.style.height = dims.h + "px";
        }
        const ctx = canvas.getContext("2d")!;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, dims.w, dims.h);

        const { cx, cy, R } = boardGeometry();

        const glow = ctx.createRadialGradient(cx, cy, R * 0.8, cx, cy, R * 1.25);
        glow.addColorStop(0, "rgba(59,130,246,0.16)");
        glow.addColorStop(1, "rgba(59,130,246,0)");
        ctx.fillStyle = glow;
        ctx.beginPath(); ctx.arc(cx, cy, R * 1.25, 0, Math.PI * 2); ctx.fill();

        ctx.beginPath(); ctx.arc(cx, cy, R * 1.06, 0, Math.PI * 2);
        ctx.fillStyle = "#0f1420"; ctx.fill();
        ctx.lineWidth = 2; ctx.strokeStyle = "rgba(59,130,246,0.4)"; ctx.stroke();

        const SINGLE_A = "#f4ede0", SINGLE_B = "#161616", RING_A = "#e11d2e", RING_B = "#0d8a3c";
        for (let i = 0; i < 20; i++) {
          const startDeg = i * 18 - 9, endDeg = i * 18 + 9, even = i % 2 === 0;
          const singleColor = even ? SINGLE_B : SINGLE_A, ringColor = even ? RING_A : RING_B;
          drawWedge(ctx, cx, cy, R * RING.outerBull, R * RING.tripleIn, startDeg, endDeg, singleColor);
          drawWedge(ctx, cx, cy, R * RING.tripleIn, R * RING.tripleOut, startDeg, endDeg, ringColor);
          drawWedge(ctx, cx, cy, R * RING.tripleOut, R * RING.doubleIn, startDeg, endDeg, singleColor);
          drawWedge(ctx, cx, cy, R * RING.doubleIn, R * RING.doubleOut, startDeg, endDeg, ringColor);
        }
        ctx.strokeStyle = "rgba(0,0,0,0.5)"; ctx.lineWidth = 1.2;
        for (let i = 0; i < 20; i++) {
          const deg = i * 18 - 9;
          const [x1, y1] = polar(cx, cy, R * RING.outerBull, deg);
          const [x2, y2] = polar(cx, cy, R * RING.doubleOut, deg);
          ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        }
        ctx.beginPath(); ctx.arc(cx, cy, R * RING.outerBull, 0, Math.PI * 2); ctx.fillStyle = "#0d8a3c"; ctx.fill();
        ctx.beginPath(); ctx.arc(cx, cy, R * RING.innerBull, 0, Math.PI * 2); ctx.fillStyle = "#e11d2e"; ctx.fill();
        ctx.beginPath(); ctx.arc(cx, cy, R * RING.doubleOut, 0, Math.PI * 2);
        ctx.lineWidth = 2; ctx.strokeStyle = "rgba(0,0,0,0.6)"; ctx.stroke();

        ctx.font = `700 ${Math.max(10, R * 0.09)}px 'Space Grotesk', sans-serif`;
        ctx.fillStyle = "rgba(255,255,255,0.85)"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        for (let i = 0; i < 20; i++) {
          const [x, y] = polar(cx, cy, R * 1.14, i * 18);
          ctx.fillText(String(SEGMENT_ORDER[i]), x, y);
        }

        // Stuck darts this turn
        stuckMarks.current.forEach((m) => drawDartIcon(ctx, cx + m.dx * R, cy + m.dy * R, -40, 1));

        // Crosshair while aiming (only when it's my turn)
        if (myTurn && phase === "aiming" && aimPointer.current) {
          const { x, y } = aimPointer.current;
          ctx.strokeStyle = "rgba(255,255,255,0.85)"; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.moveTo(x - 14, y); ctx.lineTo(x - 4, y); ctx.moveTo(x + 4, y); ctx.lineTo(x + 14, y); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(x, y - 14); ctx.lineTo(x, y - 4); ctx.moveTo(x, y + 4); ctx.lineTo(x, y + 14); ctx.stroke();
          ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fillStyle = "#3b82f6"; ctx.fill();
        }

        // Flying dart (mine or opponent's replay)
        if (flyingDart.current) {
          const f = flyingDart.current;
          const t = Math.min(1, (now - f.t0) / f.dur);
          const ease = 1 - Math.pow(1 - t, 3);
          const x = f.startX + (f.endX - f.startX) * ease;
          const y = f.startY + (f.endY - f.startY) * ease;
          const angle = (Math.atan2(f.endY - f.startY, f.endX - f.startX) * 180) / Math.PI + 90;
          drawDartIcon(ctx, x, y, angle, 0.6 + 0.4 * ease);
          if (t >= 1) flyingDart.current = null;
        }
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [dims, boardGeometry, myTurn, phase]);

  // ── Precision meter animation ──
  const precisionRafId = useRef<number>(0);
  const runPrecisionMeter = useCallback((now: number) => {
    const period = Math.max(560, 900 - room.game_state.turnNumber * 12);
    const t = (now - precisionStart.current) % period;
    const frac = t / period;
    precisionPos.current = 50 + 50 * Math.sin(frac * Math.PI * 2);
    const marker = document.getElementById("darts-precision-marker");
    if (marker) marker.style.left = `calc(${precisionPos.current}% - 2px)`;
    precisionRafId.current = requestAnimationFrame(runPrecisionMeter);
  }, [room.game_state.turnNumber]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!myTurn || isSubmitting || room.status !== "active") return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;

    if (phase === "aiming") {
      aimPointer.current = { x, y };
      setPhase("timing");
      precisionStart.current = performance.now();
      precisionRafId.current = requestAnimationFrame(runPrecisionMeter);
      return;
    }
    if (phase === "timing") {
      cancelAnimationFrame(precisionRafId.current);
      const distFromCenter = Math.abs(precisionPos.current - 50);
      const precision = 1 - distFromCenter / 50;
      const { R } = boardGeometry();
      const maxDeviation = R * 0.5;
      const deviation = maxDeviation * Math.pow(1 - precision, 2);
      const randomAngle = Math.random() * Math.PI * 2;
      const landX = aimPointer.current!.x + Math.cos(randomAngle) * deviation;
      const landY = aimPointer.current!.y + Math.sin(randomAngle) * deviation;

      setPhase("flying");
      const { cx, cy } = boardGeometry();
      flyingDart.current = {
        startX: dims.w / 2, startY: dims.h - 60,
        endX: landX, endY: landY,
        t0: performance.now(), dur: 300,
      };

      setTimeout(async () => {
        const { R: r2 } = boardGeometry();
        const dx = (landX - cx) / r2, dy = (landY - cy) / r2;
        const preview = scoreAt(dx, dy);
        setToastMsg({ text: `${preview.label} = ${preview.score}`, kind: preview.score >= 40 ? "perfect" : preview.score > 0 ? "good" : "bad" });
        setTimeout(() => setToastMsg(null), 900);

        setIsSubmitting(true);
        try {
          await submitDartsThrow(room.id, dx, dy);
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Throw failed");
        } finally {
          setIsSubmitting(false);
          setPhase("aiming");
          aimPointer.current = null;
        }
      }, 320);
    }
  };

  const handleResign = async () => {
    try {
      await resignDartsGame(room.id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to resign");
    }
  };

  if (room.status === "finished") {
    return (
      <H2HWinner
        room={room as never}
        user={user}
        localWinnerId={room.winner_id}
        isSyncing={false}
      />
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-3">
      {/* Score header */}
      <div className="flex items-center justify-between gap-3 px-1">
        <div className="flex-1 bg-black/5 dark:bg-white/5 rounded-xl p-3 border border-black/5 dark:border-white/10">
          <p className="text-[9px] font-black uppercase tracking-widest text-primary mb-1">You</p>
          <p className="font-headline text-2xl md:text-3xl font-black">{myScore}</p>
        </div>
        <div className="text-center shrink-0 px-2">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Stake</p>
          <p className="font-black text-sm flex items-center gap-0.5"><ZASymbol className="text-xs" />{room.stake}</p>
        </div>
        <div className="flex-1 bg-black/5 dark:bg-white/5 rounded-xl p-3 border border-black/5 dark:border-white/10 text-right">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{opponent?.username || (isBotOpponent ? "Bot" : "Opponent")}</p>
          <p className="font-headline text-2xl md:text-3xl font-black">{oppScore}</p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full border ${
                i < dartsThrownThisTurn && myTurn ? "bg-primary border-primary" : "bg-transparent border-slate-400/40"
              }`}
            />
          ))}
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          {myTurn ? (isSubmitting ? "Throwing..." : "Your Throw") : `Waiting for ${opponent?.username || "opponent"}...`}
        </span>
      </div>

      {/* Board */}
      <div ref={wrapRef} className="relative w-full h-[380px] md:h-[440px] rounded-2xl overflow-hidden bg-[#030712] border border-black/5 dark:border-white/10">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full touch-none"
          style={{ cursor: myTurn && !isSubmitting ? "crosshair" : "default" }}
          onPointerDown={handlePointerDown}
          onPointerMove={(e) => {
            if (!myTurn || phase !== "aiming") return;
            const rect = canvasRef.current!.getBoundingClientRect();
            aimPointer.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
          }}
        />

        {myTurn && phase === "timing" && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[84%] max-w-[320px] text-center">
            <div className="relative h-5 rounded-full bg-white/10 border border-white/15 overflow-hidden">
              <div className="absolute inset-y-0 left-[12%] right-[12%] rounded bg-red-500/25" />
              <div className="absolute inset-y-0 left-[28%] right-[28%] rounded bg-green-500/30" />
              <div className="absolute inset-y-0 left-[44%] right-[44%] rounded bg-amber-400 shadow-[0_0_14px_rgba(251,191,36,0.6)]" />
              <div id="darts-precision-marker" className="absolute -top-1 w-1 h-7 rounded bg-white shadow-[0_0_10px_rgba(255,255,255,0.7)]" style={{ left: "50%" }} />
            </div>
            <p className="mt-2 text-[10px] font-black tracking-widest text-white/60">TAP TO STOP — LAND IN THE CENTER</p>
          </div>
        )}

        {myTurn && phase === "aiming" && !isSubmitting && (
          <p className="absolute top-4 left-1/2 -translate-x-1/2 text-[11px] font-black tracking-widest text-white/35">
            TAP THE BOARD TO AIM
          </p>
        )}

        {toastMsg && (
          <div
            className={`absolute top-16 left-1/2 -translate-x-1/2 px-5 py-2 rounded-full text-sm font-black tracking-wide backdrop-blur-md border ${
              toastMsg.kind === "perfect" ? "border-amber-400 text-amber-400" : toastMsg.kind === "good" ? "border-green-400 text-green-400" : "border-red-400 text-red-400"
            } bg-black/70`}
          >
            {toastMsg.text}
          </div>
        )}

        {!myTurn && room.status === "active" && !isBotOpponent && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 text-white/50">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span className="text-[11px] font-black tracking-widest">OPPONENT'S TURN</span>
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleResign}
          className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors py-2 px-4"
        >
          <Flag className="w-3 h-3" /> Resign Match
        </button>
      </div>
    </div>
  );
}