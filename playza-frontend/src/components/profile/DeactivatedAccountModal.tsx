import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdWarning, MdMail, MdSupportAgent, MdLogout } from 'react-icons/md';
import { useAuth } from '../../context/auth';

interface DeactivatedAccountModalProps {
  isOpen: boolean;
}

export const DeactivatedAccountModal: React.FC<DeactivatedAccountModalProps> = ({ isOpen }) => {
  const { logout } = useAuth();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden shadow-2xl border border-red-500/20"
        >
          {/* Header/Banner */}
          <div className="bg-red-500 p-8 flex flex-col items-center text-center space-y-4">
            <div className="size-20 bg-white/20 rounded-full flex items-center justify-center text-white text-5xl animate-pulse">
              <MdWarning />
            </div>
            <h2 className="text-white font-black text-2xl md:text-3xl uppercase tracking-tighter italic">
              Account Deactivated
            </h2>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            <div className="space-y-4">
              <p className="text-slate-600 dark:text-slate-400 font-bold text-center leading-relaxed">
                Your account has been deactivated. You can still view limited information, 
                but all gaming activities, withdrawals, and deposits have been suspended.
              </p>
              
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-100 dark:border-white/5 space-y-4">
                <h3 className="text-slate-900 dark:text-white font-black uppercase text-xs tracking-widest flex items-center gap-2">
                  <span className="size-2 bg-red-500 rounded-full animate-ping" />
                  How to Reactivate
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="size-5 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                      <MdMail size={12} />
                    </div>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">
                      Send an appeal to <span className="text-primary underline">support@playza.com</span>
                    </p>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="size-5 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                      <MdSupportAgent size={12} />
                    </div>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">
                      Include your username and reason for reactivation
                    </p>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => window.location.href = 'mailto:support@playza.com'}
                className="w-full h-14 bg-primary text-white font-black uppercase tracking-[0.2em] rounded-2xl hover:brightness-110 transition-all shadow-lg shadow-primary/20 active:scale-[0.98]"
              >
                Contact Support
              </button>
              <button
                onClick={() => logout()}
                className="w-full h-14 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-200 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-2"
              >
                <MdLogout className="text-xl" />
                Sign Out
              </button>
            </div>

            <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold text-center uppercase tracking-widest">
              Playza Security Protocol v2.4.0
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
