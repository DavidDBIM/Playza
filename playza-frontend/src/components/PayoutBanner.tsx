import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoClose } from 'react-icons/io5';
import { Trophy } from 'lucide-react';
import { supabase } from '../config/supabase';
import { useAuth } from '../context/auth';
import { ZASymbol } from './currency/ZASymbol';
import { useQueryClient } from '@tanstack/react-query';

interface PayoutPayload {
  amount: number;
  gameName: string;
  rank: number;
}

interface TransactionPayload {
  type?: string;
  status?: string;
  amount: number;
  meta?: {
    game_name?: string;
    rank?: number;
  };
}

const PayoutBanner: React.FC = () => {
  const { user } = useAuth();
  const [payout, setPayout] = useState<PayoutPayload | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`payouts_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const tx = payload.new as TransactionPayload;
          if (tx && tx.type === 'winnings' && tx.status === 'successful') {
            setPayout({
              amount: tx.amount,
              gameName: tx.meta?.game_name || "Arena Tournament",
              rank: tx.meta?.rank || 1,
            });
            
            // Auto invalidate wallet balance so it updates instantly
            queryClient.invalidateQueries({ queryKey: ["wallet", "balance"] });

            // Auto dismiss after 8 seconds
            setTimeout(() => setPayout(null), 8000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  if (!payout) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-9999 flex items-start justify-center p-4 pt-20 pointer-events-none">
        <motion.div 
          initial={{ y: -100, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -100, opacity: 0, scale: 0.9 }}
          className="pointer-events-auto relative w-full max-w-sm overflow-hidden bg-linear-to-r from-emerald-400 via-teal-500 to-emerald-600 rounded-2xl shadow-[0_0_40px_rgba(16,185,129,0.4)] border border-white/20 p-0.5"
        >
          <div className="bg-white dark:bg-slate-950 rounded-[14px] p-4 flex gap-4 items-center relative overflow-hidden">
            {/* Celebration Effect Background */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] pointer-events-none" />
            
            {/* Icon */}
            <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-yellow-400 to-amber-500 flex items-center justify-center shrink-0 shadow-lg relative z-10 border border-yellow-200/50">
              <Trophy className="text-white w-6 h-6 drop-shadow-md" />
            </div>

            {/* Content */}
            <div className="flex-1 relative z-10">
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-0.5">Payout Activated!</p>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight pr-4">
                You won <span className="text-emerald-500 font-black"><ZASymbol className="w-3 h-3 inline-block align-baseline" />{payout.amount}</span> in <span className="italic">{payout.gameName}</span>!
              </h3>
            </div>

            {/* Close */}
            <button 
              onClick={() => setPayout(null)}
              className="absolute top-2 right-2 p-1 text-slate-400 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors z-10"
            >
              <IoClose size={16} />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PayoutBanner;
