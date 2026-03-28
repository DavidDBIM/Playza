import { games } from "@/data/games";
import { calculatePrizePool } from "@/utils/calculatedPrizePool";
import { Link, useParams, useNavigate, useLocation } from "react-router";
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
import { useAuth } from "@/context/auth";


const MatchSession = () => {

  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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

  const game = allGames.find((game) => game.slug === slug);

  if (!game) {
    return <div className="p-20 text-center font-black uppercase text-slate-500">Game not found</div>;
  }

  const handleLiveClick = () => {
    if (!user) {
      navigate(`/registration?view=login&redirect=${encodeURIComponent(location.pathname)}`);
    } else {

      setLiveEntry(true);
    }
  };


  const isUpcoming = game.status === "upcoming" || game.status === "coming soon";
  const isEnded = game.status === "ended" || game.status === "not starting soon";

  type TabItem = {
    tab: string;
    render: () => React.ReactElement;
  };

  const tabContent: TabItem[] = [
    { tab: "Live Leaderboard", render: () => <SessionLeaderboard /> },
    { tab: "My Performance", render: () => <SessionPerformance /> },
    { tab: "Live Feeds", render: () => <SessionActivities /> },
    { tab: "Final Leaderboard", render: () => <SessionLeaderboard /> },
    { tab: "My Results", render: () => <SessionPerformance /> },
    { tab: "Pre-Game Lobby", render: () => (
      <div className="flex flex-col items-center justify-center py-20 text-center glass-card rounded-2xl border border-white/5 mx-px">
        <h3 className="text-xl md:text-2xl font-black uppercase text-slate-800 dark:text-slate-100 tracking-widest mb-2 neon-text">Match Starting Soon</h3>
        <p className="text-xs md:text-sm font-bold tracking-widest uppercase opacity-60 text-slate-500 max-w-sm mt-2">Players are currently joining the lobby. Hang tight and wait for the match to begin!</p>
      </div>
    ) },
  ];

  let displayTabsNames = ["Live Leaderboard", "My Performance", "Live Feeds"];
  if (isUpcoming) {
    displayTabsNames = ["Pre-Game Lobby"];
  } else if (isEnded) {
    displayTabsNames = ["Final Leaderboard", "My Results"];
  }

  const currentTab = displayTabsNames.includes(activeTab) ? activeTab : displayTabsNames[0];
  const activeTabContent = tabContent.find((item) => item.tab === currentTab);

  return (
    <main className="relative flex-1 max-w-400 mx-auto overflow-x-hidden p-1 md:p-4">
      {liveEntry && (
        <LiveEntryModal 
          game={game} 
          onClick={setLiveEntry} 
          onConfirm={() => {
            setLiveEntry(false);
            navigate(`/games/${slug}/play`);
          }} 
        />
      )}
      {!isEnded && <ActivityToasts />}

      
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-[70%] flex flex-col gap-4">
          <Link
            to={`/games/${slug}`}
            className="mb-2 w-fit flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-bold uppercase tracking-widest text-[10px]"
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
              onLiveClick={handleLiveClick}
              onDemoClick={() => navigate(`/games/${slug}/play?mode=demo`)}
          />



          <section className="glass-card rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-sm transition-colors duration-300">
            <div className="flex border-b border-slate-200 dark:border-white/10 mb-4 overflow-x-auto scrollbar-hide">
              {displayTabsNames.map((tab, i) => (
                <button
                  onClick={() => setActiveTab(tab)}
                  key={i}
                  className={` ${currentTab === tab 
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
                  {game.category} 
                </span>
              </div>
              <div className="flex justify-between text-sm py-2 border-b border-white/5">
                <span className="dark:text-slate-400">Difficulty</span>
                <span className="text-yellow-500 font-medium">{game.difficulty}</span>
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
