import { useState } from "react";
import { useParams, Link } from "react-router";
import {
  tournaments,
  tournamentStages,
  tournamentParticipants,
} from "@/data/tournaments";
import { games } from "@/data/games";
import { ZASymbol } from "@/components/currency/ZASymbol";
import {
  Clock,
  Trophy,
  ArrowLeft,
  Gamepad2,
  Medal,
  ExternalLink,
  Skull,
} from "lucide-react";
import SessionLeaderboard from "@/components/gameSession/SessionLeaderboard";

const TournamentDetail = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<
    "overview" | "stages" | "leaderboard" | "progress" | "sessions"
  >("overview");

  const tournament = tournaments.find((t) => t.id === id);
  const game = games.find((g) => g.id === tournament?.gameId);
  const stages = tournamentStages.filter((s) => s.tournamentId === id);
  const myParticipant = tournamentParticipants.find(
    (p) => p.tournamentId === id && p.userId === "user_me",
  );

  if (!tournament || !game) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
        <Skull size={48} className="text-slate-500 opacity-30 mb-4" />
        <h2 className="text-2xl font-black font-headline text-white uppercase tracking-widest">
          Tournament Not Found
        </h2>
        <Link
          to="/tournaments"
          className="text-primary hover:underline mt-4 uppercase text-xs font-bold tracking-widest"
        >
          Return to Tournaments
        </Link>
      </div>
    );
  }

  // Derived properties for UI simulation
  const hoursRemaining = Math.max(
    0,
    Math.floor(
      (new Date(tournament.endDate).getTime() - new Date().getTime()) /
        (1000 * 60 * 60),
    ),
  );
  const isActive = tournament.status === "live";

  return (
    <div className="flex flex-col flex-1 pb-20 w-full animate-in fade-in duration-500 overflow-x-hidden">
      <div className="w-full flex-col mt-4">
        <Link
          to="/tournaments"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-white font-black uppercase text-xs tracking-widest mb-6 px-4 md:px-0 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Hub
        </Link>

        {/* Hero Header */}
        <section className="relative rounded-2xl overflow-hidden glass-card border border-white/5 mx-2 md:mx-0 shadow-2xl bg-black group select-none">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-linear-to-b from-black/20 via-slate-900/80 to-slate-950 z-10" />
            <div
              className="absolute inset-0 w-full h-full bg-cover bg-center opacity-40 mix-blend-overlay group-hover:scale-105 transition-transform duration-[10s]"
              style={{ backgroundImage: `url(${game.thumbnail})` }}
            />
          </div>

          <div className="relative z-20 flex flex-col md:flex-row justify-between items-end gap-6 p-6 md:p-10">
            <div className="w-full">
              <div className="inline-flex items-center gap-2 mb-4">
                {isActive ? (
                  <span className="bg-red-500/20 text-red-500 border border-red-500/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />{" "}
                    LIVE NOW
                  </span>
                ) : tournament.status === "upcoming" ? (
                  <span className="bg-playza-yellow/20 text-playza-yellow border border-playza-yellow/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                    <Clock size={12} /> UPCOMING
                  </span>
                ) : (
                  <span className="bg-slate-500/20 text-slate-400 border border-slate-500/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                    COMPLETED
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-5xl font-black font-headline text-white uppercase tracking-tighter drop-shadow-lg mb-2">
                {tournament.name}
              </h1>

              <div className="flex flex-wrap gap-4 mt-4">
                <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-lg border border-white/10 text-xs font-bold uppercase tracking-widest text-slate-300">
                  <Gamepad2 className="text-primary" size={16} /> {game.title}
                </div>
                <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-lg border border-white/10 text-xs font-bold uppercase tracking-widest text-slate-300">
                  <Clock className="text-slate-400" size={16} />{" "}
                  {hoursRemaining > 0
                    ? `${hoursRemaining}h remaining`
                    : "Ended"}
                </div>
                <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-lg border border-white/10 text-xs font-black uppercase tracking-widest text-slate-300 shadow-[0_0_10px_rgba(234,179,8,0.2)]">
                  <Trophy className="text-yellow-500" size={16} />{" "}
                  <ZASymbol className="text-yellow-500 scale-90" />{" "}
                  {tournament.prizePool.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="w-full md:w-auto shrink-0 flex flex-col md:items-end">
              <button
                className="w-full bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest px-10 py-4 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.4)] disabled:opacity-50 transition-all text-xs"
                disabled={!isActive}
              >
                {isActive
                  ? "ENTER TOURNAMENT"
                  : tournament.status === "upcoming"
                    ? "NOT YET STARTED"
                    : "RESULTS CALCULATED"}
              </button>
            </div>
          </div>
        </section>

        {/* Tab Navigation */}
        <div className="mt-8 border-b border-white/10 px-4 md:px-0">
          <div className="flex gap-6 overflow-x-auto custom-scrollbar pb-px">
            {[
              { id: "overview", label: "Overview" },
              { id: "stages", label: "Stages" },
              { id: "leaderboard", label: "Leaderboard" },
              { id: "progress", label: "My Progress" },
              { id: "sessions", label: "Sessions" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`pb-4 px-2 text-xs md:text-sm font-black uppercase tracking-widest whitespace-nowrap transition-colors relative ${activeTab === tab.id ? "text-primary border-b-2 border-primary" : "text-slate-500 hover:text-white"}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Tab Content */}
        <div className="py-8 px-2 md:px-0 min-h-100">
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in w-full">
              <div className="col-span-1 md:col-span-2 space-y-6">
                <div className="glass-card rounded-2xl p-6 md:p-8 border border-white/5">
                  <h3 className="font-headline font-black text-2xl uppercase mb-4 text-white">
                    About the {game.title} Series
                  </h3>
                  <p className="text-slate-400 font-medium leading-relaxed mb-4">
                    The {tournament.name} is the premier competitive event for{" "}
                    {game.title}. Prove your skills against{" "}
                    {game.activePlayers.toLocaleString()} other elite players in
                    an intense knockout structure pushing your tactical
                    awareness to its absolute limits.
                  </p>
                  <p className="text-slate-400 font-medium leading-relaxed">
                    Entry requires{" "}
                    <strong>ZA{tournament.entryFee.toLocaleString()}</strong>.
                    Players must lock in their spots before the final
                    registration wave closes. Ensure your timezone matches the
                    stage deadlines properly to avoid forfeiting matches.
                  </p>
                </div>

                <div className="glass-card rounded-2xl p-6 md:p-8 border border-white/5">
                  <h3 className="font-headline font-black text-xl uppercase mb-4 text-white">
                    Official Ruleset
                  </h3>
                  <ul className="space-y-3 text-slate-400 font-bold text-sm">
                    <li className="flex gap-2 items-start">
                      <span className="text-primary mt-0.5">•</span> All matches
                      are played on Official Anti-Cheat enabled servers.
                    </li>
                    <li className="flex gap-2 items-start">
                      <span className="text-primary mt-0.5">•</span> No pauses
                      allowed during final qualification rounds.
                    </li>
                    <li className="flex gap-2 items-start">
                      <span className="text-primary mt-0.5">•</span> Internet
                      disconnection results in immediate positional forfeit if
                      not reconnected within 120 seconds.
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-6">
                <div className="glass-card rounded-2xl p-6 border border-white/5 bg-slate-900/50 relative overflow-hidden">
                  <div className="absolute inset-0 bg-primary/5 mix-blend-color-burn" />
                  <h3 className="font-headline font-black text-xl uppercase mb-6 text-white text-center flex justify-center items-center gap-2">
                    <Trophy className="text-yellow-500" /> Prize Distribution
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex items-center gap-3">
                        <span className="text-yellow-500 font-black italic text-lg drop-shadow-sm">
                          1st
                        </span>
                        <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                          Champion
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 transition-all">
                        <ZASymbol className="text-sm scale-90" />
                        <span className="font-black text-transparent bg-clip-text bg-linear-to-r from-yellow-400 via-amber-200 to-yellow-600 uppercase">
                          {(tournament.prizePool * 0.5).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex items-center gap-3">
                        <span className="text-slate-300 font-black italic text-lg drop-shadow-sm">
                          2nd
                        </span>
                        <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                          Runner-Up
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 transition-all">
                        <ZASymbol className="text-sm scale-90" />
                        <span className="font-black text-slate-200 uppercase">
                          {(tournament.prizePool * 0.25).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex items-center gap-3">
                        <span className="text-orange-500 font-black italic text-lg drop-shadow-sm">
                          3rd
                        </span>
                        <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                          Finalist
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 transition-all">
                        <ZASymbol className="text-sm scale-90" />
                        <span className="font-black text-orange-400 uppercase">
                          {(tournament.prizePool * 0.1).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-center mt-4">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
                      Remaining 15% split across Top 10
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "stages" && (
            <div className="animate-in fade-in space-y-8 w-full">
              <div className="flex flex-col md:flex-row items-center gap-4 relative py-6">
                {/* Decorative connecting line */}
                <div className="hidden md:block absolute top-[50%] left-0 w-full h-1 bg-white/5 -z-10 rounded-full" />

                {stages.map((stage, i) => {
                  const isActiveStage = stage.name === "Semi Finals"; // Mock logic assuming it's the current active

                  return (
                    <div
                      key={stage.id}
                      className={`flex-1 w-full glass-card p-6 rounded-2xl border transition-all ${isActiveStage ? "border-primary/50 shadow-[0_0_30px_rgba(168,85,247,0.15)] bg-slate-900" : "border-white/5 opacity-70 bg-black/40"}`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${isActiveStage ? "bg-primary text-white" : "bg-white/10 text-slate-400"}`}
                        >
                          {i + 1}
                        </div>
                        {isActiveStage && (
                          <span className="text-[10px] font-black uppercase bg-primary/20 text-primary px-2 py-1 rounded tracking-widest">
                            In Progress
                          </span>
                        )}
                      </div>

                      <h4 className="font-headline font-black text-xl text-white uppercase tracking-widest mb-2">
                        {stage.name}
                      </h4>

                      <div className="space-y-2 mt-4 text-xs font-bold text-slate-400">
                        <div className="flex justify-between border-b border-white/5 pb-2">
                          <span className="uppercase tracking-widest">
                            Max Players
                          </span>
                          <span className="text-white">
                            {stage.maxPlayers.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between pt-1">
                          <span className="uppercase tracking-widest">
                            Advancing
                          </span>
                          <span className="text-primary">
                            {stage.qualifiedCount.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 text-[10px] uppercase font-black text-slate-500 bg-white/5 p-2 rounded text-center">
                        {new Date(stage.startTime).toLocaleDateString()} -{" "}
                        {new Date(stage.endTime).toLocaleDateString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "leaderboard" && (
            <div className="animate-in fade-in w-full glass-card rounded-2xl border border-white/5 p-6 h-125 overflow-hidden">
              <SessionLeaderboard />
            </div>
          )}

          {activeTab === "progress" && (
            <div className="animate-in fade-in grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              {myParticipant ? (
                <>
                  <div className="glass-card rounded-2xl p-8 border border-white/5 relative overflow-hidden bg-slate-900 border-x-primary/30">
                    <div className="absolute inset-0 bg-linear-to-b from-primary/5 to-transparent pointer-events-none" />

                    <h3 className="text-xs uppercase font-black text-slate-400 tracking-widest mb-6">
                      Current Status
                    </h3>

                    <div className="flex justify-between items-center mb-8">
                      <div className="flex items-center gap-4">
                        <img
                          src={`https://i.pravatar.cc/150?img=11`}
                          alt="avatar"
                          className="w-16 h-16 rounded-full border-2 border-primary shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                        />
                        <div>
                          <h2 className="text-2xl font-black font-headline text-white uppercase tracking-tighter">
                            My Rank
                          </h2>
                          <p className="text-xs text-primary font-bold uppercase tracking-widest mt-1">
                            {myParticipant.status === "active"
                              ? "Competing"
                              : myParticipant.status}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-4xl text-white font-black font-headline italic">
                          #14
                        </div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                          Out of 1,000
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-black/40 rounded-xl p-4 border border-white/5">
                        <div className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">
                          Total Score
                        </div>
                        <div className="text-xl font-black text-white">
                          {myParticipant.totalScore.toLocaleString()}
                        </div>
                      </div>
                      <div className="bg-black/40 rounded-xl p-4 border border-white/5">
                        <div className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">
                          Current Stage
                        </div>
                        <div className="text-xl font-black text-white truncate">
                          Semi Finals
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="glass-card rounded-2xl p-8 border border-white/5">
                    <h3 className="text-xs uppercase font-black text-slate-400 tracking-widest mb-6 flex items-center gap-2">
                      <Medal size={14} className="text-primary" /> Qualification
                      Path
                    </h3>

                    <div className="space-y-6">
                      <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-500 border border-green-500/30 flex items-center justify-center shrink-0">
                          ✓
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-white uppercase text-sm tracking-widest">
                            Qualifiers
                          </h4>
                          <p className="text-xs font-bold text-slate-500 mt-1">
                            Placed #84 - Qualified for Semis
                          </p>
                        </div>
                      </div>

                      <div className="ml-4 w-0.5 h-6 bg-white/10" />

                      <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(168,85,247,0.3)]">
                          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-white uppercase text-sm tracking-widest">
                            Semi Finals
                          </h4>
                          <p className="text-xs font-bold text-slate-500 mt-1">
                            Must place Top 10 to advance to Finals
                          </p>
                          <div className="w-full bg-black h-1.5 mt-3 rounded-full overflow-hidden">
                            <div className="bg-primary h-full w-[45%]" />
                          </div>
                        </div>
                      </div>

                      <div className="ml-4 w-0.5 h-6 bg-white/10" />

                      <div className="flex gap-4 opacity-40">
                        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                          ?
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-white uppercase text-sm tracking-widest">
                            Finals
                          </h4>
                          <p className="text-xs font-bold text-slate-500 mt-1">
                            Awaiting qualification...
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="col-span-full py-20 flex flex-col items-center justify-center text-center glass-card rounded-2xl border border-white/5">
                  <h3 className="font-headline font-black text-2xl text-slate-900 dark:text-white uppercase mb-2">
                    Not participating
                  </h3>
                  <p className="text-sm font-bold tracking-widest text-slate-500 uppercase opacity-60">
                    You haven't joined this tournament yet.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "sessions" && (
            <div className="animate-in fade-in space-y-4 w-full">
              <div className="glass-card rounded-2xl p-6 border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/50">
                <div>
                  <h4 className="font-headline font-black text-xl text-white uppercase tracking-widest mb-1 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />{" "}
                    Official Server #081
                  </h4>
                  <p className="text-xs font-bold uppercase text-slate-400 tracking-widest">
                    Region: Africa-West • Ping: 24ms
                  </p>
                </div>
                <Link
                  to={`/games/${game.slug}/session`}
                  className="bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-xs px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg w-full md:w-auto text-center shrink-0"
                >
                  Join Session <ExternalLink size={14} />
                </Link>
              </div>

              <div className="glass-card rounded-2xl p-6 border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-black/40 opacity-70">
                <div>
                  <h4 className="font-headline font-black text-xl text-white uppercase tracking-widest mb-1 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500" />{" "}
                    Official Server #014
                  </h4>
                  <p className="text-xs font-bold uppercase text-slate-400 tracking-widest">
                    Region: Europe-West • Full
                  </p>
                </div>
                <button
                  disabled
                  className="bg-slate-800 text-slate-500 font-black uppercase tracking-widest text-xs px-6 py-3 rounded-lg w-full md:w-auto text-center shrink-0 cursor-not-allowed border border-white/5"
                >
                  SERVER FULL
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TournamentDetail;
