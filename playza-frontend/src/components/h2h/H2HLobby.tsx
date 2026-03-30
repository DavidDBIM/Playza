import React, { useState } from 'react';
import { MdSearch, MdLink } from 'react-icons/md';
import { Zap, Swords, PlusCircle, Trophy } from 'lucide-react';
import { ZASymbol } from '@/components/currency/ZASymbol';
import GameModeModal from "./GameModeModal";

interface H2HLobbyProps {
  onCreate: (stake: number) => void;
  onJoin: (code: string) => void;
  loading: boolean;
}

interface GameType {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  players: string;
  color: string;
  comingSoon?: boolean;
}

const H2HLobby = ({ onCreate, onJoin, loading }: H2HLobbyProps) => {
  const [view, setView] = useState<'hub' | 'quick' | 'invite'>('hub');
  const [stakeValue, setStakeValue] = useState(100);
  const [customStake, setCustomStake] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [isFinding, setIsFinding] = useState(false);
  const [selectedGame, setSelectedGame] = useState<GameType | null>(null);
  const [inviteMobileTab, setInviteMobileTab] = useState<
    "create" | "join" | null
  >(null);

  const handleQuickMatch = () => {
    setIsFinding(true);
    setTimeout(() => {
      onCreate(stakeValue);
      setIsFinding(false);
    }, 2000);
  };

  const handleCreateChallenge = () => {
    const finalStake = customStake ? parseInt(customStake) : 100;
    onCreate(finalStake);
  };

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinCode.length === 6) {
      onJoin(joinCode.toUpperCase());
    }
  };

  const addStake = (amount: number) => {
    const current = customStake === '' ? 0 : parseInt(customStake);
    setCustomStake((current + amount).toString());
  };

  const isBtnLoading = loading || isFinding;

  const games = [
    { id: 'chess', name: 'Grand Chess', icon: Swords, players: '2.4k', color: 'from-indigo-500 to-purple-600' },
    { id: 'ludo', name: 'Ludo Pro', icon: Trophy, players: '1.8k', color: 'from-emerald-500 to-teal-600', comingSoon: true },
    { id: 'pool', name: '8-Ball Pool', icon: Zap, players: '3.1k', color: 'from-amber-500 to-orange-600', comingSoon: true },
  ];

  return (
    <div className="w-full mx-auto py-8 animate-in fade-in duration-500">
      {/* ─── BATTLE HUB VIEW ─── */}
      {view === "hub" && (
        <div className="space-y-12">
          {/* Header */}
          <header className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              Battle Master Arena
            </div>
            <h1 className="font-headline text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-tight">
              SELECT YOUR <span className="text-indigo-500">GAME</span>
            </h1>
            <p className="text-slate-400 max-w-xl mx-auto text-xs md:text-sm font-medium">
              Choose your battlefield. Compete in high-stakes matches against
              global rivals or challenge your friends for ultimate bragging
              rights.
            </p>
          </header>

          {/* Game Selection Carousel/Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
            {games.map((game) => (
              <div
                key={game.id}
                onClick={() => !game.comingSoon && setSelectedGame(game)}
                className={`relative group transition-all duration-300 ${game.comingSoon ? "opacity-50 grayscale cursor-not-allowed" : "cursor-pointer hover:scale-[1.02]"}`}
              >
                <div
                  className={`absolute -inset-0.5 bg-linear-to-r ${game.color} rounded-2xl md:rounded-3xl blur opacity-20 group-hover:opacity-40 transition-opacity`}
                ></div>
                <div className="relative bg-slate-900/80 border border-white/10 rounded-2xl md:rounded-3xl p-4 md:p-6 backdrop-blur-xl h-full flex flex-col justify-between items-center text-center overflow-hidden">
                  {game.comingSoon && (
                    <div className="absolute top-3 md:top-4 right-3 md:right-4 bg-white/30 backdrop-blur-md px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border border-white/10">
                      Coming Soon
                    </div>
                  )}
                  <div
                    className={`w-14 h-14 md:w-20 md:h-20 rounded-xl md:rounded-2xl bg-linear-to-br ${game.color} flex items-center justify-center shadow-lg mb-4 md:mb-6 group-hover:rotate-6 transition-transform`}
                  >
                    <game.icon className="text-white w-6 h-6 md:w-10 md:h-10" />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter text-white mb-1 md:mb-2">
                      {game.name}
                    </h3>
                    <div className="flex items-center justify-center gap-2 text-[8px] md:text-[10px] uppercase tracking-widest font-bold text-indigo-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                      {game.players} Active Now
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <GameModeModal
            isOpen={!!selectedGame}
            onClose={() => setSelectedGame(null)}
            onSelectMode={(mode) => setView(mode)}
          />
        </div>
      )}

      {/* ─── FIND ONLINE RIVAL VIEW ─── */}
      {view === "quick" && (
        <div className="w-full max-w-xl mx-auto animate-in slide-in-from-right-8 duration-500">
          <button
            onClick={() => setView("hub")}
            className="flex items-center gap-2 text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white mb-6 md:mb-8 transition-colors px-4 md:px-0"
          >
            ← Back to Hub
          </button>

          <div className="w-full relative p-0 md:p-1 rounded-none md:rounded-[2.5rem] bg-linear-to-b from-indigo-500/20 to-transparent">
            <section className="w-full bg-slate-900/90 backdrop-blur-3xl rounded-none md:rounded-[2.4rem] p-6 md:p-12 border-y md:border border-white/10 shadow-lg space-y-8 md:space-y-12">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                  <Zap className="text-indigo-400 w-6 h-6 md:w-8 md:h-8" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter text-white">
                    Arena Match
                  </h2>
                  <span className="text-[8px] md:text-[10px] font-black text-indigo-400/60 uppercase tracking-widest">
                    Global Pool · Instant Join
                  </span>
                </div>
              </div>

              <div className="space-y-6 md:space-y-8">
                <div className="space-y-3 md:space-y-4">
                  <label className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-black pl-1">
                    Set Your Stake (<ZASymbol className="scale-75" />)
                  </label>
                  <div className="grid grid-cols-3 gap-2 md:gap-4">
                    {[100, 200, 500].map((val) => (
                      <button
                        key={val}
                        onClick={() => setStakeValue(val)}
                        className={`py-4 md:py-6 rounded-xl md:rounded-2xl font-headline font-black text-xl md:text-2xl transition-all active:scale-95 border-2 ${stakeValue === val ? "bg-indigo-600 border-indigo-400 text-white shadow-[0_0_30px_rgba(99,102,241,0.3)]" : "bg-white/5 border-white/5 hover:border-indigo-500/30"}`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl md:rounded-2xl p-4 md:p-6 flex items-center justify-between">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-white/5 rounded-lg md:rounded-xl flex items-center justify-center">
                      <Trophy className="text-indigo-400 w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    <div>
                      <span className="text-[8px] md:text-[10px] text-slate-500 font-black uppercase tracking-widest block">
                        Potential Prize
                      </span>
                      <span className="text-lg md:text-xl font-black text-indigo-400 flex items-center gap-1 leading-none mt-1">
                        {stakeValue * 2} <ZASymbol className="scale-75" />
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] md:text-[8px] text-slate-600 font-black uppercase tracking-tighter block">
                      ESTIMATED WAIT
                    </span>
                    <span className="text-[10px] md:text-xs font-black text-slate-400">
                      {"< 10 SEC"}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleQuickMatch}
                disabled={isBtnLoading}
                className="w-full bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-white font-black py-5 md:py-7 rounded-xl text-xl md:text-2xl tracking-[0.1em] uppercase italic transition-all flex items-center justify-center gap-3 shadow-md"
              >
                {isFinding ? (
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-white"></div>
                    SEARCHING...
                  </div>
                ) : loading ? (
                  <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-white"></div>
                ) : (
                  <>
                    <MdSearch className="text-3xl" />
                    Find Rival
                  </>
                )}
              </button>
            </section>
          </div>
        </div>
      )}

      {/* ─── INVITE A FRIEND VIEW ─── */}
      {view === "invite" && (
        <div className="w-full flex flex-col lg:grid lg:grid-cols-2 gap-4 lg:gap-8 animate-in slide-in-from-left-8 duration-500">
          <div className="lg:col-span-2 px-4 md:px-0">
            <button
              onClick={() => setView("hub")}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 dark:hover:text-white mb-4 lg:mb-8 transition-colors"
            >
              ← Back to Hub
            </button>
          </div>

          {/* Create Challenge */}
          <section className="w-full bg-white/90 dark:bg-slate-900/40 lg:backdrop-blur-xl lg:rounded-[2.4rem] rounded-none md:rounded-2xl p-0 lg:p-10 border-y md:border border-slate-200 dark:border-white/10 flex flex-col shadow-md overflow-hidden">
            {/* Mobile Accordion Header */}
            <button
              onClick={() =>
                setInviteMobileTab(
                  inviteMobileTab === "create" ? null : "create",
                )
              }
              className={`lg:hidden w-full p-4 md:p-6 flex items-center justify-between font-black uppercase text-xs md:text-sm tracking-widest transition-colors ${inviteMobileTab === "create" ? "bg-emerald-500/10 text-emerald-500" : "text-slate-500"}`}
            >
              <div className="flex items-center gap-3">
                <PlusCircle size={20} /> Create Challenge
              </div>
              <span className="text-slate-400">
                {inviteMobileTab === "create" ? "▼" : "▶"}
              </span>
            </button>

            {/* Content Container */}
            <div
              className={`p-4 md:p-6 lg:p-0 flex-col justify-between flex-1 ${inviteMobileTab === "create" ? "flex" : "hidden lg:flex"}`}
            >
              <div className="space-y-6 lg:space-y-8">
                <div className="hidden lg:flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 dark:text-emerald-400">
                    <PlusCircle size={32} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">
                      Create Challenge
                    </h2>
                    <span className="text-[10px] font-black text-emerald-500/80 dark:text-emerald-400/60 uppercase tracking-widest">
                      Set Stakes · Send Link
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-black pl-1">
                    Host Custom Match
                  </label>
                  <div className="relative group/input">
                    <input
                      value={customStake}
                      onChange={(e) => setCustomStake(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-4 lg:px-8 lg:py-6 font-black text-2xl lg:text-4xl text-slate-900 dark:text-white focus:border-emerald-500 outline-none transition-all tracking-tighter italic"
                      placeholder="100"
                      type="number"
                    />
                    <span className="-translate-y-1/2 absolute right-6 top-1/2 text-emerald-500 scale-125 lg:scale-150">
                      <ZASymbol />
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {[100, 200, 500].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => addStake(amt)}
                        className="flex-1 py-3 bg-slate-50 dark:bg-white/5 hover:bg-emerald-500/10 border border-slate-200 dark:border-white/5 hover:border-emerald-500/30 rounded-xl font-black text-[10px] lg:text-xs text-slate-500 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-all uppercase italic"
                      >
                        +{amt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={handleCreateChallenge}
                disabled={loading}
                className="w-full mt-6 shrink-0 bg-transparent border-2 lg:border-4 border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-white font-black py-4 lg:py-6 rounded-xl text-sm lg:text-xl tracking-[0.2em] transition-all italic uppercase flex items-center justify-center gap-2 lg:gap-3"
              >
                {loading ? (
                  "GENERATING..."
                ) : (
                  <>
                    <MdLink size={20} className="lg:scale-125" />
                    CREATE INVITE LINK
                  </>
                )}
              </button>
            </div>
          </section>

          {/* Join Challenge */}
          <section className="w-full bg-white/90 dark:bg-slate-900/40 lg:backdrop-blur-xl lg:rounded-[2.4rem] rounded-none md:rounded-2xl p-0 lg:p-10 border-y md:border border-slate-200 dark:border-white/10 flex flex-col shadow-md overflow-hidden">
            {/* Mobile Accordion Header */}
            <button
              onClick={() =>
                setInviteMobileTab(inviteMobileTab === "join" ? null : "join")
              }
              className={`lg:hidden w-full p-4 md:p-6 flex items-center justify-between font-black uppercase text-xs md:text-sm tracking-widest transition-colors ${inviteMobileTab === "join" ? "bg-amber-500/10 text-amber-500 dark:text-amber-400" : "text-slate-500"}`}
            >
              <div className="flex items-center gap-3">
                <Zap size={20} /> Join Challenge
              </div>
              <span className="text-slate-400">
                {inviteMobileTab === "join" ? "▼" : "▶"}
              </span>
            </button>

            {/* Content Container */}
            <div
              className={`p-4 md:p-6 lg:p-0 flex-col justify-between flex-1 ${inviteMobileTab === "join" ? "flex" : "hidden lg:flex"}`}
            >
              <div className="space-y-6 lg:space-y-8">
                <div className="hidden lg:flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 dark:text-amber-400">
                    <Zap size={32} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">
                      Join by Code
                    </h2>
                    <span className="text-[10px] font-black text-amber-500/80 dark:text-amber-400/60 uppercase tracking-widest">
                      Enter Credentials
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-black pl-1">
                    Room Credentials
                  </label>
                  <form onSubmit={handleJoinByCode} className="space-y-4">
                    <input
                      value={joinCode}
                      onChange={(e) =>
                        setJoinCode(e.target.value.toUpperCase())
                      }
                      maxLength={6}
                      placeholder="ENTER CODE"
                      className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-6 font-mono font-bold text-center tracking-[0.6em] text-2xl lg:text-3xl text-slate-900 dark:text-white focus:border-amber-500 outline-none transition-all uppercase"
                    />
                    <button
                      type="submit"
                      disabled={joinCode.length < 6 || loading}
                      className="w-full bg-amber-500 text-slate-900 py-4 lg:py-6 rounded-xl font-black text-sm lg:text-xl tracking-widest hover:brightness-110 transition-all disabled:opacity-30 uppercase italic"
                    >
                      ENTER ARENA
                    </button>
                  </form>
                </div>
              </div>

              <div className="p-4 bg-slate-100 dark:bg-white/5 rounded-2xl text-[10px] text-slate-500 font-medium leading-relaxed italic text-center mt-6 lg:mt-0">
                Room codes are case-insensitive. Make sure you have the exact
                6-character sequence from your host.
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default H2HLobby;
