import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
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
import { useAuth } from "@/context/auth";

type Tab = "sessions" | "about" | "rules";

const Game = () => {
  const { id: slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("sessions");
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  const game = games.find((g) => g.slug === slug);

  useEffect(() => {
    if (slug === "chess-masters") {
      navigate("/h2h", { replace: true });
    }
  }, [slug, navigate]);

  if (slug === "chess-masters") return null;

  if (!game) {
    return (
      <div className="flex-1 flex items-center justify-center text-white">
        Game not found
      </div>
    );
  }

  const prizePool = calculatePrizePool(
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
    <main className="flex-1 space-y-6 pb-24 md:pb-10">
      <GameHero game={game} prizePool={prizePool} />

      <div className="flex border-b border-slate-200 dark:border-white/10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold transition-colors relative ${
              activeTab === tab.id
                ? "text-primary"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />
            )}
          </button>
        ))}
      </div>

      {activeTab === "sessions" && (
        <SessionsTab
          sessions={MOCK_SESSIONS}
          onJoin={handleJoinSession}
          gameTitle={game.title }
        />
      )}
      {activeTab === "about" && <AboutGameTab  />}
      {activeTab === "rules" && <RulesTab  />}

      {selectedSession && (
        <EntryConfirmationModal
          session={selectedSession}
          userBalance={user?.pzaPoints || 0}
          onConfirm={handleConfirmEntry}
          onClose={() => setSelectedSession(null)}
        />
      )}
    </main>
  );
};

export default Game;
