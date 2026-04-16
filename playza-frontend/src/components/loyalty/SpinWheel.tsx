import { useState, useRef, useEffect } from "react";
import { MdClose, MdStars, MdAutorenew } from "react-icons/md";
import { Sparkles, Zap } from "lucide-react";

interface SpinSegment {
  label: string;
  points: number;
  color: string;
  textColor: string;
  probability: number;
}

const SEGMENTS: SpinSegment[] = [
  { label: "50 PZA",    points: 50,   color: "#3B82F6", textColor: "#fff", probability: 0.25 },
  { label: "100 PZA",   points: 100,  color: "#8B5CF6", textColor: "#fff", probability: 0.20 },
  { label: "25 PZA",    points: 25,   color: "#10B981", textColor: "#fff", probability: 0.25 },
  { label: "200 PZA",   points: 200,  color: "#F59E0B", textColor: "#fff", probability: 0.12 },
  { label: "10 PZA",    points: 10,   color: "#EC4899", textColor: "#fff", probability: 0.10 },
  { label: "500 PZA",   points: 500,  color: "#EF4444", textColor: "#fff", probability: 0.05 },
  { label: "75 PZA",    points: 75,   color: "#06B6D4", textColor: "#fff", probability: 0.02 },
  { label: "1000 PZA",  points: 1000, color: "#F97316", textColor: "#fff", probability: 0.01 },
];

function pickSegmentByProbability(): number {
  const rand = Math.random();
  let cumulative = 0;
  for (let i = 0; i < SEGMENTS.length; i++) {
    cumulative += SEGMENTS[i].probability;
    if (rand <= cumulative) return i;
  }
  return SEGMENTS.length - 1;
}

interface SpinWheelModalProps {
  onClose: () => void;
  onEarnPoints: (points: number) => void;
  spinsLeft: number;
}

export function SpinWheelModal({ onClose, onEarnPoints, spinsLeft: initialSpins }: SpinWheelModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinsLeft, setSpinsLeft] = useState(initialSpins);
  const [wonPoints, setWonPoints] = useState<number | null>(null);
  const [currentAngle, setCurrentAngle] = useState(0);
  const animFrameRef = useRef<number>(0);
  const startAngleRef = useRef(0);

  const segCount = SEGMENTS.length;
  const segAngle = (2 * Math.PI) / segCount;

  function drawWheel(angle: number) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const r = cx - 12;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Outer glow ring
    const grad = ctx.createRadialGradient(cx, cy, r - 4, cx, cy, r + 8);
    grad.addColorStop(0, "rgba(99,102,241,0.5)");
    grad.addColorStop(1, "rgba(99,102,241,0)");
    ctx.beginPath();
    ctx.arc(cx, cy, r + 8, 0, 2 * Math.PI);
    ctx.fillStyle = grad;
    ctx.fill();

    // Segments
    SEGMENTS.forEach((seg, i) => {
      const startA = angle + i * segAngle;
      const endA = startA + segAngle;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, startA, endA);
      ctx.closePath();
      ctx.fillStyle = seg.color;
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(startA + segAngle / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = seg.textColor;
      ctx.font = "bold 11px 'Segoe UI', sans-serif";
      ctx.shadowColor = "rgba(0,0,0,0.4)";
      ctx.shadowBlur = 4;
      ctx.fillText(seg.label, r - 10, 4);
      ctx.restore();
    });

    // Center circle
    const centerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 30);
    centerGrad.addColorStop(0, "#6366F1");
    centerGrad.addColorStop(1, "#4F46E5");
    ctx.beginPath();
    ctx.arc(cx, cy, 30, 0, 2 * Math.PI);
    ctx.fillStyle = centerGrad;
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Center text
    ctx.fillStyle = "#fff";
    ctx.font = "bold 10px 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("SPIN", cx, cy + 4);
  }

  useEffect(() => {
    drawWheel(currentAngle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function spin() {
    if (isSpinning || spinsLeft <= 0) return;
    const targetSegIndex = pickSegmentByProbability();
    setWonPoints(null);
    setIsSpinning(true);
    setSpinsLeft(s => s - 1);

    const minRotations = 6;
    const maxRotations = 9;
    const extraRotations = (minRotations + Math.random() * (maxRotations - minRotations)) * 2 * Math.PI;

    // We want the wheel to stop with the pointer (at top, i.e. -π/2) pointing to the middle of targetSegIndex
    // pointer is at angle -π/2 relative to canvas top
    // the segment center is at: currentAngle + targetSegIndex * segAngle + segAngle/2
    // we need that to equal -π/2 (mod 2π)
    const pointerAngle = -Math.PI / 2;
    const segCenter = targetSegIndex * segAngle + segAngle / 2;
    // needed final wheel angle so segCenter lands at pointer
    const targetWheelAngle = pointerAngle - segCenter;
    // How much more to rotate (always positive, going forward)
    const currentNorm = ((currentAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    const targetNorm = ((targetWheelAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    let delta = targetNorm - currentNorm;
    if (delta < 0) delta += 2 * Math.PI;
    const totalRotation = extraRotations + delta;
    const finalAngle = currentAngle + totalRotation;

    const duration = 4500;
    const start = performance.now();
    startAngleRef.current = currentAngle;

    function easeOut(t: number) {
      return 1 - Math.pow(1 - t, 4);
    }

    function animate(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOut(progress);
      const angle = startAngleRef.current + eased * totalRotation;
      setCurrentAngle(angle);
      drawWheel(angle);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        setCurrentAngle(finalAngle);
        drawWheel(finalAngle);
        setIsSpinning(false);
        const pts = SEGMENTS[targetSegIndex].points;
        setWonPoints(pts);
        onEarnPoints(pts);
      }
    }

    animFrameRef.current = requestAnimationFrame(animate);
  }

  useEffect(() => {
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm bg-linear-to-b from-slate-900 to-slate-950 rounded-3xl border border-indigo-500/30 shadow-2xl shadow-indigo-500/20 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top decoration */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h2 className="text-white font-black text-lg tracking-tight">
              Spin & Earn PZA
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all"
          >
            <MdClose className="text-lg" />
          </button>
        </div>

        {/* Spins left */}
        <div className="px-6 mb-2">
          <div className="flex items-center justify-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl py-2">
            <Zap className="w-4 h-4 text-indigo-400" />
            <span className="text-indigo-300 text-sm font-bold">
              {spinsLeft} spin{spinsLeft !== 1 ? "s" : ""} remaining today
            </span>
          </div>
        </div>

        {/* Wheel container */}
        <div className="relative flex items-center justify-center py-4 px-4">
          {/* Pointer */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center">
            <div
              className="w-5 h-8 bg-linear-to-b from-yellow-400 to-orange-500 rounded-t-full shadow-lg shadow-orange-500/50"
              style={{ clipPath: "polygon(50% 100%, 0% 0%, 100% 0%)" }}
            />
          </div>

          <canvas
            ref={canvasRef}
            width={280}
            height={280}
            className="rounded-full cursor-pointer"
            onClick={spin}
            style={{
              filter: isSpinning
                ? "drop-shadow(0 0 20px rgba(99,102,241,0.6))"
                : "drop-shadow(0 0 8px rgba(99,102,241,0.3))",
            }}
          />
        </div>

        {/* Win display */}
        <div className="px-6 pb-2 min-h-15 flex items-center justify-center">
          {wonPoints !== null ? (
            <div className="w-full flex flex-col items-center gap-1 animate-bounce">
              <div className="flex items-center gap-2 bg-linear-to-r from-yellow-400/20 to-orange-400/20 border border-yellow-500/40 rounded-2xl px-6 py-3">
                <MdStars className="text-yellow-400 text-2xl" />
                <span className="text-2xl font-black text-white">
                  +{wonPoints.toLocaleString()}
                </span>
                <span className="text-yellow-400 font-bold text-sm">PZA</span>
              </div>
              <p className="text-slate-400 text-xs">
                Points added to your balance!
              </p>
            </div>
          ) : isSpinning ? (
            <div className="flex items-center gap-2 text-indigo-400">
              <MdAutorenew className="animate-spin text-xl" />
              <span className="text-sm font-bold">Spinning...</span>
            </div>
          ) : (
            <p className="text-slate-500 text-sm text-center">
              Tap the wheel or button to spin!
            </p>
          )}
        </div>

        {/* Spin button */}
        <div className="px-6 pb-6">
          <button
            onClick={spin}
            disabled={isSpinning || spinsLeft <= 0}
            className={`w-full py-3.5 rounded-2xl font-black text-sm tracking-wide transition-all ${
              isSpinning || spinsLeft <= 0
                ? "bg-slate-800 text-slate-600 cursor-not-allowed"
                : "bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/30 active:scale-95"
            }`}
          >
            {isSpinning
              ? "Spinning…"
              : spinsLeft <= 0
                ? "No spins left today"
                : "🎰 SPIN THE WHEEL"}
          </button>
        </div>
      </div>
    </div>
  );
}
