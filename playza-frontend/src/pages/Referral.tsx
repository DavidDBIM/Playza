import ReferralStats from "../components/referral/ReferralStats";
import ReferralHowItWorks from "../components/referral/ReferralHowItWorks";
import ReferralHistoryTable from "../components/referral/ReferralHistoryTable";
import { Link } from "react-router";
import { useEffect } from "react";
import { MdArrowForward, MdEmojiEvents, MdGroupAdd } from "react-icons/md";
import { useAuth } from "@/context/auth";
import { Button } from "@/components/ui/button";

const Referral = () => {
  const { user } = useAuth();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full md:px-10 pb-2 md:pb-20">
      {!user ? (
        <div className="mt-6 mb-12 glass-card p-2 md:p-10 rounded-xl border-primary/20 relative overflow-hidden flex flex-col items-center text-center gap-2 md:gap-8">
          <div className="absolute -top-24 -left-24 size-64 bg-primary/20 blur-[100px] rounded-full" />
          <div className="absolute -bottom-24 -right-24 size-64 bg-secondary/20 blur-[100px] rounded-full" />

          <div className="relative z-10 space-y-4 max-w-2xl">
            <div className="size-20 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-6 border border-primary/30 shadow-inner rotate-3 group-hover:rotate-6 transition-transform">
              <MdGroupAdd className="text-2xl md:text-4xl text-primary" />
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none italic">
              Recruit Your <span className="text-primary">Squad</span>
            </h1>
            <p className="text-xs md:text-base md:text-xl text-slate-500 font-bold max-w-lg mx-auto leading-relaxed">
              Don't play alone. Invite your friends to Playza and earn legendary
              ZA rewards for every active referral.
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row gap-2 md:gap-4 w-full max-w-md">
            <Link to="/registration?view=signup" className="flex-1">
              <Button className="w-full h-14 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-base hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 glow-accent">
                Start Recruiting
              </Button>
            </Link>
            <Link to="/registration?view=login" className="flex-1">
              <Button
                variant="outline"
                className="w-full h-14 border-primary/30 text-primary rounded-2xl font-black uppercase tracking-widest text-base hover:bg-primary/10 transition-all"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2 mb-8 mt-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 md:gap-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                Referral <span className="text-primary">Program</span>
              </h1>
              <p className="text-slate-400 text-sm md:text-xs md:text-base font-bold uppercase tracking-widest opacity-70">
                Recruit your squad and earn legendary rewards.
              </p>
            </div>
            <Link
              to="/leaderboard?tab=Referral"
              className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary px-2 md:px-6 py-2 md:py-3 rounded-xl border border-primary/20 transition-all font-black uppercase tracking-widest text-xs group self-start md:self-auto shadow-sm"
            >
              <MdEmojiEvents className="text-sm md:text-lg" />
              <span>Leaderboard</span>
              <MdArrowForward className=" group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2 md:gap-4">
        {user && <ReferralStats />}

        <ReferralHowItWorks />

        {user && <ReferralHistoryTable />}
      </div>
    </div>
  );
};

export default Referral;
