import React, { useState, useEffect } from 'react';
import type { Session } from "@/types/types";
import { Play, Trophy, Users, Clock, CreditCard, Timer } from "lucide-react";
import { ZASymbol } from "../currency/ZASymbol";
import { formatSessionTime, getRemainingTime } from "@/lib/formatDate";

interface SessionCardProps {
  session: Session;
  gameTitle: string;
  onJoin: () => void;
}

export const SessionCard = ({ session, gameTitle, onJoin }: SessionCardProps) => {
  const [timeLeft, setTimeLeft] = useState<{ hours: number, minutes: number, seconds: number } | null>(null);
  const [currentStatus, setCurrentStatus] = useState(session.status);

  useEffect(() => {
    if (session.status !== 'upcoming') return;

    const timer = setInterval(() => {
      const remaining = getRemainingTime(session.startTime);
      if (remaining) {
        setTimeLeft(remaining);
      } else {
        setCurrentStatus('live');
        setTimeLeft(null);
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [session.startTime, session.status]);

  const isLive = currentStatus === 'live' || currentStatus === 'active';
  const isUpcoming = currentStatus === 'upcoming';
  const isStartingSoon = currentStatus === 'starting soon';
  const isEnded = currentStatus === 'completed';
  const progress = (session.playersJoined / session.maxPlayers) * 100;

  return (
    <div className="group relative">
      <div className="relative bg-white dark:bg-[#0a0f1e]/80 rounded-xl p-4 md:p-5 border border-slate-200 dark:border-white/5 space-y-3 md:space-y-4 overflow-hidden">
        {/* Header: Title & Badge */}
        <div className="flex justify-between items-start">
          <div className="space-y-1 md:space-y-2">
            <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white tracking-tight italic leading-tight">
              {gameTitle}
            </h3>
            <div className="text-xs md:text-sm font-bold text-slate-600 dark:text-slate-300 italic">
              {session.title}
            </div>
            <div className="flex flex-col gap-1 pt-1">
              <div className="flex items-center gap-2 text-slate-500 text-[10px] md:text-xs font-bold">
                <Clock className="w-3 h-3 opacity-50" />
                {formatSessionTime(session.startTime)}
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-[9px] md:text-[10px] font-medium opacity-60">
                <span className="w-1 h-1 bg-slate-300 rounded-full" />
                Ends {formatSessionTime(session.endTime)}
              </div>
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
            {currentStatus.toUpperCase()}
          </div>
        </div>

        {/* Countdown for Upcoming */}
        {isUpcoming && timeLeft && (
          <div className="bg-primary/5 border border-primary/10 rounded-lg p-3 flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-2 text-primary">
              <Timer className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Starts In:</span>
            </div>
            <div className="flex gap-2 text-sm font-black text-slate-900 dark:text-white font-mono">
              <span>{String(timeLeft.hours).padStart(2, '0')}h</span>
              <span>{String(timeLeft.minutes).padStart(2, '0')}m</span>
              <span>{String(timeLeft.seconds).padStart(2, '0')}s</span>
            </div>
          </div>
        )}

        {/* Stats Row: Entry Fee & Prize Pool */}
        <div className="flex items-center gap-6 md:gap-10 border-t border-slate-100 dark:border-white/5 pt-3 md:pt-4">
          <div className="space-y-1">
            <p className="text-xs md:text-base text-[9px] text-slate-500 uppercase font-black tracking-widest flex items-center gap-1.5">
              <CreditCard className="w-3 h-3 opacity-60" />
              Entry
            </p>
            <div className="flex items-center gap-1.5">
              <ZASymbol className="text-sm scale-90" />
              <p className="text-xs md:text-lg text-slate-900 dark:text-white font-black tracking-tighter leading-none">
                {(Number(session.entryFee) || 0).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs md:text-base text-[9px] text-slate-500 uppercase font-black tracking-widest flex items-center gap-1.5">
              <Trophy className="w-3 h-3 text-playza-blue/60 fill-playza-blue/10" />
              {isEnded ? 'Prize' : 'Pool'}
            </p>
            <div className="flex items-center gap-1.5">
              <ZASymbol className="text-sm scale-90" />
              <p className="text-xs md:text-lg text-playza-green font-black tracking-tighter leading-none">
                {(Number(session.prizePool) || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Bar Area */}
        {isEnded ? (
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
                {session.playersJoined} / {session.maxPlayers}
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
              <div
                style={{ width: `${Math.min(progress, 100)}%` }}
                className="h-full bg-playza-blue rounded-full transition-all duration-500"
              />
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={() => onJoin()}
          disabled={!isLive && !isStartingSoon}
          className={`w-full py-2.5 md:py-3 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all ${
            isLive || isStartingSoon
              ? "bg-primary text-slate-900 hover:scale-[1.02] active:scale-95 shadow-lg shadow-primary/20"
              : "bg-slate-100 dark:bg-white/5 text-slate-500 cursor-not-allowed border border-slate-200 dark:border-white/5"
          }`}
        >
          {isLive ? (
            <>
              <div className="size-2 bg-slate-900 rounded-full animate-pulse" />
              <span>Enter Arena</span>
            </>
          ) : isStartingSoon ? (
            <>
              <Play className="w-3 h-3 fill-current" />
              <span>Join Match</span>
            </>
          ) : isEnded ? (
            "Ended"
          ) : (
            <>
              <Timer className="w-3 h-3" />
              <span>Upcoming</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
