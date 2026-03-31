import { useState } from "react";
import { MdContentCopy, MdShare, MdQrCodeScanner } from "react-icons/md";
import { ZASymbol } from "@/components/currency/ZASymbol";
import { type ReferralStatsData } from "@/api/referral.api";

interface ReferralStatsProps {
  stats: ReferralStatsData | undefined;
  onOpenInvite: () => void;
  referralLink: string;
}

const ReferralStats = ({
  stats,
  onOpenInvite,
  referralLink,
}: ReferralStatsProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const nextMilestone = stats?.next_milestone;
  const progressPercent =
    stats && nextMilestone
      ? (stats.total_referrals / nextMilestone.target) * 100
      : 0;

  return (
    <div className="flex flex-col gap-2 md:gap-6 w-full">
      {/* Hero Link Section */}
      <div className="glass-card rounded-2xl p-6 md:p-8 relative overflow-hidden flex flex-col md:flex-row items-center gap-2 md:gap-8 justify-between">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 blur-[100px] rounded-full -ml-32 -mb-32 pointer-events-none"></div>

        <div className="flex flex-col z-10 flex-1 w-full relative">
          <h2 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-slate-100 mb-2">
            Invite your squad to the arena
          </h2>
          <p className="text-slate-400 text-sm md:text-xs mb-6 max-w-lg font-bold">
            Earn exclusive items, in-game currency, and legendary{" "}
            <ZASymbol className="inline-block" /> bonuses for every verified
            recruit that joins PlayZa.
          </p>

          <div className="flex flex-col sm:flex-row gap-2 md:gap-3 w-full max-w-xl">
            <div className="flex-1 bg-slate-50 dark:bg-background/50 border border-slate-200 dark:border-white/10 rounded-xl flex items-center px-2 md:px-4 py-2 md:py-3 shadow-inner overflow-hidden">
              <span className="text-slate-500 dark:text-slate-400 text-[10px] md:text-sm truncate mr-2 flex-1">
                {referralLink}
              </span>
            </div>
            <button
              onClick={handleCopy}
              className="px-2 md:px-6 py-2 md:py-3 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-900 dark:text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <MdContentCopy /> {copied ? "Copied!" : "Copy"}
            </button>
            <button
              onClick={onOpenInvite}
              className="px-2 md:px-4 py-2 md:py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold flex items-center justify-center transition-all shadow-lg glow-primary"
            >
              <MdShare />
            </button>
          </div>
        </div>

        <div className="hidden md:flex flex-col items-center justify-center bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-2 md:p-6 rounded-2xl z-10 shrink-0">
          <div className="w-24 h-24 bg-white/20 dark:bg-white/10 rounded-xl mb-4 flex items-center justify-center shadow-inner">
            <MdQrCodeScanner className="text-3xl md:text-5xl text-primary" />
          </div>
          <p className="text-slate-900 dark:text-slate-300 font-bold text-xs md:text-sm">
            Scan to invite
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
        {[
          {
            label: "TOTAL REFERRALS",
            value: stats?.total_referrals || 0,
            trend: "",
            trendUp: true,
          },
          {
            label: "VERIFIED USERS",
            value: stats?.verified_referrals || 0,
            trend: "",
            trendUp: true,
          },
          {
            label: "PENDING",
            value:
              (stats?.total_referrals || 0) - (stats?.verified_referrals || 0),
            trend: "",
            trendUp: true,
            glow: "border-accent/30",
          },
          {
            label: "TOTAL EARNED",
            value: (stats?.verified_referrals || 0) * 15, // Example calc from engine SIGNUP+EMAIL_VERIFIED
            trend: "",
            trendUp: true,
            glow: "border-primary/50 text-transparent bg-clip-text bg-linear-to-r from-primary to-accent",
            isCurrency: true, // It's ZA
          },
        ].map((stat, i) => (
          <div
            key={i}
            className={`glass-card rounded-2xl p-4 md:p-6 flex flex-col justify-between items-start ${stat.glow || "border-white/5"}`}
          >
            <p className="text-slate-400 text-[10px] font-bold tracking-widest uppercase mb-2">
              {stat.label}
            </p>
            <div className="flex items-end gap-2">
              <div
                className={`flex items-center gap-1.5 text-2xl md:text-3xl font-black ${stat.label === "TOTAL EARNED" ? "text-primary" : "text-slate-900 dark:text-slate-100"}`}
              >
                {stat.isCurrency && (
                  <ZASymbol className="text-xl md:text-2xl" />
                )}
                {stat.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Next Milestone */}
      {nextMilestone && (
        <div className="glass-card rounded-2xl p-2 md:p-6 border-primary/20 bg-primary/5 relative overflow-hidden mt-2">
          <div className="flex justify-between items-center mb-4 relative z-10">
            <div>
              <p className="text-primary text-[10px] font-bold uppercase tracking-widest mb-1">
                NEXT MILESTONE: {nextMilestone.target} RECRUITS
              </p>
              <h3 className="text-slate-900 dark:text-slate-100 text-lg md:text-xl font-bold italic tracking-tight uppercase">
                Recruiter Bonus
              </h3>
            </div>
            <div className="text-right">
              <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">
                Reward
              </p>
              <div className="flex items-center gap-1.5 text-slate-900 dark:text-slate-100 font-black justify-end">
                <span>{nextMilestone.pza_reward}</span>
                <ZASymbol className="text-[10px]" />
              </div>
            </div>
          </div>

          <div className="w-full bg-slate-200 dark:bg-background/50 rounded-full h-3 mb-2 relative z-10 overflow-hidden shadow-inner">
            <div
              className="bg-primary h-3 rounded-full relative transition-all duration-1000"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>
          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 relative z-10">
            <span>
              {stats?.total_referrals}/{nextMilestone.target} Referrals
              Completed
            </span>
            <span className="text-primary">
              {nextMilestone.remaining} More Needed
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralStats;
