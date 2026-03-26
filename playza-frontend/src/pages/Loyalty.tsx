import { useState } from "react";
import {
  MdDiamond,
  MdCheckCircle,
  MdToken,
  MdLock,
  MdStar,
  MdMilitaryTech,
  MdLogin,
  MdGroupAdd,
  MdEmojiEvents,
  MdArrowForward,
  MdAccountBalanceWallet,
  MdConfirmationNumber,
  MdLocalMall,
  MdInfo,
  MdClose,
} from "react-icons/md";

const Loyalty = () => {
  const [isTierModalOpen, setIsTierModalOpen] = useState(false);

  return (
    <div className="flex-1 space-y-12 pb-20">
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card rounded-xl p-8 relative overflow-hidden border border-white/5 neon-glow">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <MdDiamond className="text-9xl" />
          </div>
          <div className="relative z-10">
            <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight mb-2">
              Loyalty & Rewards
            </h1>
            <p className="text-on-surface-variant mb-8 max-w-md">
              Earn PZA Points. Complete tasks. Unlock rewards.
            </p>
            <div className="flex flex-wrap items-end gap-8">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-secondary-fixed mb-1 font-bold opacity-70">
                  Total Balance
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-4xl md:text-5xl font-black font-headline text-on-surface">
                    2,450
                  </span>
                  <span className="text-xl md:text-2xl font-bold text-primary">PZA</span>
                </div>
              </div>
              <div className="flex-1 min-w-60">
                <div className="flex justify-between text-xs mb-2 text-on-surface-variant">
                  <span className="flex items-center gap-1.5">
                    Progress to{" "}
                    <span className="text-primary font-bold">GOLD</span>
                    <button 
                      onClick={() => setIsTierModalOpen(true)}
                      className="text-primary hover:text-primary/80 transition-colors p-0.5"
                      title="View Tiers"
                    >
                      <MdInfo className="text-xs" />
                    </button>
                  </span>
                  <span>2,450 / 5,000 PZA</span>
                </div>
                <div className="h-3 bg-surface-variant rounded-full overflow-hidden">
                  <div className="h-full bg-linear-to-r from-primary to-secondary w-[49%] relative">
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-8 flex flex-col justify-between border border-white/5">
          <div className="flex justify-between items-start">
            <div className="text-sm uppercase tracking-widest text-tertiary font-bold">
              Current Streak
            </div>
            <div className="bg-error-container/20 text-error px-3 py-1 rounded-full text-xs font-bold border border-error/20">
              3 days 🔥
            </div>
          </div>
          <div className="mt-6 flex justify-between items-end">
            <div className="space-y-1">
              <div className="text-4xl font-black font-headline text-on-surface">
                12
              </div>
              <div className="text-xs text-on-surface-variant uppercase">
                Tasks Today
              </div>
            </div>
            <div className="w-16 h-16 rounded-full border-4 border-surface-variant flex items-center justify-center">
              <span className="text-primary font-bold">65%</span>
            </div>
          </div>
        </div>
      </section>

      {/* Daily Rewards */}
      <section className="space-y-6">
        <div className="flex justify-between items-center bg-surface-container/30 p-3 md:p-4 rounded-2xl border border-white/5">
          <h2 className="font-headline text-base md:text-lg font-bold tracking-tight">
            Daily Rewards
          </h2>
          <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 md:px-3 py-1 rounded-full">Claim every 24h</span>
        </div>
        <div className="grid grid-cols-7 gap-1 md:gap-2">
          {[
            { day: 1, amount: 50, icon: <MdCheckCircle />, color: "secondary", status: "claimed" },
            { day: 2, amount: 100, icon: <MdCheckCircle />, color: "secondary", status: "claimed" },
            { day: 3, amount: 150, icon: <MdCheckCircle />, color: "secondary", status: "claimed" },
            { day: 4, amount: 200, icon: <MdToken />, color: "primary", status: "active" },
            { day: 5, amount: 250, icon: <MdLock />, color: "neutral", status: "locked" },
            { day: 6, amount: 300, icon: <MdLock />, color: "neutral", status: "locked" },
            { day: 7, amount: 350, icon: <MdStar />, color: "tertiary", status: "locked" },
          ].map((item) => (
            <div 
              key={item.day}
              className={`flex-1 glass-card p-1 md:p-2 rounded-lg border flex flex-col items-center gap-0.5 md:gap-1 transition-all ${
                item.status === "active" 
                ? "border-primary bg-primary/10 shadow-[0_0_10px_rgba(var(--primary-rgb),0.1)]" 
                : item.status === "claimed" 
                ? "border-secondary/30 bg-secondary/5" 
                : "border-white/5 opacity-50"
              }`}
            >
              <span className={`text-[6px] md:text-[8px] font-bold uppercase ${item.status === "active" ? "text-primary" : "text-on-surface-variant"}`}>
                Day {item.day}
              </span>
              <div className={`text-base md:text-lg ${item.color === "primary" ? "text-primary" : item.color === "secondary" ? "text-secondary" : item.color === "tertiary" ? "text-tertiary" : ""}`}>
                {item.icon}
              </div>
              <div className={`font-black text-[7px] md:text-[10px] ${item.status === "active" ? "text-on-surface" : item.status === "claimed" ? "text-secondary" : item.color === "tertiary" ? "text-tertiary" : ""}`}>
                {item.amount}
              </div>
              {item.status === "active" && (
                <button className="text-[6px] md:text-[8px] bg-primary text-on-primary-fixed px-1.5 py-0.5 rounded-full font-bold uppercase hover:scale-105 active:scale-95 transition-transform">
                  CLAIM
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Starter Quests Section */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="font-headline text-2xl font-bold tracking-tight bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
              Starter Quests
            </h2>
            <p className="text-sm text-on-surface-variant">
              Complete these one-time missions to kickstart your journey
            </p>
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-secondary-fixed opacity-70">
            Phase 1 / 1
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: "First Signup", points: 5, status: "completed", icon: <MdCheckCircle /> },
            { name: "Verify Email", points: 10, status: "completed", icon: <MdCheckCircle /> },
            { name: "Verify Phone", points: 10, status: "active", icon: <MdLogin /> },
            { name: "Complete Profile", points: 30, status: "locked", icon: <MdLock /> },
            { name: "Upload Avatar", points: 20, status: "locked", icon: <MdLock /> },
            { name: "Play First Game", points: 200, status: "locked", icon: <MdLock /> },
          ].map((quest, idx) => (
            <div 
              key={idx}
              className={`glass-card p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between h-32 hover:border-primary/50 group ${
                quest.status === "completed" 
                ? "border-secondary/20 bg-secondary/5 opacity-80" 
                : quest.status === "active"
                ? "border-primary bg-primary/5 shadow-2xl shadow-primary/10 scale-[1.02]"
                : "border-white/5 opacity-50 bg-white/5"
              }`}
            >
              <div className="flex justify-between items-start">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ${
                  quest.status === "completed" ? "bg-secondary/20 text-secondary" :
                  quest.status === "active" ? "bg-primary/20 text-primary group-hover:rotate-12" : "bg-white/5 text-on-surface-variant"
                }`}>
                  {quest.icon}
                </div>
                <div className="text-right">
                  <div className={`text-base font-black ${quest.status === "completed" ? "text-secondary" : "text-primary"}`}>
                    +{quest.points}
                  </div>
                  <div className="text-[9px] font-black uppercase opacity-60 tracking-tighter">PZA Points</div>
                </div>
              </div>
              <div className="mt-2">
                <div className="font-headline font-black text-sm mb-1 uppercase tracking-tight">{quest.name}</div>
                {quest.status === "active" ? (
                  <div className="h-1.5 w-full bg-surface-variant rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[30%] animate-pulse"></div>
                  </div>
                ) : quest.status === "completed" ? (
                  <div className="flex items-center gap-1.5">
                    <MdCheckCircle className="text-secondary text-xs" />
                    <span className="text-[10px] font-black text-secondary uppercase tracking-widest">Authenticated</span>
                  </div>
                ) : (
                  <div className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest flex items-center gap-1.5">
                    <MdLock className="text-[10px]" /> Encrypted
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tier Modal */}
      {isTierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-lg glass-card rounded-3xl overflow-hidden border border-white/10 shadow-2xl p-6 md:p-8 animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setIsTierModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-on-surface-variant transition-colors"
            >
              <MdClose className="text-xl" />
            </button>

            <div className="mb-8">
              <h2 className="font-headline text-3xl font-black mb-2 flex items-center gap-3">
                <MdMilitaryTech className="text-primary text-4xl" />
                Tier System
              </h2>
              <p className="text-on-surface-variant text-sm">
                Unlock higher multipliers and exclusive rewards as you earn more PZA points.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="glass-card p-3 rounded-xl border border-white/5 flex flex-col items-center text-center gap-1 bg-white/5">
                <div className="w-8 h-8 rounded-lg bg-orange-900/20 border border-orange-500/30 flex items-center justify-center">
                  <MdMilitaryTech className="text-orange-400 text-lg" />
                </div>
                <div>
                  <div className="font-headline font-black text-sm">Bronze</div>
                  <div className="text-[10px] text-on-surface-variant font-bold">0-999 PZA</div>
                </div>
              </div>

              <div className="glass-card p-3 rounded-xl border-2 border-primary flex flex-col items-center text-center gap-1 bg-primary/10">
                <div className="w-8 h-8 rounded-lg bg-slate-500/20 border border-slate-400/30 flex items-center justify-center">
                  <MdMilitaryTech className="text-slate-300 text-lg" />
                </div>
                <div>
                  <div className="font-headline font-black text-sm">Silver</div>
                  <div className="text-[10px] text-on-surface-variant font-bold">1k-5k PZA</div>
                </div>
              </div>

              <div className="glass-card p-3 rounded-xl border border-white/5 flex flex-col items-center text-center gap-1 opacity-60 grayscale bg-white/5">
                <div className="w-8 h-8 rounded-lg bg-yellow-500/20 border border-yellow-400/30 flex items-center justify-center">
                  <MdMilitaryTech className="text-yellow-400 text-lg" />
                </div>
                <div>
                  <div className="font-headline font-black text-sm">Gold</div>
                  <div className="text-[10px] text-on-surface-variant font-bold">5k-10k PZA</div>
                </div>
              </div>

              <div className="glass-card p-3 rounded-xl border border-white/5 flex flex-col items-center text-center gap-1 opacity-60 grayscale bg-white/5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center">
                  <MdMilitaryTech className="text-cyan-400 text-lg" />
                </div>
                <div>
                  <div className="font-headline font-black text-sm">Platinum</div>
                  <div className="text-[10px] text-on-surface-variant font-bold">10k+ PZA</div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setIsTierModalOpen(false)}
              className="w-full mt-8 bg-surface-container hover:bg-surface-container-high text-on-surface py-3 rounded-xl font-bold uppercase tracking-tight transition-colors border border-white/5"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="font-headline text-2xl font-bold tracking-tight">
              Earn More PZA Points
            </h2>
            <p className="text-sm text-on-surface-variant">
              Complete missions to boost your balance
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-card p-5 rounded-xl border border-white/5 flex items-center justify-between group hover:bg-surface-container transition-colors cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <MdLogin className="text-xl" />
              </div>
              <div>
                <div className="font-bold">Daily Login</div>
                <div className="text-xs text-on-surface-variant">
                  Check in today for a bonus
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-primary font-black">+50 PZA</div>
              <div className="text-[10px] text-secondary font-bold">
                COMPLETED
              </div>
            </div>
          </div>

          <div className="glass-card p-5 rounded-xl border border-white/5 flex items-center justify-between group hover:bg-surface-container transition-colors cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary group-hover:scale-110 transition-transform">
                <MdMilitaryTech className="text-xl" />
              </div>
              <div>
                <div className="font-bold">Weekly Challenge</div>
                <div className="text-xs text-on-surface-variant">
                  Complete 10 games this week
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-primary font-black">+1,000 PZA</div>
              <div className="text-[10px] text-on-surface-variant">
                4/10 Progress
              </div>
            </div>
          </div>

          <div className="glass-card p-5 rounded-xl border border-white/5 flex items-center justify-between group hover:bg-surface-container transition-colors cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
                <MdGroupAdd className="text-xl" />
              </div>
              <div>
                <div className="font-bold">Refer a Friend</div>
                <div className="text-xs text-on-surface-variant">
                  Share your unique link
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-primary font-black">+300 PZA</div>
              <MdArrowForward className="text-primary text-sm inline" />
            </div>
          </div>

          <div className="glass-card p-5 rounded-xl border border-white/5 flex items-center justify-between group hover:bg-surface-container transition-colors cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center text-error group-hover:scale-110 transition-transform">
                <MdEmojiEvents className="text-xl" />
              </div>
              <div>
                <div className="font-bold">Win a Game</div>
                <div className="text-xs text-on-surface-variant">
                  Rank #1 in any arena match
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-primary font-black">+200 PZA</div>
              <MdArrowForward className="text-primary text-sm inline" />
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="font-headline text-2xl font-bold tracking-tight">
            Redemption Store
          </h2>
          <button className="text-sm font-bold text-primary hover:underline uppercase">
            View All
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="glass-card rounded-xl overflow-hidden border border-white/5 group">
            <div className="h-32 bg-linear-to-br from-primary/20 to-tertiary/20 flex items-center justify-center relative">
              <MdAccountBalanceWallet className="text-5xl text-on-surface/50" />
              <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-[10px] font-bold uppercase">
                WALLET BONUS
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <div className="font-headline font-bold text-lg">
                  $10 Wallet Credit
                </div>
                <div className="text-xs text-on-surface-variant">
                  Instant credit to your Playza wallet
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <div className="flex items-center gap-1">
                  <span className="text-primary font-black">1,500</span>
                  <span className="text-[10px] text-on-surface-variant">
                    PZA
                  </span>
                </div>
                <button className="bg-surface-variant hover:bg-primary hover:text-on-primary transition-all px-4 py-2 rounded-full text-xs font-bold uppercase">
                  Redeem
                </button>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-xl overflow-hidden border border-white/5 group">
            <div className="h-32 bg-linear-to-br from-secondary/20 to-primary/20 flex items-center justify-center relative">
              <MdConfirmationNumber className="text-5xl text-on-surface/50" />
              <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-[10px] font-bold uppercase">
                ENTRY TICKET
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <div className="font-headline font-bold text-lg">
                  Free Arena Entry
                </div>
                <div className="text-xs text-on-surface-variant">
                  One-time pass for any Pro Arena
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <div className="flex items-center gap-1">
                  <span className="text-primary font-black">800</span>
                  <span className="text-[10px] text-on-surface-variant">
                    PZA
                  </span>
                </div>
                <button className="bg-surface-variant hover:bg-primary hover:text-on-primary transition-all px-4 py-2 rounded-full text-xs font-bold uppercase">
                  Redeem
                </button>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-xl overflow-hidden border border-white/5 group">
            <div className="h-32 bg-linear-to-br from-tertiary/20 to-error/20 flex items-center justify-center relative">
              <MdLocalMall className="text-5xl text-on-surface/50" />
              <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-[10px] font-bold uppercase">
                MERCH SHOP
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <div className="font-headline font-bold text-lg">
                  25% Store Discount
                </div>
                <div className="text-xs text-on-surface-variant">
                  Apply to any physical merchandise
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <div className="flex items-center gap-1">
                  <span className="text-primary font-black">2,500</span>
                  <span className="text-[10px] text-on-surface-variant">
                    PZA
                  </span>
                </div>
                <button className="bg-surface-variant px-4 py-2 rounded-full text-xs font-bold opacity-50 cursor-not-allowed uppercase">
                  Insufficient
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Loyalty;
