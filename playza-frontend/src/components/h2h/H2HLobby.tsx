import React, { useState } from 'react';
import { MdSearch } from 'react-icons/md';

interface H2HLobbyProps {
  onCreate: (stake: number) => void;
  onJoin: (code: string) => void;
  loading: boolean;
}

const H2HLobby = ({ onCreate, onJoin, loading }: H2HLobbyProps) => {
  const [stakeValue, setStakeValue] = useState(100);
  const [customStake, setCustomStake] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [isFinding, setIsFinding] = useState(false);

  const handleQuickMatch = () => {
    setIsFinding(true);
    // Simulate matchmaking feel
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

  const isBtnLoading = loading || isFinding;

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <header className="mb-10 text-center lg:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-4">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          Live Matchmaking
        </div>
        <h1 className="font-headline text-5xl md:text-6xl font-black text-foreground tracking-tighter uppercase italic leading-tight">
          H2H <span className="text-primary">Battles</span>
        </h1>
        <p className="text-muted-foreground mt-3 max-w-xl font-body text-sm md:text-base">
          Challenge players in real-time and win instantly. High-stakes digital sport at your fingertips.
        </p>
      </header>

      {/* Bento Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-20">
        {/* Quick Match Card */}
        <section className="md:col-span-8 bg-card/40 backdrop-blur-xl rounded-xl p-8 md:p-10 border border-white/5 relative overflow-hidden flex flex-col justify-between shadow-2xl group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -mr-48 -mt-48 transition-all group-hover:bg-primary/20 duration-1000"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30">
                <span className="material-symbols-outlined text-primary scale-110" style={{ fontVariationSettings: "'FILL' 1" }}>flash_on</span>
              </div>
              <h2 className="font-headline text-2xl uppercase tracking-widest font-black italic">Quick Match</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-5">
                <label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-black pl-1">Choose Arena</label>
                <div className="bg-white/5 dark:bg-black/20 p-5 rounded-xl flex items-center justify-between border border-primary/5 cursor-pointer shadow-inner">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-linear-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center border border-white/10">
                      <span className="material-symbols-outlined text-foreground text-2xl">chess</span>
                    </div>
                    <div>
                      <span className="font-headline font-black text-xl block">Chess</span>
                      <span className="text-[10px] uppercase tracking-widest text-primary font-bold">In Play</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-black pl-1">Stake (ZA)</label>
                <div className="grid grid-cols-3 gap-3 h-18.5">
                  {[50, 100, 500].map((val) => (
                    <button 
                      key={val} 
                      onClick={() => setStakeValue(val)}
                      className={`flex-1 rounded-xl font-headline font-black text-lg transition-all active:scale-95 border ${stakeValue === val ? 'bg-linear-to-br from-primary to-accent text-white border-transparent shadow-lg shadow-primary/20' : 'bg-white/5 dark:bg-black/20 border-white/5 hover:border-primary/30'}`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={handleQuickMatch}
            disabled={isBtnLoading}
            className="relative z-10 w-full mt-12 bg-foreground text-background font-black py-6 rounded-3xl font-headline text-xl tracking-widest flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-[0.98] transition-all overflow-hidden group/btn shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 bg-linear-to-r from-primary via-secondary to-accent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
            <span className="relative z-10 flex items-center gap-3 group-hover/btn:text-white transition-colors">
              {isFinding ? (
                 <div className="flex items-center gap-3">
                   <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                   SEARCHING...
                 </div>
              ) : loading ? (
                 <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
              ) : (
                <>
                  <MdSearch className="animate-pulse text-2xl" />
                  FIND OPPONENT
                </>
              )}
            </span>
          </button>
        </section>

        {/* Create Challenge Card */}
        <section className="md:col-span-4 bg-primary/5 rounded-[2.5rem] p-8 border border-primary/20 flex flex-col shadow-xl">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-2xl bg-secondary/20 flex items-center justify-center border border-secondary/30">
              <span className="material-symbols-outlined text-secondary scale-110" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
            </div>
            <h2 className="font-headline text-2xl uppercase tracking-widest font-black italic">Challenge</h2>
          </div>
          
          <div className="space-y-6 flex-1">
            <div className="space-y-3">
              <label htmlFor="stake-input" className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-black pl-1">Custom Stake</label>
              <div className="relative group">
                <input 
                  id="stake-input" 
                  value={customStake}
                  onChange={(e) => setCustomStake(e.target.value)}
                  className="w-full bg-background border border-white/10 rounded-2xl pl-6 pr-14 py-4 font-headline font-black focus:border-primary outline-none group-hover:border-primary/50 transition-colors tracking-widest uppercase text-lg" 
                  placeholder="0 (Free)" 
                  type="number" 
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-black text-primary">ZA</span>
              </div>
            </div>

            <div className="p-5 bg-black/20 rounded-2xl border border-white/5">
                <p className="font-headline text-xs font-black uppercase tracking-[0.2em] text-primary">Join Room</p>
                <form onSubmit={handleJoinByCode} className="mt-4 flex gap-2">
                  <input 
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    placeholder="ENTER CODE"
                    className="flex-1 bg-background/50 border border-white/10 rounded-xl px-4 py-2 font-mono font-bold text-center tracking-[0.3em] text-sm focus:border-secondary outline-none"
                  />
                  <button 
                    type="submit"
                    disabled={joinCode.length < 6 || loading}
                    className="bg-secondary text-black px-4 py-2 rounded-xl font-headline font-black text-[10px] tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                  >
                    JOIN
                  </button>
                </form>
            </div>
          </div>

          <button 
            onClick={handleCreateChallenge}
            disabled={loading}
            className="w-full mt-10 bg-white dark:bg-black/40 border-[3px] border-primary text-primary hover:bg-primary hover:text-white font-black py-4 rounded-2xl font-headline tracking-widest transition-all shadow-lg text-lg italic uppercase disabled:opacity-50"
          >
            {loading ? "CREATING..." : "LAUNCH LOBBY"}
          </button>
        </section>
      </div>
    </div>
  );
};

export default H2HLobby;
