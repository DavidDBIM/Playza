import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ZASymbol } from "@/components/currency/ZASymbol";
import { useMemo, useState } from "react";

import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
import { useAuth, type UserProfile } from "@/context/auth";
import Search from "@/components/Search";
import {
  useGames,
  useGameSessions,
  useSessionLeaderboard,
} from "@/hooks/gamesession/useGameSession";
import { Loader2, Calendar } from "lucide-react";
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

const GameLeaderboard = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedGameId, setExpandedGameId] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null,
  );
  const [selectedSessionPool, setSelectedSessionPool] = useState<number>(0);
  const [selectedSessionEntryFee, setSelectedSessionEntryFee] = useState<number>(100);

  const { data: gamesData, isLoading: gamesLoading } = useGames();
  const allGames = gamesData?.games || [];

  const filteredGames = useMemo(() => {
    if (!searchQuery) return allGames;
    return allGames.filter((g: Game) =>
      g.title.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [allGames, searchQuery]);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="mb-4 space-y-3">
        <div>
          <h2 className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-primary">
            Arena Global Rankings
          </h2>
          <p className="text-xs text-slate-500 font-bold mt-1">
            Select a game and session to view historical and live performance
            data.
          </p>
        </div>
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
                <p className="text-sm font-black text-white uppercase tracking-tighter italic">No Active Signal</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  No records found for "{searchQuery}"
                </p>
              </div>
          </div>
        ) : (
          filteredGames.map((game: Game) => (
            <div
              key={game.id}
              className="glass-card rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden"
            >
              {/* Game Header */}
              <button
                onClick={() =>
                  setExpandedGameId(expandedGameId === game.id ? null : game.id)
                }
                className="w-full flex items-center justify-between p-4 md:p-6 hover:bg-slate-50 dark:hover:bg-white/2 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10">
                    <img
                      src={game.thumbnail_url || game.thumbnail}
                      alt={game.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-left">
                     <h3 className="font-black text-lg text-slate-900 dark:text-white uppercase italic tracking-tighter">
                      {game.title}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      {game.category} • {game.difficulty}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden md:flex flex-col items-end">
                    <span className="text-[10px] font-black text-slate-400 uppercase">
                      Status
                    </span>
                    <span
                      className={`text-xs font-black uppercase ${game.is_active ? "text-primary" : "text-slate-500"}`}
                    >
                      {game.is_active ? "Online" : "Archived"}
                    </span>
                  </div>
                  {expandedGameId === game.id ? (
                    <MdKeyboardArrowUp size={24} />
                  ) : (
                    <MdKeyboardArrowDown size={24} />
                  )}
                </div>
              </button>

              {/* Sessions List */}
              {expandedGameId === game.id && (
                <div className="p-4 md:p-6 border-t border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-black/20">
                  <GameSessionsList
                    gameId={game.id}
                    selectedSessionId={selectedSessionId}
                    onSelectSession={(id, pool, fee) => {
                      setSelectedSessionId(id);
                      setSelectedSessionPool(pool);
                      setSelectedSessionEntryFee(fee || 100);
                    }}
                  />

                  {selectedSessionId && (
                    <div className="mt-8 animate-in fade-in slide-in-from-top-4 duration-500">
                      <SessionLeaderboardTable
                        sessionId={selectedSessionId}
                        user={user}
                        prizePool={selectedSessionPool}
                        entryFee={selectedSessionEntryFee}
                        platformFeePercent={game.platform_fee_percentage || 10}
                      />
                    </div>
                  )}

                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const GameSessionsList = ({
  gameId,
  selectedSessionId,
  onSelectSession,
}: {
  gameId: string;
  selectedSessionId: string | null;
  onSelectSession: (id: string, pool: number, fee: number) => void;
}) => {

  const { data, isLoading } = useGameSessions(gameId);
  const sessions = data?.sessions || [];

  if (isLoading)
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Calendar size={14} className="text-primary" />
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
          Available Sessions
        </h4>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {sessions.map((session: Session) => (
          <button
            key={session.id}
            onClick={() => onSelectSession(session.id, session.pool_amount, session.entry_fee)}
            className={`p-4 rounded-xl border transition-all text-left group ${

              selectedSessionId === session.id
                ? "bg-primary border-primary"
                : "bg-white/5 border-white/10 hover:border-primary/50"
            }`}
          >
            <h5
              className={`font-black text-sm uppercase italic tracking-tight ${selectedSessionId === session.id ? "text-black" : "text-white group-hover:text-primary"}`}
            >
              {session.title || "Standard Tournament"}
            </h5>
            <div className="flex justify-between items-end mt-2">
              <div
                className={`text-[9px] font-bold uppercase tracking-widest ${selectedSessionId === session.id ? "text-black/60" : "text-slate-500"}`}
              >
                {format(new Date(session.start_time), "MMM dd")}
              </div>
              <span
                className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                  session.status === "active"
                    ? "bg-rose-500 text-white"
                    : "bg-slate-500/20 text-slate-400"
                }`}
              >
                {session.status}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

const SessionLeaderboardTable = ({
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
}) => {

  const { data, isLoading } = useSessionLeaderboard(sessionId);
  const leaderboardData = data?.leaderboard || [];

  const netPool = prizePool * (1 - platformFeePercent / 100);
  const estimatedPlayers = entryFee > 0 ? Math.max(1, Math.floor(prizePool / entryFee)) : 1;
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
              <TableCell
                colSpan={4}
                className="h-48 text-center"
              >
                <div className="flex flex-col items-center gap-3 py-10 opacity-40">
                   <div className="size-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                      <span className="text-xl">🏆</span>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-white">Untapped Glory</p>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">No participants have claimed their rank in this session yet.</p>
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
                    {distributionCurve && rank <= distributionCurve.length && netPool > 0 ? (
                      <div className="flex items-center justify-end gap-1 text-primary">
                        <ZASymbol className="text-[10px] scale-75" />
                        <span className="font-black text-xs">
                          {(distributionCurve[rank - 1] * netPool).toLocaleString(undefined, { maximumFractionDigits: 2 })}
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
};

export default GameLeaderboard;
