import { useState, useMemo } from "react";
import type { Session } from "@/types/types";
import { SessionCard } from "./SessionCard";
import { Loader2 } from "lucide-react";

interface SessionsTabProps {
  gameTitle: string;
  sessions: Session[];
  onJoin: () => void;
  isLoading?: boolean;
}
export const SessionsTab = ({ gameTitle, sessions, onJoin, isLoading }: SessionsTabProps) => {
  const [view, setView] = useState<'live' | 'history'>('live');

  const filteredSessions = useMemo(() => {
    if (view === 'live') return sessions.filter(s => s.status !== 'completed');
    return sessions.filter(s => s.status === 'completed');
  }, [sessions, view]);

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
          Syncing Match Rotations...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-lg md:text-2xl font-black text-slate-900 dark:text-white tracking-tight italic">
            {view === 'live' ? "Today's Game Sessions" : "Previous Match History"}
          </h2>
          <p className="text-slate-500 text-xs md:text-sm font-medium">
            {view === 'live' 
              ? (sessions.filter(s => s.status !== 'completed').length > 0 
                ? "Join a live session now to start earning rewards."
                : "No active sessions found for this sector.")
              : "Review past performance and tournament results."}
          </p>
        </div>
        
        <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl border border-slate-200 dark:border-white/10 w-fit">
          <button 
            onClick={() => setView('live')}
            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${view === 'live' ? 'bg-white dark:bg-white/10 text-primary shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
          >
            Live Matches
          </button>
          <button 
            onClick={() => setView('history')}
            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${view === 'history' ? 'bg-white dark:bg-white/10 text-primary shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
          >
            History
          </button>
        </div>
      </div>

      {filteredSessions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5">
          {filteredSessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              gameTitle={gameTitle}
              onJoin={onJoin}
            />
          ))}
        </div>
      ) : (
        <div className="py-20 bg-slate-50 dark:bg-white/5 border border-dashed border-slate-200 dark:border-white/10 rounded-3xl flex flex-col items-center justify-center text-center p-8">
            <div className="size-16 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center mb-4">
                <span className="text-3xl">{view === 'live' ? '📡' : '📁'}</span>
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase italic tracking-tight">
              {view === 'live' ? 'No Active Signal' : 'No History Found'}
            </h3>
            <p className="text-slate-500 text-xs font-medium max-w-xs mt-1">
                {view === 'live' 
                  ? "There are currently no active or upcoming tournaments scheduled for this game."
                  : "You haven't participated in any sessions for this game yet."}
            </p>
        </div>
      )}
    </div>
  );
};
