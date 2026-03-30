import type { Session } from "@/types/types";
import { SessionCard } from "./SessionCard";


interface SessionsTabProps {
  gameTitle: string;
  sessions: Session[];
  onJoin: (session: Session) => void;
}

export const SessionsTab = ({ gameTitle, sessions, onJoin }: SessionsTabProps) => {
  return (
    <div className="space-y-4 md:space-y-10">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-lg md:text-2xl font-black text-slate-900 dark:text-white tracking-tight italic">
            Today's Game Sessions
          </h2>
          <p className="text-slate-500 text-xs md:text-sm font-medium">
            Join a live session now to start earning rewards.
          </p>
        </div>
      </div>

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
    </div>
  );
};
