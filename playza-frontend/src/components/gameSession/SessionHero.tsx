import { formatZA, formatZAAmount } from "@/lib/formatCurrency";
import { ZASymbol } from "@/components/currency/ZASymbol";
import { Gamepad2, PlayCircle, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { getRemainingTime } from "@/lib/formatDate";

type SessionHeroProps = {
  title: string;
  slug: string;
  thumbnail: string;
  activePlayers: number;
  entryFee: number;
  prizePool?: number;
  endTime: string;
  sessionId: string;
  status: string;
  gameName?: string;
  onLiveClick: () => void;
  onDemoClick: () => void;
};

const SessionHero = ({
  title,
  slug,
  thumbnail,
  prizePool,
  activePlayers,
  entryFee,
  endTime,
  sessionId,
  status,
  gameName,
  onLiveClick,
  onDemoClick,
}: SessionHeroProps) => {
  console.log("🎮 SessionHero Props:", { title, sessionId, endTime, activePlayers, status });
  const [timeLeft, setTimeLeft] = useState(getRemainingTime(endTime));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getRemainingTime(endTime));
    }, 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  const sessionCode = sessionId ? sessionId.slice(0, 6).toUpperCase() : "ARENA";
  const isUpcoming = (status || "").toLowerCase() === "upcoming";

  return (
    <section className="bg-white dark:bg-black/20 rounded-xl pr-1 py-2 md:py-4 overflow-hidden relative border border-slate-200 dark:border-white/10">
      <div className="absolute top-0 right-0 w-1/3 h-full bg-linear-to-l from-primary/10 to-transparent pointer-events-none"></div>
      <div className="flex flex-row justify-between items-center mb-4 ">
        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center gap-1.5">
            <span className={`w-fit text-slate-900 dark:text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1 ${isUpcoming ? 'bg-orange-500' : 'bg-red-500'}`}>
              <span className="h-1.5 w-1.5 bg-white rounded-full"></span>{" "}
              {isUpcoming ? 'UPCOMING' : 'LIVE'}
            </span>
            <span className="text-slate-600 dark:text-slate-400 text-sm font-bold uppercase tracking-tight">
              #{sessionCode}
            </span>
          </div>
          {gameName && (
            <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-primary/60 mt-2 -mb-1">
              {gameName} Arena
            </p>
          )}
          <h2 className=" text-lg md:text-5xl font-bold dark:text-white mt-1">
            {title}
          </h2>
          <p className="text-xs md:text-md dark:text-slate-400">
            {isUpcoming ? 'Register now to compete' : `Join ${(activePlayers || 0).toLocaleString()} players competing for glory`}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest mb-1">
            Prize Pool
          </p>
          <p className="text-sm md:text-2xl flex items-baseline  font-black text-slate-900 dark:text-transparent dark:bg-clip-text dark:bg-linear-to-r dark:from-yellow-400 dark:via-amber-200 dark:to-yellow-600">
            {formatZA(prizePool)}
          </p>
        </div>
      </div>
      <div className="relative rounded-lg overflow-hidden h-70 md:h-90 mb-6 group">
        <img
          alt={slug}
          className="w-full h-full object-cover"
          src={thumbnail}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-transparent to-transparent"></div>

        <div className="absolute right-0 top-0 flex gap-2 p-2 text-white bg-slate-900/80 border-b border-l border-white/10 font-black text-xs md:text-base rounded-bl-xl">
          <p className="text-xs md:text-base text-slate-400">Entry Fee:</p>
          <span className="text-primary flex items-center gap-1 font-black">
            <ZASymbol className="scale-90" />{formatZAAmount(entryFee)}
          </span>
        </div>

        <div className="absolute left-0 top-0 flex items-center gap-2 p-2 text-white bg-playza-blue border-b border-r border-white/10 font-black text-xs md:text-base rounded-br-xl">
          <Users className="size-4 md:size-5" />
          <span>{(activePlayers || 0).toLocaleString()}</span>
        </div>

        <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row items-center justify-between gap-2 md:gap-4">
          <div className="flex items-center gap-2 md:gap-4">
            <div className="bg-white dark:bg-slate-900/60 px-2 md:px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10">
              <p className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-black tracking-widest mb-1 text-center sm:text-left">
                {timeLeft ? 'Entry Closes In' : 'Entry Closed'}
              </p>
              <div className="flex gap-2 text-lg md:text-2xl font-black text-slate-900 dark:text-white items-center justify-center sm:justify-start tabular-nums">
                {timeLeft ? (
                  <>
                    <span>{String(timeLeft.hours).padStart(2, '0')}</span>
                    <span className="text-primary animate-pulse">:</span>
                    <span>{String(timeLeft.minutes).padStart(2, '0')}</span>
                    <span className="text-primary animate-pulse">:</span>
                    <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
                  </>
                ) : (
                  <span className="text-rose-500">EXPIRED</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 md:gap-3 w-full sm:w-auto">
            <button
              onClick={onLiveClick}
              disabled={!timeLeft || isUpcoming}
              className={`sm:flex-none bg-primary text-background-dark font-bold px-2 md:px-4 lg:px-8 py-2 md:py-3 rounded-xl flex items-center text-xs sm:text-base justify-center gap-2 cursor-pointer ${(!timeLeft || isUpcoming) ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
            >
              <PlayCircle className="md:text-xl" />
              {isUpcoming ? 'Coming Soon' : 'Enter Live Game'}
            </button>
            <button 
              onClick={onDemoClick}
              className="sm:flex-none bg-accent dark:text-white font-bold px-2 md:px-4 lg:px-8 py-2 md:py-3 rounded-xl border border-slate-900/10 dark:border-white/10 flex items-center text-xs sm:text-base justify-center gap-2 cursor-pointer"
            >
              <Gamepad2 className="md:text-xl" />
              Play Demo
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SessionHero;
