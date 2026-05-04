import { useMemo } from "react";
import HeroBanner from "@/components/home/HeroBanner";
import HowItWorks from "@/components/home/HowItWorks";
import RecentWinners from "@/components/home/RecentWinners";
import HomeGames from "@/components/home/HomeGames";
import CTAReferral from "@/components/home/CTAReferral";
import GamesMaintenance from "@/components/home/GamesMaintenance";
import { Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import { useGames } from "@/hooks/gamesession/useGameSession";
import type { Game } from "@/types/types";
import { Skeleton } from "@/components/ui/skeleton";

const Home = () => {
  const { data: gamesData, isLoading } = useGames();

  const backendGames = useMemo(() => {
    const gamesList = Array.isArray(gamesData)
      ? gamesData
      : gamesData?.games || [];

    return gamesList.map((g: Game) => ({
      ...g,
      thumbnail: g.thumbnail_url || g.thumbnail || "/games/placeholder.png",
      entryFee: g.entry_fee || g.entryFee || 0,
      platformFeePercentage:
        g.platform_fee_percentage || g.platformFeePercentage || 10,
      durationInSeconds: g.duration_seconds || g.durationInSeconds || 60,
      iframeUrl: g.iframe_url || g.iframeUrl,
      status: g.is_active ? "live" : "coming soon",
      badge: g.badge || (g.is_active ? "POPULAR" : null), // Default badge if none
    }));
  }, [gamesData]);

  const popularGames = useMemo(
    () =>
      backendGames.filter((game: Game) => game.badge === "POPULAR").slice(0, 8),
    [backendGames],
  );

  const hottestGames = useMemo(
    () => backendGames.filter((game: Game) => game.badge === "HOT").slice(0, 8),
    [backendGames],
  );

  const newestGames = useMemo(
    () => backendGames.filter((game: Game) => game.badge === "NEW").slice(0, 6),
    [backendGames],
  );

  const hasGames = backendGames.length > 0;

  return (
    <main className="flex-1 min-w-0 space-y-6">
      <HeroBanner />
      <RecentWinners />

      {/* Loyalty CTA - Small Height Banner */}
      <Link to="/loyalty" className="block px-1">
        <div className="glass-card py-2 md:py-2.5 px-4 md:px-6 rounded-2xl flex items-center justify-between border border-primary/20 bg-primary/5 dark:bg-primary/10">
          <div className="flex items-center gap-2 md:gap-4">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[10px] md:text-xs lg:text-sm font-black uppercase tracking-tight">
                  Active Rewards
                </h3>
                <span className="flex h-1.5 w-1.5 rounded-full bg-primary"></span>
              </div>
              <p className="text-[10px] text-on-surface-variant font-bold opacity-80 uppercase tracking-widest hidden sm:block">
                Claim your daily bonus • Current multi: 1.2x
              </p>
            </div>
          </div>
          <Button
            size="sm"
            className="h-7 md:h-8 text-[10px] px-3 md:px-5 font-black rounded-full bg-primary text-slate-900 shrink-0"
          >
            VIEW REWARDS
          </Button>
        </div>
      </Link>

      {isLoading ? (
        <div className="space-y-8 px-4">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-8 w-48 bg-white/5" />
              <div className="flex gap-4 overflow-hidden">
                {[1, 2, 3, 4].map((j) => (
                  <Skeleton
                    key={j}
                    className="h-48 w-40 md:w-64 shrink-0 rounded-2xl bg-white/5"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : hasGames ? (
        <>
          {newestGames.length > 0 && (
            <HomeGames games={newestGames} title="Newest Games" />
          )}
          {popularGames.length > 0 && (
            <HomeGames games={popularGames} title="Popular Games" />
          )}
          {hottestGames.length > 0 && (
            <HomeGames games={hottestGames} title="Hottest Games" />
          )}
        </>
      ) : (
        <GamesMaintenance />
      )}

      <CTAReferral />
      <HowItWorks />
    </main>
  );
};

export default Home;
