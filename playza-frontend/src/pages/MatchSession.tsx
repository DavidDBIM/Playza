import { Link, useParams, useNavigate, useLocation } from "react-router";
import { ArrowBigLeft, Info, Laptop, Smartphone, Loader2 } from "lucide-react";
import { BiTrophy } from "react-icons/bi";
import { MdArrowForward, MdSupportAgent } from "react-icons/md";
import { useState, useEffect } from "react";
import SessionLeaderboard from "@/components/gameSession/SessionLeaderboard";
import SessionPerformance from "@/components/gameSession/SessionPerformance";
import SessionActivities from "@/components/gameSession/SessionActivities";
import SessionHero from "@/components/gameSession/SessionHero";
import LiveEntryModal from "@/components/gameSession/LiveEntryModal";
import HowToPlayModal from "@/components/gameSession/HowToPlayModal";
import ActivityToasts from "@/components/gameSession/ActivityToasts";
import { ZASymbol } from "@/components/currency/ZASymbol";
import { useAuth } from "@/context/auth";
import { useActiveSession } from "@/hooks/gamesession/useGameSession";

const MatchSession = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { id: slug } = useParams();
  const [activeTab, setActiveTab] = useState("Live Leaderboard");
  const [entryState, setEntryState] = useState<"none" | "fee" | "how-to-play">(
    "none",
  );

  // --- LIVE DATA FETCH ---
  const { data: sessionData, isLoading } = useActiveSession(slug || "");

  const session = sessionData?.result;
  const game = session?.games;

  useEffect(() => {
    if (entryState !== "none") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [entryState]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-xs font-black uppercase tracking-widest text-slate-500 animate-pulse">
          Syncing Arena Data...
        </p>
      </div>
    );
  }

  if (!session || !game) {
    return (
      <div className="p-20 text-center flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500">
          <Info size={32} />
        </div>
        <h2 className="text-xl font-black uppercase italic tracking-tighter">
          Arena Not Found
        </h2>
        <p className="text-slate-500 text-sm font-medium max-w-xs">
          The tournament session you are looking for does not exist or has been
          archived.
        </p>
        <button
          onClick={() => navigate("/games")}
          className="px-8 py-3 bg-primary text-slate-950 rounded-xl font-black uppercase text-xs tracking-widest mt-4"
        >
          Browse Tournaments
        </button>
      </div>
    );
  }

  const handleLiveClick = () => {
    if (!user) {
      navigate(
        `/registration?view=login&redirect=${encodeURIComponent(location.pathname)}`,
      );
    } else {
      setEntryState("fee");
    }
  };

  const isUpcoming = session.status === "upcoming";
  const isEnded = session.status === "completed";

  type TabItem = {
    tab: string;
    render: () => React.ReactElement;
  };

  const tabContent: TabItem[] = [
    {
      tab: "Live Leaderboard",
      render: () => (
        <SessionLeaderboard
          sessionId={session.id}
          prizePool={session.pool_amount}
        />
      ),
    },
    {
      tab: "My Performance",
      render: () => <SessionPerformance sessionId={session.id} />,
    },
    {
      tab: "Live Feeds",
      render: () => <SessionActivities sessionId={session.id} />,
    },
    {
      tab: "Final Leaderboard",
      render: () => (
        <SessionLeaderboard
          sessionId={session.id}
          prizePool={session.pool_amount}
        />
      ),
    },

    {
      tab: "My Results",
      render: () => <SessionPerformance sessionId={session.id} />,
    },
    {
      tab: "Pre-Game Lobby",
      render: () => (
        <div className="flex flex-col items-center justify-center py-2 md:py-20 text-center glass-card rounded-2xl border border-white/5 mx-px">
          <h3 className="text-xl md:text-2xl font-black uppercase text-slate-800 dark:text-slate-100 tracking-widest mb-2 neon-text">
            Match Starting Soon
          </h3>
          <p className="text-xs md:text-sm font-bold tracking-widest uppercase opacity-60 text-slate-500 max-w-sm mt-2">
            Players are currently joining the lobby. Hang tight and wait for the
            match to begin!
          </p>
        </div>
      ),
    },
  ];

  let displayTabsNames = ["Live Leaderboard", "My Performance", "Live Feeds"];
  if (isUpcoming) {
    displayTabsNames = ["Pre-Game Lobby"];
  } else if (isEnded) {
    displayTabsNames = ["Final Leaderboard", "My Results"];
  }

  const currentTab = displayTabsNames.includes(activeTab)
    ? activeTab
    : displayTabsNames[0];
  const activeTabContent = tabContent.find((item) => item.tab === currentTab);

  // Dynamic Prize Distribution (calculated from net pool)
  const platformFeePercent = Number(game?.platform_fee_percentage || 10);
  const netPool =
    Number(session.pool_amount || 0) * (1 - platformFeePercent / 100);
  const prizes = [
    {
      label: "Grand Prize",
      rank: "1st",
      amount: netPool * 0.4,
      color: "text-yellow-500",
    },
    {
      label: "Runner Up",
      rank: "2nd",
      amount: netPool * 0.25,
      color: "text-slate-400",
    },
    {
      label: "Finalist",
      rank: "3rd",
      amount: netPool * 0.15,
      color: "text-orange-500",
    },
    {
      label: "4th Place",
      rank: "4th",
      amount: netPool * 0.1,
      color: "text-slate-500",
    },
    {
      label: "5th Place",
      rank: "5th",
      amount: netPool * 0.1,
      color: "text-slate-500",
    },
  ];

  return (
    <main className="relative flex-1 max-w-400 mx-auto overflow-x-hidden p-2 md:p-6 lg:p-8">
      {entryState === "fee" && (
        <LiveEntryModal
          game={{ ...game, entryFee: session.entry_fee, id: session.id }}
          onClick={(open) => setEntryState(open ? "fee" : "none")}
          onConfirm={() => {
            setEntryState("how-to-play");
          }}
        />
      )}
      {entryState === "how-to-play" && (
        <HowToPlayModal
          game={{ ...game, howToPlay: game.how_to_play }}
          onClose={() => setEntryState("none")}
          onConfirm={() => {
            setEntryState("none");
            navigate(`/games/${slug}/play`);
          }}
        />
      )}
      {!isEnded && <ActivityToasts sessionId={session.id} />}

      <div className="flex flex-col lg:flex-row gap-2 md:gap-8">
        <div className="w-full lg:w-[70%] flex flex-col gap-2 md:gap-4">
          <Link
            to={`/games/${slug}`}
            className="mb-2 w-fit flex items-center gap-2 text-slate-500 md:hover:text-primary font-bold uppercase tracking-widest text-[10px]"
          >
            <ArrowBigLeft size={16} />
            Back to Tournament
          </Link>

          <SessionHero
            title={game.title}
            slug={game.slug}
            thumbnail={game.thumbnail_url}
            activePlayers={session.max_players} // For now using max_players as a metric
            entryFee={session.entry_fee}
            prizePool={session.pool_amount}
            onLiveClick={handleLiveClick}
            onDemoClick={() => navigate(`/games/${slug}/play?mode=demo`)}
          />

          <section className="bg-white dark:bg-black/20 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10">
            <div className="flex border-b border-slate-200 dark:border-white/10 mb-4 overflow-x-auto scrollbar-hide">
              {displayTabsNames.map((tab, i) => (
                <button
                  onClick={() => setActiveTab(tab)}
                  key={i}
                  className={` ${
                    currentTab === tab
                      ? "text-primary border-b-2 border-primary bg-primary/5"
                      : "text-slate-600 dark:text-slate-400 md:hover:text-slate-900 md:dark:hover:text-white"
                  } px-3.5 md:px-6 py-4 whitespace-nowrap text-[10px] md:text-sm font-bold uppercase tracking-widest`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-0">
              <div className="flex-1 px-px overflow-y-auto pb-2 md:pb-4">
                {activeTabContent?.render()}
              </div>
            </div>
          </section>
        </div>

        <div className="hidden lg:w-[30%] md:flex flex-col gap-2 md:gap-6">
          <div className="glass-card rounded-xl border border-slate-200 dark:border-white/10 p-2 md:p-5">
            <h3 className="text-sm md:text-lg font-black italic mb-4 flex items-center gap-2 text-slate-900 dark:text-white uppercase tracking-tighter">
              <BiTrophy className="text-primary text-base md:text-xl" />
              Prize Distribution
            </h3>
            <div className="space-y-3">
              {prizes.map((prize) => (
                <div
                  key={prize.rank}
                  className="flex items-center justify-between p-2 md:p-3 rounded-lg bg-slate-900/5 dark:bg-white/5 border border-slate-200 dark:border-white/10"
                >
                  <div className="flex items-center gap-2 md:gap-3">
                    <span
                      className={`${prize.color} font-black italic text-sm md:text-lg`}
                    >
                      {prize.rank}
                    </span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      {prize.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ZASymbol className="text-sm scale-90" />
                    <span className="font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                      {prize.amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
              <div className="text-center pt-2">
                <p className="text-[10px] text-slate-500 italic uppercase font-bold">
                  Top 5 split the Net Prize Pool (
                  {game.platform_fee_percentage || 10}% fee applied)
                </p>
              </div>
            </div>
          </div>

          {/* Metadata Section */}
          <div className="bg-white dark:bg-black/20 rounded-xl border border-slate-200 dark:border-white/10 p-2 md:p-5">
            <h3 className="text-sm md:text-lg font-black italic mb-4 flex items-center gap-2 text-slate-900 dark:text-white uppercase tracking-tighter">
              <Info className="text-primary" />
              Arena Details
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-xs py-2 border-b border-white/5 uppercase font-bold tracking-widest">
                <span className="dark:text-slate-400">Category</span>
                <span className="text-white">{game.category}</span>
              </div>
              <div className="flex justify-between text-xs py-2 border-b border-white/5 uppercase font-bold tracking-widest">
                <span className="dark:text-slate-400">Difficulty</span>
                <span className="text-yellow-500">{game.difficulty}</span>
              </div>
              <div className="flex justify-between text-xs py-2 border-b border-white/5 uppercase font-bold tracking-widest">
                <span className="dark:text-slate-400">Duration</span>
                <span className="text-white">{game.duration_seconds}s</span>
              </div>
              <div className="flex justify-between text-xs py-2 uppercase font-bold tracking-widest">
                <span className="dark:text-slate-400">Platform</span>
                <div className="flex gap-2 text-white">
                  <Laptop size={14} />
                  <Smartphone size={14} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-primary/5 dark:bg-primary/10 rounded-xl border border-primary/20 p-2 md:p-5">
            <div className="flex items-start gap-2 md:gap-4">
              <div className="p-2 bg-primary rounded-lg text-background-dark">
                <MdSupportAgent />
              </div>
              <div>
                <h4 className=" font-bold text-sm uppercase">Arena Support</h4>
                <p className="text-[10px] text-slate-600 dark:text-slate-400 mb-3 font-medium">
                  Support agents are active for this tournament session.
                </p>
                <button className="text-[10px] font-black text-primary flex items-center gap-1 md:hover:underline uppercase tracking-widest">
                  Live Chat <MdArrowForward className="text-xs" />
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
