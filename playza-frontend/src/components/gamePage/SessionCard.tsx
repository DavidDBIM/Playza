import type { Session } from "@/types/types";
import { Play, Trophy, Users, Clock, CreditCard } from "lucide-react";
import { ZASymbol } from "../currency/ZASymbol";

interface SessionCardProps {
  session: Session;
  gameTitle: string;
  onJoin: (session: Session) => void;
}

export const SessionCard = ({ session, gameTitle, onJoin }: SessionCardProps) => {
  const isLive = session.status === 'live';
  const isUpcoming = session.status === 'upcoming';
  const isStartingSoon = session.status === 'starting soon';
  const progress = (session.playersJoined / session.maxPlayers) * 100;

  return (
    <div className="group relative">
      {/* Glow Effect on Hover */}
      <div className="absolute inset-0 bg-playza-blue/10 blur-3xl rounded-4xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative bg-white dark:bg-[#0a0f1e]/80 backdrop-blur-3xl rounded-2xl p-4 md:p-5 border border-slate-200 dark:border-white/5 space-y-3 md:space-y-4 shadow-2xl overflow-hidden group-hover:border-primary/30 transition-colors">
        {/* Header: Title & Badge */}
        <div className="flex justify-between items-start">
          <div className="space-y-1 md:space-y-2">
            <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white tracking-tight italic leading-tight">
              {gameTitle}
            </h3>
            <div className="text-xs md:text-sm font-bold text-slate-600 dark:text-slate-300 italic">
              {session.title}
            </div>
            <div className="flex items-center gap-2 text-slate-500 text-[10px] md:text-xs font-bold pt-1">
              <Clock className="w-3 h-3 opacity-50" />
              {session.startTime} - {session.endTime}
            </div>
          </div>

          <div
            className={`px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase border backdrop-blur-md ${
              isLive
                ? "bg-playza-green/10 text-playza-green border-playza-green/30"
                : isStartingSoon
                  ? "bg-playza-blue/10 text-playza-blue border-playza-blue/30"
                  : isUpcoming
                    ? "bg-white/10 text-white/50 border-white/10"
                    : "bg-playza-red/10 text-playza-red border-playza-red/30"
            }`}
          >
            {session.status.toUpperCase()}
          </div>
        </div>

        {/* Stats Row: Entry Fee & Prize Pool */}
        <div className="flex items-center gap-6 md:gap-10 border-t border-slate-100 dark:border-white/5 pt-3 md:pt-4">
          <div className="space-y-1">
            <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest flex items-center gap-1.5">
              <CreditCard className="w-3 h-3 opacity-60" />
              Entry
            </p>
            <div className="flex items-center gap-1.5">
              <ZASymbol className="text-sm scale-90" />
              <p className="text-slate-900 dark:text-white font-black text-lg md:text-xl tracking-tighter leading-none">
                {session.entryFee}
              </p>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest flex items-center gap-1.5">
              <Trophy className="w-3 h-3 text-playza-blue/60 fill-playza-blue/10" />
              {session.status === 'ended' ? 'Prize' : 'Pool'}
            </p>
            <div className="flex items-center gap-1.5">
              <ZASymbol className="text-sm scale-90" />
              <p className="text-playza-green font-black text-lg md:text-xl tracking-tighter leading-none">
                {session.prizePool}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Bar Area */}
        {session.status === 'ended' ? (
          <div className="space-y-3 pt-2 md:pt-4">
            <div className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-widest">
              <span className="flex items-center gap-2">
                <Users className="w-3 h-3" />
                Total Players Participated
              </span>
              <span className="text-slate-900 dark:text-white text-xs md:text-sm opacity-100 font-bold">
                {session.playersJoined}
              </span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-widest">
              <span className="flex items-center gap-2">
                <Trophy className="w-3 h-3" />
                Winners
              </span>
              <span className="text-slate-900 dark:text-white text-xs md:text-sm opacity-100 font-bold">
                {session.winnersCount || 0}
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-3 pt-2 md:pt-4">
            <div className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-widest">
              <span className="flex items-center gap-2">
                <Users className="w-3 h-3" />
                Players Joined
              </span>
              <span className="text-slate-900 dark:text-white text-xs md:text-sm opacity-100 font-bold">
                {session.playersJoined}
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden shadow-inner">
              <div
                style={{ width: `${progress}%` }}
                className="h-full bg-playza-blue rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"
              />
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={() => onJoin(session)}
          disabled={!isLive && !isStartingSoon}
          className={`w-full py-2.5 md:py-3 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 active:scale-95 ${
            isLive || isStartingSoon
              ? "bg-primary text-white hover:brightness-110 shadow-lg glow-accent"
              : "bg-slate-100 dark:bg-white/5 text-slate-500 cursor-not-allowed border border-slate-200 dark:border-white/5"
          }`}
        >
          <Play
            className={`w-3 h-3 ${isLive || isStartingSoon ? "fill-current" : "opacity-20"}`}
          />
          {session.status === 'ended' ? "Ended" : "Join"}
        </button>
      </div>
    </div>
  );
};
