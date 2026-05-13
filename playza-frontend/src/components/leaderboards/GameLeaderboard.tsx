import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ZASymbol } from "@/components/currency/ZASymbol";
import { useMemo, useState, useEffect } from "react";

import { MdKeyboardArrowDown } from "react-icons/md";
import { useAuth, type UserProfile } from "@/context/auth";
import Search from "@/components/Search";
import {
  useGames,
  useGameSessions,
  useSessionLeaderboard,
} from "@/hooks/gamesession/useGameSession";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import type { Game } from "@/types/types";
import { calculateDistributionCurve } from "@/utils/payoutDistribution";

interface Session {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  status: string;
  pool_amount: number;
  entry_fee: number;
}

interface LeaderboardEntry {
  id: string;
  user_id: string;
  best_score: number;
  attempts: number;
  users: {
    username: string;
    avatar_url: string;
  };
}

function GameSessionsList({
  gameId,
  selectedSessionId,
  onSelectSession,
}: {
  gameId: string;
  selectedSessionId: string | null;
  onSelectSession: (
    id: string,
    pool: number,
    fee: number,
    title?: string,
  ) => void;
}) {
  const { data, isLoading } = useGameSessions(gameId);
  const sessions = data?.sessions || [];

  useEffect(() => {
    if (sessions.length > 0 && !selectedSessionId) {
      const activeSession =
        sessions.find((s: Session) => {
          const now = new Date().getTime();
          const start = new Date(s.start_time).getTime();
          const end = new Date(s.end_time).getTime();
          return now >= start && now <= end;
        }) || sessions[0];

      onSelectSession(
        activeSession.id,
        activeSession.pool_amount,
        activeSession.entry_fee,
        activeSession.title,
      );
    }
  }, [sessions, selectedSessionId, onSelectSession]);

  if (isLoading)
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );

  return (
    <div className="flex flex-col gap-2 bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-xl p-2 max-h-60 overflow-y-auto custom-scrollbar shadow-xl">
      {sessions.map((session: Session) => (
        <button
          key={session.id}
          onClick={() =>
            onSelectSession(
              session.id,
              session.pool_amount,
              session.entry_fee,
              session.title,
            )
          }
          className={`flex flex-col text-left px-4 py-3 rounded-lg transition-colors ${
            selectedSessionId === session.id
              ? "bg-primary/20 border border-primary/50"
              : "bg-white/5 border border-transparent hover:bg-white/10"
          }`}
        >
          <div className="flex justify-between items-center w-full">
            <span className="font-black uppercase text-sm text-white">
              {session.title || "Standard Tournament"}
            </span>
            <span
              className={`text-[10px] px-2 py-1 rounded font-bold uppercase tracking-widest ${
                session.status === "active"
                  ? "bg-green-500/20 text-green-400"
                  : session.status === "upcoming"
                    ? "bg-blue-500/20 text-blue-400"
                    : "bg-white/10 text-slate-400"
              }`}
            >
              {session.status}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
            {format(new Date(session.start_time), "MMM dd, yyyy")}
          </span>
        </button>
      ))}
    </div>
  );
}

function SessionLeaderboardTable({
  sessionId,
  user,
  prizePool = 0,
  entryFee = 100,
  platformFeePercent = 10,
}: {
  sessionId: string;
  user: UserProfile | null;
  prizePool?: number;
  entryFee?: number;
  platformFeePercent?: number;
}) {
  const { data, isLoading } = useSessionLeaderboard(sessionId);
  const leaderboardData = data?.leaderboard || [];

  const netPool = prizePool * (1 - platformFeePercent / 100);
  const estimatedPlayers =
    entryFee > 0 ? Math.max(1, Math.floor(prizePool / entryFee)) : 1;
  const distributionCurve = calculateDistributionCurve(estimatedPlayers);

  if (isLoading)
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );

  return (
    <div className="overflow-hidden rounded-xl border border-white/5 shadow-2xl">
      <Table
        className={
          !user ? "opacity-50 grayscale select-none pointer-events-none" : ""
        }
      >
        <TableHeader>
          <TableRow className="bg-white/5 border-b-white/10 hover:bg-white/5">
            <TableHead className="w-16 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
              Rank
            </TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Player
            </TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Score
            </TableHead>
            <TableHead className="text-right text-[10px] font-black uppercase tracking-widest text-slate-400">
              Reward
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leaderboardData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-48 text-center">
                <div className="flex flex-col items-center gap-3 py-10 opacity-40">
                  <div className="size-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                    <span className="text-xl">🏆</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white">
                      Untapped Glory
                    </p>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">
                      No participants have claimed their rank in this session
                      yet.
                    </p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            leaderboardData.map((player: LeaderboardEntry, index: number) => {
              const rank = index + 1;

              const isMe = player.user_id === user?.id;
              return (
                <TableRow
                  key={player.id}
                  className={`${isMe ? "bg-primary/10" : ""} border-b-white/5 hover:bg-white/5`}
                >
                  <TableCell className="text-center">
                    <div
                      className={`size-8 mx-auto flex items-center justify-center rounded-lg font-black text-xs ${
                        rank === 1
                          ? "bg-yellow-400 text-black"
                          : rank === 2
                            ? "bg-slate-300 text-black"
                            : rank === 3
                              ? "bg-orange-400 text-black"
                              : "bg-white/5 text-slate-400"
                      }`}
                    >
                      {rank}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 bg-slate-800">
                        <img
                          src={
                            player.users?.avatar_url || "/default-avatar.png"
                          }
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span
                        className={`font-bold text-xs ${isMe ? "text-primary" : "text-slate-200"}`}
                      >
                        {player.users?.username} {isMe && "(You)"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-black text-xs text-white">
                    {player.best_score.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {distributionCurve &&
                    rank <= distributionCurve.length &&
                    netPool > 0 ? (
                      <div className="flex items-center justify-end gap-1 text-primary">
                        <ZASymbol className="text-[10px] scale-75" />
                        <span className="font-black text-xs">
                          {(
                            distributionCurve[rank - 1] * netPool
                          ).toLocaleString(undefined, {
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">
                        {player.attempts} Attempts
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function GameLeaderboard() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null,
  );
  const [isSessionDropdownOpen, setIsSessionDropdownOpen] = useState(false);
  const [selectedSessionTitle, setSelectedSessionTitle] = useState<
    string | null
  >(null);
  const [selectedSessionPool, setSelectedSessionPool] = useState<number>(0);
  const [selectedSessionEntryFee, setSelectedSessionEntryFee] =
    useState<number>(100);

  const { data: gamesData, isLoading: gamesLoading } = useGames();
  const allGames = gamesData?.games || [];

  const filteredGames = useMemo(() => {
    let games = allGames.filter((g: Game) => g.mode?.toLowerCase() === "arena");
    if (!searchQuery) return games;
    return games.filter((g: Game) =>
      g.title.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [allGames, searchQuery]);

  const activeGameId = useMemo(() => {
    if (filteredGames.length === 0) return null;
    if (
      selectedGameId &&
      filteredGames.some((g: Game) => g.id === selectedGameId)
    ) {
      return selectedGameId;
    }
    return filteredGames[0].id;
  }, [filteredGames, selectedGameId]);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="mb-4 space-y-3">
        <div className="max-w-md">
          <Search
            placeholder="Search by game name..."
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>
      </div>

      <div className="overflow-auto custom-scrollbar flex-1 space-y-4">
        {gamesLoading ? (
          <div className="py-20 flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Loading Games...
            </p>
          </div>
        ) : filteredGames.length === 0 ? (
          <div className="py-32 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full" />
              <div className="relative size-20 bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-2xl flex items-center justify-center shadow-2xl">
                <span className="text-4xl opacity-50">📡</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-black text-white uppercase tracking-tighter italic">
                No Active Signal
              </p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                No records found for "{searchQuery}"
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex overflow-x-auto custom-scrollbar gap-2 pb-2">
              {filteredGames.map((game: Game) => (
                <button
                  key={game.id}
                  onClick={() => {
                    if (activeGameId === game.id) {
                      setIsSessionDropdownOpen(!isSessionDropdownOpen);
                    } else {
                      setSelectedGameId(game.id);
                      setSelectedSessionId(null);
                      setIsSessionDropdownOpen(true);
                    }
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border whitespace-nowrap transition-all ${
                    activeGameId === game.id
                      ? "bg-primary border-primary text-black"
                      : "bg-white/5 border-white/10 text-slate-400 hover:border-primary/50 hover:text-white"
                  }`}
                >
                  <img
                    src={game.thumbnail_url || game.thumbnail}
                    alt={game.title}
                    className="w-6 h-6 rounded-md object-cover"
                  />
                  <span className="font-black text-xs uppercase italic tracking-tighter">
                    {game.title}
                  </span>
                  {activeGameId === game.id && (
                    <MdKeyboardArrowDown
                      className={`transition-transform duration-200 ${isSessionDropdownOpen ? "rotate-180" : ""}`}
                      size={16}
                    />
                  )}
                </button>
              ))}
            </div>

            {activeGameId && (
              <div
                className={
                  isSessionDropdownOpen
                    ? "animate-in slide-in-from-top-2 fade-in duration-200 block"
                    : "hidden"
                }
              >
                <GameSessionsList
                  gameId={activeGameId}
                  selectedSessionId={selectedSessionId}
                  onSelectSession={(id, pool, fee, title) => {
                    setSelectedSessionId(id);
                    setSelectedSessionPool(pool);
                    setSelectedSessionEntryFee(fee || 100);
                    setSelectedSessionTitle(title || "Standard Tournament");
                    setIsSessionDropdownOpen(false);
                  }}
                />
              </div>
            )}

            {activeGameId && selectedSessionId && (
              <div className="glass-card rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden">
                <div className="px-1 py-4 md:py-6 bg-slate-50/50 dark:bg-black/20">
                  <div className="mb-4">
                    <h3 className="text-sm md:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                      {selectedSessionTitle} Leaderboard
                    </h3>
                  </div>
                  <SessionLeaderboardTable
                    sessionId={selectedSessionId}
                    user={user}
                    prizePool={selectedSessionPool}
                    entryFee={selectedSessionEntryFee}
                    platformFeePercent={
                      filteredGames.find((g: Game) => g.id === activeGameId)
                        ?.platform_fee_percentage || 10
                    }
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default GameLeaderboard;
