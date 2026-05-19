import { useState, useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { emojipopApi } from "@/api/emojipop.api";
import { supabase } from "@/config/supabase";
import { useToast } from "@/context/toast";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { 
  Swords, 
  Bot, 
  User, 
  Maximize, 
  Minimize, 
  Loader2,
  Tv
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import H2HWinner from "../H2HWinner";
import type { UserProfile } from "@/context/auth";

interface EmojiPopArenaProps {
  room: {
    id: string;
    code: string;
    stake: number;
    status: string;
    winner_id: string | null;
    is_bot: boolean;
    bot_difficulty: string | null;
    host_id: string;
    guest_id: string | null;
    host: { id: string; username: string; avatar_url: string | null };
    guest?: { id: string; username: string; avatar_url: string | null } | null;
  };
  user: UserProfile | null;
}

interface OpponentState {
  paddleXRatio: number;
  paddleWidthRatio: number;
  balls: {
    xRatio: number;
    yRatio: number;
    radiusRatio: number;
    emoji: string;
    isBoss: boolean;
  }[];
  score: number;
  comboStreak: number;
  shieldActive: boolean;
  storedShields: number;
  slowMoActive: boolean;
  widePaddleActive: boolean;
}

export default function EmojiPopArena({ room, user }: EmojiPopArenaProps) {
  const toast = useToast();
  const queryClient = useQueryClient();

  const [phase, setPhase] = useState<"countdown" | "playing" | "submitted" | "finished">( "countdown" );
  const [countdown, setCountdown] = useState(3);
  const [myScore, setMyScore] = useState(0);
  const [rivalScore, setRivalScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [roomData, setRoomData] = useState(room);

  // Spectator Canvas State
  const [rivalGameState, setRivalGameState] = useState<OpponentState | null>(null);
  const miniCanvasRef = useRef<HTMLCanvasElement>(null);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const broadcastChannelRef = useRef<RealtimeChannel | null>(null);

  const isHost = roomData.host_id === user?.id;
  const role = isHost ? "host" : "guest";

  // Opponent Details
  const opponentName = roomData.is_bot 
    ? `Playza Bot (${roomData.bot_difficulty || "medium"})`
    : isHost 
      ? roomData.guest?.username || "Opponent"
      : roomData.host?.username || "Host";

  const opponentAvatar = roomData.is_bot 
    ? null 
    : isHost 
      ? roomData.guest?.avatar_url 
      : roomData.host?.avatar_url;

  // ── Fullscreen Handlers ──────────────────────────────────────────────────
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  }, []);

  // ── Match Polling and Completion ─────────────────────────────────────────
  useEffect(() => {
    if (phase === "finished" || phase === "countdown") return;

    const pollMatch = setInterval(async () => {
      try {
        const freshRoom = await emojipopApi.getRoom(roomData.id);
        setRoomData(freshRoom);

        if (freshRoom.status === "finished") {
          setPhase("finished");
          clearInterval(pollMatch);
        }
      } catch (e) {
        console.error("Match fetch issue", e);
      }
    }, 3000);

    return () => clearInterval(pollMatch);
  }, [phase, roomData.id]);

  // ── Countdown Tick ────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "countdown") return;
    if (countdown === 0) {
      setPhase("playing");
      return;
    }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, phase]);

  // ── Real-time Score & State Broadcast Sync (Supabase) ─────────────────────
  useEffect(() => {
    if (phase !== "playing") return;

    const channel = supabase.channel(`emojipop-duel-${roomData.id}`, {
      config: { broadcast: { self: false } }
    });

    channel
      .on("broadcast", { event: "live-score" }, (payload: { payload: { userId: string; score: number } }) => {
        if (payload.payload.userId !== user?.id) {
          setRivalScore(payload.payload.score);
        }
      })
      .on("broadcast", { event: "rival-state-sync" }, (payload: { payload: { userId: string; state: OpponentState } }) => {
        if (payload.payload.userId !== user?.id) {
          setRivalGameState(payload.payload.state);
          setRivalScore(payload.payload.state.score);
        }
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          broadcastChannelRef.current = channel;
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [phase, roomData.id, user?.id]);

  // ── Local Physics Simulator for AI Bot Preview ────────────────────────────
  useEffect(() => {
    if (phase !== "playing" || !roomData.is_bot) return;

    const botDifficulty = roomData.bot_difficulty || "medium";
    const lerpSpeed = botDifficulty === "easy" ? 0.05 : botDifficulty === "medium" ? 0.09 : 0.16;
    const ballSpeed = botDifficulty === "easy" ? 0.008 : botDifficulty === "medium" ? 0.012 : 0.018;

    // Simulated Bot physics parameters
    let simBallX = 0.5;
    let simBallY = 0.2;
    let simBallVx = ballSpeed;
    let simBallVy = ballSpeed;
    let simPaddleX = 0.5;
    let simPaddleWidth = 0.25;
    let simScore = 0;
    let simBounces = 0;
    let simShieldActive = false;
    let simWideActive = false;

    const simInterval = setInterval(() => {
      // 1. Move Ball
      simBallX += simBallVx;
      simBallY += simBallVy;

      // 2. Wall collisions
      if (simBallX <= 0.04 || simBallX >= 0.96) {
        simBallVx = -simBallVx;
      }
      if (simBallY <= 0.04) {
        simBallVy = -simBallVy;
      }

      // 3. AI Paddle Tracking (smooth Lerp toward ball)
      const targetPaddleX = simBallX - simPaddleWidth / 2;
      simPaddleX += (targetPaddleX - simPaddleX) * lerpSpeed;
      simPaddleX = Math.max(0, Math.min(1 - simPaddleWidth, simPaddleX));

      // 4. Paddle Deflections (Height = 90% Y level)
      if (simBallY >= 0.88 && simBallY <= 0.91 && simBallVy > 0) {
        if (simBallX >= simPaddleX && simBallX <= simPaddleX + simPaddleWidth) {
          simBallVy = -simBallVy;
          simScore += 100;
          simBounces++;

          // Powerup simulations
          if (simBounces % 4 === 0) {
            simWideActive = true;
            simPaddleWidth = 0.35;
          } else if (simBounces % 5 === 0) {
            simWideActive = false;
            simPaddleWidth = 0.25;
          }
          if (simBounces % 7 === 0) {
            simShieldActive = true;
          }
        }
      }

      // 5. Fall down reset
      if (simBallY >= 0.98) {
        if (simShieldActive) {
          simBallVy = -Math.abs(simBallVy);
          simShieldActive = false;
        } else {
          // Reset ball at top
          simBallX = 0.5;
          simBallY = 0.2;
          simBallVx = (Math.random() > 0.5 ? 1 : -1) * ballSpeed;
          simBallVy = ballSpeed;
        }
      }

      // 6. Set active simulated frame
      const frameState: OpponentState = {
        paddleXRatio: simPaddleX,
        paddleWidthRatio: simPaddleWidth,
        balls: [{
          xRatio: simBallX,
          yRatio: simBallY,
          radiusRatio: 0.025,
          emoji: "😀",
          isBoss: false
        }],
        score: simScore,
        comboStreak: Math.floor(simBounces / 3),
        shieldActive: simShieldActive,
        storedShields: 0,
        slowMoActive: false,
        widePaddleActive: simWideActive
      };

      setRivalGameState(frameState);
      setRivalScore(simScore);

    }, 33); // 30 fps

    return () => clearInterval(simInterval);
  }, [phase, roomData.is_bot, roomData.bot_difficulty]);

  // ── Spectator Canvas Drawing Context ──────────────────────────────────────
  useEffect(() => {
    const canvas = miniCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Draw Static searching/tuning background if no frame data
    if (!rivalGameState || phase === "countdown") {
      ctx.fillStyle = "#020617";
      ctx.fillRect(0, 0, w, h);

      // Spectator grid
      ctx.strokeStyle = "rgba(59, 130, 246, 0.05)";
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 15) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 0; y < h; y += 15) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }

      // Tuning static noise
      ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
      for (let i = 0; i < 200; i++) {
        ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
      }

      ctx.fillStyle = "#475569";
      ctx.font = "bold 8px Courier New";
      ctx.textAlign = "center";
      ctx.fillText("TUNING TRANSCEIVER...", w / 2, h / 2);
      return;
    }

    // ── ACTIVE GAMEPLAY SPECTATOR RENDERING ──
    ctx.fillStyle = "#030712";
    ctx.fillRect(0, 0, w, h);

    // Glowing grid lines
    ctx.strokeStyle = "rgba(239, 68, 68, 0.03)";
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 12) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y < h; y += 12) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // Slow-Mo active effect overlays
    if (rivalGameState.slowMoActive) {
      ctx.fillStyle = "rgba(6, 182, 212, 0.04)";
      ctx.fillRect(0, 0, w, h);
    }

    // ── Draw Rival Paddle ──
    const padW = rivalGameState.paddleWidthRatio * w;
    const padX = rivalGameState.paddleXRatio * w;
    const padY = h - 16;
    const padH = 4;

    ctx.shadowBlur = 6;
    ctx.shadowColor = roomData.is_bot ? "#f5a623" : "#ef4444";
    ctx.fillStyle = roomData.is_bot ? "#f5a623" : "#ef4444";

    // Round rect paddle
    ctx.beginPath();
    ctx.roundRect(padX, padY, padW, padH, 2);
    ctx.fill();

    // ── Draw Safety Shield ──
    if (rivalGameState.shieldActive) {
      ctx.shadowColor = "#00e5ff";
      ctx.strokeStyle = "rgba(0, 229, 255, 0.8)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(padX - 4, padY - 6);
      ctx.lineTo(padX + padW + 4, padY - 6);
      ctx.stroke();
    }

    // Reset shadow for text drawing
    ctx.shadowBlur = 0;

    // ── Draw Emojis/Balls ──
    rivalGameState.balls.forEach((ball) => {
      const bx = ball.xRatio * w;
      const by = ball.yRatio * h;

      if (ball.isBoss) {
        ctx.fillStyle = "#ec4899";
        ctx.beginPath();
        ctx.arc(bx, by, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = "8px Arial";
        ctx.fillText("👿", bx - 4, by + 3);
      } else {
        // Draw active emoji
        ctx.font = "10px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(ball.emoji || "😀", bx, by);
      }
    });

  }, [rivalGameState, phase, roomData.is_bot]);

  // ── Listen for state/score messages from within iframe ─────────────────────
  useEffect(() => {
    const handleGameMessage = async (e: MessageEvent) => {
      if (phase !== "playing") return;

      const { type, score, payload } = e.data;

      // Realtime frame coordinate syncing
      if (type === "H2H_STATE_SYNC" && payload) {
        setMyScore(payload.score);

        // Broadcast to human opponent
        if (broadcastChannelRef.current && !roomData.is_bot) {
          broadcastChannelRef.current.send({
            type: "broadcast",
            event: "rival-state-sync",
            payload: { userId: user?.id, state: payload }
          });
        }
      }

      // Handle continuous score updates
      if (type === "SCORE_UPDATE" && typeof score === "number") {
        setMyScore(score);

        if (broadcastChannelRef.current && !roomData.is_bot) {
          broadcastChannelRef.current.send({
            type: "broadcast",
            event: "live-score",
            payload: { userId: user?.id, score }
          });
        }
      }

      // Handle round completions
      if ((type === "GAME_OVER" || type === "PLAYZA_SCORE_SUBMISSION") && phase === "playing") {
        const finalScore = typeof score === "number" ? score : (payload?.score || 0);
        setMyScore(finalScore);
        setPhase("submitted");
        setIsSubmitting(true);

        try {
          const finalResult = await emojipopApi.submitResult(roomData.id, finalScore);
          
          if (finalResult.finished) {
            setPhase("finished");
            queryClient.invalidateQueries({ queryKey: ["h2h", "room", roomData.id] });
          } else {
            toast.custom("score", "Result submitted! Waiting for your rival to complete their run...", "SUBMITTED");
          }
        } catch (err: unknown) {
          toast.error(err instanceof Error ? err.message : "Failed to submit round score.");
        } finally {
          setIsSubmitting(false);
        }
      }
    };

    window.addEventListener("message", handleGameMessage);
    return () => window.removeEventListener("message", handleGameMessage);
  }, [phase, roomData.id, roomData.is_bot, user?.id, queryClient, toast]);

  // Parameterized launcher frame url
  const iframeUrl = (() => {
    const base = `/gameLib/emoji-pop/index.html`;
    const separator = "?";
    return `${base}${separator}mode=h2h&roomId=${roomData.id}&role=${role}`;
  })();

  const leading = myScore > rivalScore ? "me" : rivalScore > myScore ? "rival" : "draw";
  const totalScore = myScore + rivalScore || 1;
  const ratio = (myScore / totalScore) * 100;

  // ── Render States ─────────────────────────────────────────────────────────
  if (phase === "countdown") {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-slate-950 z-[999]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center space-y-6"
        >
          <img src="/logoImage.png" alt="Playza" className="h-10 mx-auto opacity-70" loading="lazy" />
          <h2 className="text-slate-500 font-black uppercase tracking-[0.2em] text-xs md:text-sm animate-pulse">
            Emoji Pop Warzone Initializing...
          </h2>
          <div className="text-[100px] md:text-[140px] font-black text-primary leading-none italic drop-shadow-[0_0_35px_rgba(59,130,246,0.5)]">
            {countdown === 0 ? "GO!" : countdown}
          </div>
        </motion.div>
      </div>
    );
  }

  if (phase === "finished") {
    return (
      <div className="fixed inset-0 z-[1000] overflow-y-auto bg-slate-950/95 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <H2HWinner 
            room={roomData}
            user={user}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-200 bg-slate-950 flex flex-col overflow-hidden select-none">
      
      {/* ── Glassmorphic Dual Score HUD Header ── */}
      <div className="absolute top-4 left-4 right-4 flex flex-col gap-2 z-100 pointer-events-none">
        <div className="flex justify-between items-center w-full">
          
          {/* User Score Card */}
          <div className="bg-black/60 backdrop-blur-md px-3 md:px-5 py-2 rounded-full border border-white/10 shadow-xl flex items-center gap-2 md:gap-3 pointer-events-auto">
            <div className="shrink-0 w-7 h-7 rounded-full bg-primary flex items-center justify-center text-slate-950 font-black text-xs overflow-hidden">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} className="w-full h-full object-cover" alt="" />
              ) : (
                <User size={14} />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-primary uppercase tracking-widest leading-none">YOU</span>
              <span className="text-sm md:text-lg font-black text-white leading-tight">{myScore.toLocaleString()}</span>
            </div>
            {leading === "me" && (
              <span className="bg-primary/20 text-primary text-[8px] font-black uppercase px-2 py-0.5 rounded-full border border-primary/20 animate-pulse hidden sm:inline">
                👑 LEADING
              </span>
            )}
          </div>

          {/* VS Center Marker */}
          <div className="bg-slate-900/80 backdrop-blur-md px-4 py-2.5 rounded-full border border-white/5 shadow-2xl flex items-center gap-2">
            <Swords className="text-primary animate-pulse" size={16} />
            <span className="text-[10px] md:text-xs font-black text-slate-400 tracking-widest italic">VS</span>
            {roomData.stake > 0 && (
              <span className="text-emerald-400 text-[10px] font-black uppercase tracking-wider hidden sm:inline">
                💰 {roomData.stake} ZA
              </span>
            )}
          </div>

          {/* Opponent Score Card */}
          <div className="bg-black/60 backdrop-blur-md px-3 md:px-5 py-2 rounded-full border border-white/10 shadow-xl flex items-center gap-2 md:gap-3 pointer-events-auto">
            {leading === "rival" && (
              <span className="bg-red-500/20 text-red-400 text-[8px] font-black uppercase px-2 py-0.5 rounded-full border border-red-500/20 animate-pulse hidden sm:inline">
                👑 LEADING
              </span>
            )}
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-black text-red-400 uppercase tracking-widest leading-none truncate max-w-[80px]">
                {opponentName}
              </span>
              <span className="text-sm md:text-lg font-black text-white leading-tight">{rivalScore.toLocaleString()}</span>
            </div>
            <div className="shrink-0 w-7 h-7 rounded-full bg-red-500 flex items-center justify-center text-white font-black text-xs overflow-hidden">
              {opponentAvatar ? (
                <img src={opponentAvatar} className="w-full h-full object-cover" alt="" />
              ) : roomData.is_bot ? (
                <Bot size={14} className="text-white" />
              ) : (
                <User size={14} />
              )}
            </div>
          </div>

        </div>

        {/* 🏆 Neon Split Progress Score Bar */}
        <div className="w-full h-2 bg-slate-900/60 backdrop-blur-md rounded-full overflow-hidden border border-white/5 relative flex">
          <div 
            className="h-full bg-primary transition-all duration-300 ease-out shadow-[0_0_10px_rgba(59,130,246,0.6)]" 
            style={{ width: `${ratio}%` }}
          />
          <div 
            className="h-full bg-red-500 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(239,68,68,0.6)]" 
            style={{ width: `${100 - ratio}%` }}
          />
        </div>
      </div>

      {/* ── Sandboxed Game Iframe ── */}
      <div className="flex-1 min-h-0 w-full relative pt-20">
        <div className="h-full w-full px-2 pb-3 md:px-4 md:pb-4">
          <div className="mx-auto flex h-full w-full max-w-5xl items-center justify-center overflow-hidden rounded-2xl bg-slate-950/80 shadow-2xl ring-1 ring-white/10 relative">
            <iframe 
              ref={iframeRef}
              src={iframeUrl} 
              className="w-full h-full border-none"
              title="Emoji Pop Duel"
              allow="autoplay; fullscreen"
            />
            
            {/* 🎥 E-Sports Spectator Mini-Canvas Live Preview (Bottom-Left Corner) */}
            <div className="absolute bottom-4 left-4 z-100 w-[120px] h-[180px] md:w-[140px] md:h-[210px] bg-black/75 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col pointer-events-auto group hover:scale-105 transition-all">
              <div className="px-2.5 py-1.5 bg-red-950/20 border-b border-white/5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                  <span className="text-[7px] md:text-[8px] font-black text-slate-200 tracking-wider">LIVE</span>
                </div>
                <Tv size={10} className="text-white/40 group-hover:text-primary transition-colors" />
              </div>
              <div className="flex-1 min-h-0 relative bg-slate-950">
                <canvas 
                  ref={miniCanvasRef} 
                  width={140} 
                  height={210} 
                  className="w-full h-full"
                />
              </div>
              <div className="p-1.5 bg-black/60 border-t border-white/5 text-center shrink-0">
                <p className="text-[7px] md:text-[8px] font-bold text-slate-400 tracking-wide uppercase truncate">
                  {opponentName}
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Submitting Overlay ── */}
      <AnimatePresence>
        {isSubmitting && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center z-400 gap-4"
          >
            <div className="bg-slate-900/80 p-8 rounded-3xl border border-primary/30 max-w-sm text-center space-y-4 shadow-2xl">
              <Loader2 size={40} className="text-primary animate-spin mx-auto" />
              <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Score Verification</h3>
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest leading-relaxed">
                We are validating your final score against our anti-cheat sentinel. Please hold on...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Bottom Floating Controls ── */}
      <div className="absolute bottom-4 right-4 z-100 flex gap-2 pointer-events-auto">
        <button
          onClick={toggleFullscreen}
          className="bg-black/60 backdrop-blur-md p-3 rounded-full text-white/50 hover:text-white transition-all border border-white/10 shadow-lg hover:scale-105 active:scale-95"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
        </button>
      </div>

    </div>
  );
}
