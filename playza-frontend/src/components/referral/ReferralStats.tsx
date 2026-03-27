import { useState } from "react";
import { MdContentCopy, MdShare, MdQrCodeScanner } from "react-icons/md";
import InviteFriendModal from "./InviteFriendModal";
import { useAuth } from "@/context/auth";
import { ZASymbol } from "@/components/currency/ZASymbol";

const ReferralStats = () => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const referralLink = `${window.location.origin}/registration?referral_code=${user?.referralCode || ""}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Hero Link Section */}
      <div className="glass-card rounded-2xl p-6 md:p-8 relative overflow-hidden flex flex-col md:flex-row items-center gap-8 justify-between">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 blur-[100px] rounded-full -ml-32 -mb-32 pointer-events-none"></div>

        <div className="flex flex-col z-10 flex-1 w-full relative">
          <h2 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-slate-100 mb-2">
            Invite your squad to the arena
          </h2>
          <p className="text-slate-400 text-sm md:text-base mb-6 max-w-lg font-bold">
            Earn exclusive items, in-game currency, and 20% of their tournament
            winnings for the first 3 months.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xl">
            <div className="flex-1 bg-slate-50 dark:bg-background/50 border border-slate-200 dark:border-white/10 rounded-xl flex items-center px-4 py-3 shadow-inner">
              <span className="text-slate-500 dark:text-slate-400 text-sm truncate mr-2 flex-1">
                {referralLink}
              </span>
            </div>
            <button
              onClick={handleCopy}
              className="px-6 py-3 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-900 dark:text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <MdContentCopy /> {copied ? "Copied!" : "Copy"}
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold flex items-center justify-center transition-all shadow-lg glow-primary"
            >
              <MdShare />
            </button>
          </div>
        </div>

        <div className="hidden md:flex flex-col items-center justify-center bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-6 rounded-2xl z-10 shrink-0">
          <div className="w-24 h-24 bg-white/20 dark:bg-white/10 rounded-xl mb-4 flex items-center justify-center shadow-inner">
            <MdQrCodeScanner className="text-5xl text-primary" />
          </div>
          <p className="text-slate-900 dark:text-slate-300 font-bold text-sm">
            Scan to invite
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "TOTAL REFERRALS",
            value: "42",
            trend: "+12",
            trendUp: true,
          },
          { label: "ACTIVE PLAYERS", value: "18", trend: "", trendUp: true },
          {
            label: "PENDING",
            value: "05",
            trend: "",
            trendUp: true,
            glow: "border-accent/30",
          },
          {
            label: "TOTAL EARNED",
            value: "840",
            trend: "+120",
            trendUp: true,
            glow: "border-primary/50 text-transparent bg-clip-text bg-linear-to-r from-primary to-accent",
            isCurrency: true,
          },
        ].map((stat, i) => (
          <div
            key={i}
            className={`glass-card rounded-2xl p-4 md:p-6 flex flex-col justify-between items-start ${stat.glow || "border-white/5"}`}
          >
            <p className="text-slate-400 text-xs font-bold tracking-widest uppercase mb-2">
              {stat.label}
            </p>
            <div className="flex items-end gap-2">
              <div
                className={`flex items-center gap-1.5 text-2xl md:text-3xl font-black ${stat.label === "TOTAL EARNED" ? stat.glow : "text-slate-900 dark:text-slate-100"}`}
              >
                {stat.isCurrency && <ZASymbol className="text-xl md:text-2xl" />}
                {stat.value}
              </div>
              {stat.trend && (
                <div
                  className={`flex items-center gap-0.5 text-xs font-bold mb-1 ${stat.trendUp ? "text-green-500" : "text-red-500"}`}
                >
                  {stat.trend.startsWith("+") ? "+ " : "- "}
                  {stat.isCurrency && <ZASymbol className="text-[10px] scale-90" />}
                  {stat.trend.replace("+", "").replace("-", "")}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Next Milestone */}
      <div className="glass-card rounded-2xl p-6 border-primary/20 bg-primary/5 relative overflow-hidden mt-2">
        <div className="flex justify-between items-center mb-4 relative z-10">
          <div>
            <p className="text-primary text-xs font-bold uppercase tracking-widest mb-1">
              NEXT MILESTONE: LEGENDARY RECRUITER
            </p>
            <h3 className="text-slate-900 dark:text-slate-100 text-lg md:text-xl font-bold italic tracking-tight uppercase">
              Earn "Apex Predator" Skin
            </h3>
          </div>
          <div className="text-right">
            <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">
              Rewards Value
            </p>
            <div className="flex items-center gap-1.5 text-slate-900 dark:text-slate-100 font-black justify-end">
              <ZASymbol className="text-xs scale-90" />
              <span>50.00</span>
            </div>
          </div>
        </div>

        <div className="w-full bg-slate-200 dark:bg-background/50 rounded-full h-3 mb-2 relative z-10 overflow-hidden shadow-inner">
          <div
            className="bg-primary h-3 rounded-full relative"
            style={{ width: "75%" }}
          >
            <div className="absolute top-0 right-0 bottom-0 left-0 bg-white/20 animate-pulse"></div>
          </div>
        </div>
        <div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-400 relative z-10">
          <span>15/20 Referrals Completed</span>
          <span className="text-primary">5 More Needed</span>
        </div>
      </div>

      {isModalOpen && (
        <InviteFriendModal
          onClose={() => setIsModalOpen(false)}
          referralLink={referralLink}
        />
      )}
    </div>
  );
};

export default ReferralStats;
