import React from "react";
import { 
  MdDiamond, 
  MdCheckCircle, 
  MdToken, 
  MdLock, 
  MdStar, 
  MdMilitaryTech, 
  MdCheck, 
  MdBolt, 
  MdRocketLaunch, 
  MdShield, 
  MdLogin, 
  MdGroupAdd, 
  MdEmojiEvents, 
  MdArrowForward, 
  MdAccountBalanceWallet, 
  MdConfirmationNumber, 
  MdLocalMall 
} from "react-icons/md";

const Loyalty = () => {
  return (
    <div className="flex-1 space-y-12">
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
                <div className="text-sm uppercase tracking-widest text-secondary-fixed mb-1 font-bold">
                  Total Balance
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-5xl font-black font-headline text-on-surface">
                    2,450
                  </span>
                  <span className="text-2xl font-bold text-primary">PZA</span>
                </div>
              </div>
              <div className="flex-1 min-w-60">
                <div className="flex justify-between text-xs mb-2 text-on-surface-variant">
                  <span>
                    Progress to{" "}
                    <span className="text-primary font-bold">GOLD</span>
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
      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="font-headline text-2xl font-bold tracking-tight">
            Daily Rewards
          </h2>
          <span className="text-sm text-primary">Claim every 24h</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <div className="glass-card p-4 rounded-xl border border-secondary/30 flex flex-col items-center gap-2 bg-secondary/5">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase">
              Day 1
            </span>
            <MdCheckCircle className="text-secondary text-2xl" />
            <div className="font-bold text-secondary">50 PZA</div>
          </div>
          <div className="glass-card p-4 rounded-xl border border-secondary/30 flex flex-col items-center gap-2 bg-secondary/5">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase">
              Day 2
            </span>
            <MdCheckCircle className="text-secondary text-2xl" />
            <div className="font-bold text-secondary">100 PZA</div>
          </div>
          <div className="glass-card p-4 rounded-xl border border-secondary/30 flex flex-col items-center gap-2 bg-secondary/5">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase">
              Day 3
            </span>
            <MdCheckCircle className="text-secondary text-2xl" />
            <div className="font-bold text-secondary">150 PZA</div>
          </div>

          <div className="glass-card p-4 rounded-xl border-2 border-primary flex flex-col items-center gap-2 bg-primary/10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
            <span className="text-[10px] font-bold text-primary uppercase">
              Day 4
            </span>
            <MdToken className="text-primary text-2xl" />
            <div className="font-bold text-on-surface">200 PZA</div>
            <button className="text-[10px] bg-primary text-on-primary-fixed px-3 py-1 rounded-full font-bold mt-1 uppercase">
              CLAIM
            </button>
          </div>

          <div className="glass-card p-4 rounded-xl border border-white/5 flex flex-col items-center gap-2 opacity-50">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase">
              Day 5
            </span>
            <MdLock className="text-2xl" />
            <div className="font-bold">250 PZA</div>
          </div>
          <div className="glass-card p-4 rounded-xl border border-white/5 flex flex-col items-center gap-2 opacity-50">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase">
              Day 6
            </span>
            <MdLock className="text-2xl" />
            <div className="font-bold">300 PZA</div>
          </div>
          <div className="glass-card p-4 rounded-xl border border-tertiary/30 flex flex-col items-center gap-2 bg-tertiary/5">
            <span className="text-[10px] font-bold text-tertiary uppercase">
              Day 7
            </span>
            <MdStar className="text-tertiary text-2xl" />
            <div className="font-bold text-tertiary">350 PZA</div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="font-headline text-2xl font-bold tracking-tight">
          Tier System
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card p-6 rounded-xl border border-white/5 space-y-4">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 rounded-lg bg-orange-900/20 border border-orange-500/30 flex items-center justify-center">
                <MdMilitaryTech className="text-orange-400 text-2xl" />
              </div>
              <span className="text-[10px] bg-secondary-container/30 text-secondary px-2 py-1 rounded-md font-bold uppercase">
                UNLOCKED
              </span>
            </div>
            <div>
              <div className="font-headline font-bold text-xl">Bronze</div>
              <div className="text-xs text-on-surface-variant">0 - 999 PZA</div>
            </div>
            <ul className="text-xs space-y-2 text-on-surface/70">
              <li className="flex gap-2 items-center">
                <MdCheck className="text-[14px] text-secondary" /> Basic Support
              </li>
              <li className="flex gap-2 items-center">
                <MdCheck className="text-[14px] text-secondary" /> Standard Multiplier
              </li>
            </ul>
          </div>

          <div className="glass-card p-6 rounded-xl border border-white/5 space-y-4 bg-surface-container-high">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 rounded-lg bg-slate-500/20 border border-slate-400/30 flex items-center justify-center">
                <MdMilitaryTech className="text-slate-300 text-2xl" />
              </div>
              <span className="text-[10px] bg-secondary-container/30 text-secondary px-2 py-1 rounded-md font-bold uppercase">
                ACTIVE
              </span>
            </div>
            <div>
              <div className="font-headline font-bold text-xl">Silver</div>
              <div className="text-xs text-on-surface-variant">
                1,000 - 4,999 PZA
              </div>
            </div>
            <ul className="text-xs space-y-2 text-on-surface/70">
              <li className="flex gap-2 items-center">
                <MdCheck className="text-[14px] text-secondary" /> 1.2x PZA Multiplier
              </li>
              <li className="flex gap-2 items-center">
                <MdCheck className="text-[14px] text-secondary" /> Priority Chat
              </li>
            </ul>
          </div>

          <div className="glass-card p-6 rounded-xl border border-white/5 space-y-4 opacity-70 grayscale">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 rounded-lg bg-yellow-500/20 border border-yellow-400/30 flex items-center justify-center">
                <MdMilitaryTech className="text-yellow-400 text-2xl" />
              </div>
              <MdLock className="text-on-surface-variant" />
            </div>
            <div>
              <div className="font-headline font-bold text-xl">Gold</div>
              <div className="text-xs text-on-surface-variant">
                5,000 - 9,999 PZA
              </div>
            </div>
            <ul className="text-xs space-y-2 text-on-surface/70">
              <li className="flex gap-2 items-center">
                <MdBolt className="text-[14px] text-primary" /> 1.5x PZA Multiplier
              </li>
              <li className="flex gap-2 items-center">
                <MdStar className="text-[14px] text-primary" /> Weekly Rewards
              </li>
            </ul>
          </div>

          <div className="glass-card p-6 rounded-xl border border-white/5 space-y-4 opacity-70 grayscale">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 rounded-lg bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center">
                <MdMilitaryTech className="text-cyan-400 text-2xl" />
              </div>
              <MdLock className="text-on-surface-variant" />
            </div>
            <div>
              <div className="font-headline font-bold text-xl">Platinum</div>
              <div className="text-xs text-on-surface-variant">10,000+ PZA</div>
            </div>
            <ul className="text-xs space-y-2 text-on-surface/70">
              <li className="flex gap-2 items-center">
                <MdRocketLaunch className="text-[14px] text-primary" /> 2.0x PZA Multiplier
              </li>
              <li className="flex gap-2 items-center">
                <MdShield className="text-[14px] text-primary" /> Dedicated Manager
              </li>
            </ul>
          </div>
        </div>
      </section>

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
