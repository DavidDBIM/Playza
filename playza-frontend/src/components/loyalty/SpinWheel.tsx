import { useState, useRef, useEffect } from "react";
import { MdClose, MdStars, MdAutorenew } from "react-icons/md";
import { Sparkles, Zap } from "lucide-react";

const SPIN_COST = 50; // PZA per spin

interface SpinSegment {
  label: string;
  points: number;
  color: string;
  textColor: string;
  probability: number;
  isZero?: boolean;
}

const SEGMENTS: SpinSegment[] = [
  { label: "0 PZA",    points: 0,    color: "#1e293b", textColor: "#64748b", probability: 0.15, isZero: true },
  { label: "10 PZA",   points: 10,   color: "#EC4899", textColor: "#fff",    probability: 0.10 },
  { label: "25 PZA",   points: 25,   color: "#10B981", textColor: "#fff",    probability: 0.20 },
  { label: "50 PZA",   points: 50,   color: "#3B82F6", textColor: "#fff",    probability: 0.20 },
  { label: "75 PZA",   points: 75,   color: "#06B6D4", textColor: "#fff",    probability: 0.10 },
  { label: "100 PZA",  points: 100,  color: "#8B5CF6", textColor: "#fff",    probability: 0.12 },
  { label: "200 PZA",  points: 200,  color: "#F59E0B", textColor: "#fff",    probability: 0.08 },
  { label: "500 PZA",  points: 500,  color: "#EF4444", textColor: "#fff",    probability: 0.04 },
  { label: "1000 PZA", points: 1000, color: "#F97316", textColor: "#fff",    probability: 0.01 },
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
  onEarnPoints: (delta: number) => void;
  totalPoints: number;
}

export function SpinWheelModal({ onClose, onEarnPoints, totalPoints }: SpinWheelModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wonPoints, setWonPoints] = useState<number | null>(null);
  const [currentAngle, setCurrentAngle] = useState(0);
  const animFrameRef = useRef<number>(0);
  const startAngleRef = useRef(0);
  const [spinsThisSession, setSpinsThisSession] = useState(0);
  const [localBalance, setLocalBalance] = useState(totalPoints);

  const segCount = SEGMENTS.length;
  const segAngle = (2 * Math.PI) / segCount;
  const canAfford = localBalance >= SPIN_COST;

  function drawWheel(angle: number) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const r = cx - 10;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const outerGrad = ctx.createRadialGradient(cx, cy, r - 2, cx, cy, r + 12);
    outerGrad.addColorStop(0, "rgba(99,102,241,0.5)");
    outerGrad.addColorStop(1, "rgba(99,102,241,0)");
    ctx.beginPath();
    ctx.arc(cx, cy, r + 12, 0, 2 * Math.PI);
    ctx.fillStyle = outerGrad;
    ctx.fill();

    SEGMENTS.forEach((seg, i) => {
      const startA = angle + i * segAngle;
      const endA = startA + segAngle;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, startA, endA);
      ctx.closePath();
      ctx.fillStyle = seg.color;
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.07)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(startA + segAngle / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = seg.textColor;
      ctx.font = `bold 11px 'Segoe UI', sans-serif`;
      ctx.shadowColor = "rgba(0,0,0,0.7)";
      ctx.shadowBlur = 5;
      ctx.fillText(seg.label, r - 8, 4);
      ctx.restore();
    });

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.lineWidth = 2;
    ctx.stroke();

    const hubGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 26);
    hubGrad.addColorStop(0, "#818CF8");
    hubGrad.addColorStop(1, "#3730A3");
    ctx.beginPath();
    ctx.arc(cx, cy, 26, 0, 2 * Math.PI);
    ctx.fillStyle = hubGrad;
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#fff";
    ctx.font = "bold 9px 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.shadowColor = "transparent";
    ctx.fillText("SPIN", cx, cy + 3);
  }

  useEffect(() => {
    drawWheel(currentAngle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function spin() {
    if (isSpinning || !canAfford) return;
    const targetSegIndex = pickSegmentByProbability();
    setWonPoints(null);
    setIsSpinning(true);
    setSpinsThisSession(s => s + 1);
    setLocalBalance(b => b - SPIN_COST);
    onEarnPoints(-SPIN_COST);

    const extraRotations = (6 + Math.random() * 3) * 2 * Math.PI;
    const pointerAngle = -Math.PI / 2;
    const segCenter = targetSegIndex * segAngle + segAngle / 2;
    const targetWheelAngle = pointerAngle - segCenter;
    const currentNorm = ((currentAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    const targetNorm = ((targetWheelAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    let delta = targetNorm - currentNorm;
    if (delta < 0) delta += 2 * Math.PI;
    const totalRotation = extraRotations + delta;

    const duration = 4500;
    const start = performance.now();
    startAngleRef.current = currentAngle;

    function easeOut(t: number) { return 1 - Math.pow(1 - t, 4); }

    function animate(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const angle = startAngleRef.current + easeOut(progress) * totalRotation;
      setCurrentAngle(angle);
      drawWheel(angle);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        const finalAngle = startAngleRef.current + totalRotation;
        setCurrentAngle(finalAngle);
        drawWheel(finalAngle);
        setIsSpinning(false);
        const pts = SEGMENTS[targetSegIndex].points;
        setWonPoints(pts);
        if (pts > 0) {
          setLocalBalance(b => b + pts);
          onEarnPoints(pts);
        }
      }
    }
    animFrameRef.current = requestAnimationFrame(animate);
  }

  useEffect(() => () => cancelAnimationFrame(animFrameRef.current), []);

  const isZeroWin = wonPoints === 0;
  const netGain = wonPoints !== null ? wonPoints - SPIN_COST : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={onClose}>
      <div
        className="relative w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"
        style={{ background: "linear-gradient(160deg, #0d0d1a 0%, #0a0a14 100%)", border: "1px solid rgba(99,102,241,0.2)" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, #6366f1, #a855f7, #ec4899)" }} />

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-white font-black text-[15px] tracking-tight">Spin & Earn</span>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-white transition-colors" style={{ background: "rgba(255,255,255,0.05)" }}>
            <MdClose className="text-sm" />
          </button>
        </div>

        {/* Cost chip + session count */}
        <div className="px-5 mb-0 flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-lg px-2.5 py-1" style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}>
            <Zap className="w-3 h-3 text-indigo-400" />
            <span className="text-indigo-300 text-[11px] font-bold">{SPIN_COST} PZA per spin · Unlimited</span>
          </div>
          {spinsThisSession > 0 && (
            <span className="text-slate-600 text-[11px] font-bold">{spinsThisSession} spin{spinsThisSession > 1 ? "s" : ""} this session</span>
          )}
        </div>

        {/* Balance display */}
        <div className="px-5 pt-2 pb-1 flex items-center gap-1">
          <span className="text-slate-600 text-[11px] font-medium">Balance:</span>
          <span className="text-slate-300 text-[11px] font-black">{localBalance.toLocaleString()} PZA</span>
        </div>

        {/* Wheel */}
        <div className="relative flex items-center justify-center py-2 px-4">
          {/* Pointer */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10">
            <div className="w-4 h-6 shadow-lg" style={{ background: "linear-gradient(to bottom, #fbbf24, #f97316)", clipPath: "polygon(50% 100%, 0% 0%, 100% 0%)", filter: "drop-shadow(0 2px 6px rgba(249,115,22,0.7))" }} />
          </div>

          <canvas
            ref={canvasRef}
            width={270}
            height={270}
            className="rounded-full cursor-pointer select-none"
            onClick={spin}
            style={{
              filter: isSpinning ? "drop-shadow(0 0 20px rgba(99,102,241,0.65))" : "drop-shadow(0 0 6px rgba(99,102,241,0.2))",
              opacity: !canAfford && !isSpinning ? 0.45 : 1,
              transition: "opacity 0.3s, filter 0.3s",
            }}
          />
        </div>

        {/* Result */}
        <div className="px-5 pb-1 min-h-[52px] flex items-center justify-center">
          {wonPoints !== null ? (
            isZeroWin ? (
              <div className="flex flex-col items-center gap-0.5 w-full">
                <div className="flex items-center gap-2 w-full justify-center rounded-2xl px-4 py-2.5" style={{ background: "rgba(30,41,59,0.9)", border: "1px solid rgba(100,116,139,0.2)" }}>
                  <span className="text-base">😬</span>
                  <span className="text-slate-300 font-black text-sm">No win this time</span>
                </div>
                <p className="text-slate-700 text-[10px]">−{SPIN_COST} PZA spent</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-0.5 w-full">
                <div className="flex items-center gap-2 w-full justify-center rounded-2xl px-4 py-2.5" style={{ background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.25)" }}>
                  <MdStars className="text-yellow-400 text-xl" />
                  <span className="text-2xl font-black text-white">+{wonPoints.toLocaleString()}</span>
                  <span className="text-yellow-400 font-bold text-sm">PZA</span>
                </div>
                <p className="text-slate-600 text-[10px]">
                  {netGain !== null && netGain >= 0 ? `Net profit: +${netGain.toLocaleString()} PZA` : netGain !== null ? `Net: ${netGain.toLocaleString()} PZA` : ""}
                </p>
              </div>
            )
          ) : isSpinning ? (
            <div className="flex items-center gap-2 text-indigo-400">
              <MdAutorenew className="animate-spin text-lg" />
              <span className="text-xs font-bold tracking-widest uppercase">Spinning…</span>
            </div>
          ) : (
            <p className="text-slate-600 text-xs text-center">
              {canAfford ? "Tap the wheel or button to spin" : `You need at least ${SPIN_COST} PZA to spin`}
            </p>
          )}
        </div>

        {/* Button */}
        <div className="px-5 pb-5 pt-2">
          <button
            onClick={spin}
            disabled={isSpinning || !canAfford}
            className="w-full py-3 rounded-2xl font-black text-sm tracking-wider transition-all active:scale-[0.98]"
            style={
              isSpinning || !canAfford
                ? { background: "rgba(255,255,255,0.04)", color: "#475569", cursor: "not-allowed", border: "1px solid rgba(255,255,255,0.05)" }
                : { background: "linear-gradient(135deg, #4f46e5, #7c3aed)", color: "#fff", boxShadow: "0 4px 20px rgba(79,70,229,0.3)" }
            }
          >
            {isSpinning ? "Spinning…" : !canAfford ? `Need ${SPIN_COST} PZA to spin` : `🎰 SPIN — ${SPIN_COST} PZA`}
          </button>
        </div>
      </div>
    </div>
  );
}
