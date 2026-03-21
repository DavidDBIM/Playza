import { LogOut, Trophy, Zap, Shield, Target, ArrowUp, Users, MessageSquare } from "lucide-react";
import { BsPersonAdd } from "react-icons/bs";
import { MdLeaderboard, MdTimer } from "react-icons/md";

const FEED_DATA = [
  { id: 1, type: "entry", user: "DarkKnight", action: "entered the lobby", time: "Just now", icon: <BsPersonAdd />, color: "text-blue-500 dark:text-blue-400", bg: "bg-blue-500/10" },
  { id: 2, type: "rank", user: "ShadowMaster", action: "moved up to Rank #2", time: "45s ago", icon: <MdLeaderboard />, color: "text-primary", bg: "bg-primary/10", highlight: "Rank #2" },
  { id: 3, type: "score", user: "ProGamer_X", action: "finished with a score of", time: "2m ago", icon: <Trophy />, color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-400/10", highlight: "12,450" },
  { id: 4, type: "achievement", user: "AceHunter", action: "earned 'Flawless Execution'", time: "5m ago", icon: <Target />, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-400/10" },
  { id: 5, type: "exit", user: "SilentWolf", action: "has disconnected", time: "12m ago", icon: <LogOut />, color: "text-slate-500", bg: "bg-slate-500/10" },
  { id: 6, type: "streak", user: "HyperSlayer", action: "is on a 5-match win streak!", time: "15m ago", icon: <Zap />, color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-400/10" },
  { id: 7, type: "shield", user: "DefendX", action: "activated rank protection", time: "18m ago", icon: <Shield />, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-400/10" },
  { id: 8, type: "entry", user: "NoobKiller", action: "entered the lobby", time: "22m ago", icon: <BsPersonAdd />, color: "text-blue-500 dark:text-blue-400", bg: "bg-blue-500/10" },
];

const SessionActivities = () => {
  return (
    <main className="flex-1 mx-auto w-full py-2 md:py-4 bg-transparent rounded-3xl overflow-hidden min-h-150 flex flex-col relative transition-colors duration-300">
      {/* Visual Accents */}
      <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none">
         <Users size={200} className="text-primary rotate-12" />
      </div>

      <div className="px-3 md:px-8 pt-4 md:pt-8 pb-3 md:pb-6 flex items-center justify-between border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900/20 relative z-10 transition-colors">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <h1 className="tracking-tighter text-2xl lg:text-3xl font-black uppercase text-slate-900 dark:text-white italic transition-colors">
               Live <span className="text-primary font-black italic">Feed</span>
             </h1>
             <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span className="text-red-500 text-[9px] font-black uppercase tracking-[0.2em]">Active Session</span>
             </div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors">
            <MdTimer size={14} className="text-primary" />
            Global Channel #402 • Real-time Monitoring
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-4">
           <div className="text-right">
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest leading-none mb-1">Online</p>
              <p className="text-lg font-black text-slate-900 dark:text-white leading-none transition-colors">1,240</p>
           </div>
           <div className="p-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm">
              <Users size={18} className="text-primary" />
           </div>
        </div>
      </div>

      {/* <!-- Feed Stats Bar --> */}
      <div className="hidden md:flex items-center gap-6 px-8 py-3 bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/5 relative z-10 transition-colors">
         <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Entries: 42</span>
         </div>
         <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Rank Shifts: 18</span>
         </div>
         <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Achievements: 5</span>
         </div>
      </div>

      {/* <!-- Live Feed List --> */}
      <div className="flex-1 overflow-y-auto p-2 md:p-4  space-y-2 md:space-y-4 custom-scrollbar relative z-10">
        {FEED_DATA.map((item, idx) => (
          <div 
            key={item.id} 
            className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 hover:border-primary/30 hover:bg-white/10 transition-all group relative animate-in fade-in slide-in-from-right duration-500 shadow-sm"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div className={`${item.bg} ${item.color} flex items-center justify-center rounded-xl shrink-0 size-12 border border-slate-100 dark:border-white/5 shadow-inner`}>
              {item.icon}
            </div>
            
            <div className="flex flex-col justify-center flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-slate-900 dark:text-white font-black uppercase text-xs tracking-tight transition-colors">{item.user}</span>
                <span className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest opacity-60 transition-colors">{item.action}</span>
              </div>
              {item.highlight && (
                <p className={`text-sm font-black italic tracking-tighter ${item.color}`}>
                   {item.highlight}
                </p>
              )}
            </div>
            
            <div className="shrink-0 flex flex-col items-end gap-1">
              <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-tighter tabular-nums transition-colors">
                {item.time}
              </p>
              <div className="flex h-1 w-8 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                 <div className={`h-full ${item.bg.replace('/10', '')} w-1/2 animate-pulse`}></div>
              </div>
            </div>

            {/* Event Line Connector */}
            <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-8 rounded-full bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        ))}

        {/* <!-- Dynamic Loading State --> */}
        <div className="pt-4 md:pt-6 flex flex-col items-center gap-3 md:gap-4">
           <div className="flex items-center gap-2 md:gap-3 py-2 md:py-3 px-4 md:px-6 rounded-full border border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 animate-pulse shadow-sm">
              <div className="size-2 rounded-full bg-primary" />
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Monitoring Stream...</span>
           </div>
           
           <button className="flex items-center gap-3 px-8 py-3.5 rounded-2xl bg-white dark:bg-white/5 hover:bg-primary hover:text-slate-900 border border-slate-200 dark:border-white/10 hover:border-primary transition-all duration-300 text-xs font-black uppercase tracking-widest shadow-lg group text-slate-700 dark:text-white">
             <ArrowUp className="size-4 group-hover:-translate-y-1 transition-transform" />
             Show Older Activity
           </button>
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-white/5 flex items-center justify-between transition-colors">
         <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
               <MessageSquare size={16} />
            </button>
            <div className="h-4 w-px bg-slate-200 dark:bg-white/5" />
            <span className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">Protocol v4.2.1</span>
         </div>
         <div className="flex items-center gap-1.5">
            <div className="size-1.5 rounded-full bg-playza-green" />
            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Server: STABLE</span>
         </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.02);
        }
        .dark .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </main>
  );
};

export default SessionActivities;
