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
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-lg md:text-2xl font-black text-slate-900 dark:text-white tracking-tight italic">
            Today's Game Sessions
          </h2>
          <p className="text-slate-500 text-xs md:text-sm font-medium">
            {sessions.length > 0 
              ? "Join a live session now to start earning rewards."
              : "No active sessions found for this sector."}
          </p>
        </div>
      </div>

      {sessions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5">
          {sessions.map((session) => (
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
                <span className="text-3xl">📡</span>
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase italic tracking-tight">No Active Signal</h3>
            <p className="text-slate-500 text-xs font-medium max-w-xs mt-1">
                There are currently no active or upcoming tournaments scheduled for this game. Check back soon for new challenges.
            </p>
        </div>
      )}
    </div>
  );
};
