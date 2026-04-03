import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, Trophy, Users, ArrowUp, Target, Zap, Star, Rocket } from 'lucide-react';

export type ToastType =
  | "success"
  | "error"
  | "info"
  | "entry"
  | "rank"
  | "overtake"
  | "winning_zone"
  | "score"
  | "achievement"
  | "streak"
  | "move"
  | "checkmate"
  | "check";

export interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  user?: string;
  onClose: (id: string) => void;
  duration?: number;
}

const getIcon = (type: ToastType) => {
  switch (type) {
    case "success":
      return <CheckCircle className="text-emerald-500" size={16} />;
    case "error":
      return <AlertCircle className="text-red-500" size={16} />;
    case "info":
      return <Info className="text-blue-500" size={16} />;
    case "entry":
      return <Users className="text-blue-500 dark:text-blue-400" size={16} />;
    case "rank":
      return <Trophy className="text-primary" size={16} />;
    case "overtake":
      return (
        <ArrowUp className="text-emerald-500 dark:text-emerald-400" size={16} />
      );
    case "winning_zone":
      return (
        <Target className="text-purple-500 dark:text-purple-400" size={16} />
      );
    case "score":
      return <Zap className="text-orange-500 dark:text-orange-400" size={16} />;
    case "achievement":
      return <Star className="text-yellow-500" size={16} />;
    case "streak":
      return <Rocket className="text-red-500" size={16} />;
    case "move":
      return <Target className="text-secondary" size={16} />;
    default:
      return <Zap className="text-primary" size={16} />;
  }
};

const getBg = (type: ToastType) => {
  switch (type) {
    case "success":
      return "border-emerald-500/20 bg-white/90 dark:bg-emerald-950/20";
    case "error":
      return "border-red-500/20 bg-white/90 dark:bg-red-950/20";
    case "info":
      return "border-blue-500/20 bg-white/90 dark:bg-blue-950/20";
    case "entry":
      return "border-blue-500/20 bg-white/90 dark:bg-blue-950/20";
    case "rank":
      return "border-primary/20 bg-white/90 dark:bg-primary/5";
    case "overtake":
      return "border-emerald-500/20 bg-white/90 dark:bg-emerald-950/20";
    case "winning_zone":
      return "border-purple-500/20 bg-white/90 dark:bg-purple-950/20";
    case "score":
      return "border-orange-500/20 bg-white/90 dark:bg-orange-950/20";
    case "achievement":
      return "border-yellow-500/20 bg-white/90 dark:bg-yellow-950/20";
    case "streak":
      return "border-red-500/20 bg-white/90 dark:bg-red-950/20";
    case "move":
      return "border-secondary/20 bg-white/90 dark:bg-secondary/5";
    default:
      return "border-primary/20 bg-white/90 dark:bg-slate-900/90";
  }
};

export const Toast = ({ id, type, message, user, onClose, duration = 3000 }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);
    return () => clearTimeout(timer);
  }, [id, onClose, duration]);

  return (
    <div
      className={`pointer-events-auto relative overflow-hidden flex items-center gap-2.5 p-2 rounded-lg border backdrop-blur-3xl shadow-2xl transition-all duration-500 animate-in slide-in-from-right-full fade-in ${getBg(type)} max-w-xs w-full mb-2`}
    >
      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 h-0.5 bg-primary/20 w-full">
        <div 
          className="h-full bg-primary/60 animate-[shrink-width_4s_linear_forwards]" 
          style={{ animationDuration: `${duration}ms` }}
        />
      </div>

      <div className="shrink-0 p-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-inner">
        {getIcon(type)}
      </div>

      <div className="flex-1">
        {user && (
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-0.5">{user}</p>
        )}
        <p className="text-xs font-black text-slate-800 dark:text-white/90 leading-tight pr-2 md:pr-4">
          {message}
        </p>
      </div>

      <button 
        onClick={() => onClose(id)}
        className="shrink-0 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors p-1"
      >
        <X size={14} />
      </button>
    </div>
  );
};
