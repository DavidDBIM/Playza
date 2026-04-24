import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { Trophy, Zap, Timer, Swords } from "lucide-react";
import * as soccerApi from "@/api/soccer.api";
import { useAuth } from "@/context/auth";
import { useToast } from "@/context/toast";
import { supabase } from "@/config/supabase";
import H2HWinner from "@/components/h2h/H2HWinner";
import SoccerGame, { TEAM_COLORS, type Difficulty, type GameMode } from "./SoccerGame";
import SoccerTournament from "./SoccerTournament";
import type { UserProfile } from "@/context/auth";

// ─── Types ────────────────────────────────────────────────────────────────────
interface SoccerRoom {
  id: string;
  code: string;
  stake: number;
  status: "waiting" | "active" | "finished" | "abandoned";
  host_id: string;
  guest_id: string | null;
  winner_id: string | null;
  game_state: any;
  host?: { id: string; username: string; avatar_url?: string | null };
  guest?: { id: string; username: string; avatar_url?: string | null };
  is_bot?: boolean;
  bot_difficulty?: Difficulty;
  game_mode?: GameMode;
  team0_name?: string;
  team1_name?: string;
  team0_color?: string;
  team1_color?: string;
}

interface SoccerArenaProps {
  room: SoccerRoom;
  user: UserProfile | null;
}

// ─── Team Setup Screen ────────────────────────────────────────────────────────
interface TeamSetupProps {
  onConfirm: (name: string, colorIdx: number) => void;
  existingTeamName?: string;
  existingColorIdx?: number;
  label: string;
}

const TeamSetup: React.FC<TeamSetupProps> = ({ onConfirm, label }) => {
  const [name, setName] = useState(TEAM_COLORS[0].name);
  const [colorIdx, setColorIdx] = useState(0);

  return (
    <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 space-y-5 max-w-sm mx-auto">
      <h3 className="text-white font-black text-lg uppercase tracking-widest text-center">{label}</h3>
      <div>
        <label className="text-gray-400 text-[10px] uppercase tracking-widest font-black block mb-2">Team Name</label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full bg-gray-800 border border-white/10 text-white rounded-xl px-4 py-3 font-black text-sm focus:outline-none focus:border-yellow-500"
          maxLength={20}
          placeholder="Enter team name..."
        />
      </div>
      <div>
        <label className="text-gray-400 text-[10px] uppercase tracking-widest font-black block mb-2">Team Colour</label>
        <div className="grid grid-cols-4 gap-2">
          {TEAM_COLORS.map((tc, i) => (
            <button
              key={i}
              onClick={() => { setColorIdx(i); if (!name || name === TEAM_COLORS[colorIdx].name) setName(tc.name); }}
              className={`h-10 rounded-xl border-2 transition-all ${colorIdx === i ? "border-yellow-400 scale-110" : "border-transparent"}`}
              style={{ backgroundColor: tc.primary }}
            />
          ))}
        </div>
        <p className="text-yellow-400 font-black text-[10px] uppercase tracking-widest mt-2 text-center">{TEAM_COLORS[colorIdx].name}</p>
      </div>
      <button
        onClick={() => onConfirm(name || TEAM_COLORS[colorIdx].name, colorIdx)}
        className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase tracking-widest py-3 rounded-xl transition-all text-sm active:scale-95"
      >
        ⚽ Ready!
      </button>
    </div>
  );
};

// ─── Mode Select ──────────────────────────────────────────────────────────────
interface ModeSelectProps {
  onSelect: (mode: GameMode) => void;
}

const ModeSelect: React.FC<ModeSelectProps> = ({ onSelect }) => {
  const modes: { mode: GameMode; icon: React.ReactNode; label: string; desc: string }[] = [
    { mode: "timed", icon: <Timer size={20} />, label: "5 Min Match", desc: "Most goals in 5 minutes wins" },
    { mode: "sudden-death", icon: <Zap size={20} />, label: "Sudden Death", desc: "First goal wins instantly" },
    { mode: "tournament", icon: <Trophy size={20} />, label: "Tournament", desc: "Create a bracket with real players & AI" },
  ];
  return (
    <div className="space-y-3">
      <h3 className="text-white font-black text-center uppercase tracking-widest text-lg">Select Mode</h3>
      {modes.map(({ mode, icon, label, desc }) => (
        <button
          key={mode}
          onClick={() => onSelect(mode)}
          className="w-full flex items-center gap-4 bg-gray-800 hover:bg-gray-700 border border-white/10 hover:border-yellow-500/40 rounded-xl p-4 transition-all group text-left"
        >
          <div className="text-yellow-400 group-hover:scale-110 transition-transform">{icon}</div>
          <div>
            <div className="text-white font-black text-sm uppercase tracking-wider">{label}</div>
            <div className="text-gray-400 text-[10px] uppercase tracking-widest">{desc}</div>
          </div>
        </button>
      ))}
    </div>
  );
};

// ─── Main Arena ───────────────────────────────────────────────────────────────
const SoccerArena: React.FC<SoccerArenaProps> = ({ room: initialRoom, user }) => {
  const toast = useToast();
  const navigate = useNavigate();
  const [room, setRoom] = useState(initialRoom);
  const [gamePhase, setGamePhase] = useState<"mode-select" | "team-setup" | "playing" | "finished" | "tournament">(
    initialRoom.is_bot ? "team-setup" : "mode-select"
  );
  const [gameMode, setGameMode] = useState<GameMode>(initialRoom.game_mode || "timed");
  const [myTeamName, setMyTeamName] = useState("My Team");
  const [myColorIdx, setMyColorIdx] = useState(0);
  const [localWinnerId, setLocalWinnerId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentScore, setCurrentScore] = useState<[number, number]>([0, 0]);

  const isHost = user?.id === room.host_id;
  const myTeam: 0 | 1 = isHost ? 0 : 1;
  const botDifficulty: Difficulty = room.bot_difficulty || "medium";

  // ── Real-time room subscription
  useEffect(() => {
    const channel = supabase
      .channel(`soccer-room-${room.id}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "soccer_rooms", filter: `id=eq.${room.id}` },
        payload => { setRoom(prev => ({ ...prev, ...payload.new })); }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [room.id]);

  // ── Auto start when room becomes active
  useEffect(() => {
    if (room.status === "active" && gamePhase === "team-setup") {
      setGamePhase("playing");
    }
  }, [room.status, gamePhase]);

  const handleModeSelect = (mode: GameMode) => {
    if (mode === "tournament") {
      setGameMode("tournament");
      setGamePhase("tournament");
    } else {
      setGameMode(mode);
      setGamePhase("team-setup");
    }
  };

  const handleTeamConfirm = (name: string, colorIdx: number) => {
    setMyTeamName(name);
    setMyColorIdx(colorIdx);
    setGamePhase("playing");
  };

  const handleGoal = useCallback((score: [number, number]) => {
    setCurrentScore(score);
  }, []);

  const handleGameOver = useCallback(async (score: [number, number], winner: 0 | 1 | null) => {
    setCurrentScore(score);
    const winnerId = winner === null ? null : winner === myTeam ? user?.id ?? null : (isHost ? room.guest_id : room.host_id);
    setLocalWinnerId(winnerId);
    setGamePhase("finished");
    if (room.id && !room.is_bot) {
      setIsSyncing(true);
      try {
        await soccerApi.finishGame(room.id, winnerId);
      } catch (err) {
        console.error("Failed to sync game result", err);
      } finally {
        setIsSyncing(false);
      }
    }
  }, [myTeam, user, isHost, room]);

  // ── Derive team info
  const hostColorIdx = room.team0_color ? parseInt(room.team0_color) : 0;
  const guestColorIdx = room.team1_color ? parseInt(room.team1_color) : 1;
  const team0Color = TEAM_COLORS[isHost ? myColorIdx : hostColorIdx]?.primary || "#e63946";
  const team1Color = TEAM_COLORS[isHost ? guestColorIdx : myColorIdx]?.primary || "#2196F3";
  const team0Name = isHost ? myTeamName : (room.team0_name || room.host?.username || "Team A");
  const team1Name = isHost ? (room.team1_name || room.guest?.username || "Team B") : myTeamName;

  if (gamePhase === "tournament") {
    return <SoccerTournament userId={user?.id || ""} username={user?.username || "Player"} />;
  }

  if (gamePhase === "mode-select") {
    return (
      <div className="w-full min-h-[60vh] flex items-center justify-center py-8">
        <div className="w-full max-w-sm px-4">
          <ModeSelect onSelect={handleModeSelect} />
        </div>
      </div>
    );
  }

  if (gamePhase === "team-setup") {
    return (
      <div className="w-full min-h-[60vh] flex items-center justify-center py-8">
        <div className="w-full max-w-sm px-4">
          <TeamSetup
            label="Your Team"
            onConfirm={handleTeamConfirm}
          />
        </div>
      </div>
    );
  }

  if (gamePhase === "finished") {
    return (
      <H2HWinner
        room={{ ...room, stake: room.stake, winner_id: room.winner_id || localWinnerId } as any}
        user={user}
        localWinnerId={localWinnerId}
        isSyncing={isSyncing}
      />
    );
  }

  return (
    <div className="w-full flex flex-col items-center pb-6">
      {/* Bot difficulty badge */}
      {room.is_bot && (
        <div className="mb-2 flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
          <Swords size={12} className="text-yellow-400" />
          <span className="text-yellow-400 font-black text-[10px] uppercase tracking-widest">
            vs AI · {botDifficulty}
          </span>
        </div>
      )}

      <SoccerGame
        myTeam={myTeam}
        team0Name={team0Name}
        team1Name={team1Name}
        team0Color={team0Color}
        team1Color={team1Color}
        isBot={!!room.is_bot}
        botDifficulty={botDifficulty}
        gameMode={gameMode}
        onGoal={handleGoal}
        onGameOver={handleGameOver}
        roomId={room.id}
        userId={user?.id}
      />

      {/* Score sync status */}
      {isSyncing && (
        <div className="mt-3 text-yellow-400 font-black text-[10px] uppercase tracking-widest animate-pulse">
          Syncing result...
        </div>
      )}
    </div>
  );
};

export default SoccerArena;
