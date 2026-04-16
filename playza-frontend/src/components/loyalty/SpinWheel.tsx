import { useState, useRef, useEffect } from "react";
import { MdClose, MdStars, MdAutorenew } from "react-icons/md";
import { Sparkles, Zap, AlertCircle } from "lucide-react";
import { spinWheelApi } from "@/api/loyalty.api";

// Sharp, vivid colours — each segment is visually distinct
const SEGMENTS = [
  { label: "10 PZA",   points: 10,   bg: "#FF2D55", text: "#fff" },
  { label: "25 PZA",   points: 25,   bg: "#FF9F0A", text: "#fff" },
  { label: "50 PZA",   points: 50,   bg: "#30D158", text: "#fff" },
  { label: "75 PZA",   points: 75,   bg: "#0A84FF", text: "#fff" },
  { label: "100 PZA",  points: 100,  bg: "#BF5AF2", text: "#fff" },
  { label: "200 PZA",  points: 200,  bg: "#FFD60A", text: "#1C1C1E" },
  { label: "500 PZA",  points: 500,  bg: "#FF6B00", text: "#fff" },
  { label: "1000 PZA", points: 1000, bg: "#00D4FF", text: "#1C1C1E" },
];

const SEG_COUNT = SEGMENTS.length;
const SEG_ANGLE = (2 * Math.PI) / SEG_COUNT;

interface SpinWheelModalProps {
  onClose: () => void;
  onSpinComplete: (result: { points_won: number; new_balance: number; spins_left_today: number; segment_index: number }) => void;
  spinsLeft: number;
  totalPoints: number;
}

export function SpinWheelModal({ onClose, onSpinComplete, spinsLeft: initialSpins, totalPoints }: SpinWheelModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinsLeft, setSpinsLeft] = useState(initialSpins);
  const [wonPoints, setWonPoints] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentAngle, setCurrentAngle] = useState(0);
  const animFrameRef = useRef<number>(0);
  const SPIN_COST = 30;

  function drawWheel(angle: number) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const r = cx - 8;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Outer ring shadow
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.6)";
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(cx, cy, r + 4, 0, 2 * Math.PI);
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 8;
    ctx.stroke();
    ctx.restore();

    SEGMENTS.forEach((seg, i) => {
      const startA = angle + i * SEG_ANGLE;
      const endA = startA + SEG_ANGLE;

      // Segment fill
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, startA, endA);
      ctx.closePath();
      ctx.fillStyle = seg.bg;
      ctx.fill();

      // Inner lighter stripe for depth
      ctx.save();
      ctx.globalAlpha = 0.12;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, startA, endA);
      ctx.closePath();
      const radialGrad = ctx.createRadialGradient(cx, cy, r * 0.3, cx, cy, r);
      radialGrad.addColorStop(0, "#ffffff");
      radialGrad.addColorStop(1, "transparent");
      ctx.fillStyle = radialGrad;
      ctx.fill();
      ctx.restore();

      // Divider line
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, startA, endA);
      ctx.closePath();
      ctx.strokeStyle = "rgba(0,0,0,0.35)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label text
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(startA + SEG_ANGLE / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = seg.text;
      ctx.font = "bold 12px 'Segoe UI', system-ui, sans-serif";
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = 4;
      ctx.fillText(seg.label, r - 12, 4.5);
      ctx.restore();
    });

    // Center hub
    const hubGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 32);
    hubGrad.addColorStop(0, "#FFFFFF");
    hubGrad.addColorStop(0.5, "#E0E0E0");
    hubGrad.addColorStop(1, "#A0A0A0");
    ctx.beginPath();
    ctx.arc(cx, cy, 32, 0, 2 * Math.PI);
    ctx.fillStyle = hubGrad;
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.6)";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Hub inner ring
    ctx.beginPath();
    ctx.arc(cx, cy, 22, 0, 2 * Math.PI);
    ctx.strokeStyle = "rgba(0,0,0,0.12)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Hub star icon (manual)
    ctx.fillStyle = "#1C1C1E";
    ctx.font = "bold 14px 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("★", cx, cy + 5);
  }

  useEffect(() => {
    drawWheel(currentAngle);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function spin() {
    if (isSpinning || spinsLeft <= 0 || totalPoints < SPIN_COST) return;
    setWonPoints(null);
    setError(null);
    setIsSpinning(true);

    try {
      const result = await spinWheelApi();
      const targetSegIndex = result.segment_index;

      const minRotations = 6;
      const extraRotations = (minRotations + Math.random() * 3) * 2 * Math.PI;
      const pointerAngle = -Math.PI / 2;
      const segCenter = targetSegIndex * SEG_ANGLE + SEG_ANGLE / 2;
      const targetWheelAngle = pointerAngle - segCenter;
      const currentNorm = ((currentAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      const targetNorm = ((targetWheelAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      let delta = targetNorm - currentNorm;
      if (delta < 0) delta += 2 * Math.PI;
      const totalRotation = extraRotations + delta;
      const finalAngle = currentAngle + totalRotation;

      const duration = 4800;
      const start = performance.now();
      const startAngle = currentAngle;

      function easeOut(t: number) { return 1 - Math.pow(1 - t, 4); }

      function animate(now: number) {
        const progress = Math.min((now - start) / duration, 1);
        const angle = startAngle + easeOut(progress) * totalRotation;
        drawWheel(angle);

        if (progress < 1) {
          animFrameRef.current = requestAnimationFrame(animate);
        } else {
          setCurrentAngle(finalAngle);
          drawWheel(finalAngle);
          setIsSpinning(false);
          setWonPoints(result.points_won);
          setSpinsLeft(result.spins_left_today);
          onSpinComplete(result);
        }
      }

      animFrameRef.current = requestAnimationFrame(animate);
    } catch (err: any) {
      setIsSpinning(false);
      setError(err?.response?.data?.message ?? "Spin failed. Please try again.");
    }
  }

  useEffect(() => () => cancelAnimationFrame(animFrameRef.current), []);

  const canSpin = spinsLeft > 0 && totalPoints >= SPIN_COST && !isSpinning;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md" onClick={onClose}>
      <div
        className="relative w-full max-w-[360px] bg-[#0F0F14] rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Rainbow top strip */}
        <div className="h-1 w-full" style={{ background: "linear-gradient(90deg,#FF2D55,#FF9F0A,#30D158,#0A84FF,#BF5AF2,#FFD60A)" }} />

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-white font-black text-base tracking-tight">Spin & Earn PZA</span>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all">
            <MdClose />
          </button>
        </div>

        {/* Cost + spins banner */}
        <div className="px-5 flex gap-2 mb-3">
          <div className="flex-1 flex items-center gap-2 bg-red-500/15 border border-red-500/30 rounded-xl px-3 py-2">
            <MdStars className="text-red-400 text-base" />
            <span className="text-red-300 text-xs font-bold">{SPIN_COST} PZA per spin</span>
          </div>
          <div className="flex-1 flex items-center gap-2 bg-indigo-500/15 border border-indigo-500/30 rounded-xl px-3 py-2">
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-indigo-300 text-xs font-bold">{spinsLeft}/3 spins left</span>
          </div>
        </div>

        {/* Wheel */}
        <div className="relative flex justify-center items-center py-2 px-4">
          {/* Pointer */}
          <div className="absolute top-2 left-1/2 z-10" style={{ transform: "translateX(-50%)" }}>
            <div style={{
              width: 0, height: 0,
              borderLeft: "10px solid transparent",
              borderRight: "10px solid transparent",
              borderTop: "22px solid #FFD60A",
              filter: "drop-shadow(0 2px 6px rgba(255,214,10,0.8))",
            }} />
          </div>

          <canvas
            ref={canvasRef}
            width={300}
            height={300}
            className="cursor-pointer rounded-full"
            onClick={spin}
            style={{
              filter: isSpinning
                ? "drop-shadow(0 0 24px rgba(99,102,241,0.9))"
                : "drop-shadow(0 0 10px rgba(255,255,255,0.08))",
              transition: "filter 0.3s",
            }}
          />
        </div>

        {/* Result / error / hint */}
        <div className="px-5 min-h-[52px] flex items-center justify-center mb-1">
          {error ? (
            <div className="flex items-center gap-2 bg-red-500/15 border border-red-500/30 rounded-xl px-4 py-2.5 w-full">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span className="text-red-300 text-xs font-medium">{error}</span>
            </div>
          ) : wonPoints !== null ? (
            <div className="flex flex-col items-center gap-1 animate-bounce">
              <div className="flex items-center gap-2 bg-yellow-400/15 border border-yellow-400/40 rounded-2xl px-6 py-2.5">
                <MdStars className="text-yellow-400 text-2xl" />
                <span className="text-white font-black text-xl">+{wonPoints.toLocaleString()}</span>
                <span className="text-yellow-400 font-bold text-sm">PZA</span>
              </div>
              <p className="text-white/40 text-[11px]">Points credited to your balance!</p>
            </div>
          ) : isSpinning ? (
            <div className="flex items-center gap-2 text-indigo-400">
              <MdAutorenew className="animate-spin text-lg" />
              <span className="text-sm font-bold">Spinning…</span>
            </div>
          ) : totalPoints < SPIN_COST ? (
            <p className="text-white/40 text-xs text-center">You need {SPIN_COST} PZA to spin. Earn more points first!</p>
          ) : (
            <p className="text-white/40 text-xs text-center">Tap the wheel or button to spin!</p>
          )}
        </div>

        {/* Spin button */}
        <div className="px-5 pb-5">
          <button
            onClick={spin}
            disabled={!canSpin}
            className={`w-full py-3.5 rounded-2xl font-black text-sm tracking-wide transition-all ${
              !canSpin
                ? "bg-white/5 text-white/25 cursor-not-allowed"
                : "text-white shadow-lg active:scale-95"
            }`}
            style={canSpin ? {
              background: "linear-gradient(135deg,#6366F1,#8B5CF6)",
              boxShadow: "0 4px 24px rgba(99,102,241,0.45)",
            } : undefined}
          >
            {isSpinning ? "Spinning…"
              : spinsLeft <= 0 ? "No spins left today"
              : totalPoints < SPIN_COST ? `Need ${SPIN_COST} PZA to spin`
              : `🎰 SPIN  (-${SPIN_COST} PZA)`}
          </button>
        </div>
      </div>
    </div>
  );
}
