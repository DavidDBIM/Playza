import React from 'react';
import { MdChat } from 'react-icons/md';
import { FeedbackForm } from '../components/feedback/FeedbackForm';
import { useAuth } from '@/context/auth';
import { useNavigate } from 'react-router';
import { useEffect } from 'react';
import SEO from "@/components/SEO"

const Support: React.FC = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/registration');
    }
  }, [user, isLoading, navigate]);

  if (isLoading || !user) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ">
      <SEO
      title="Support – Help Center"
      description="Need help? Contact the Playza support team. We're here to help with deposits, withdrawals, games and account issues."
      url="/support"
      keywords="playza support, help center, contact playza, customer service worldwide"
      />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="size-16 rounded-3xl bg-primary/20 flex items-center justify-center text-primary text-3xl shadow-inner">
            <MdChat />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white italic tracking-tighter uppercase">
              🎧 Support
            </h1>
            <p className="text-slate-500 font-bold text-xs md:text-sm uppercase tracking-widest opacity-70">
              Need help? Reach out to us for issues or suggestions.
            </p>
          </div>
        </div>
      </div>

      <div className="glass-card p-2 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-2xl bg-white dark:bg-white/5 overflow-hidden relative ">
        <div className="absolute top-0 right-0 size-64 bg-primary/5 blur-[100px] rounded-full -mr-32 -mt-32"></div>
        <div className="relative z-10">
          <FeedbackForm />
        </div>
      </div>

      <div className="p-8 rounded-3xl border border-primary/10 bg-primary/5 flex items-center gap-4">
        <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xl shrink-0">
          🛡️
        </div>
        <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 leading-relaxed uppercase tracking-wider">
          We appreciate your time. Every message helps us build a better gaming platform for you.
        </p>
      </div>
    </div>
  );
};

export default Support;
