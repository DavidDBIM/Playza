import { useState, useRef, useEffect } from "react";
import { MdClose, MdStars, MdAutorenew } from "react-icons/md";
import { AlertCircle, Zap } from "lucide-react";
import { useSpinWheel } from "@/hooks/loyalty/useSpinWheel";

// 9 segments — matches backend segment_index 0..8
const SEGMENTS = [
  { label: "0",    points: 0,    bg: "#1C1C2E", text: "#6B7280", accent: "#374151" },
  { label: "10",   points: 10,   bg: "#FF2D55", text: "#fff",    accent: "#FF6B84" },
  { label: "25",   points: 25,   bg: "#FF9F0A", text: "#fff",    accent: "#FFB84D" },
  { label: "50",   points: 50,   bg: "#30D158", text: "#fff",    accent: "#5EE47A" },
  { label: "75",   points: 75,   bg: "#0A84FF", text: "#fff",    accent: "#4DA8FF" },
  { label: "100",  points: 100,  bg: "#BF5AF2", text: "#fff",    accent: "#D48AF7" },
  { label: "200",  points: 200,  bg: "#FFD60A", text: "#111",    accent: "#FFE44D" },
  { label: "500",  points: 500,  bg: "#FF6B00", text: "#fff",    accent: "#FF8C3A" },
  { label: "1000", points: 1000, bg: "#00D4FF", text: "#111",    accent: "#55E4FF" },
];

const SEG_COUNT = SEGMENTS.length;
const SEG_ANGLE = (2 * Math.PI) / SEG_COUNT;

// The pointer sits at the TOP of the canvas, which is angle = -π/2 in canvas coords.
// Segments are drawn starting from `angle` (the wheel's current rotation).
// Segment[i] occupies the arc from (angle + i*SEG_ANGLE) to (angle + (i+1)*SEG_ANGLE).
// Its visual centre is at: angle + i*SEG_ANGLE + SEG_ANGLE/2
//
// For segment[targetIdx] to land under the pointer (-π/2), we need:
//   wheelAngle + targetIdx*SEG_ANGLE + SEG_ANGLE/2  ≡  -π/2  (mod 2π)
//   wheelAngle  =  -π/2 - targetIdx*SEG_ANGLE - SEG_ANGLE/2
//
// We then add enough full rotations so the wheel spins visually before stopping.

interface SpinResult {
  points_won: number;
  points_spent: number;
  segment_index: number;
  label: string;
  new_balance: number;
  spins_left_today: number;
}

interface SpinWheelModalProps {
  onClose: () => void;
  onSpinComplete: (result: SpinResult) => void;
  spinsLeft: number;
  totalPoints: number;
}

export function SpinWheelModal({ onClose, onSpinComplete, spinsLeft: initialSpins, totalPoints }: SpinWheelModalProps) {
  const { mutateAsync: performSpin } = useSpinWheel();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinsLeft, setSpinsLeft] = useState(initialSpins);
  const [result, setResult] = useState<SpinResult | null>(null);
  const [currentBalance, setCurrentBalance] = useState(totalPoints);
  const [error, setError] = useState<string | null>(null);
  // wheelAngle tracks the wheel's total accumulated rotation (never reset, so easing works correctly)
  const wheelAngleRef = useRef(0);
  const animFrameRef = useRef<number>(0);
  const SPIN_COST = 30;

  function drawWheel(angle: number) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    const pointerHeight = 30;          // pixels reserved at top for pointer
    const cx = w / 2;
    const cy = pointerHeight + (h - pointerHeight) / 2;  // wheel centre shifted down
    const r = Math.min(cx, cy - pointerHeight / 2) - 6;
    const innerR = r * 0.18;

    ctx.clearRect(0, 0, w, h);

    // Outer glow ring
    ctx.save();
    ctx.shadowColor = "rgba(99,102,241,0.6)";
    ctx.shadowBlur = 28;
    ctx.beginPath();
    ctx.arc(cx, cy, r + 3, 0, 2 * Math.PI);
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.restore();

    SEGMENTS.forEach((seg, i) => {
      const startA = angle + i * SEG_ANGLE;
      const endA = startA + SEG_ANGLE;
      const midA = startA + SEG_ANGLE / 2;

      // Fill
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, startA, endA);
      ctx.closePath();
      ctx.fillStyle = seg.bg;
      ctx.fill();

      // Sheen
      ctx.save();
      ctx.globalAlpha = 0.18;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, startA, endA);
      ctx.closePath();
      const grad = ctx.createRadialGradient(cx, cy, innerR, cx, cy, r);
      grad.addColorStop(0, "#ffffff");
      grad.addColorStop(0.6, "rgba(255,255,255,0.3)");
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();

      // Divider line
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + r * Math.cos(startA), cy + r * Math.sin(startA));
      ctx.strokeStyle = "rgba(255,255,255,0.25)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      // Accent arc near edge
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r - 6, startA + 0.05, endA - 0.05);
      ctx.strokeStyle = seg.accent;
      ctx.lineWidth = 3;
      ctx.globalAlpha = 0.55;
      ctx.stroke();
      ctx.restore();

      // Label
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(midA);
      const textR = r * 0.66;
      ctx.textAlign = "center";

      if (seg.points === 0) {
        ctx.fillStyle = seg.text;
        ctx.font = "bold 9px 'Segoe UI', system-ui, sans-serif";
        ctx.globalAlpha = 0.7;
        ctx.fillText("MISS", textR, -4);
        ctx.font = "bold 12px 'Segoe UI', system-ui, sans-serif";
        ctx.fillText("0", textR, 8);
      } else {
        ctx.shadowColor = "rgba(0,0,0,0.7)";
        ctx.shadowBlur = 5;
        ctx.fillStyle = seg.text;
        const numStr = seg.points >= 1000 ? "1K" : String(seg.points);
        ctx.font = `900 ${seg.points >= 100 ? 13 : 15}px 'Segoe UI', system-ui, sans-serif`;
        ctx.fillText(numStr, textR, -3);
        ctx.font = "bold 8px 'Segoe UI', system-ui, sans-serif";
        ctx.globalAlpha = 0.85;
        ctx.fillText("PZA", textR, 9);
      }
      ctx.restore();
    });

    // Outer border
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // ── Pointer arrow drawn ON the canvas at exact top-centre ──
    // This guarantees it always aligns with angle = -π/2 regardless of CSS layout.
    const pW = 11;  // half-width of the triangle base
    const pH = 26;  // height of the triangle
    const pX = cx;
    const pY = cy - r - 2; // tip sits just outside the wheel edge
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(pX,      pY);          // tip pointing down into the wheel
    ctx.lineTo(pX - pW, pY - pH);     // top-left
    ctx.lineTo(pX + pW, pY - pH);     // top-right
    ctx.closePath();
    ctx.fillStyle = "#FFD60A";
    ctx.shadowColor = "rgba(255,214,10,0.95)";
    ctx.shadowBlur = 14;
    ctx.fill();
    // thin white outline for contrast
    ctx.strokeStyle = "rgba(255,255,255,0.6)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // Hub
    const hubGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, innerR);
    hubGrad.addColorStop(0, "#FFFFFF");
    hubGrad.addColorStop(0.45, "#DADADA");
    hubGrad.addColorStop(1, "#888");
    ctx.beginPath();
    ctx.arc(cx, cy, innerR, 0, 2 * Math.PI);
    ctx.fillStyle = hubGrad;
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(255,255,255,0.7)";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = "#1C1C1E";
    ctx.font = `bold ${Math.round(innerR * 0.75)}px 'Segoe UI', sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("\u2605", cx, cy);
    ctx.textBaseline = "alphabetic";
  }

  useEffect(() => {
    drawWheel(wheelAngleRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function spin() {
    if (isSpinning || spinsLeft <= 0 || currentBalance < SPIN_COST) return;
    setResult(null);
    setError(null);
    setIsSpinning(true);

    // Optimistically deduct cost
    setCurrentBalance(prev => prev - SPIN_COST);

    try {
      const spinResult = await performSpin();
      const targetSegIndex = spinResult.segment_index;

      // --- ACCURATE LANDING MATH ---
      // Pointer is at canvas top = angle -π/2.
      // The wheel has accumulated `wheelAngleRef.current` total rotation.
      //
      // We want the final wheel angle F such that:
      //   segment[targetSegIndex] centre sits exactly at -π/2:
      //   F + targetSegIndex * SEG_ANGLE + SEG_ANGLE/2  ≡  -π/2  (mod 2π)
      //   F_target  =  -π/2 - targetSegIndex * SEG_ANGLE - SEG_ANGLE/2
      //
      // Then we normalise to 0..2π and add enough full spins (≥ 5) so the
      // wheel visually rotates before stopping.

      const POINTER_ANGLE = -Math.PI / 2;
      const rawTarget = POINTER_ANGLE - targetSegIndex * SEG_ANGLE - SEG_ANGLE / 2;

      // Normalise rawTarget to [0, 2π)
      const twoPi = 2 * Math.PI;
      const normTarget = ((rawTarget % twoPi) + twoPi) % twoPi;

      // Current wheel angle normalised
      const normCurrent = ((wheelAngleRef.current % twoPi) + twoPi) % twoPi;

      // How far to rotate FROM normCurrent TO normTarget (always go forward = clockwise)
      let delta = normTarget - normCurrent;
      if (delta <= 0) delta += twoPi; // ensure forward spin

      // Add at least 6 full rotations for visual drama
      const minFullSpins = 6 + Math.floor(Math.random() * 3); // 6–8 full spins
      const totalRotation = minFullSpins * twoPi + delta;
      const finalAngle = wheelAngleRef.current + totalRotation;
      // ---

      const duration = 5400;
      const start = performance.now();
      const startAngle = wheelAngleRef.current;

      function easeOut(t: number) {
        // Quartic ease-out — fast start, smooth deceleration
        return 1 - Math.pow(1 - t, 4);
      }

      function animate(now: number) {
        const progress = Math.min((now - start) / duration, 1);
        const angle = startAngle + easeOut(progress) * totalRotation;
        drawWheel(angle);

        if (progress < 1) {
          animFrameRef.current = requestAnimationFrame(animate);
        } else {
          // Lock exactly on target to eliminate any floating-point drift
          wheelAngleRef.current = finalAngle;
          drawWheel(finalAngle);
          setIsSpinning(false);
          setResult(spinResult);
          // Sync to authoritative server balance
          setCurrentBalance(spinResult.new_balance);
          setSpinsLeft(spinResult.spins_left_today);
          onSpinComplete(spinResult);
        }
      }

      animFrameRef.current = requestAnimationFrame(animate);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      // Restore optimistic deduction on error
      setCurrentBalance(prev => prev + SPIN_COST);
      setIsSpinning(false);
      setError(error.response?.data?.message ?? "Spin failed. Please try again.");
    }
  }

  useEffect(() => () => cancelAnimationFrame(animFrameRef.current), []);

  const canSpin = spinsLeft > 0 && currentBalance >= SPIN_COST && !isSpinning;
  const isWin = result !== null && result.points_won > 0;
  const isZero = result !== null && result.points_won === 0;

  const canvasWidth  = 300;
  const canvasHeight = 330;  // extra 30px at top for the pointer arrow

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md"
      onClick={() => !isSpinning && onClose()}
    >
      <div
        className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 shadow-2xl"
        style={{ background: "linear-gradient(160deg,#0D0D18 0%,#12121F 55%,#0A0A14 100%)" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Rainbow top strip */}
        <div
          className="h-1 w-full"
          style={{ background: "linear-gradient(90deg,#FF2D55,#FF9F0A,#30D158,#0A84FF,#BF5AF2,#FFD60A,#00D4FF)" }}
        />

        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-base shrink-0"
              style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)", boxShadow: "0 0 12px rgba(99,102,241,0.5)" }}
            >
              🎰
            </div>
            <div>
              <span className="text-white font-black text-sm tracking-tight">Spin & Earn PZA</span>
              <p className="text-white/40 text-[10px]">Costs {SPIN_COST} PZA · Win up to 1,000 PZA</p>
            </div>
          </div>
          <button
            onClick={() => !isSpinning && onClose()}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white/50 hover:text-white transition-all shrink-0"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <MdClose />
          </button>
        </div>

        {/* Stats row */}
        <div className="px-4 flex gap-2 mb-3">
          <div
            className="flex-1 flex items-center gap-2 rounded-xl px-3 py-2 border border-white/8"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            <Zap className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <div>
              <p className="text-indigo-300 text-[10px] font-bold uppercase tracking-wider">Spins Left</p>
              <p className="text-white font-black text-sm leading-tight">
                {spinsLeft}<span className="text-white/30 font-normal">/3</span>
              </p>
            </div>
          </div>
          <div
            className="flex-1 flex items-center gap-2 rounded-xl px-3 py-2 border border-white/8"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            <MdStars className="text-yellow-400 text-base shrink-0" />
            <div>
              <p className="text-yellow-400/70 text-[10px] font-bold uppercase tracking-wider">Balance</p>
              <p className="text-white font-black text-sm leading-tight">
                {currentBalance.toLocaleString()} <span className="text-white/40 text-[10px] font-normal">PZA</span>
              </p>
            </div>
          </div>
        </div>

        {/* Wheel */}
        <div className="relative flex justify-center items-center px-4 pb-1">
          {/* Glow halo — aligned with wheel (offset 30px for pointer space) */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: canvasWidth - 20, height: canvasWidth - 20,
              top: 30, left: 10,
              background: "radial-gradient(circle,rgba(99,102,241,0.22) 0%,transparent 70%)",
              filter: "blur(16px)",
            }}
          />

          <canvas
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
            className="cursor-pointer select-none"
            onClick={canSpin ? spin : undefined}
            style={{
              width: canvasWidth,
              height: canvasHeight,
              filter: isSpinning
                ? "drop-shadow(0 0 32px rgba(99,102,241,1)) drop-shadow(0 0 12px rgba(255,214,10,0.6))"
                : canSpin
                ? "drop-shadow(0 0 14px rgba(99,102,241,0.5))"
                : "drop-shadow(0 0 6px rgba(0,0,0,0.5))",
              transition: "filter 0.4s ease",
            }}
          />
        </div>

        {/* Result / status */}
        <div className="px-4 min-h-[58px] flex items-center justify-center py-2">
          {error ? (
            <div className="flex items-center gap-2.5 rounded-2xl px-4 py-3 w-full border border-red-500/30"
                 style={{ background: "rgba(239,68,68,0.1)" }}>
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span className="text-red-300 text-xs font-medium">{error}</span>
            </div>
          ) : isWin ? (
            <div className="flex flex-col items-center gap-1 w-full animate-bounce">
              <div className="flex items-center gap-2 rounded-2xl px-5 py-2.5 border border-yellow-400/40"
                   style={{ background: "rgba(255,214,10,0.12)" }}>
                <MdStars className="text-yellow-400 text-xl" />
                <span className="text-white font-black text-2xl">+{result!.points_won.toLocaleString()}</span>
                <span className="text-yellow-400 font-bold text-sm">PZA</span>
              </div>
              <p className="text-emerald-400 text-[11px] font-bold">Added to your balance!</p>
            </div>
          ) : isZero ? (
            <div className="flex flex-col items-center gap-1 w-full">
              <div className="flex items-center gap-2 rounded-2xl px-5 py-2.5 border border-white/10"
                   style={{ background: "rgba(255,255,255,0.04)" }}>
                <span className="text-white/50 font-black text-lg">Miss — 0 PZA</span>
                <span className="text-lg">😬</span>
              </div>
              <p className="text-white/30 text-[11px]">Better luck next spin!</p>
            </div>
          ) : isSpinning ? (
            <div className="flex items-center gap-2.5 text-indigo-400">
              <MdAutorenew className="animate-spin text-xl" />
              <span className="text-sm font-black tracking-wide">Spinning…</span>
            </div>
          ) : currentBalance < SPIN_COST ? (
            <p className="text-white/35 text-xs text-center">You need {SPIN_COST} PZA to spin. Earn more first!</p>
          ) : spinsLeft <= 0 ? (
            <p className="text-white/35 text-xs text-center">All 3 spins used today. Come back tomorrow!</p>
          ) : (
            <p className="text-white/35 text-xs text-center">Tap the wheel or the button below to spin!</p>
          )}
        </div>

        {/* Spin button + dots */}
        <div className="px-4 pb-5">
          <div className="flex items-center justify-center gap-2 mb-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-1.5 rounded-full transition-all duration-500"
                style={{
                  width: i < spinsLeft ? 32 : 16,
                  background: i < spinsLeft
                    ? "linear-gradient(90deg,#6366F1,#8B5CF6)"
                    : "rgba(255,255,255,0.12)",
                  boxShadow: i < spinsLeft ? "0 0 8px rgba(99,102,241,0.7)" : "none",
                }}
              />
            ))}
            <span className="text-white/30 text-[10px] font-bold ml-1">{spinsLeft}/3</span>
          </div>

          <button
            onClick={spin}
            disabled={!canSpin}
            className="w-full py-3.5 rounded-2xl font-black text-sm tracking-widest transition-all active:scale-95 uppercase"
            style={canSpin ? {
              background: "linear-gradient(135deg,#6366F1 0%,#8B5CF6 50%,#A855F7 100%)",
              boxShadow: "0 4px 28px rgba(99,102,241,0.55), inset 0 1px 0 rgba(255,255,255,0.15)",
              color: "#fff",
            } : {
              background: "rgba(255,255,255,0.05)",
              color: "rgba(255,255,255,0.2)",
              cursor: "not-allowed",
            }}
          >
            {isSpinning
              ? "Spinning…"
              : spinsLeft <= 0
              ? "No spins left today"
              : currentBalance < SPIN_COST
              ? `Need ${SPIN_COST} PZA`
              : `🎰  Spin  (−${SPIN_COST} PZA)`}
          </button>
        </div>
      </div>
    </div>
  );
}
