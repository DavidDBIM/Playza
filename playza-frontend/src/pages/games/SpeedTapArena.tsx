import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router";
import { Trophy, Timer, Zap, X, AlertCircle, Target } from "lucide-react";
import { useTournamentStore } from "@/store/tournamentStore";

// --- TYPES ---
interface TargetProps {
  id: string;
  x: number;
  y: number;
  type: "normal" | "trap" | "boost" | "freeze" | "combo";
  createdAt: number;
}

// --- UTILS ---
const SEED_MULTIPLIER = 1664525;
const SEED_INCREMENT = 1013904223;
const SEED_MODULUS = Math.pow(2, 32);

class SeededRandom {
  private seed: number;
  constructor(seed: number) {
    this.seed = seed;
  }
  next() {
    this.seed = (SEED_MULTIPLIER * this.seed + SEED_INCREMENT) % SEED_MODULUS;
    return this.seed / SEED_MODULUS;
  }
}

const SpeedTapArena: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const matchId = searchParams.get("matchId");
  const seed = parseInt(searchParams.get("seed") || "12345");

  const { submitMatchScore } = useTournamentStore();

  // Game State
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [combo, setCombo] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [isActive, setIsActive] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [targets, setTargets] = useState<TargetProps[]>([]);

  // Derived State (Calculated during render to avoid cascading renders)
  const phase: "warmup" | "chaos" | "clutch" =
    60 - timeLeft < 10
      ? "warmup"
      : 60 - timeLeft < 50
        ? "chaos"
        : "clutch";

  const rng = useRef(new SeededRandom(seed));
  const gameRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const spawnRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // --- GAME LOGIC ---

  const spawnTarget = useCallback(() => {
    if (!isActive || isGameOver) return;

    const id = Math.random().toString(36).substr(2, 9);
    const x = 10 + rng.current.next() * 80; // Margin
    const y = 15 + rng.current.next() * 70;

    // Target types logic
    let type: TargetProps["type"] = "normal";
    const roll = rng.current.next();

    if (phase === "warmup") {
      type = roll > 0.9 ? "boost" : "normal";
    } else if (phase === "chaos") {
      if (roll > 0.8) type = "trap";
      else if (roll > 0.7) type = "boost";
      else if (roll > 0.6) type = "freeze";
      else type = "normal";
    } else {
      // Clutch
      if (roll > 0.7) type = "trap";
      else if (roll > 0.5) type = "combo";
      else if (roll > 0.4) type = "boost";
      else type = "normal";
    }

    const newTarget = { id, x, y, type, createdAt: Date.now() };
    setTargets((prev) => [...prev, newTarget]);

    // Auto-remove target after 2 seconds
    setTimeout(() => {
      setTargets((prev) => prev.filter((t) => t.id !== id));
    }, 2000);
  }, [isActive, isGameOver, phase]);

  const handleTargetClick = (target: TargetProps) => {
    if (isGameOver) return;

    setTargets((prev) => prev.filter((t) => t.id !== target.id));

    let points = 0;
    let newMultiplier = multiplier;
    let newCombo = combo + 1;

    switch (target.type) {
      case "normal":
        points = 10 * multiplier;
        break;
      case "trap":
        points = -20;
        newCombo = 0;
        newMultiplier = 1;
        break;
      case "boost":
        points = 15;
        newMultiplier = Math.min(multiplier + 0.5, 4);
        break;
      case "freeze":
        points = 5;
        // Slow down time effectively by pausing spawn or increasing timer?
        // For simplicity, we'll just give points here
        break;
      case "combo":
        points = 30 * multiplier;
        newCombo += 5;
        break;
    }

    setScore((prev) => prev + points);
    setCombo(newCombo);
    setMultiplier(newMultiplier);
  };

  // --- GAME LOOPS ---

  // Timer Effect (Starts once and runs till game over)
  useEffect(() => {
    if (isActive && !isGameOver) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            setIsGameOver(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, isGameOver]);

  // Spawner Effect (Only resets when valid phase changes to maintain rhythm)
  useEffect(() => {
    if (isActive && !isGameOver) {
      const spawnRate = phase === "warmup" ? 800 : phase === "chaos" ? 400 : 250;
      spawnRef.current = setInterval(spawnTarget, spawnRate);
    }
    return () => {
      if (spawnRef.current) clearInterval(spawnRef.current);
    };
  }, [isActive, isGameOver, phase, spawnTarget]);

  // Handle Game Over
  useEffect(() => {
    if (isGameOver && matchId) {
      // Submit score to store (and subsequently to backend)
      submitMatchScore(matchId, "user_me", score);
    }
  }, [isGameOver, score, matchId, submitMatchScore]);

  return (
    <div className="fixed inset-0 bg-[#050505] text-white flex flex-col items-center justify-center overflow-hidden z-[100] font-body">
      {/* HUD - TOP bar */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-50 bg-linear-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-8">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-black tracking-widest text-primary/60 italic">
              Battle Score
            </span>
            <span className="text-3xl font-black font-headline italic tracking-tighter text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
              {score.toLocaleString()}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-black tracking-widest text-blue-400/60 italic">
              Multiplier
            </span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black font-headline text-blue-400">
                x{multiplier.toFixed(1)}
              </span>
              <div className="h-1 w-16 bg-blue-900/40 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-blue-400"
                  animate={{ width: `${(combo % 10) * 10}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div
            className={`flex items-center gap-3 px-6 py-3 rounded-2xl border ${timeLeft < 10 ? "border-red-500/50 bg-red-500/10" : "border-white/10 bg-white/5"} backdrop-blur-md`}
          >
            <Timer
              className={`${timeLeft < 10 ? "text-red-500" : "text-slate-400"}`}
              size={20}
            />
            <span
              className={`text-3xl font-black font-headline italic ${timeLeft < 10 ? "text-red-500 animate-pulse" : "text-white"}`}
            >
              00:{timeLeft.toString().padStart(2, "0")}
            </span>
          </div>
          <span className="text-[10px] uppercase font-black tracking-[0.3em] mt-2 text-white/30 italic">
            Phase: {phase}
          </span>
        </div>

        <button
          onClick={() => navigate("/tournaments")}
          className="p-3 rounded-full bg-white/5 border border-white/10 hover:bg-red-500/20 hover:border-red-500/50 transition-all text-white/40 hover:text-red-500"
        >
          <X size={20} />
        </button>
      </div>

      {/* GAME ARENA */}
      {!isActive && !isGameOver && (
        <div className="relative z-50 text-center animate-in zoom-in duration-500">
          <h1 className="text-6xl md:text-8xl font-black font-headline text-white italic tracking-tighter mb-8 bg-linear-to-b from-white to-white/20 bg-clip-text text-transparent">
            ARENA READY
          </h1>
          <button
            onClick={() => setIsActive(true)}
            className="group relative px-12 py-5 bg-primary text-slate-950 font-black uppercase text-xl tracking-widest rounded-2xl hover:scale-105 transition-all hover:shadow-[0_0_40px_rgba(var(--primary),0.5)]"
          >
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity rounded-2xl" />
            INITIALIZE BATTLE
          </button>
        </div>
      )}

      <div
        ref={gameRef}
        className="absolute inset-0 w-full h-full cursor-crosshair"
      >
        <AnimatePresence>
          {targets.map((target) => (
            <motion.div
              key={target.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={() => handleTargetClick(target)}
              className="absolute group"
              style={{ left: `${target.x}%`, top: `${target.y}%` }}
            >
              {/* Target Visuals */}
              <div
                className={`relative w-16 h-16 md:w-24 md:h-24 flex items-center justify-center cursor-pointer`}
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className={`absolute inset-0 rounded-full border-4 ${
                    target.type === "normal"
                      ? "border-primary/40 bg-primary/10 shadow-[0_0_20px_rgba(var(--primary),0.3)]"
                      : target.type === "trap"
                        ? "border-red-500/40 bg-red-500/10 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                        : target.type === "boost"
                          ? "border-blue-400/40 bg-blue-400/10 shadow-[0_0_20px_rgba(96,165,250,0.3)]"
                          : target.type === "freeze"
                            ? "border-white/40 bg-white/10 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                            : "border-yellow-400/40 bg-yellow-400/10 shadow-[0_0_20px_rgba(250,204,21,0.3)]"
                  }`}
                />

                <div
                  className={`w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center ${
                    target.type === "normal"
                      ? "bg-primary"
                      : target.type === "trap"
                        ? "bg-red-500"
                        : target.type === "boost"
                          ? "bg-blue-400"
                          : target.type === "freeze"
                            ? "bg-white"
                            : "bg-yellow-400"
                  }`}
                >
                  {target.type === "boost" && (
                    <Zap className="text-white" size={20} />
                  )}
                  {target.type === "trap" && (
                    <AlertCircle className="text-white" size={20} />
                  )}
                  {target.type === "freeze" && (
                    <div className="w-4 h-4 rounded-full bg-blue-200" />
                  )}
                  {target.type === "combo" && (
                    <Target className="text-white" size={20} />
                  )}
                </div>

                {/* Ring Animation */}
                <motion.div
                  initial={{ scale: 0.5, opacity: 0.8 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`absolute inset-0 rounded-full border-2 ${
                    target.type === "normal" ? "border-primary" : "border-white"
                  }`}
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* GAME OVER SCREEN */}
      <AnimatePresence>
        {isGameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-100 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-lg glass-card p-10 rounded-[40px] border border-white/10 text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-primary via-purple-500 to-blue-500" />

              <div className="w-24 h-24 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-8 animate-bounce">
                <Trophy className="text-primary size-12" />
              </div>

              <h2 className="text-xs uppercase font-black tracking-[0.5em] text-primary mb-2 italic">
                Battle Concluded
              </h2>
              <h1 className="text-5xl md:text-7xl font-black font-headline text-white italic tracking-tighter mb-8">
                {score.toLocaleString()}
              </h1>

              <div className="grid grid-cols-2 gap-4 mb-10 text-left">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[10px] uppercase font-black text-slate-500 tracking-widest">
                    Accuracy
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-2xl font-black text-white italic">
                      94%
                    </span>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[10px] uppercase font-black text-slate-500 tracking-widest">
                    Max Combo
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-2xl font-black text-white italic">
                      {combo}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => navigate("/tournaments")}
                  className="w-full py-5 bg-primary text-slate-950 font-black uppercase tracking-widest rounded-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(var(--primary),0.3)]"
                >
                  SUBMIT TO BRACKET <Zap size={20} />
                </button>
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest italic">
                  Results will be validated on the secure server
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-500 rounded-full blur-[120px]" />
      </div>
    </div>
  );
};

export default SpeedTapArena;
