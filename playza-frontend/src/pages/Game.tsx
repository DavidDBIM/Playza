import { useState } from "react";
import { useParams } from "react-router";
import { MdTimeline, MdInfo, MdRule } from "react-icons/md";
import { games } from "@/data/games";
import { calculatePrizePool } from "@/utils/calculatedPrizePool";
import { GameHero } from "@/components/gamePage/GameHero";
import { SessionsTab } from "@/components/gamePage/SessionsTab";
import { AboutGameTab } from "@/components/gamePage/AboutGameTab";
import { RulesTab } from "@/components/gamePage/RulesTab";
import { EntryConfirmationModal } from "@/components/gamePage/EntryConfirmationModal";
import { MOCK_SESSIONS } from "@/data/mockSessions";
import type { Session } from "@/types/types";

type Tab = "sessions" | "about" | "rules";

const Game = () => {
  const { id: slug } = useParams();
  const [activeTab, setActiveTab] = useState<Tab>("sessions");
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  const game = games.find((g) => g.slug === slug);

  if (!game) {
    return (
      <div className="flex-1 flex items-center justify-center text-white">
        Game not found
      </div>
    );
  }

  const pricePool = calculatePrizePool(
    game.entryFee,
    game.activePlayers,
    game.platformFeePercentage,
  );

  const handleJoinSession = (session: Session) => {
    setSelectedSession(session);
  };

  const handleConfirmEntry = () => {
    console.log("Joined session:", selectedSession?.id);
    setSelectedSession(null);
  };

  const tabs = [
    { id: "sessions", label: "Sessions", icon: MdTimeline },
    { id: "about", label: "About", icon: MdInfo },
    { id: "rules", label: "Rules", icon: MdRule },
  ];

  return (
    <div className="flex-1 min-h-screen pb-10 overflow-hidden">
      {/* Hero Header Area */}
      <GameHero game={game} pricePool={pricePool} />

      <div className="mx-auto container ">
        {/* Tabs Navigation - Modern Segmented Control */}
        <div className="flex  mb-10 md:mb-16 overflow-x-auto no-scrollbar scrollbar-hide">
          <div className="inline-flex p-1.5 bg-slate-100/50 dark:bg-white/5 backdrop-blur-3xl rounded-xl shadow-2xl">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`flex items-center gap-2 md:gap-3 px-6 md:px-10 py-3 md:py-4 rounded-lg md:rounded-xl text-[10px] md:text-sm font-black uppercase tracking-widest transition-all duration-300 relative whitespace-nowrap ${
                  activeTab === tab.id
                    ? "text-primary bg-white dark:bg-playza-dark/80 shadow-lg scale-[1.02]"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <tab.icon
                  className={`text-base md:text-xl transition-colors ${activeTab === tab.id ? "text-primary" : "text-slate-400"}`}
                />
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Tab Content Area */}
        <main className="relative max-w-7xl mx-auto">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div key={activeTab}>
              {activeTab === "sessions" && (
                <SessionsTab
                  gameTitle={game.title}
                  sessions={MOCK_SESSIONS}
                  onJoin={handleJoinSession}
                />
              )}

              {activeTab === "about" && <AboutGameTab />}

              {activeTab === "rules" && <RulesTab />}
            </div>
          </div>
        </main>
      </div>

      <EntryConfirmationModal
        session={selectedSession}
        userBalance={25000}
        onClose={() => setSelectedSession(null)}
        onConfirm={handleConfirmEntry}
      />
    </div>
  );
};

export default Game;
