import React from "react";
import { MdClose, MdEmojiEvents, MdLock, MdCheckCircle } from "react-icons/md";

interface Badge {
  id: string;
  name: string;
  count: number;
  total: number;
  unlocked: boolean;
  icon: React.ReactNode;
  description: string;
}

const badges: Badge[] = [
  {
    id: "1",
    name: "Pro Gamer",
    count: 10,
    total: 10,
    unlocked: true,
    icon: <MdEmojiEvents className="text-yellow-500 text-3xl" />,
    description: "Win 10 professional matches.",
  },
  {
    id: "2",
    name: "Ticket Master",
    count: 150,
    total: 500,
    unlocked: false,
    icon: <MdEmojiEvents className="text-blue-500 text-3xl" />,
    description: "Earn 500 tickets in total.",
  },
  {
    id: "3",
    name: "Unstoppable",
    count: 5,
    total: 10,
    unlocked: false,
    icon: <MdEmojiEvents className="text-red-500 text-3xl" />,
    description: "Get a 10-match win streak.",
  },
  {
    id: "4",
    name: "Social Butterfly",
    count: 50,
    total: 50,
    unlocked: true,
    icon: <MdEmojiEvents className="text-purple-500 text-3xl" />,
    description: "Refer 50 friends to the platform.",
  },
  {
    id: "5",
    name: "High Roller",
    count: 10000,
    total: 50000,
    unlocked: false,
    icon: <MdEmojiEvents className="text-emerald-500 text-3xl" />,
    description: "Wager a total of 50,000 in games.",
  },
];

interface BadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BadgeModal: React.FC<BadgeModalProps> = ({ isOpen, onClose }) => {
  React.useEffect(() => {
    if (isOpen) {
      document.body.classList.add("modal-open", "overflow-hidden");
      document.documentElement.classList.add("modal-open", "overflow-hidden");
    } else {
      document.body.classList.remove("modal-open", "overflow-hidden");
      document.documentElement.classList.remove("modal-open", "overflow-hidden");
    }
    return () => {
      document.body.classList.remove("modal-open", "overflow-hidden");
      document.documentElement.classList.remove("modal-open", "overflow-hidden");
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
      ></div>
      <div className="glass-card w-full max-w-lg rounded-3xl overflow-hidden relative z-10 animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-primary/5">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Platform Badges</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Unlock these to showcase your achievements</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <MdClose className="text-2xl text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4 custom-scrollbar scrollbar-hide">
          {badges.map((badge) => (
            <div 
              key={badge.id}
              className={`p-4 rounded-2xl border flex items-center gap-4 transition-all ${
                badge.unlocked 
                ? "bg-primary/10 border-primary/20" 
                : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 opacity-70"
              }`}
            >
              <div className="relative">
                <div className={`size-16 rounded-xl flex items-center justify-center ${badge.unlocked ? "bg-primary/20" : "bg-slate-300/10"}`}>
                  {badge.icon}
                </div>
                {!badge.unlocked && (
                  <div className="absolute -top-1 -right-1 bg-slate-800 rounded-full p-1 border border-white/10">
                    <MdLock className="text-xs text-white/50" />
                  </div>
                )}
                {badge.unlocked && (
                  <div className="absolute -top-1 -right-1 bg-primary rounded-full p-0.5 border border-white/20">
                    <MdCheckCircle className="text-xs text-white" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-bold text-slate-900 dark:text-white">{badge.name}</h3>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    {badge.count} / {badge.total}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 leading-tight font-medium">
                  {badge.description}
                </p>
                
                {/* Progress Bar */}
                <div className="h-1.5 w-full bg-slate-500/10 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${badge.unlocked ? "bg-primary" : "bg-primary/40"}`}
                    style={{ width: `${(badge.count / badge.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 bg-primary/5 border-t border-slate-200 dark:border-white/10 text-center">
          <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-widest">
            More badges coming soon!
          </p>
        </div>
      </div>
    </div>
  );
};

export default BadgeModal;
