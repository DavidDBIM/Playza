import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import { MdTimeline, MdInfo, MdRule } from "react-icons/md";
import { calculatePrizePool } from "@/utils/calculatedPrizePool";
import { GameHero } from "@/components/gamePage/GameHero";
import { SessionsTab } from "@/components/gamePage/SessionsTab";
import { AboutGameTab } from "@/components/gamePage/AboutGameTab";
import { RulesTab } from "@/components/gamePage/RulesTab";
import { EntryConfirmationModal } from "@/components/gamePage/EntryConfirmationModal";
import type { Session, Game as GameType } from "@/types/types";
import { useAuth } from "@/context/auth";
import {
  useGames,
  useGameSessions,
  useJoinSession,
} from "@/hooks/gamesession/useGameSession";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

type Tab = "sessions" | "about" | "rules";

const Game = () => {
  const { id: slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("sessions");
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  const { data: gamesData, isLoading: gamesLoading } = useGames();
  const joinMutation = useJoinSession();

  const game = useMemo(() => {
    const allGames = (gamesData?.games || gamesData?.result || (Array.isArray(gamesData) ? gamesData : [])) as GameType[];
    const found = allGames.find((g) => g.slug === slug);
    if (!found) return null;

    const mapped: GameType = {
      ...found,
      thumbnail:
        found.thumbnail_url || found.thumbnail || "/games/placeholder.png",
      status: found.is_active ? "live" : "coming soon",
      durationInSeconds: found.duration_seconds || 300,
      platformFeePercentage: Number(found.platform_fee_percentage || 10),
      entryFee: Number(found.entry_fee || 0),
      activePlayers: Number(found.unique_players || 0),
      ctaLabel: "Play Now",
      badge: null,
      createdAt: found.created_at || new Date().toISOString(),
      updatedAt: found.created_at || new Date().toISOString(),
      iframeUrl: found.iframe_url,
      controls: found.controls,
      rules: found.rules,
      scoring: found.scoring,
    };
    return mapped;
  }, [gamesData, slug]);

  const { data: sessionsData, isLoading: sessionsLoading } = useGameSessions(
    game?.id || "",
  );

  const sessions: Session[] = useMemo(() => {
    const rawSessions = sessionsData?.sessions || sessionsData?.result || sessionsData?.data || (Array.isArray(sessionsData) ? sessionsData : []);
    return rawSessions.map((s: Session) => ({
      id: s.id,
      title: s.title,
      entryFee: Number(s.entryFee || s.entry_fee || 0),
      playersJoined: s.playersJoined || 0,
      maxPlayers: s.maxPlayers || s.max_players || 0,
      prizePool: s.prizePool || s.pool_amount?.toString() || "0",
      startTime: s.startTime || s.start_time || "",
      endTime: s.endTime || s.end_time || "",
      status: s.status,
      type: s.type,
      winnersCount: s.winnersCount || s.winners_count,
    }));
  }, [sessionsData]);

  useEffect(() => {
    if (selectedSession) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedSession]);

  useEffect(() => {
    if (slug === "chess-masters") navigate("/h2h", { replace: true });
    if (slug === "speed-battle") navigate("/speed-battle", { replace: true });
    if (slug === "word-scramble") navigate("/word-scramble", { replace: true });
    if (slug === "8-ball-pool") navigate("/h2h/pool", { replace: true });
  }, [slug, navigate]);

  if (
    slug === "chess-masters" ||
    slug === "speed-battle" ||
    slug === "word-scramble" ||
    slug === "8-ball-pool"
  )
    return null;

  if (gamesLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-white gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">
          Calibrating Game Engine...
        </p>
      </div>
    );
  }

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

  const handleJoinSession = () => {
    // Navigate directly to the match session page instead of opening the modal here
    navigate(`/games/${slug}/session`);
  };

  const handleConfirmEntry = async () => {
    if (!selectedSession) return;

    try {
      await joinMutation.mutateAsync(selectedSession.id);
      toast.success("Successfully joined the tournament!");
      navigate(`/games/${slug}/session`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to join session";
      toast.error(message);
    } finally {
      setSelectedSession(null);
    }
  };

  const tabs = [
    { id: "sessions", label: "Sessions", icon: MdTimeline },
    { id: "about", label: "About", icon: MdInfo },
    { id: "rules", label: "Rules", icon: MdRule },
  ];

  return (
    <main className="flex-1 space-y-4 p-2 md:p-6 pb-24 md:pb-10">
      <GameHero game={game} prizePool={prizePool} sessions={sessions} onJoin={handleJoinSession} />

      <div className="flex border-b border-slate-200 dark:border-white/10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={`flex items-center gap-2 px-4 py-3 text-[10px] md:text-sm font-bold relative ${
              activeTab === tab.id
                ? "text-primary"
                : "text-slate-500 md:hover:text-slate-900 md:dark:hover:text-white"
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
          sessions={sessions}
          onJoin={handleJoinSession}
          gameTitle={game.title}
          isLoading={sessionsLoading}
        />
      )}
      {activeTab === "about" && <AboutGameTab game={game} />}
      {activeTab === "rules" && <RulesTab game={game} />}

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
