import React, { useState } from 'react';
import { MdLink } from 'react-icons/md';
import { Zap, Swords, PlusCircle, Trophy } from 'lucide-react';
import { ZASymbol } from '@/components/currency/ZASymbol';
import GameModeModal from "./GameModeModal";
import { getWaitingRooms } from '@/api/chess.api';
import { useEffect, useCallback } from 'react';
import { timeAgo } from '@/utils/time-ago';
import { ShieldCheck, AlertCircle } from 'lucide-react';

interface H2HLobbyProps {
  onCreate: (stake: number) => void;
  onBotCreate: (stake: number) => void;
  onJoin: (code: string) => void;
  onQuickMatch: (stake: number) => void;
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

import type { ChessRoom } from '@/types/chess';

const H2HLobby = ({ onCreate, onBotCreate, onJoin, onQuickMatch, loading }: H2HLobbyProps) => {
  const [view, setView] = useState<'hub' | 'quick' | 'invite' | 'bot'>('hub');
  const [stakeValue, setStakeValue] = useState(100);
  const [customStake, setCustomStake] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [isFinding, setIsFinding] = useState(false);
  const [selectedGame, setSelectedGame] = useState<GameType | null>(null);
  const [inviteMobileTab, setInviteMobileTab] = useState<"create" | "join" | null>(null);
  const [publicRooms, setPublicRooms] = useState<ChessRoom[]>([]);
  const [quickViewMode, setQuickViewMode] = useState<'list' | 'create'>('list');
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [confirmingAction, setConfirmingAction] = useState<{ type: 'create' | 'join' | 'quick' | 'bot', stake: number, code?: string } | null>(null);

  const fetchPublicRooms = useCallback(async () => {
    setLoadingRooms(true);
    try {
      const rooms = await getWaitingRooms();
      setPublicRooms(rooms);
      if (rooms.length === 0) {
        setQuickViewMode('create');
      } else {
        setQuickViewMode('list');
      }
    } catch (err) {
      console.error("Failed to fetch public rooms", err);
      setQuickViewMode('create');
    } finally {
      setLoadingRooms(false);
    }
  }, []);

  useEffect(() => {
    if (view === 'quick') {
      fetchPublicRooms();
    }
  }, [view, fetchPublicRooms]);

  const handleQuickMatch = async () => {
    const finalStake = customStake ? parseInt(customStake) : stakeValue;
    setConfirmingAction({ type: 'quick', stake: finalStake });
  };

  const handleBotMatch = async () => {
    const finalStake = customStake ? parseInt(customStake) : stakeValue;
    setConfirmingAction({ type: 'bot', stake: finalStake });
  };

  const handleCreateChallenge = async () => {
    const finalStake = customStake ? parseInt(customStake) : 100;
    setConfirmingAction({ type: 'create', stake: finalStake });
  };

  const executeConfirmedAction = async () => {
    if (!confirmingAction) return;
    const { type, stake, code } = confirmingAction;
    setConfirmingAction(null);
    
    setIsFinding(true);
    try {
      if (type === 'create') await onCreate(stake);
      if (type === 'bot') await onBotCreate(stake);
      if (type === 'quick') await onQuickMatch(stake);
      if (type === 'join' && code) await onJoin(code);
    } finally {
      setIsFinding(false);
    }
  };

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinCode.length === 6) {
      setConfirmingAction({ type: 'join', stake: 0, code: joinCode.toUpperCase() });
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

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
            {games.map((game) => (
              <div
                key={game.id}
                onClick={() => !game.comingSoon && setSelectedGame(game)}
                className={`relative group transition-all duration-300 ${game.comingSoon ? "opacity-50 grayscale cursor-not-allowed" : "cursor-pointer hover:scale-[1.02]"}`}
              >
                <div className={`absolute -inset-0.5 bg-linear-to-r ${game.color} rounded-2xl md:rounded-3xl blur opacity-20 group-hover:opacity-40 transition-opacity`}></div>
                <div className="relative bg-slate-900/80 border border-white/10 rounded-2xl md:rounded-3xl p-4 md:p-6 backdrop-blur-xl h-full flex flex-col justify-between items-center text-center overflow-hidden">
                  {game.comingSoon && (
                    <div className="absolute top-3 md:top-4 right-3 md:right-4 bg-white/30 backdrop-blur-md px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border border-white/10">
                      Coming Soon
                    </div>
                  )}
                  <div className={`w-14 h-14 md:w-20 md:h-20 rounded-xl md:rounded-2xl bg-linear-to-br ${game.color} flex items-center justify-center shadow-lg mb-4 md:mb-6 group-hover:rotate-6 transition-transform`}>
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

      {/* ─── SKELETON LOADER ─── */}
      {view === "quick" && loadingRooms && (
        <div className="w-full max-w-xl mx-auto animate-pulse space-y-8">
           <div className="h-6 w-32 bg-white/5 rounded-full mb-8"></div>
           <div className="bg-slate-900/90 rounded-[2.5rem] p-8 md:p-12 border border-white/10 space-y-10">
              <div className="space-y-4">
                 <div className="h-4 w-24 bg-white/5 rounded-full mx-auto"></div>
                 <div className="h-8 w-48 bg-white/5 rounded-full mx-auto"></div>
              </div>
              <div className="space-y-3">
                 {[1,2,3].map(i => (
                   <div key={i} className="h-20 w-full bg-white/5 rounded-2xl border border-white/5"></div>
                 ))}
              </div>
              <div className="h-16 w-full bg-white/5 rounded-2xl border border-white/5"></div>
           </div>
        </div>
      )}

      {/* ─── FIND ONLINE RIVAL VIEW ─── */}
      {view === "quick" && !loadingRooms && (
        <div className="w-full max-w-xl mx-auto animate-in slide-in-from-right-8 duration-500">
          <button
            onClick={() => setView("hub")}
            className="flex items-center gap-2 text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white mb-6 md:mb-8 transition-colors px-4 md:px-0"
          >
            ← Back to Hub
          </button>

          <div className="w-full relative p-0 md:p-1 rounded-none md:rounded-[2.5rem] bg-linear-to-b from-indigo-500/20 to-transparent">
            <section className="w-full bg-slate-900/90 backdrop-blur-3xl rounded-none md:rounded-[2.4rem] p-6 md:p-12 border-y md:border border-white/10 shadow-lg space-y-8 md:space-y-12 text-center md:text-left">
              {quickViewMode === 'list' && publicRooms.length > 0 ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400/60 mb-2 whitespace-nowrap">Battle Zone Active</p>
                    <h3 className="text-xl md:text-2xl font-black uppercase italic text-white leading-none">Challengers Waiting</h3>
                  </div>
                  
                  <div className="space-y-3 max-h-80 overflow-y-auto no-scrollbar pr-1">
                    {publicRooms.map((room) => (
                      <button
                        key={room.id}
                        onClick={() => setConfirmingAction({ type: 'join', stake: room.stake, code: room.code })}
                        className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10">
                            <img src={room.host?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${room.host?.username}`} className="w-full h-full object-cover" />
                          </div>
                          <div className="text-left">
                            <span className="block text-[10px] font-black text-white uppercase tracking-tight truncate max-w-32">{room.host?.username || "Player"}</span>
                            <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-widest">{timeAgo(room.created_at)} · CHESS</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                             <div className="flex items-center gap-1 text-sm font-black text-indigo-400">
                               {room.stake} <ZASymbol className="w-2.5 h-2.5" />
                             </div>
                             <span className="text-[7px] text-slate-600 font-bold uppercase tracking-tighter block">ENTRY FEE</span>
                          </div>
                          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-slate-900 group-hover:scale-110 transition-transform">
                            <Swords size={16} />
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/5"></span></div>
                    <div className="relative flex justify-center"><span className="px-4 bg-slate-900 text-[10px] font-black text-slate-600 uppercase tracking-widest">Or Entry Global Pool</span></div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                     <button 
                       onClick={() => setQuickViewMode('create')}
                       className="bg-white/5 border border-white/10 text-slate-400 font-black py-4 rounded-xl text-[10px] tracking-widest uppercase italic transition-all hover:text-white"
                     >
                       Create Your Own
                     </button>
                     <button 
                       onClick={handleQuickMatch}
                       className="bg-indigo-500 text-white font-black py-4 rounded-xl text-[10px] tracking-widest uppercase italic transition-all shadow-lg shadow-indigo-500/20"
                     >
                       Auto Match
                     </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {publicRooms.length > 0 && quickViewMode === 'create' && (
                    <button 
                      onClick={() => setQuickViewMode('list')}
                      className="text-[10px] font-black text-indigo-400 hover:text-white mb-2 uppercase tracking-widest transition-colors flex items-center gap-2"
                    >
                      ← Back to Challengers
                    </button>
                  )}
                  <div className="space-y-6 md:space-y-8">
                    <div className="space-y-3 md:space-y-4">
                      <label className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-black pl-1 block text-center md:text-left">
                        Target Stake (<ZASymbol className="scale-75" />)
                      </label>
                      
                      <div className="grid grid-cols-3 gap-2 md:gap-4">
                        {[100, 200, 500].map((val) => (
                          <button
                            key={val}
                            onClick={() => { setStakeValue(val); setCustomStake(''); }}
                            className={`py-4 md:py-6 rounded-xl md:rounded-2xl font-headline font-black text-xl md:text-2xl transition-all active:scale-95 border-2 ${stakeValue === val && !customStake ? "bg-indigo-600 border-indigo-400 text-white shadow-[0_0_30px_rgba(99,102,241,0.3)]" : "bg-white/5 border-white/5 hover:border-indigo-500/30"}`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>

                      <div className="relative group/input mt-4">
                        <input
                          value={customStake}
                          onChange={(e) => setCustomStake(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 lg:px-6 lg:py-4 font-black text-xl lg:text-2xl text-slate-900 dark:text-white focus:border-indigo-500 outline-none transition-all tracking-tighter italic text-center"
                          placeholder="CUSTOM PRICE"
                          type="number"
                        />
                        <span className="-translate-y-1/2 absolute right-4 top-1/2 text-indigo-500 scale-110 lg:scale-125">
                          <ZASymbol />
                        </span>
                      </div>
                    </div>

                    <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl md:rounded-2xl p-4 md:p-6 flex items-center justify-between">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-white/5 rounded-lg md:rounded-xl flex items-center justify-center">
                          <Trophy className="text-indigo-400 w-4 h-4 md:w-5 md:h-5" />
                        </div>
                        <div>
                          <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest block">
                            Potential Prize
                          </span>
                          <span className="text-lg md:text-xl font-black text-indigo-400 flex items-center gap-1 leading-none mt-1">
                            {(parseInt(customStake) || stakeValue) * 2} <ZASymbol className="scale-75" />
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[8px] text-slate-600 font-black uppercase tracking-tighter block">
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
                    className="w-full bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-white font-black py-5 md:py-7 rounded-xl text-xl md:text-2xl tracking-[0.1em] uppercase italic transition-all flex items-center justify-center gap-3 shadow-md border-b-4 border-indigo-700 active:border-b-0 active:translate-y-1"
                  >
                    MATCH NEAREST RIVAL
                  </button>
                </div>
              )}
            </section>
          </div>
        </div>
      )}

      {/* ─── SOLO PRACTICE (BOT) VIEW ─── */}
      {view === "bot" && (
        <div className="w-full max-w-xl mx-auto animate-in slide-in-from-right-8 duration-500">
          <button
            onClick={() => setView("hub")}
            className="flex items-center gap-2 text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white mb-6 md:mb-8 transition-colors px-4 md:px-0"
          >
            ← Back to Hub
          </button>

          <div className="w-full relative p-0 md:p-1 rounded-none md:rounded-[2.5rem] bg-linear-to-b from-amber-500/20 to-transparent">
            <section className="w-full bg-slate-900/90 backdrop-blur-3xl rounded-none md:rounded-[2.4rem] p-6 md:p-12 border-y md:border border-white/10 shadow-lg space-y-8 md:space-y-12 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 md:gap-4">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                  <Trophy className="text-amber-400 w-6 h-6 md:w-8 md:h-8" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter text-white">
                    Training Match
                  </h2>
                  <span className="text-[8px] md:text-[10px] font-black text-amber-400/60 uppercase tracking-widest leading-none block md:inline mt-1">
                    Solo vs AI · Instant Entry
                  </span>
                </div>
              </div>

              <div className="space-y-6 md:space-y-8">
                <div className="space-y-3 md:space-y-4">
                  <label className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-black pl-1 block text-center md:text-left">
                    Practice Stake (<ZASymbol className="scale-75" />)
                  </label>
                  
                  <div className="grid grid-cols-3 gap-2 md:gap-4">
                    {[0, 50, 100].map((val) => (
                      <button
                        key={val}
                        onClick={() => { setStakeValue(val); setCustomStake(''); }}
                        className={`py-4 md:py-6 rounded-xl md:rounded-2xl font-headline font-black text-xl md:text-2xl transition-all active:scale-95 border-2 ${stakeValue === val && !customStake ? "bg-amber-600 border-amber-400 text-white shadow-[0_0_30px_rgba(245,158,11,0.3)]" : "bg-white/5 border-white/5 hover:border-amber-500/30"}`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>

                  <div className="relative group/input mt-4">
                    <input
                      value={customStake}
                      onChange={(e) => setCustomStake(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 lg:px-6 lg:py-4 font-black text-xl lg:text-2xl text-slate-900 dark:text-white focus:border-amber-500 outline-none transition-all tracking-tighter italic text-center"
                      placeholder="CUSTOM STAKE"
                      type="number"
                    />
                    <span className="-translate-y-1/2 absolute right-4 top-1/2 text-amber-500 scale-110 lg:scale-125">
                      <ZASymbol />
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleBotMatch}
                disabled={loading}
                className="w-full bg-amber-500 text-slate-950 font-black py-5 md:py-7 rounded-xl text-xl md:text-2xl tracking-[0.1em] uppercase italic transition-all flex items-center justify-center gap-3 shadow-md"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-slate-950"></div>
                ) : (
                  <>
                    <Swords className="text-3xl" />
                    BATTLE COMPUTER
                  </>
                )}
              </button>
            </section>
          </div>
        </div>
      )}

      {/* ─── INVITE A FRIEND VIEW ─── */}
      {view === "invite" && (
        <div className="w-full flex flex-col lg:flex-col xl:grid xl:grid-cols-2 gap-4 xl:gap-8 animate-in slide-in-from-left-8 duration-500 lg:px-4 xl:px-0">
          <div className="xl:col-span-2 px-4 md:px-0">
            <button
              onClick={() => setView("hub")}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 dark:hover:text-white mb-3 xl:mb-8 transition-colors"
            >
              ← Back to Hub
            </button>
          </div>

          {/* Create Challenge Accordion */}
          <section className="w-full bg-white/90 dark:bg-slate-900/40 lg:rounded-2xl xl:rounded-[2.4rem] rounded-none border-y md:border border-slate-200 dark:border-white/10 flex flex-col shadow-md overflow-hidden xl:min-h-auto">
            <button
              onClick={() => setInviteMobileTab(inviteMobileTab === "create" ? null : "create")}
              className={`w-full p-6 md:p-8 lg:p-10 flex items-center justify-between font-black uppercase text-xs md:text-sm tracking-widest transition-colors ${inviteMobileTab === "create" ? "bg-emerald-500/10 text-emerald-500" : "text-slate-500 dark:text-slate-400 hover:bg-white/5"}`}
            >
              <div className="flex items-center gap-4">
                <PlusCircle size={24} className={inviteMobileTab === "create" ? "animate-pulse" : ""} />
                <span>Create Challenge</span>
              </div>
              <span className={`text-slate-400 transition-transform duration-300 ${inviteMobileTab === "create" ? "rotate-90" : ""}`}>▶</span>
            </button>

            <div className={`transition-all duration-500 overflow-hidden ${inviteMobileTab === "create" ? "max-h-200 border-t border-slate-200 dark:border-white/5" : "max-h-0 lg:max-h-none"}`}>
              <div className={`p-6 md:p-8 lg:p-10 flex flex-col gap-6 ${inviteMobileTab === "create" ? "opacity-100 scale-100" : "opacity-0 scale-95 lg:opacity-100 lg:scale-100"} transition-all duration-500`}>
                <div className="hidden lg:flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                    <PlusCircle size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl lg:text-2xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">Room Setup</h2>
                    <span className="text-[8px] lg:text-[10px] font-black text-emerald-500/80 uppercase tracking-widest leading-none">Global Link Protection</span>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[9px] md:text-[11px] uppercase tracking-[0.3em] text-slate-500 font-bold pl-1 italic">Arena Entry Stake</label>
                    <div className="relative group/input">
                      <input value={customStake} onChange={(e) => setCustomStake(e.target.value)} className="w-full bg-slate-50 dark:bg-black/40 border-2 border-slate-200 dark:border-white/10 rounded-2xl px-6 py-4 font-black text-2xl text-slate-900 dark:text-white focus:border-emerald-500 outline-none transition-all tracking-tighter italic" placeholder="100" type="number" />
                      <span className="-translate-y-1/2 absolute right-6 top-1/2 text-emerald-500 scale-125"><ZASymbol /></span>
                    </div>
                    <div className="flex gap-2">
                      {[100, 200, 500].map((amt) => (
                        <button key={amt} onClick={() => addStake(amt)} className="flex-1 py-3 bg-slate-50 dark:bg-white/5 hover:bg-emerald-500/10 border border-slate-200 dark:border-white/5 hover:border-emerald-500/30 rounded-xl font-bold text-[10px] text-slate-500 dark:text-slate-400 hover:text-emerald-500 transition-all uppercase italic">+{amt}</button>
                      ))}
                    </div>
                  </div>
                  <button onClick={handleCreateChallenge} disabled={loading} className="w-full bg-emerald-500 text-white font-black py-5 rounded-2xl text-sm md:text-base tracking-[0.2em] transition-all hover:brightness-110 active:scale-95 italic uppercase flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20">
                    {loading ? "INITIALIZING..." : <><MdLink size={20} /> GENERATE WARZONE LINK</>}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Join Challenge Accordion */}
          <section className="w-full bg-white/90 dark:bg-slate-900/40 lg:rounded-2xl xl:rounded-[2.4rem] rounded-none border-y md:border border-slate-200 dark:border-white/10 flex flex-col shadow-md overflow-hidden xl:min-h-auto">
            <button
              onClick={() => setInviteMobileTab(inviteMobileTab === "join" ? null : "join")}
              className={`w-full p-6 md:p-8 lg:p-10 flex items-center justify-between font-black uppercase text-xs md:text-sm tracking-widest transition-colors ${inviteMobileTab === "join" ? "bg-amber-500/10 text-amber-500 dark:text-amber-400" : "text-slate-500 dark:text-slate-400 hover:bg-white/5"}`}
            >
              <div className="flex items-center gap-4">
                <Zap size={24} className={inviteMobileTab === "join" ? "animate-pulse" : ""} />
                <span>Join Challenge</span>
              </div>
              <span className={`text-slate-400 transition-transform duration-300 ${inviteMobileTab === "join" ? "rotate-90" : ""}`}>▶</span>
            </button>

            <div className={`transition-all duration-500 overflow-hidden ${inviteMobileTab === "join" ? "max-h-200 border-t border-slate-200 dark:border-white/5" : "max-h-0 lg:max-h-none"}`}>
              <div className={`p-6 md:p-8 lg:p-10 flex flex-col gap-6 ${inviteMobileTab === "join" ? "opacity-100 scale-100" : "opacity-0 scale-95 lg:opacity-100 lg:scale-100"} transition-all duration-500`}>
                <div className="hidden lg:flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 dark:text-amber-400">
                    <Zap size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl lg:text-2xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">Credentials</h2>
                    <span className="text-[8px] lg:text-[10px] font-black text-amber-500/80 dark:text-amber-400/60 uppercase tracking-widest">Authorized Entry Only</span>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[9px] md:text-[11px] uppercase tracking-[0.3em] text-slate-500 font-bold pl-1 italic">Match Access Code</label>
                    <form onSubmit={handleJoinByCode} className="space-y-4">
                      <input value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} maxLength={6} placeholder="ROOM-ID" className="w-full bg-slate-50 dark:bg-black/40 border-2 border-slate-200 dark:border-white/10 rounded-2xl px-6 py-4 font-mono font-black text-center tracking-[0.5em] text-2xl text-slate-900 dark:text-white focus:border-amber-500 outline-none transition-all uppercase" />
                      <button type="submit" disabled={joinCode.length < 6 || loading} className="w-full bg-amber-500 text-slate-950 py-5 rounded-2xl font-black text-sm md:text-base tracking-[0.2em] hover:brightness-110 transition-all active:scale-95 disabled:opacity-30 uppercase italic shadow-lg shadow-amber-500/20">ENTER WARZONE</button>
                    </form>
                  </div>
                  <div className="p-4 bg-amber-500/5 dark:bg-white/5 border border-amber-500/10 rounded-2xl text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed italic text-center">Codes are case-insensitive. Ensure you enter the 6-character sequence exactly as provided by your opponent.</div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
      {/* ─── CONFIRMATION MODAL ─── */}
      {confirmingAction && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border-2 border-primary/30 rounded-3xl p-8 shadow-2xl space-y-8 animate-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="text-primary w-12 h-12" />
              </div>
              <div>
                <h2 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">Authorize Entry</h2>
                <div className="h-1 w-12 bg-primary/30 mx-auto mt-2 rounded-full"></div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl p-6 space-y-4">
              <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-widest text-center leading-relaxed">
                Wallet verification required. To enter this H2H battle, the room's entry fee will be deducted from your balance.
              </p>
              
              <div className="flex items-center justify-center gap-3 py-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Entry Fee:</span>
                <span className="text-3xl font-black text-indigo-500 italic">
                  {confirmingAction.stake > 0 ? (
                    <>{confirmingAction.stake} <ZASymbol className="scale-125" /></>
                  ) : (
                    "ROOM STAKE"
                  )}
                </span>
              </div>

              <div className="flex items-center gap-2 text-[8px] md:text-[9px] text-amber-500 font-black uppercase justify-center bg-amber-500/5 py-2 rounded-lg border border-amber-500/10">
                <AlertCircle size={14} />
                Match abandonment forfeits this stake
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setConfirmingAction(null)}
                className="py-4 rounded-xl font-black uppercase text-[10px] tracking-widest text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={executeConfirmedAction}
                disabled={isBtnLoading}
                className="py-4 bg-primary text-slate-950 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] hover:scale-105 active:scale-95 shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2"
              >
                {isBtnLoading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-900"></div> : "Agree & Join"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default H2HLobby;
