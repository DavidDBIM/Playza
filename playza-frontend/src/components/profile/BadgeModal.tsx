import React from "react";
import { 
  MdClose, 
  MdLock, 
  MdCheckCircle, 
  MdMilitaryTech 
} from "react-icons/md";

interface Badge {
  id: string;
  name: string;
  reward: number;
  unlocked: boolean;
  category: "Identity" | "Gaming" | "Social" | "Rank";
  icon: React.ReactNode;
  description: string;
}

// Tier thresholds: Bronze 0–4,999 | Silver 5,000–24,999 | Gold 25,000–99,999 | Platinum 100,000+
function getTierBadges(pzaPoints: number) {
  return [
    {
      id: "bronze",
      name: "Bronze",
      minPts: 0,
      maxPts: 4999,
      range: "0 – 4,999 PZA",
      unlocked: pzaPoints >= 0,
      category: "Rank" as const,
      icon: <MdMilitaryTech className="text-amber-700 text-2xl md:text-3xl" />,
      bg: "bg-amber-700",
      description: "Welcome to the Arena. Every champion starts here — earn your first PZA and claim Bronze status.",
    },
    {
      id: "silver",
      name: "Silver",
      minPts: 5000,
      maxPts: 24999,
      range: "5,000 – 24,999 PZA",
      unlocked: pzaPoints >= 5000,
      category: "Rank" as const,
      icon: <MdMilitaryTech className="text-slate-300 text-2xl md:text-3xl" />,
      bg: "bg-slate-400",
      description: "Proving your consistency. Reach 5,000 PZA to rise into the Silver tier and earn recognition.",
    },
    {
      id: "gold",
      name: "Gold",
      minPts: 25000,
      maxPts: 99999,
      range: "25,000 – 99,999 PZA",
      unlocked: pzaPoints >= 25000,
      category: "Rank" as const,
      icon: <MdMilitaryTech className="text-yellow-400 text-2xl md:text-3xl" />,
      bg: "bg-yellow-400",
      description: "A mark of true dedication. Hit 25,000 PZA to enter the Gold tier and join the elite.",
    },
    {
      id: "platinum",
      name: "Platinum",
      minPts: 100000,
      maxPts: Infinity,
      range: "100,000+ PZA",
      unlocked: pzaPoints >= 100000,
      category: "Rank" as const,
      icon: <MdMilitaryTech className="text-cyan-300 text-2xl md:text-3xl" />,
      bg: "bg-cyan-500",
      description: "Legendary status. Reach 100,000 PZA to ascend to Platinum — the pinnacle of Playza mastery.",
    },
  ];
}

interface BadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  pzaPoints?: number;
}

const BadgeModal: React.FC<BadgeModalProps> = ({ isOpen, onClose, pzaPoints = 0 }) => {
  const badges = getTierBadges(pzaPoints);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 animate-in fade-in duration-300">
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-xl"
        onClick={onClose}
      >
        <div className="absolute top-0 left-0 w-full h-full bg-linear-to-b from-primary/10 to-transparent"></div>
      </div>
      <div className="glass-card w-full max-w-xl rounded-xl overflow-hidden relative z-10 animate-in zoom-in-95 duration-500 border-primary/20 shadow-[0_0_80px_-20px_rgba(var(--primary),0.3)]">
        <style>
          {`
            .hide-scrollbar::-webkit-scrollbar {
              display: none;
            }
            .hide-scrollbar {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `}
        </style>
        {/* Header */}
        <div className="p-5 md:p-8 border-b border-white/5 flex items-center justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-primary/10 rounded-full border border-primary/20 mb-1">
              <MdMilitaryTech className="text-primary text-[10px]" />
              <span className="text-[8px] text-primary font-black uppercase tracking-[0.2em] leading-none">
                Prestige System
              </span>
            </div>
            <h2 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none">
              Legacy <span className="text-primary">Ranks</span>
            </h2>
            <p className="text-[9px] md:text-[11px] text-slate-500 font-bold uppercase tracking-widest opacity-60">
              Climb the hierarchy to unlock legendary PZA rewards
            </p>
          </div>
          <button
            onClick={onClose}
            className="size-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all hover:scale-110 active:scale-95 group border border-white/5"
          >
            <MdClose className="text-xl text-slate-500 group-hover:text-white transition-colors" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 md:p-8 space-y-3 max-h-[60vh] overflow-y-auto hide-scrollbar">
          {badges.map((badge, idx) => (
            <div
              key={badge.id}
              className={`p-4 md:p-6 rounded-xl border relative overflow-hidden transition-all duration-700 group ${
                badge.unlocked
                  ? "bg-primary/5 border-primary/30 shadow-inner"
                  : "bg-white/2 border-white/5 opacity-80"
              }`}
            >
              {/* Hover Glow Effect */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 blur-[60px] rounded-full -mr-12 -mt-12 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

              <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 relative z-10">
                <div className="shrink-0 relative">
                  <div
                    className={`size-16 md:size-24 rounded-2xl flex items-center justify-center transition-all duration-700 shadow-lg ${badge.unlocked ? badge.bg + " scale-105 shadow-xl" : "bg-white/5 grayscale saturate-50 opacity-40 group-hover:opacity-100 group-hover:grayscale-0 group-hover:scale-105"}`}
                  >
                    {badge.icon}
                  </div>
                  {badge.unlocked && (
                    <div className="absolute -top-2 -right-2 bg-primary text-white p-1.5 rounded-lg shadow-2xl shadow-primary/40 animate-bounce">
                      <MdCheckCircle size={12} />
                    </div>
                  )}
                  {!badge.unlocked && (
                    <div className="absolute -top-2 -right-2 bg-slate-900 border border-white/10 text-slate-500 p-1.5 rounded-lg shadow-2xl opacity-60">
                      <MdLock size={12} />
                    </div>
                  )}
                </div>

                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[8px] font-black uppercase text-primary tracking-[0.3em] opacity-80 mb-0.5 block leading-none">
                        {badge.range}
                      </span>
                      <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none group-hover:text-primary transition-colors">
                        {badge.name}
                      </h3>
                    </div>
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${badge.unlocked ? badge.bg + "/20 border-current" : "bg-white/5 border-white/10"}`}>
                      <span className={`text-xs font-black uppercase tracking-widest leading-none ${badge.unlocked ? "text-primary" : "text-slate-500"}`}>
                        {badge.unlocked ? "✓ Unlocked" : "Locked"}
                      </span>
                    </div>
                  </div>
                  <p className="text-[10px] md:text-xs text-slate-500 font-bold leading-relaxed max-w-sm">
                    {badge.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-5 md:p-8 bg-linear-to-t from-primary/10 to-transparent text-center border-t border-white/5">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-primary text-white rounded-xl font-black uppercase tracking-[0.2em] text-[10px] md:text-xs hover:scale-105 active:scale-95 transition-all shadow-glow"
          >
            Close Records
          </button>
        </div>
      </div>
    </div>
  );
};

export default BadgeModal;
