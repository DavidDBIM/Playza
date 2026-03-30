import { useState } from "react";
import { Link } from "react-router";
import type { Game } from "@/types/types";
import { games } from "@/data/games";
import { MdTimer, MdCheckCircle, MdVideogameAsset } from "react-icons/md";
import { useAuth } from "@/context/auth";
import { ZASymbol } from "@/components/currency/ZASymbol";

type TabTypes = "live" | "upcoming" | "ended";

const MyGames = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabTypes>("live");

  const liveGames = games.filter((g) => g.status === "live").slice(0, 1);
  const upcomingGames = games
    .filter((g) => g.status === "upcoming")
    .slice(0, 1);
  const endedGames = games.filter((g) => g.status === "ended").slice(0, 2);

  const renderActiveCard = (game: Game) => (
    <div
      key={game.id}
      className="glass-card rounded-xl p-2 md:p-5 border border-white/5 shadow-md relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 p-2 md:p-4 opacity-10 rounded-full bg-primary/20 pointer-events-none group-hover:bg-primary/40 transition-colors"></div>

      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-headline font-black text-base md:text-xl text-slate-900 dark:text-white mb-1 uppercase tracking-tight">
            {game.title}
          </h3>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Pro Challenge #4
          </p>
        </div>
        <div className="bg-primary/10 text-primary border border-primary/20 rounded-full px-2 md:px-3 py-1 font-black text-xs uppercase tracking-widest">
          Rank #10 🔥
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-2 md:gap-4 justify-between items-center bg-slate-50 dark:bg-white/5 rounded-xl p-2 md:p-4 border border-white/5">
        <div className="flex gap-2 md:gap-4 items-center w-full md:w-auto">
          <div className="text-center bg-slate-900/5 dark:bg-black/20 rounded-lg p-2 md:p-3 min-w-20">
            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">
              Time Left
            </div>
            <div className="font-black text-slate-900 dark:text-white flex justify-center items-center gap-1">
              <MdTimer className="text-primary" /> 1h 12m
            </div>
          </div>
          <div className="text-center bg-slate-900/5 dark:bg-black/20 rounded-lg p-2 md:p-3 flex-1 min-w-28 border-x border-primary/10">
            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">
              Prize Zone
            </div>
            <div className="font-black font-headline text-slate-900 dark:text-white">
              Top 50{" "}
              <span className="text-xs font-bold text-slate-500 ml-1 tracking-widest lowercase">
                win rewards
              </span>
            </div>
          </div>
        </div>

        <Link
          to={`/games/${game.slug}/session`}
          className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white font-black uppercase text-xs tracking-widest px-8 md:px-10 py-2 md:py-3 rounded-xl transition-all text-center relative z-10 shadow-sm"
        >
          View Live
        </Link>
      </div>
    </div>
  );

  const renderUpcomingCard = (game: Game) => (
    <div
      key={game.id}
      className="glass-card rounded-xl p-2 md:p-5 border border-white/5 shadow-md opacity-90 group"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-headline font-black text-base md:text-xl text-slate-900 dark:text-white mb-1 uppercase tracking-tight">
            {game.title}
          </h3>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-playza-yellow"></span>
            Starting Soon
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-2 md:gap-4 justify-between items-center bg-slate-50 dark:bg-white/5 rounded-xl p-2 md:p-4 border border-white/5">
        <div className="flex gap-2 md:gap-4 items-center w-full md:w-auto">
          <div className="text-center bg-slate-900/5 dark:bg-black/20 rounded-lg p-2 md:p-3 min-w-28 flex-1 border-x border-playza-yellow/10">
            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">
              Starts In
            </div>
            <div className="font-black text-slate-900 dark:text-white flex justify-center items-center gap-1">
              <MdTimer className="text-playza-yellow" /> 40m 15s
            </div>
          </div>
        </div>

        <Link
          to={`/games/${game.slug}/session`}
          className="w-full md:w-auto bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-900 dark:text-white font-black uppercase text-xs tracking-widest px-8 md:px-10 py-2 md:py-3 rounded-xl transition-colors text-center"
        >
          View Details
        </Link>
      </div>
    </div>
  );

  const renderEndedCard = (game: Game) => (
    <div
      key={game.id}
      className="glass-card rounded-xl p-2 md:p-5 border border-white/5 shadow-sm opacity-70 filter transition-all hover:opacity-100 group"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-headline font-black text-base md:text-xl text-slate-900 dark:text-white mb-1 uppercase tracking-tight">
            {game.title}
          </h3>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
            <MdCheckCircle className="text-slate-400" /> Finished Today
          </p>
        </div>
        <div className="bg-green-500/10 text-green-500 border border-green-500/20 rounded-full px-2 md:px-3 py-1 font-black text-xs uppercase tracking-widest flex items-center gap-1">
          + 2,500 <ZASymbol className="scale-75" />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-2 md:gap-4 justify-between items-center bg-slate-50 dark:bg-white/5 rounded-xl p-2 md:p-4 border border-white/5">
        <div className="flex gap-2 md:gap-4 items-center w-full md:w-auto">
          <div className="text-center bg-slate-900/5 dark:bg-black/20 rounded-lg p-2 md:p-3 min-w-20">
            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">
              Final Rank
            </div>
            <div className="font-black text-slate-900 dark:text-white">#4</div>
          </div>
        </div>

        <Link
          to={`/games/${game.slug}/session`}
          className="w-full md:w-auto border border-white/10 dark:border-white/20 hover:bg-white/5 text-slate-900 dark:text-white font-black uppercase text-xs tracking-widest px-8 md:px-10 py-2 md:py-3 rounded-xl transition-colors text-center"
        >
          View Results
        </Link>
      </div>
    </div>
  );

  return (
    <div className="flex-1 min-w-0 space-y-8 pb-2 md:pb-20 animate-in fade-in duration-500">
      {!user ? (
        <div className="glass-card rounded-2xl p-2 md:p-12 text-center h-[50vh] flex flex-col items-center justify-center border border-white/5 shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 blur-3xl opacity-50 pointer-events-none"></div>
          <MdVideogameAsset className="text-4xl md:text-6xl text-slate-300 dark:text-slate-700 mb-4 relative z-10" />
          <h2 className="text-lg md:text-2xl font-black font-headline uppercase text-slate-900 dark:text-white relative z-10">
            Sign in to view games
          </h2>
          <p className="text-xs md:text-sm font-bold tracking-widest text-slate-500 mt-2 lowercase max-w-sm relative z-10">
            track your active and recent competitions by creating an account
            Overview logging in.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="space-y-1 mt-4">
            <h1 className="text-3xl md:text-5xl font-black font-headline tracking-tighter text-slate-900 dark:text-white uppercase flex items-center gap-2 md:gap-3">
              My <span className="text-primary">Games</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm font-bold uppercase tracking-widest">
              Track your active and recent competitions
            </p>
          </div>

          <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
            {[
              {
                id: "live",
                label: "Active",
                icon: (
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                ),
                count: liveGames.length,
              },
              {
                id: "upcoming",
                label: "Upcoming",
                icon: (
                  <span className="w-2 h-2 rounded-full bg-playza-yellow"></span>
                ),
                count: upcomingGames.length,
              },
              {
                id: "ended",
                label: "Ended",
                icon: (
                  <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                ),
                count: endedGames.length,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabTypes)}
                className={`flex flex-col min-w-28 px-4 py-3 rounded-xl border transition-all text-left ${
                  activeTab === tab.id
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-md scale-100"
                    : "glass-card border-white/5 text-slate-500 hover:text-slate-900 hover:dark:text-white hover:bg-slate-100 hover:dark:bg-white/5 opacity-80"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {tab.icon}
                  <span className="text-[10px] md:text-xs uppercase font-black tracking-widest">
                    {tab.label}
                  </span>
                </div>
                <div className="font-headline font-black text-lg md:text-2xl">
                  {tab.count}
                </div>
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest">
                {activeTab === "live"
                  ? "Live Sessions"
                  : activeTab === "upcoming"
                    ? "Starting Soon"
                    : "Finished Today"}
              </h2>
            </div>

            <div className="space-y-6">
              {activeTab === "live" &&
                (liveGames.length ? (
                  liveGames.map(renderActiveCard)
                ) : (
                  <div className="text-center py-2 md:py-12 text-slate-500 font-bold uppercase tracking-widest text-xs glass-card rounded-2xl border border-white/5">
                    No active games
                  </div>
                ))}
              {activeTab === "upcoming" &&
                (upcomingGames.length ? (
                  upcomingGames.map(renderUpcomingCard)
                ) : (
                  <div className="text-center py-2 md:py-12 text-slate-500 font-bold uppercase tracking-widest text-xs glass-card rounded-2xl border border-white/5">
                    No upcoming games
                  </div>
                ))}
              {activeTab === "ended" &&
                (endedGames.length ? (
                  endedGames.map(renderEndedCard)
                ) : (
                  <div className="text-center py-2 md:py-12 text-slate-500 font-bold uppercase tracking-widest text-xs glass-card rounded-2xl border border-white/5">
                    No ended games
                  </div>
                ))}
            </div>
          </div>

          <div className="text-center mt-8 pb-2 md:pb-4">
            <p className="text-[10px] font-black tracking-widest uppercase text-slate-400 opacity-60">
              👉 After 24h, results are moved to your Profile History
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyGames;
