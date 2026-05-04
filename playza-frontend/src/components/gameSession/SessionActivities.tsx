import { Trophy, MessageSquare, Loader2, Target } from "lucide-react";
import { MdTimer } from "react-icons/md";
import { useEffect, useState } from "react";
import { supabase } from "@/config/supabase";

interface Activity {
  id: string;
  type: "score" | "entry" | "rank";
  user: string;
  avatar?: string;
  action: string;
  time: string;
  highlight?: string;
  color: string;
  bg: string;
  icon: React.ReactNode;
}

const SessionActivities = ({ sessionId }: { sessionId: string }) => {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel(`session_feed_${sessionId}`)
      .on("broadcast", { event: "LEADERBOARD_UPDATE" }, (payload) => {
        const { username, avatarUrl, newScore, isHighScore } = payload.payload;

        const newActivity: Activity = {
          id: Math.random().toString(36).substr(2, 9),
          type: "score",
          user: username || "Unknown Player",
          avatar: avatarUrl,
          action: isHighScore
            ? "achieved a new high score of"
            : "finished a round with",
          time: "Just now",
          highlight: newScore.toLocaleString(),
          color: isHighScore ? "text-primary" : "text-slate-400",
          bg: isHighScore ? "bg-primary/10" : "bg-slate-500/5",
          icon: isHighScore ? (
            <Trophy className="size-5" />
          ) : (
            <Target className="size-5" />
          ),
        };

        setActivities((prev) => [newActivity, ...prev].slice(0, 20));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  return (
    <main className="flex-1 mx-auto w-full py-2 md:py-4 bg-transparent rounded-xl overflow-hidden min-h-150 flex flex-col relative">
      <div className="px-3 md:px-8 pt-4 md:pt-8 pb-3 md:pb-6 flex items-center justify-between border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900/20 relative z-10 transition-colors">
        <div className="space-y-1">
          <div className="flex items-center gap-2 md:gap-3">
            <h1 className="tracking-tighter text-lg md:text-2xl lg:text-3xl font-black uppercase text-slate-900 dark:text-white italic transition-colors">
              Live <span className="text-primary font-black italic">Feed</span>
            </h1>
            <div className="flex items-center gap-2 px-2 md:px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span className="text-red-500 text-[9px] font-black uppercase tracking-[0.2em]">
                Active
              </span>
            </div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
            <MdTimer size={14} className="text-primary" />
            Arena Stream • Real-time Monitoring
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 md:p-4 space-y-2 md:space-y-4 custom-scrollbar relative z-10">
        {activities.length === 0 ? (
          <div className="py-20 flex flex-col items-center gap-4 text-center">
            <div className="p-6 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
              <Loader2 size={32} className="text-primary animate-spin" />
            </div>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
              Waiting for arena activity...
            </p>
          </div>
        ) : (
          activities.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 group relative animate-in slide-in-from-top-2 duration-300"
            >
              <div
                className={`${item.bg} ${item.color} flex items-center justify-center rounded-xl shrink-0 size-12 border border-slate-100 dark:border-white/5`}
              >
                {item.avatar ? (
                  <img
                    src={item.avatar}
                    alt=""
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  item.icon
                )}
              </div>

              <div className="flex flex-col justify-center flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-slate-900 dark:text-white font-black uppercase text-xs tracking-tight transition-colors">
                    {item.user}
                  </span>
                  <span className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest opacity-60 transition-colors">
                    {item.action}
                  </span>
                </div>
                {item.highlight && (
                  <p
                    className={`text-xs md:text-sm font-black italic tracking-tighter ${item.color}`}
                  >
                    {item.highlight} PTS
                  </p>
                )}
              </div>

              <div className="shrink-0 flex flex-col items-end gap-1">
                <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-tighter tabular-nums transition-colors">
                  {item.time}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom Status Bar */}
      <div className="p-2 md:p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-white/5 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-2 md:gap-4">
          <button className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
            <MessageSquare size={16} />
          </button>
          <div className="h-4 w-px bg-slate-200 dark:bg-white/5" />
          <span className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">
            Arena Sync v2.0
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="size-1.5 rounded-full bg-playza-green" />
          <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Connection: Stable
          </span>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.02); }
        .dark .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.02); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.1); border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); }
      `}</style>
    </main>
  );
};

export default SessionActivities;
