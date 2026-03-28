import HeroBanner from "@/components/home/HeroBanner";
import HowItWorks from "@/components/home/HowItWorks";
// import LeaderBoard from "@/components/home/LeaderBoard";
import RecentWinners from "@/components/home/RecentWinners";
import { games } from "@/data/games";
import HomeGames from "@/components/home/HomeGames";
import CTAReferral from "@/components/home/CTAReferral";
import { Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";

const Home = () => {
  const popularGames = games
    .filter((game) => game.badge === "POPULAR")
    .slice(0, 8);
  const hottestGames = games.filter((game) => game.badge === "HOT").slice(0, 8);
  const newestGames = games.filter((game) => game.badge === "HOT").slice(0, 6);

  return (
    <main className="flex-1 min-w-0 space-y-6">
      <HeroBanner />
      <RecentWinners />
      
      {/* Loyalty CTA - Small Height Banner */}
      <Link to="/loyalty" className="block px-1">
        <div className="glass-card py-2 md:py-2.5 px-4 md:px-6 rounded-2xl flex items-center justify-between border border-primary/20 bg-linear-to-r from-primary/10 via-transparent to-primary/5 group hover:border-primary/40 transition-all shadow-xs">
          <div className="flex items-center gap-2 md:gap-4">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary group-hover:rotate-12 transition-transform">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs md:text-sm font-black uppercase tracking-tight">Active Rewards</h3>
                <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
              </div>
              <p className="text-[10px] text-on-surface-variant font-bold opacity-80 uppercase tracking-widest hidden sm:block">
                Claim your daily bonus • Current multi: 1.2x
              </p>
            </div>
          </div>
          <Button size="sm" className="h-7 md:h-8 text-[10px] px-3 md:px-5 font-black rounded-full bg-primary text-slate-900 hover:scale-105 transition-transform shrink-0">
            VIEW REWARDS
          </Button>
        </div>
      </Link>

      <HomeGames games={newestGames} title="Newest Games" />
      <HomeGames games={popularGames} title="Popular Games" />
      <HomeGames games={hottestGames} title="Hottest Games" />
      <CTAReferral />
      {/* <LeaderBoard /> */}
      <HowItWorks />
    </main>
  );
};

export default Home;
