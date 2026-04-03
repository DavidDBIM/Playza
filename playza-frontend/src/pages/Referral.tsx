import { useState, useEffect } from "react";
import { Link } from "react-router";
import { MdArrowForward, MdEmojiEvents, MdGroupAdd } from "react-icons/md";
import { useAuth } from "@/context/auth";
import { Button } from "@/components/ui/button";
import { ZASymbol } from "@/components/currency/ZASymbol";
import { useReferralStats } from "@/hooks/referral/useReferralStats";
import { ReferralSkeleton } from "@/components/skeletons/ReferralSkeleton";
import ReferralStats from "../components/referral/ReferralStats";
import ReferralHowItWorks from "../components/referral/ReferralHowItWorks";
import ReferralHistoryTable from "../components/referral/ReferralHistoryTable";
import InviteFriendModal from "../components/referral/InviteFriendModal";

const Referral = () => {
  const { user } = useAuth();
  const { data: stats, isLoading } = useReferralStats();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (user && isLoading) {
    return <ReferralSkeleton />;
  }

  const referralLink = `${window.location.origin}/registration?referral_code=${stats?.referral_code || user?.referralCode || ""}`;

  return (
    <div className="flex-1 w-full pb-2 md:pb-20">
      {!user ? (
        <div className="mt-6 mb-12 glass-card p-2 md:p-10 rounded-xl border-primary/20 relative overflow-hidden flex flex-col items-center text-center gap-2 md:gap-8">

          <div className="relative z-10 space-y-4 max-w-2xl">
            <div className="size-20 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-6 border border-primary/30">
              <MdGroupAdd className="text-2xl md:text-4xl text-primary" />
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none italic">
              Recruit Your <span className="text-primary">Squad</span>
            </h1>
            <p className="text-xs md:text-base text-slate-500 font-bold max-w-lg mx-auto leading-relaxed">
              Don't play alone. Invite your friends to Playza and earn legendary{" "}
              <ZASymbol className="inline-block scale-110 ml-1" /> rewards for
              every active referral.
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row gap-2 md:gap-4 w-full max-w-md">
            <Link to="/registration?view=signup" className="flex-1">
              <Button className="w-full h-14 bg-primary text-white rounded-xl font-black uppercase tracking-widest text-base">
                Start Recruiting
              </Button>
            </Link>
            <Link to="/registration?view=login" className="flex-1">
              <Button
                variant="outline"
                className="w-full h-14 border-primary/30 text-primary rounded-xl font-black uppercase tracking-widest text-base md:hover:bg-primary/10"
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
              <p className="text-slate-400 text-xs md:text-sm font-bold uppercase tracking-widest opacity-70">
                Recruit your squad and earn legendary rewards.
              </p>
            </div>
            <Link
              to="/leaderboard?tab=Referral"
              className="flex items-center gap-2 bg-primary/10 md:hover:bg-primary/20 text-primary px-2 md:px-6 py-2 md:py-3 rounded-xl border border-primary/20 font-black uppercase tracking-widest text-xs group self-start md:self-auto"
            >
              <MdEmojiEvents className="text-sm md:text-lg" />
              <span>Leaderboard</span>
              <MdArrowForward className="md:group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2 md:gap-4">
        {user && (
          <ReferralStats 
            stats={stats} 
            onOpenInvite={() => setIsModalOpen(true)} 
            referralLink={referralLink} 
          />
        )}

        <ReferralHowItWorks />

        {user && <ReferralHistoryTable referrals={stats?.referrals || []} />}
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

export default Referral;
