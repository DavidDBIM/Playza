import { useState } from "react";
import {
  MdDiamond,
  MdCheckCircle,
  MdToken,
  MdLock,
  MdStar,
  MdMilitaryTech,
  MdLogin,
  // MdGroupAdd,
  // MdEmojiEvents,
  // MdArrowForward,
  MdAccountBalanceWallet,
  MdConfirmationNumber,
  MdLocalMall,
  MdInfo,
  MdClose,
  MdStars,
} from "react-icons/md";
import { useAuth } from "@/context/auth";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";

const Loyalty = () => {
  const { user } = useAuth();
  const [isTierModalOpen, setIsTierModalOpen] = useState(false);

  return (
    <div className="flex-1 space-y-12 pb-2 md:pb-20">
      {!user ? (
        <div className="mt-6 mb-12 glass-card p-2 md:p-10 rounded-xl border-primary/20 relative overflow-hidden flex flex-col items-center text-center gap-2 md:gap-8 shadow-2xl">
          <div className="absolute -top-24 -left-24 size-96 bg-primary/20 blur-[120px] rounded-full" />
          <div className="absolute -bottom-24 -right-24 size-96 bg-secondary/20 blur-[120px] rounded-full" />

          <div className="relative z-10 space-y-4 max-w-2xl">
            <div className="size-24 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-8 border border-primary/30 shadow-inner group">
              <MdStars className="text-3xl md:text-5xl text-primary animate-pulse" />
            </div>
            <h1 className="text-2xl md:text-4xl md:text-7xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none italic">
              PZA <span className="text-primary">Rewards</span> Center
            </h1>
            <p className="text-xs md:text-base md:text-xl text-slate-500 font-bold max-w-lg mx-auto leading-relaxed">
              Earn PZA for every move you make. Unlock exclusive
              tournaments, redeem wallet credits, and rank up your legacy.
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row gap-2 md:gap-4 w-full max-w-md">
            <Link to="/registration?view=signup" className="flex-1">
              <Button className="w-full h-16 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-sm md:text-lg hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 glow-accent">
                Join Rewards
              </Button>
            </Link>
            <Link to="/registration?view=login" className="flex-1">
              <Button
                variant="outline"
                className="w-full h-16 border-primary/30 text-primary rounded-2xl font-black uppercase tracking-widest text-sm md:text-lg hover:bg-primary/10 transition-all"
              >
                Member Login
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2 md:gap-6">
          <div className="flex justify-end pt-2 md:pt-4">
            <Link
              to="/leaderboard?tab=Loyalty"
              className="px-2 md:px-4 py-2 bg-primary/10 text-primary rounded-lg font-bold uppercase text-xs hover:bg-primary/20 transition-colors"
            >
              Reward Leaderboard
            </Link>
          </div>
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-2 md:gap-6">
            <div className="lg:col-span-2 glass-card rounded-xl p-2 md:p-8 relative overflow-hidden border border-white/5 neon-glow">
              <div className="absolute top-0 right-0 p-2 md:p-8 opacity-10">
                <MdDiamond className="text-9xl" />
              </div>
              <div className="relative z-10">
                <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight mb-2 text-slate-900 dark:text-white">
                  Loyalty & Rewards
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md font-bold uppercase tracking-widest opacity-60 text-xs">
                  Earn PZA. Complete tasks. Unlock rewards.
                </p>
                <div className="flex flex-wrap items-end gap-2 md:gap-8">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-primary mb-1 font-bold opacity-70">
                      Total Balance
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-4xl md:text-5xl font-black font-headline text-slate-900 dark:text-white">
                        2,450
                      </span>
                      <span className="text-xl md:text-2xl font-bold text-primary">
                        PZA
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-60">
                    <div className="flex justify-between text-xs mb-2 text-slate-500">
                      <span className="flex items-center gap-1.5 font-bold uppercase tracking-widest">
                        Progress to{" "}
                        <span className="text-primary font-black">GOLD</span>
                        <button
                          onClick={() => setIsTierModalOpen(true)}
                          className="text-primary hover:text-primary/80 transition-colors p-0.5"
                          title="View Tiers"
                        >
                          <MdInfo className="text-xs" />
                        </button>
                      </span>
                      <span className="font-black text-slate-900 dark:text-white">
                        2,450 / 5,000 PZA
                      </span>
                    </div>
                    <div className="h-3 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-inner">
                      <div className="h-full bg-linear-to-r from-primary to-secondary w-[49%] relative">
                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-xl p-2 md:p-8 flex flex-col justify-between border border-white/5">
              <div className="flex justify-between items-start">
                <div className="text-sm uppercase tracking-widest text-slate-500 font-bold">
                  Current Streak
                </div>
                <div className="bg-red-500/10 text-red-500 px-2 md:px-3 py-1 rounded-full text-xs font-bold border border-red-500/20">
                  3 days 🔥
                </div>
              </div>
              <div className="mt-6 flex justify-between items-end">
                <div className="space-y-1">
                  <div className="text-2xl md:text-4xl font-black font-headline text-slate-900 dark:text-white">
                    12
                  </div>
                  <div className="text-xs text-slate-500 uppercase font-bold tracking-widest opacity-60">
                    Tasks Today
                  </div>
                </div>
                <div className="w-16 h-16 rounded-full border-4 border-primary/20 flex items-center justify-center bg-primary/5">
                  <span className="text-primary font-black">65%</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Access Protected Sections */}
      {user && (
        <>
          {/* Daily Rewards */}
          <section className="space-y-6">
            <div className="flex justify-between items-center bg-slate-900/5 dark:bg-white/5 p-3 md:p-4 rounded-2xl border border-white/5">
              <h2 className="font-headline text-base md:text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                Daily Rewards
              </h2>
              <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 md:px-3 py-1 rounded-full">
                Claim every 24h
              </span>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1 md:gap-2 text-slate-900 dark:text-white">
              {[
                {
                  day: 1,
                  amount: 50,
                  icon: <MdCheckCircle />,
                  color: "secondary",
                  status: "claimed",
                },
                {
                  day: 2,
                  amount: 100,
                  icon: <MdCheckCircle />,
                  color: "secondary",
                  status: "claimed",
                },
                {
                  day: 3,
                  amount: 150,
                  icon: <MdCheckCircle />,
                  color: "secondary",
                  status: "claimed",
                },
                {
                  day: 4,
                  amount: 200,
                  icon: <MdToken />,
                  color: "primary",
                  status: "active",
                },
                {
                  day: 5,
                  amount: 250,
                  icon: <MdLock />,
                  color: "neutral",
                  status: "locked",
                },
                {
                  day: 6,
                  amount: 300,
                  icon: <MdLock />,
                  color: "neutral",
                  status: "locked",
                },
                {
                  day: 7,
                  amount: 350,
                  icon: <MdStar />,
                  color: "tertiary",
                  status: "locked",
                },
              ].map((item) => (
                <div
                  key={item.day}
                  className={`flex-1 glass-card p-1 md:p-2 rounded-lg border flex flex-col items-center gap-0.5 md:gap-1 transition-all ${
                    item.status === "active"
                      ? "border-primary bg-primary/10 shadow-[0_0_10px_rgba(var(--primary-rgb),0.1)]"
                      : item.status === "claimed"
                        ? "border-green-500/30 bg-green-500/5"
                        : "border-white/5 opacity-50"
                  }`}
                >
                  <span
                    className={`text-[6px] md:text-[8px] font-bold uppercase ${item.status === "active" ? "text-primary" : "text-slate-500"}`}
                  >
                    Day {item.day}
                  </span>
                  <div
                    className={`text-base md:text-lg ${item.color === "primary" ? "text-primary" : item.color === "secondary" ? "text-green-500" : item.color === "tertiary" ? "text-amber-500" : ""}`}
                  >
                    {item.icon}
                  </div>
                  <div
                    className={`font-black text-[7px] md:text-[10px] ${item.status === "active" ? "text-slate-900 dark:text-white" : item.status === "claimed" ? "text-green-500" : ""}`}
                  >
                    {item.amount}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Starter Quests Section */}
          <section className="space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="font-headline text-lg md:text-2xl font-bold tracking-tight bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent italic">
                  Starter Quests
                </h2>
                <p className="text-xs md:text-sm text-slate-500 font-bold uppercase tracking-widest opacity-70">
                  Complete missions to kickstart your journey
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
              {[
                {
                  name: "First Signup",
                  points: 5,
                  status: "completed",
                  icon: <MdCheckCircle />,
                },
                {
                  name: "Verify Email",
                  points: 10,
                  status: "completed",
                  icon: <MdCheckCircle />,
                },
                {
                  name: "Verify Phone",
                  points: 10,
                  status: "active",
                  icon: <MdLogin />,
                },
                {
                  name: "Complete Profile",
                  points: 30,
                  status: "locked",
                  icon: <MdLock />,
                },
                {
                  name: "Upload Avatar",
                  points: 20,
                  status: "locked",
                  icon: <MdLock />,
                },
                {
                  name: "Play First Game",
                  points: 200,
                  status: "locked",
                  icon: <MdLock />,
                },
              ].map((quest, idx) => (
                <div
                  key={idx}
                  className={`glass-card p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between h-32 hover:border-primary/50 group ${
                    quest.status === "completed"
                      ? "border-green-500/20 bg-green-500/5 opacity-80"
                      : quest.status === "active"
                        ? "border-primary bg-primary/5 shadow-2xl shadow-primary/10 scale-[1.02]"
                        : "border-white/5 opacity-50 bg-white/5"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ${
                        quest.status === "completed"
                          ? "bg-green-500/20 text-green-500"
                          : quest.status === "active"
                            ? "bg-primary/20 text-primary"
                            : "bg-white/5 text-slate-500"
                      }`}
                    >
                      {quest.icon}
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-base font-black ${quest.status === "completed" ? "text-green-500" : "text-primary"}`}
                      >
                        +{quest.points}
                      </div>
                      <div className="text-[9px] font-black uppercase opacity-60 tracking-tighter">
                        PZA
                      </div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="font-headline font-black text-sm mb-1 uppercase tracking-tight text-slate-900 dark:text-white">
                      {quest.name}
                    </div>
                    {quest.status === "active" ? (
                      <div className="h-1.5 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-[30%] animate-pulse"></div>
                      </div>
                    ) : quest.status === "completed" ? (
                      <div className="flex items-center gap-1.5">
                        <MdCheckCircle className="text-green-500 text-xs" />
                        <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">
                          Authenticated
                        </span>
                      </div>
                    ) : (
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                        <MdLock className="text-[10px]" /> Encrypted
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* Redemption Store - Visible to all but actions limited */}
      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="font-headline text-lg md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white uppercase italic">
            Redemption Store
          </h2>
          <button className="text-xs font-black text-primary hover:underline uppercase tracking-widest">
            View All
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-6">
          <div className="glass-card rounded-xl overflow-hidden border border-white/5 group bg-slate-100/50 dark:bg-white/5">
            <div className="h-32 bg-linear-to-br from-primary/20 to-secondary/20 flex items-center justify-center relative">
              <MdAccountBalanceWallet className="text-3xl md:text-5xl text-slate-500 opacity-20" />
              <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-[10px] font-bold uppercase text-white">
                WALLET BONUS
              </div>
            </div>
            <div className="p-2 md:p-6 space-y-4">
              <div>
                <div className="font-headline font-black text-sm md:text-lg text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                  <span className="text-primary">PZA</span>
                  <span>10 Wallet Credit</span>
                </div>
                <div className="text-xs text-slate-500 font-bold leading-relaxed">
                  Instant credit to your Playza wallet
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-white/5">
                <div className="flex items-center gap-1">
                  <span className="text-primary font-black">1,500</span>
                  <span className="text-[10px] text-slate-500 font-bold">
                    PZA
                  </span>
                </div>
                <button
                  className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${user ? "bg-primary text-white hover:scale-105" : "bg-slate-200 dark:bg-white/10 text-slate-400 cursor-not-allowed"}`}
                >
                  {user ? "Redeem" : "Locked"}
                </button>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-xl overflow-hidden border border-white/5 group bg-slate-100/50 dark:bg-white/5">
            <div className="h-32 bg-linear-to-br from-secondary/20 to-primary/20 flex items-center justify-center relative">
              <MdConfirmationNumber className="text-3xl md:text-5xl text-slate-500 opacity-20" />
              <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-[10px] font-bold uppercase text-white">
                ENTRY TICKET
              </div>
            </div>
            <div className="p-2 md:p-6 space-y-4">
              <div>
                <div className="font-headline font-black text-sm md:text-lg text-slate-900 dark:text-white uppercase tracking-tight">
                  Free Arena Entry
                </div>
                <div className="text-xs text-slate-500 font-bold leading-relaxed">
                  One-time pass for any Pro Arena
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-white/5">
                <div className="flex items-center gap-1">
                  <span className="text-primary font-black">800</span>
                  <span className="text-[10px] text-slate-500 font-bold">
                    PZA
                  </span>
                </div>
                <button
                  className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${user ? "bg-primary text-white hover:scale-105" : "bg-slate-200 dark:bg-white/10 text-slate-400 cursor-not-allowed"}`}
                >
                  {user ? "Redeem" : "Locked"}
                </button>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-xl overflow-hidden border border-white/5 group bg-slate-100/50 dark:bg-white/5">
            <div className="h-32 bg-linear-to-br from-secondary/20 to-red-500/20 flex items-center justify-center relative">
              <MdLocalMall className="text-3xl md:text-5xl text-slate-500 opacity-20" />
              <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-[10px] font-bold uppercase text-white">
                MERCH SHOP
              </div>
            </div>
            <div className="p-2 md:p-6 space-y-4">
              <div>
                <div className="font-headline font-black text-sm md:text-lg text-slate-900 dark:text-white uppercase tracking-tight">
                  25% Store Discount
                </div>
                <div className="text-xs text-slate-500 font-bold leading-relaxed">
                  Apply to any physical merchandise
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-white/5">
                <div className="flex items-center gap-1 text-slate-900 dark:text-white">
                  <span className="text-primary font-black">2,500</span>
                  <span className="text-[10px] text-slate-500 font-bold">
                    PZA
                  </span>
                </div>
                <button className="bg-slate-200 dark:bg-white/10 text-slate-400 px-2 md:px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest cursor-not-allowed">
                  Insufficient
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tier Modal */}
      {isTierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="relative w-full max-w-lg glass-card rounded-xl overflow-hidden border border-white/10 shadow-2xl p-6 md:p-10 animate-in zoom-in-95 duration-300">
            <button
              onClick={() => setIsTierModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <MdClose className="text-base md:text-xl" />
            </button>

            <div className="mb-8">
              <h2 className="font-headline text-xl md:text-3xl font-black mb-2 flex items-center gap-2 md:gap-3 text-slate-900 dark:text-white uppercase italic tracking-tight">
                <MdMilitaryTech className="text-primary text-2xl md:text-4xl" />
                Tier System
              </h2>
              <p className="text-slate-500 font-bold text-xs md:text-sm leading-relaxed">
                Unlock higher multipliers and exclusive rewards as you earn more
                PZA.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 md:gap-3">
              {[
                { name: "Bronze", range: "0-999 PZA", color: "orange" },
                {
                  name: "Silver",
                  range: "1k-5k PZA",
                  color: "slate",
                  active: true,
                },
                { name: "Gold", range: "5k-10k PZA", color: "yellow" },
                { name: "Platinum", range: "10k+ PZA", color: "cyan" },
              ].map((tier) => (
                <div
                  key={tier.name}
                  className={`glass-card p-4 rounded-2xl border flex flex-col items-center text-center gap-2 transition-all ${
                    tier.active
                      ? "border-primary bg-primary/10 shadow-lg scale-105"
                      : "border-white/5 opacity-60 bg-white/5"
                  }`}
                >
                  <MdMilitaryTech
                    className={`text-2xl ${
                      tier.name === "Bronze"
                        ? "text-orange-400"
                        : tier.name === "Silver"
                          ? "text-slate-300"
                          : tier.name === "Gold"
                            ? "text-yellow-400"
                            : "text-cyan-400"
                    }`}
                  />
                  <div>
                    <div className="font-headline font-black text-sm uppercase text-slate-900 dark:text-white">
                      {tier.name}
                    </div>
                    <div className="text-[10px] text-slate-500 font-bold">
                      {tier.range}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setIsTierModalOpen(false)}
              className="w-full mt-10 bg-primary hover:bg-primary/90 text-white py-2 md:py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-primary/20"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Loyalty;
