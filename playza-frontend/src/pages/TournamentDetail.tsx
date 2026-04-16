import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Clock,
  Users,
  Play,
  Shield,
  ChevronRight,
  Target,
  Zap,
  Award,
  Info,
  MapPin,
  CheckCircle2,
  Lock,
  ArrowRight,
} from "lucide-react";
import { useTournamentStore } from "@/store/tournamentStore";
import { ZASymbol } from "@/components/currency/ZASymbol";
import { tournamentGames } from "@/data/tournamentGames";

const TournamentDetail: React.FC = () => {
  const navigate = useNavigate();
  const {
    activeTournament,
    userPlayer,
    matches,
    isLoading,
    fetchActiveTournament,
    joinTournament,
    fetchMatches,
  } = useTournamentStore();

  const [timeLeft, setTimeLeft] = useState<{ h: number; m: number; s: number }>(
    { h: 0, m: 34, s: 12 },
  );

  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (id) {
      fetchActiveTournament(id);
      fetchMatches(id);
    }
  }, [id, fetchActiveTournament, fetchMatches]);

  // Countdown timer simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.s > 0) return { ...prev, s: prev.s - 1 };
        if (prev.m > 0) return { ...prev, m: prev.m - 1, s: 59 };
        if (prev.h > 0) return { h: prev.h - 1, m: 59, s: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (isLoading || !activeTournament) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 animate-pulse italic">
            Synchronizing Arena Data...
          </span>
        </div>
      </div>
    );
  }

  const handleJoin = () => {
    joinTournament("user_me");
  };

  const handlePlayMatch = (matchId: string) => {
    navigate(
      `/games/speed-tap-arena?matchId=${matchId}&seed=${Math.floor(Math.random() * 100000)}`,
    );
  };

  return (
    <div className="flex flex-col flex-1 pb-20 w-full overflow-hidden font-body text-slate-900 dark:text-white">
      {/* 1. HERO SECTION */}
      <section className="relative w-full rounded-xl overflow-hidden border border-white/5 bg-slate-950 p-8 md:p-12 mb-10 shadow-2xl">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-linear-to-b from-primary/40 via-slate-950/90 to-slate-950 z-10 mix-blend-multiply" />
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_30%,rgba(var(--primary),0.3),transparent_60%)] z-10" />
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center opacity-40 mix-blend-luminosity"
            style={{ backgroundImage: `url(https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop)` }}
          />
          {/* Animated particles background could go here */}
        </div>

        <div className="relative z-20 flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 bg-primary/20 text-primary border border-primary/30 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-[0.2em] mb-6 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-primary" /> LIVE
              TOURNAMENT
            </div>

            <h1 className="text-5xl md:text-7xl font-black font-headline text-white uppercase tracking-tighter mb-4 italic leading-none">
              {activeTournament.name}
            </h1>

            <p className="text-slate-400 text-sm md:text-lg font-bold uppercase tracking-widest mb-8 max-w-xl">
              Battle for supremacy in the ultimate reflex showdown. 16 players
              enter, only 1 becomes the legend.
            </p>

            <div className="flex flex-wrap items-center gap-6">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6 backdrop-blur-xl">
                <span className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-1 block">
                  Prize Pool
                </span>
                <div className="flex items-center gap-2">
                  <ZASymbol className="text-primary size-6" />
                  <span className="text-3xl md:text-5xl font-black font-headline italic tracking-tighter text-white">
                    {activeTournament.prize_pool.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6 backdrop-blur-xl min-w-50">
                <span className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-1 block">
                  Starts In
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl md:text-5xl font-black font-headline italic tracking-tighter text-primary">
                    {timeLeft.h.toString().padStart(2, "0")}:
                    {timeLeft.m.toString().padStart(2, "0")}:
                    {timeLeft.s.toString().padStart(2, "0")}
                  </span>
                  <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
                    H:M:S
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full md:w-auto shrink-0 space-y-4">
            {!userPlayer ? (
              <button
                onClick={handleJoin}
                className="group relative w-full md:w-80 h-20 bg-primary text-slate-950 font-black uppercase text-xl tracking-widest rounded-2xl hover:scale-105 transition-all shadow-[0_0_40px_rgba(var(--primary),0.3)] flex items-center justify-center gap-3 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
                JOIN TOURNAMENT <ArrowRight size={24} />
              </button>
            ) : (
              <div className="w-full md:w-80 h-20 bg-green-500/10 border-2 border-green-500/30 rounded-2xl flex items-center justify-center gap-3 animate-in fade-in zoom-in duration-500">
                <CheckCircle2 className="text-green-500" size={28} />
                <span className="text-green-500 font-black uppercase text-xl tracking-widest">
                  YOU'RE IN
                </span>
              </div>
            )}
            <p className="text-[10px] text-center font-bold text-slate-500 uppercase tracking-widest italic opacity-60">
              Entry Fee: <ZASymbol className="inline-block scale-75" />
              {activeTournament.entry_fee} • Non-refundable
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-10">
          {/* 4. BRACKET SYSTEM */}
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black font-headline uppercase tracking-tighter flex items-center gap-3">
                <Shield className="text-primary" /> Tournament Bracket
              </h2>
              <div className="flex gap-2">
                <span className="bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest">
                  ROUND 1: QUARTERFINALS
                </span>
              </div>
            </div>

            <div className="glass-card rounded-xl border border-white/5 p-8 overflow-x-auto custom-scrollbar">
              <div className="flex items-center gap-12 min-w-200 py-10">
                {/* Round 1 (Quarterfinals) */}
                <div className="flex-1 space-y-12">
                  {matches
                    .filter((m) => m.round === 1)
                    .map((match) => (
                      <div key={match.id} className="relative">
                        <div className="space-y-2">
                          <div
                            className={`bg-slate-900 border rounded-xl p-3 flex justify-between items-center transition-all ${
                              match.winner_id === match.player1_id &&
                              match.winner_id
                                ? "border-primary bg-primary/5"
                                : "border-white/5"
                            }`}
                          >
                            <span
                              className={`text-xs font-bold ${match.player1_id === userPlayer?.user_id ? "text-primary" : "text-slate-400"}`}
                            >
                              {match.player1_id
                                ? `Player ${match.player1_id.slice(-4)}`
                                : "TBD"}
                            </span>
                            <span className="text-xs font-black text-slate-600">
                              {match.player1_score || "--"}
                            </span>
                          </div>
                          <div
                            className={`bg-slate-900 border rounded-xl p-3 flex justify-between items-center transition-all ${
                              match.winner_id === match.player2_id &&
                              match.winner_id
                                ? "border-primary bg-primary/5"
                                : "border-white/5"
                            }`}
                          >
                            <span
                              className={`text-xs font-bold ${match.player2_id === userPlayer?.user_id ? "text-primary" : "text-slate-400"}`}
                            >
                              {match.player2_id
                                ? `Player ${match.player2_id.slice(-4)}`
                                : "TBD"}
                            </span>
                            <span className="text-xs font-black text-slate-600">
                              {match.player2_score || "--"}
                            </span>
                          </div>
                        </div>
                        {/* Connector Line */}
                        <div className="absolute top-1/2 -right-12 w-12 h-0.5 bg-white/10" />
                      </div>
                    ))}
                </div>

                {/* Round 2 */}
                <div className="flex-1 space-y-36 pb-10">
                  {matches
                    .filter((m) => m.round === 2)
                    .map((match) => (
                      <div key={match.id} className="relative">
                        {/* Vertical Bracket Line */}
                        <div className="absolute -left-6 -top-7.5 -bottom-7.5 w-0.5 bg-white/10" />
                        <div className="space-y-2">
                          <div className="bg-slate-900/50 border border-white/5 rounded-xl p-3 flex justify-between items-center border-dashed">
                            <span className="text-xs font-bold text-slate-500">
                              {match.player1_id
                                ? `Player ${match.player1_id.slice(-4)}`
                                : "TBD"}
                            </span>
                          </div>
                          <div className="bg-slate-900/50 border border-white/5 rounded-xl p-3 flex justify-between items-center border-dashed">
                            <span className="text-xs font-bold text-slate-500">
                              {match.player2_id
                                ? `Player ${match.player2_id.slice(-4)}`
                                : "TBD"}
                            </span>
                          </div>
                        </div>
                        <div className="absolute top-1/2 -right-12 w-12 h-0.5 bg-white/10" />
                      </div>
                    ))}
                </div>

                {/* Final */}
                <div className="flex-1">
                  <div className="relative">
                    <div className="absolute -left-6 -top-7.5 -bottom-7.5 w-0.5 bg-white/10" />
                    <div className="flex flex-col items-center">
                      <Award
                        className="text-yellow-500 mb-4 scale-150 animate-bounce"
                        size={32}
                      />
                      <div className="w-full bg-linear-to-b from-yellow-500/20 to-transparent border-2 border-yellow-500/30 rounded-2xl p-6 text-center">
                        <div className="text-[10px] font-black text-yellow-500 uppercase tracking-widest mb-1">
                          Final Winner
                        </div>
                        <div className="text-xl font-black text-white italic">
                          CHAMPION
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 3. HOW IT WORKS */}
          <section>
            <h2 className="text-2xl font-black font-headline uppercase tracking-tighter flex items-center gap-3 mb-6">
              <Info className="text-blue-400" /> Progression System
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                {
                  step: 1,
                  title: "Join Arena",
                  desc: "Secure your spot in the bracket",
                },
                {
                  step: 2,
                  title: "Matchmake",
                  desc: "Get paired against your rival",
                },
                {
                  step: 3,
                  title: "Dominate",
                  desc: "Win your 1v1 reaction battle",
                },
                {
                  step: 4,
                  title: "Claim Glory",
                  desc: "Advance to win the grand prize",
                },
              ].map((s) => (
                <div
                  key={s.step}
                  className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 text-center relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 p-2 text-white/5 font-black text-4xl">
                    {s.step}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4 text-primary font-black text-xs">
                    {s.step}
                  </div>
                  <h4 className="text-sm font-black uppercase text-white mb-2 tracking-widest">
                    {s.title}
                  </h4>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-8">
          {/* 5. PLAYER STATE PANEL (DYNAMIC) */}
          <section>
            <h2 className="text-xl font-black font-headline uppercase tracking-tighter flex items-center gap-2 mb-4">
              <Zap className="text-primary" /> Current Round
            </h2>

            <div className="glass-card rounded-xl border border-primary/20 bg-primary/5 p-8 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
              <AnimatePresence mode="wait">
                {!userPlayer ? (
                  <motion.div
                    key="not-joined"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center"
                  >
                    <Lock className="text-slate-500 mb-4" size={40} />
                    <h3 className="text-lg font-black uppercase text-white mb-2 tracking-widest">
                      Arena Locked
                    </h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 leading-relaxed">
                      You must join the tournament to view your live match
                      status.
                    </p>
                    <button
                      onClick={handleJoin}
                      className="px-8 py-3 bg-white text-slate-950 font-black uppercase text-xs tracking-widest rounded-xl hover:bg-primary transition-all"
                    >
                      SECURE ENTRY
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="joined"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center"
                  >
                    <div className="flex items-center gap-6 mb-8 w-full">
                      <div className="flex-1 flex flex-col items-center gap-2">
                        <img
                          src="https://i.pravatar.cc/150?u=me"
                          className="w-16 h-16 rounded-2xl border-2 border-primary"
                          alt="me"
                        />
                        <span className="text-[10px] font-black uppercase text-white tracking-widest">
                          Me
                        </span>
                      </div>
                      <div className="text-2xl font-black italic text-slate-700 font-headline">
                        VS
                      </div>
                      <div className="flex-1 flex flex-col items-center gap-2 grayscale group hover:grayscale-0 transition-all">
                        <div className="w-16 h-16 rounded-2xl border-2 border-white/10 bg-slate-800 flex items-center justify-center">
                          <Users size={24} className="text-slate-600" />
                        </div>
                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest italic">
                          Awaiting Rival
                        </span>
                      </div>
                    </div>

                    <div className="w-full space-y-4">
                      <div className="bg-black/40 rounded-2xl p-4 border border-white/10 flex justify-between items-center text-left">
                        <div>
                          <span className="text-[10px] uppercase font-black text-slate-500 tracking-widest block">
                            Qualification Round
                          </span>
                          <span className="text-sm font-black text-white italic tracking-widest uppercase">
                            Quarterfinals
                          </span>
                        </div>
                        <ChevronRight className="text-primary" />
                      </div>

                      <button
                        onClick={() => handlePlayMatch("m1")}
                        className="w-full py-5 bg-linear-to-r from-primary to-purple-600 text-white font-black uppercase tracking-[0.2em] rounded-2xl hover:scale-105 transition-all shadow-[0_10px_30px_rgba(var(--primary),0.3)] flex items-center justify-center gap-2"
                      >
                        PLAY MATCH <Play size={18} fill="currentColor" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>

          {/* 2. TOURNAMENT DETAILS CARD */}
          <section className="bg-slate-900 border border-white/5 rounded-xl p-8">
            <h3 className="text-xs uppercase font-black text-slate-500 tracking-[0.3em] mb-6">
              Arena Metadata
            </h3>
            <div className="space-y-4">
              {[
                {
                  icon: Target,
                  label: "Game",
                  val:
                    tournamentGames.find(
                      (g) => g.id === activeTournament.game_id,
                    )?.title || "Speed Tap Arena",
                },
                { icon: Trophy, label: "Mode", val: "1v1 Elimination" },
                {
                  icon: Users,
                  label: "Players",
                  val: `${activeTournament.max_players} Slots / Full`,
                },
                {
                  icon: Clock,
                  label: "Match Time",
                  val: `${activeTournament.match_duration} Seconds`,
                },
                {
                  icon: MapPin,
                  label: "Region",
                  val: activeTournament.region || "Global",
                },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                    <item.icon size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-black text-slate-500 tracking-widest block">
                      {item.label}
                    </span>
                    <span className="text-xs font-black text-white uppercase tracking-widest">
                      {item.val}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 6. REWARD BREAKDOWN */}
          <section>
            <h2 className="text-xl font-black font-headline uppercase tracking-tighter flex items-center gap-2 mb-4">
              <Award className="text-yellow-500" /> Prize Hierarchy
            </h2>
            <div className="space-y-3">
              {[
                {
                  rank: "1st",
                  bg: "bg-yellow-500/10",
                  border: "border-yellow-500/30",
                  text: "text-yellow-400",
                  label: "Grand Champion",
                  pct: 0.6,
                },
                {
                  rank: "2nd",
                  bg: "bg-slate-300/10",
                  border: "border-slate-300/30",
                  text: "text-slate-200",
                  label: "Silver Finalist",
                  pct: 0.25,
                },
                {
                  rank: "3rd",
                  bg: "bg-orange-500/10",
                  border: "border-orange-500/30",
                  text: "text-orange-400",
                  label: "Bronze Elite",
                  pct: 0.15,
                },
              ].map((r) => (
                <div
                  key={r.rank}
                  className={`${r.bg} ${r.border} border rounded-2xl p-4 flex justify-between items-center group hover:bg-white/5 transition-all`}
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={`text-2xl font-black italic font-headline ${r.text}`}
                    >
                      {r.rank}
                    </span>
                    <div>
                      <span className="text-[10px] uppercase font-black text-slate-500 tracking-widest block">
                        Level
                      </span>
                      <span className="text-xs font-black text-white uppercase tracking-widest">
                        {r.label}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1.5 justify-end">
                      <ZASymbol className={`scale-75 ${r.text}`} />
                      <span className={`text-xl font-black ${r.text}`}>
                        {(activeTournament.prize_pool * r.pct).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TournamentDetail;
