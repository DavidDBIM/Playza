import WalletBalance from "@/components/wallet/WalletBalance";
import BankInfo from "@/components/wallet/BankInfo";
import RecentTransactions from "@/components/wallet/RecentTransactions";
import { useAuth } from "@/context/auth";
import { useWallet } from "@/hooks/wallet/useWallet";
import { AlertCircle, ArrowRight, Gift } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useEffect } from "react";
import { ZASymbol } from "@/components/currency/ZASymbol";
import { WalletSkeleton } from "@/components/skeletons/WalletSkeleton";

interface WalletProps {
  onWithdrawClick: () => void;
}

const Wallet = ({ onWithdrawClick }: WalletProps) => {
  const { user, isProfileComplete } = useAuth();
  const { balance, fetchBalance, loading } = useWallet();
  const navigate = useNavigate();

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  useEffect(() => {
    if (balance) {
      console.log("[Wallet] Current balance state:", balance);
    }
  }, [balance]);
  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  if (loading && !balance) {
    return (
      <main className="flex-1 flex flex-col gap-4 md:gap-10 pb-2 md:pb-10 animate-in fade-in duration-500">
        <WalletSkeleton />
      </main>
    );
  }

  return (
    <main className="flex-1 min-w-0 flex flex-col gap-4 md:gap-10 pb-2 md:pb-10 animate-in fade-in duration-500">
      {!isProfileComplete && (
        <div className="bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/30 dark:border-amber-500/20 rounded-2xl p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4">
          <div className="flex items-center gap-2 md:gap-4 text-center md:text-left">
            <div className="size-12 rounded-full bg-amber-500/20 dark:bg-amber-500/10 flex items-center justify-center shrink-0">
              <AlertCircle className="text-amber-600 dark:text-amber-500" />
            </div>
            <div>
              <h4 className="text-amber-900 dark:text-amber-50 font-black uppercase tracking-tight">
                Withdrawals are Locked
              </h4>
              <p className="text-amber-800/70 dark:text-slate-400 text-xs md:text-sm">
                Complete your profile with your real name to enable withdrawals.
              </p>
            </div>
          </div>
          <Link
            to="/profile/settings"
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black px-2 md:px-6 py-2 md:py-3 rounded-xl font-bold transition-all text-sm group shrink-0"
          >
            Complete Profile
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>
      )}

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
        <WalletBalance
          balance={balance?.balance || 0}
          onWithdrawClick={onWithdrawClick}
        />
        <BankInfo />
      </section>

      {/* Rewards Link Section */}
      <Link to="/loyalty" className="group">
        <div className="glass-card p-2 md:p-6 rounded-2xl border border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-2 md:gap-4 bg-linear-to-r from-primary/5 to-transparent hover:border-primary/40 transition-all shadow-xs">
          <div className="flex items-center gap-2 md:gap-5 text-center sm:text-left">
            <div className="size-14 rounded-2xl bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-inner">
              <Gift size={28} />
            </div>
            <div>
              <h3 className="font-black text-sm md:text-lg uppercase tracking-tight leading-none mb-1 text-on-surface">
                <ZASymbol className="scale-110 mr-1" /> Rewards Center
              </h3>
              <p className="text-xs md:text-sm text-on-surface-variant font-medium">
                Check your points, streaks, and unlock exclusive tournament
                bonuses.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-primary/10 text-primary px-2 md:px-5 py-3 rounded-xl font-black text-xs uppercase tracking-widest group-hover:bg-primary/20 transition-colors">
            Go to Rewards
            <ArrowRight
              size={14}
              className="group-hover:translate-x-1 transition-transform"
            />
          </div>
        </div>
      </Link>

      <RecentTransactions />
    </main>
  );
};

export default Wallet;
