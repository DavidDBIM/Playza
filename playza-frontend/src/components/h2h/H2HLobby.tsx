import React, { useState } from 'react';
import { MdSearch, MdLink } from 'react-icons/md';
import { Zap, Swords, PlusCircle, Trophy } from 'lucide-react';
import { ZASymbol } from '@/components/currency/ZASymbol';

interface H2HLobbyProps {
  onCreate: (stake: number) => void;
  onJoin: (code: string) => void;
  loading: boolean;
}

const H2HLobby = ({ onCreate, onJoin, loading }: H2HLobbyProps) => {
  const [view, setView] = useState<'hub' | 'quick' | 'invite'>('hub');
  const [stakeValue, setStakeValue] = useState(100);
  const [customStake, setCustomStake] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [isFinding, setIsFinding] = useState(false);

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
    <div className="w-full max-w-6xl mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* ─── BATTLE HUB VIEW ─── */}
      {view === 'hub' && (
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
            <h1 className="font-headline text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-tight text-white">
              SELECT YOUR <span className="text-indigo-500">GAME</span>
            </h1>
            <p className="text-slate-400 max-w-xl mx-auto text-xs md:text-sm font-medium">
              Choose your battlefield. Compete in high-stakes matches against global rivals or challenge your friends for ultimate bragging rights.
            </p>
          </header>

          {/* Game Selection Carousel/Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {games.map((game) => (
              <div 
                key={game.id}
                className={`relative group cursor-pointer transition-all duration-300 ${game.comingSoon ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:scale-[1.02]'}`}
              >
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${game.color} rounded-3xl blur opacity-20 group-hover:opacity-40 transition-opacity`}></div>
                <div className="relative bg-slate-900/80 border border-white/10 rounded-3xl p-6 backdrop-blur-xl h-full flex flex-col justify-between items-center text-center overflow-hidden">
                  {game.comingSoon && (
                    <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border border-white/10">Coming Soon</div>
                  )}
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${game.color} flex items-center justify-center shadow-lg mb-6 group-hover:rotate-6 transition-transform`}>
                    <game.icon size={40} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-2">{game.name}</h3>
                    <div className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest font-bold text-indigo-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                      {game.players} Active Now
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mode Selection Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
            {/* Find Online Rival */}
            <button 
              onClick={() => setView('quick')}
              className="group relative overflow-hidden rounded-[2rem] p-1 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-20 group-hover:opacity-100 transition-opacity animate-gradient-x"></div>
              <div className="relative bg-slate-950 rounded-[1.9rem] p-8 flex items-center gap-6 h-full text-left border border-white/5">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-500">
                  <Swords size={32} />
                </div>
                <div className="flex-1">
                  <span className="text-indigo-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1 block">Global Matchmaking</span>
                  <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">Find Online Rival</h2>
                  <p className="text-slate-500 text-xs mt-1">Battle random tiers across the globe</p>
                </div>
                <Zap className="text-slate-700 group-hover:text-indigo-400 group-hover:scale-125 transition-all duration-500" />
              </div>
            </button>

            {/* Invite a Friend */}
            <button 
              onClick={() => setView('invite')}
              className="group relative overflow-hidden rounded-[2rem] p-1 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 opacity-20 group-hover:opacity-100 transition-opacity animate-gradient-x"></div>
              <div className="relative bg-slate-950 rounded-[1.9rem] p-8 flex items-center gap-6 h-full text-left border border-white/5">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500">
                  <MdLink size={32} />
                </div>
                <div className="flex-1">
                  <span className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1 block">Private Challenge</span>
                  <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">Invite a Friend</h2>
                  <p className="text-slate-500 text-xs mt-1">Play with someone you know</p>
                </div>
                <Trophy className="text-slate-700 group-hover:text-emerald-400 group-hover:scale-125 transition-all duration-500" />
              </div>
            </button>
          </div>
        </div>
      )}

      {/* ─── FIND ONLINE RIVAL VIEW ─── */}
      {view === 'quick' && (
        <div className="max-w-2xl mx-auto animate-in slide-in-from-right-8 duration-500">
          <button 
            onClick={() => setView('hub')}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white mb-8 transition-colors"
          >
            ← Back to Hub
          </button>
          
          <div className="relative p-1 rounded-[2.5rem] bg-gradient-to-b from-indigo-500/20 to-transparent">
            <section className="bg-slate-900/90 backdrop-blur-3xl rounded-[2.4rem] p-8 md:p-12 border border-white/10 shadow-2xl space-y-12">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                  <Zap className="text-indigo-400" size={32} />
                </div>
                <div>
                  <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">Arena Match</h2>
                  <span className="text-[10px] font-black text-indigo-400/60 uppercase tracking-widest">Global Pool · Instant Join</span>
                </div>
              </div>

              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-black pl-1">Set Your Stake (<ZASymbol className="scale-75" />)</label>
                  <div className="grid grid-cols-3 gap-4">
                    {[100, 200, 500].map((val) => (
                      <button 
                        key={val} 
                        onClick={() => setStakeValue(val)}
                        className={`py-6 rounded-2xl font-headline font-black text-2xl transition-all active:scale-95 border-2 ${stakeValue === val ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_30px_rgba(99,102,241,0.3)]' : 'bg-white/5 border-white/5 hover:border-indigo-500/30'}`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center">
                      <Trophy size={20} className="text-indigo-400" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest block">Potential Prize</span>
                      <span className="text-xl font-black text-indigo-400 flex items-center gap-1 leading-none mt-1">
                        {stakeValue * 2} <ZASymbol className="scale-75" />
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] text-slate-600 font-black uppercase tracking-tighter block">ESTIMATED WAIT</span>
                    <span className="text-xs font-black text-slate-400">{'< 10 SEC'}</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleQuickMatch}
                disabled={isBtnLoading}
                className="w-full bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-white font-black py-7 rounded-[1.5rem] text-2xl tracking-[0.1em] uppercase italic transition-all flex items-center justify-center gap-4 shadow-[0_20px_40px_rgba(99,102,241,0.2)]"
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
      {view === 'invite' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-left-8 duration-500">
          <div className="lg:col-span-2">
            <button 
              onClick={() => setView('hub')}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white mb-8 transition-colors"
            >
              ← Back to Hub
            </button>
          </div>

          {/* Create Challenge */}
          <section className="bg-slate-900/40 backdrop-blur-xl rounded-[2.4rem] p-10 border border-white/10 space-y-8 h-full flex flex-col justify-between">
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <PlusCircle size={32} />
                </div>
                <div>
                  <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">Create Challenge</h2>
                  <span className="text-[10px] font-black text-emerald-400/60 uppercase tracking-widest">Set Stakes · Send Link</span>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-black pl-1">Host Custom Match</label>
                <div className="relative group/input">
                  <input 
                    value={customStake}
                    onChange={(e) => setCustomStake(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-8 py-6 font-black text-4xl text-white focus:border-emerald-500 outline-none transition-all tracking-tighter italic" 
                    placeholder="100" 
                    type="number" 
                  />
                  <span className="absolute right-8 top-1/2 -translate-y-1/2 text-emerald-500 scale-150"><ZASymbol /></span>
                </div>
                <div className="flex gap-2">
                  {[100, 200, 500].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => addStake(amt)}
                      className="flex-1 py-3 bg-white/5 hover:bg-emerald-500/10 border border-white/5 hover:border-emerald-500/30 rounded-xl font-black text-xs text-slate-400 hover:text-emerald-400 transition-all uppercase italic"
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
              className="w-full mt-8 bg-transparent border-4 border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-black font-black py-6 rounded-[1.5rem] text-xl tracking-[0.2em] transition-all shadow-xl italic uppercase flex items-center justify-center gap-3"
            >
              {loading ? "GENERATING..." : (
                <>
                  <MdLink size={24} />
                  CREATE INVITE LINK
                </>
              )}
            </button>
          </section>

          {/* Join Challenge */}
          <section className="bg-slate-900/40 backdrop-blur-xl rounded-[2.4rem] p-10 border border-white/10 space-y-8 flex flex-col justify-between">
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Zap size={32} />
                </div>
                <div>
                  <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">Join by Code</h2>
                  <span className="text-[10px] font-black text-amber-400/60 uppercase tracking-widest">Enter Credentials</span>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-black pl-1">Room Credentials</label>
                <form onSubmit={handleJoinByCode} className="space-y-4">
                  <input 
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    placeholder="ENTER CODE"
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-8 font-mono font-bold text-center tracking-[0.6em] text-3xl text-white focus:border-amber-500 outline-none transition-all uppercase"
                  />
                  <button 
                    type="submit"
                    disabled={joinCode.length < 6 || loading}
                    className="w-full bg-amber-500 text-black py-6 rounded-[1.5rem] font-black text-xl tracking-widest hover:brightness-110 transition-all disabled:opacity-30 uppercase italic"
                  >
                    ENTER ARENA
                  </button>
                </form>
              </div>
            </div>
            
            <div className="p-4 bg-white/5 rounded-2xl text-[10px] text-slate-500 font-medium leading-relaxed italic text-center">
              Room codes are case-insensitive. Make sure you have the exact 6-character sequence from your host.
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default H2HLobby;
