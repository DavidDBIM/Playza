import { useState, useEffect, useCallback } from 'react';
import { Users, Trophy, Target, ArrowUp, Zap, X, Star, Rocket } from 'lucide-react';

type ToastType = 'entry' | 'rank' | 'score' | 'winning_zone' | 'overtake' | 'achievement' | 'streak';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  user?: string;
  timestamp: number;
}

const ActivityToasts = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, message: string, user?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = { id, type, message, user, timestamp: Date.now() };
    
    setToasts([newToast]); // Show only one toast at a time

    // Auto remove after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  // Highly varied scenarios for dynamic content
  const triggerRandomToast = useCallback(() => {
    const users = ['BladeRunner', 'ShadowNinja', 'GuselTony', 'NeonStrike', 'CyberPunk', 'AceHunter', 'SilentWolf', 'NoobKiller', 'AlphaGamer', 'DragonSlayer'];
    const user = users[Math.floor(Math.random() * users.length)];
    
    const scenarios = [
      { type: 'entry' as ToastType, user, msg: 'just jumped into the arena!' },
      { type: 'rank' as ToastType, user, msg: `climbed to Rank #${Math.floor(Math.random() * 50) + 1}!` },
      { type: 'overtake' as ToastType, user, msg: `just overtook ${users[Math.floor(Math.random() * users.length)]}!` },
      { type: 'winning_zone' as ToastType, msg: `Only ${Math.floor(Math.random() * 500) + 100} points needed to enter the Prize Zone!` },
      { type: 'score' as ToastType, user, msg: `scored ${Math.floor(Math.random() * 5000) + 1000} points in one go!` },
      { type: 'achievement' as ToastType, user, msg: 'unlocked the "Untouchable" badge!' },
      { type: 'streak' as ToastType, user, msg: 'is on a massive 10-match win streak!' },
      { type: 'overtake' as ToastType, user: 'System', msg: 'New match starting in Arena #04!' },
    ];

    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    addToast(scenario.type, scenario.msg, scenario.user);
  }, [addToast]);

  useEffect(() => {
    // Initial toast after a short delay
    const initialTimer = setTimeout(triggerRandomToast, 2000);

    const interval = setInterval(() => {
      if (Math.random() > 0.4) {
        triggerRandomToast();
      }
    }, 5000); // Check every 5 seconds

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [triggerRandomToast]);

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'entry': return <Users className="text-blue-500 dark:text-blue-400" size={16} />;
      case 'rank': return <Trophy className="text-primary" size={16} />;
      case 'overtake': return <ArrowUp className="text-emerald-500 dark:text-emerald-400" size={16} />;
      case 'winning_zone': return <Target className="text-purple-500 dark:text-purple-400" size={16} />;
      case 'score': return <Zap className="text-orange-500 dark:text-orange-400" size={16} />;
      case 'achievement': return <Star className="text-yellow-500" size={16} />;
      case 'streak': return <Rocket className="text-red-500" size={16} />;
      default: return <Zap className="text-primary" size={16} />;
    }
  };

  const getBg = (type: ToastType) => {
    switch (type) {
      case 'entry': return 'border-blue-500/20 bg-white/90 dark:bg-blue-950/20';
      case 'rank': return 'border-primary/20 bg-white/90 dark:bg-primary/5';
      case 'overtake': return 'border-emerald-500/20 bg-white/90 dark:bg-emerald-950/20';
      case 'winning_zone': return 'border-purple-500/20 bg-white/90 dark:bg-purple-950/20';
      case 'score': return 'border-orange-500/20 bg-white/90 dark:bg-orange-950/20';
      case 'achievement': return 'border-yellow-500/20 bg-white/90 dark:bg-yellow-950/20';
      case 'streak': return 'border-red-500/20 bg-white/90 dark:bg-red-950/20';
      default: return 'border-primary/20 bg-white/90 dark:bg-slate-900/90';
    }
  };

  return (
    <div className="fixed top-20 right-2 md:right-6 z-45 flex flex-col gap-2 max-w-70 md:max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto relative overflow-hidden flex items-center gap-3 p-3 rounded-xl border backdrop-blur-3xl shadow-2xl transition-all duration-500 animate-in slide-in-from-right-full fade-in ${getBg(toast.type)}`}
        >
          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 h-0.5 bg-primary/20 w-full">
            <div className="h-full bg-primary/60 animate-shrink-width" />
          </div>

          <div className="shrink-0 p-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-inner">
            {getIcon(toast.type)}
          </div>

          <div className="flex-1">
             {toast.user && (
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-0.5">{toast.user}</p>
             )}
             <p className="text-xs font-black text-slate-800 dark:text-white/90 leading-tight pr-4 transition-colors">
               {toast.message}
             </p>
          </div>

          <button 
            onClick={() => removeToast(toast.id)}
            className="shrink-0 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors p-1"
          >
            <X size={14} />
          </button>
        </div>
      ))}

      <style>{`
        @keyframes shrink-width {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-shrink-width {
          animation: shrink-width 4s linear forwards;
        }
      `}</style>
    </div>
  );
};

export default ActivityToasts;
