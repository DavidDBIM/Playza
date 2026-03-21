import ReferralStats from "../components/referral/ReferralStats";
import ReferralHowItWorks from "../components/referral/ReferralHowItWorks";
import ReferralHistoryTable from "../components/referral/ReferralHistoryTable";
import { Link } from "react-router";
import { useEffect } from "react";
import { MdArrowForward, MdEmojiEvents } from "react-icons/md";

const Referral = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full md:px-10 pb-20">
      <div className="flex flex-col gap-2 mb-8 mt-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">
              Referral <span className="text-primary">Program</span>
            </h1>
            <p className="text-slate-400 text-sm md:text-base">
              Recruit your squad and earn legendary rewards.
            </p>
          </div>
          <Link
            to="/referral-leaderboard"
            className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary px-6 py-3 rounded-xl border border-primary/20 transition-all font-bold group self-start md:self-auto"
          >
            <MdEmojiEvents />
            <span>Leaderboard</span>
            <MdArrowForward className=" group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-2 md:gap-4">
        <ReferralStats />

        <ReferralHowItWorks />

        <ReferralHistoryTable />
      </div>
    </div>
  );
};

export default Referral;
