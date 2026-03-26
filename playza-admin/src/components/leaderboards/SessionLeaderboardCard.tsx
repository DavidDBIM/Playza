import React, { useState } from 'react';
import { 
  MdPersonOutline, 
  MdEmojiEvents, 
  MdAccessTime, 
  MdKeyboardArrowDown, 
  MdKeyboardArrowRight,
  MdSettingsBackupRestore,
  MdDeleteForever,
  MdVisibility
} from 'react-icons/md';
import type { SessionRecord } from '../../data/leaderboardData';
import SessionLeaderboardTable from './SessionLeaderboardTable';
import { Button } from '../ui/button';

interface SessionLeaderboardCardProps {
  session: SessionRecord;
  activeSessionId?: string;
}

const SessionLeaderboardCard: React.FC<SessionLeaderboardCardProps> = ({ session, activeSessionId }) => {
  const [isExpanded, setIsExpanded] = useState(session.id === activeSessionId);

  // Sync isExpanded when activeSessionId changes from URL and scroll into view
  React.useEffect(() => {
    if (session.id === activeSessionId) {
      setIsExpanded(true);
      // Small timeout to allow expand animation
      setTimeout(() => {
        const element = document.getElementById(`session-${session.id}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }
  }, [activeSessionId, session.id]);

  const statusColors = {
    Live: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-emerald-500/20',
    Upcoming: 'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-amber-500/20',
    Completed: 'bg-slate-500/10 text-slate-500 border-slate-500/20 shadow-slate-500/20'
  };

  return (
    <div id={`session-${session.id}`} className={`glass-card rounded-[1.5rem] overflow-hidden border border-slate-200 dark:border-white/10 shadow-sm bg-white/30 dark:bg-black/10 transition-all hover:bg-white/50 dark:hover:bg-white/5 ${
      isExpanded ? 'border-primary/50 bg-primary/5' : ''
    } ${session.id === activeSessionId ? 'ring-2 ring-primary ring-offset-4 dark:ring-offset-slate-900 border-primary transition-all duration-500 scale-[1.01] shadow-xl shadow-primary/20 z-10' : ''}`}>
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-4 md:p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6 group"
      >
        <div className="flex flex-col md:flex-row md:items-center gap-6 flex-1">
          <div className="space-y-1">
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight group-hover:text-primary transition-colors">{session.title}</h3>
            <div className="flex items-center gap-3">
              <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border shadow-sm flex items-center gap-1 ${statusColors[session.status]}`}>
                <span className={`w-1 h-1 rounded-full ${
                  session.status === 'Live' ? 'bg-emerald-500 animate-pulse' :
                  session.status === 'Upcoming' ? 'bg-amber-500' :
                  'bg-slate-500'
                }`}></span>
                {session.status}
              </span>
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1">
                <MdAccessTime className="text-sm opacity-50" />
                Starts {session.startTime}
              </span>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 border-l border-slate-200 dark:border-white/10 md:pl-6">
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Total Enrolled</span>
              <span className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1">
                <MdPersonOutline className="text-primary opacity-50" />
                {session.playersJoined}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Grand Prize</span>
              <span className="text-sm font-black text-emerald-500 flex items-center gap-1">
                <MdEmojiEvents className="text-emerald-500/30" />
                ₦{session.prizePool.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 border-r border-slate-200 dark:border-white/10 pr-4 mr-1">
            <Button variant="ghost" className="h-9 w-9 p-0 rounded-xl hover:bg-emerald-500/10 hover:text-emerald-500 transition-all" title="Recalculate Leaderboard">
              <MdSettingsBackupRestore className="text-lg" />
            </Button>
            <Button variant="ghost" className="h-9 w-9 p-0 rounded-xl hover:bg-rose-500/10 hover:text-rose-500 transition-all text-slate-400" title="Reset Session Statistics">
              <MdDeleteForever className="text-lg" />
            </Button>
            <Button variant="ghost" className="h-9 w-9 p-0 rounded-xl hover:bg-primary/10 hover:text-primary transition-all text-slate-400" title="Full Session Details">
              <MdVisibility className="text-lg" />
            </Button>
          </div>
          <div className="text-primary transform group-hover:scale-110 transition-transform">
            {isExpanded ? <MdKeyboardArrowDown className="text-2xl" /> : <MdKeyboardArrowRight className="text-2xl" />}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 md:p-6 pt-0 border-t border-slate-200 dark:border-white/10 animate-in slide-in-from-top-4 duration-300">
          <div className="my-6">
            <SessionLeaderboardTable leaderboard={session.leaderboard} />
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionLeaderboardCard;
