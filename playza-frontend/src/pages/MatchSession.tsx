import { games } from "@/data/games";
import { calculatePrizePool } from "@/utils/calculatedPrizePool";
import { Link, useParams } from "react-router";
import { ArrowBigLeft, Info, Laptop, Smartphone } from "lucide-react";
import { BiTrendingUp, BiTrophy } from "react-icons/bi";
import { MdArrowForward, MdSupportAgent } from "react-icons/md";
import { useState } from "react";
import SessionLeaderboard from "@/components/gameSession/SessionLeaderboard";
import SessionPerformance from "@/components/gameSession/SessionPerformance";
import SessionActivities from "@/components/gameSession/SessionActivities";
import SessionHero from "@/components/gameSession/SessionHero";
import LiveEntryModal from "@/components/gameSession/LiveEntryModal";
import ActivityToasts from "@/components/gameSession/ActivityToasts";
import { ZASymbol } from "@/components/currency/ZASymbol";

const MatchSession = () => {
  const [activeTab, setActiveTab] = useState("Live Leaderboard");
  const [liveEntry, setLiveEntry] = useState(false);

  const param = useParams();

  const slug = param.id;

  const allGames = games.map((g) => ({
    ...g,
    prizePool: calculatePrizePool(
      g.entryFee,
      g.activePlayers,
      g.platformFeePercentage,
    ),
  }));

  type TabItem = {
    tab: string;
    render: () => React.ReactElement;
  };

  const game = allGames.find((game) => game.slug === slug);

  if (!game) {
    return <div>Game not found</div>; // or loader
  }

  const tabContent: TabItem[] = [
    { tab: "Live Leaderboard", render: () => <SessionLeaderboard /> },
    { tab: "My Performance", render: () => <SessionPerformance /> },
    { tab: "Live Feeds", render: () => <SessionActivities /> },
    // {
    //   tab: "Info",
    //   render: () => (
    //     <SessionInfo title={game?.title} pricePool={game?.pricePool} />
    //   ),
    // },
    // { tab: "Rules", render: () => <SessionRules /> },
  ];

  const activeTabContent = tabContent.find((item) => item.tab === activeTab);
  // console.log(splitTitle);

  return (
    <main className="relative flex-1 max-w-400 mx-auto overflow-x-hidden ">
      {liveEntry && <LiveEntryModal onClick={setLiveEntry} />}
      <ActivityToasts />
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-[70%] flex flex-col gap-4">
          <Link
            to={`/games/${slug}`}
            className="mb-2 flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-bold uppercase tracking-widest text-[10px]"
          >
            <ArrowBigLeft size={16} />
            Back to Tournament
          </Link>

          <SessionHero
            title={game?.title}
            slug={game?.slug}
            thumbnail={game?.thumbnail}
            activePlayers={game?.activePlayers}
            entryFee={game?.entryFee}
            prizePool={game?.prizePool}
            onClick={setLiveEntry}
          />

          <section className="glass-card rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-sm transition-colors duration-300">
            <div className="flex border-b border-slate-200 dark:border-white/10 mb-4 overflow-x-auto scrollbar-hide">
              {[
                "Live Leaderboard",
                "My Performance",
                "Live Feeds",
                // "Info",
                // "Rules",
              ].map((tab, i) => (
                <button
                  onClick={() => setActiveTab(tab)}
                  key={i}
                  className={` ${activeTab === tab 
                      ? "text-primary border-b-2 border-primary bg-primary/5" 
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    } px-3.5 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm font-bold transition-all duration-300`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-0">
              <div className="flex-1 px-px overflow-y-auto pb-4">
                {activeTabContent?.render()}
              </div>
            </div>
          </section>
        </div>

        <div className="hidden lg:w-[30%] md:flex flex-col gap-6">
          <div className="glass-card rounded-2xl border border-slate-200 dark:border-white/10 p-5 shadow-sm transition-colors duration-300">
            <h3 className="text-lg font-black italic mb-4 flex items-center gap-2 text-slate-900 dark:text-white uppercase tracking-tighter">
              <BiTrophy className="text-primary text-xl" />
              Prize Distribution
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/5 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <span className="text-yellow-500 font-black italic text-lg drop-shadow-sm">1st</span>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Grand Prize</span>
                </div>
                <div className="flex items-center gap-1.5 transition-all">
                  <ZASymbol className="text-sm scale-90" />
                  <span className="font-black text-slate-900 dark:text-transparent dark:bg-clip-text dark:bg-linear-to-r dark:from-yellow-400 dark:via-amber-200 dark:to-yellow-600 uppercase">75,000</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/5 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 font-black italic text-lg drop-shadow-sm">2nd</span>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Runner Up</span>
                </div>
                <div className="flex items-center gap-1.5 transition-all">
                  <ZASymbol className="text-sm scale-90" />
                  <span className="font-black text-slate-900 dark:text-slate-300 uppercase">45,000</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/5 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <span className="text-orange-500 font-black italic text-lg drop-shadow-sm">3rd</span>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Finalist</span>
                </div>
                <div className="flex items-center gap-1.5 transition-all">
                  <ZASymbol className="text-sm scale-90" />
                  <span className="font-black text-slate-900 dark:text-orange-400 uppercase">30,000</span>
                </div>
              </div>
              <div className="text-center pt-2">
                <p className="text-[10px] text-slate-500 italic uppercase">
                  4th - 100th place earn Arena Credits
                </p>
              </div>
            </div>
          </div>
          <div className="glass-card rounded-2xl border border-slate-200 dark:border-white/10 p-5 shadow-sm transition-colors duration-300">
            <h3 className="text-lg font-bold  mb-4 flex items-center gap-2">
              <BiTrendingUp className="text-playza-green" />
              Your Session Stats
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-2">
                  <span>Skill Progress</span>
                  <span className="text-primary">82%</span>
                </div>
                <div className="h-2 w-full bg-black rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[82%]"></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/80 p-3 rounded-lg">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">
                    Best Score
                  </p>
                  <p className="text-lg font-bold ">89,420</p>
                </div>
                <div className="bg-muted/80 p-3 rounded-lg">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">
                    Game Time
                  </p>
                  <p className="text-lg font-bold ">45m</p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl border border-slate-200 dark:border-white/10 p-5 shadow-sm transition-colors duration-300">
            <h3 className="text-lg font-bold  mb-4 flex items-center gap-2">
              <Info className="text-primary" />
              Session Meta
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm py-2 border-b border-white/5">
                <span className="dark:text-slate-400">Game Type</span>
                <span className=" font-medium">
                  Single Player FPS
                </span>
              </div>
              <div className="flex justify-between text-sm py-2 border-b border-white/5">
                <span className="dark:text-slate-400">Difficulty</span>
                <span className="text-yellow-500 font-medium">Competitive</span>
              </div>
              <div className="flex justify-between text-sm py-2 border-b border-white/5">
                <span className="dark:text-slate-400">Region</span>
                <span className=" font-medium">West Africa</span>
              </div>
              <div className="flex justify-between text-sm py-2">
                <span className="dark:text-slate-400">Platform</span>
                <div className="flex gap-2">
                  <Laptop className="text-sm" />
                  <Smartphone className="text-sm" />
                </div>
              </div>
            </div>
          </div>
          <div className="bg-primary/5 dark:bg-primary/10 rounded-2xl border border-primary/20 p-5 shadow-sm transition-colors duration-300">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-primary rounded-lg text-background-dark">
                <MdSupportAgent />
              </div>
              <div>
                <h4 className=" font-bold text-sm">Need Help?</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                  Our support team is active for this tournament.
                </p>
                <button className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                  Open Live Chat{" "}
                  <MdArrowForward className="text-xs"/>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default MatchSession;
