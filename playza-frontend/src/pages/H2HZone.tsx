import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import H2HLobby from '@/components/h2h/H2HLobby';
import H2HWaitingRoom from '@/components/h2h/H2HWaitingRoom';
import ChessArena from '@/components/h2h/chess/ChessArena';
import SpeedBattleArena from '@/components/h2h/speed-battle/SpeedBattleArena';
import WordScrambleArena from '@/components/h2h/word-scramble/WordScrambleArena';
import PoolArena from '@/components/h2h/pool/PoolArena';
import ArenaDuel from '@/components/h2h/arena-duel/ArenaDuel';
import * as chessApi from '@/api/chess.api';
import { poolApi } from '@/api/poolApi';
import { useH2HRoom, useH2HMutations, type GameType } from '@/hooks/h2h/useH2H';
import { useAuth } from '@/context/auth';
import type { PoolRoom } from '@/components/h2h/pool/game/pool/types';
import type { UserProfile } from '@/context/auth';
import { useToast } from '@/context/toast';
import type { ChessRoom } from '@/types/chess';

const H2HZone = () => {
  const toast = useToast();
  const { gameType = "chess", roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth() as { user: UserProfile | null };
  const currentType = gameType as GameType;

  // Use the new TanStack query hook for the room state
  const { data: room, isError } = useH2HRoom(roomId, currentType);
  const { createRoom, createBotRoom, joinRoom, quickMatch } = useH2HMutations(currentType);

  useEffect(() => {
    if (isError && !room) {
      toast.error("Failed to enter warzone. Returning to lobby.");
      navigate(`/h2h/${gameType}`);
    }
  }, [isError, room, navigate, gameType, toast]);

  const handleCreateRoom = async (stake: number) => {
    try {
      if (gameType === "arena-duel") {
        navigate(`/h2h/${gameType}/match-local`);
        return;
      }
      const data = await createRoom.mutateAsync(stake) as { room_id?: string; id?: string };
      navigate(`/h2h/${gameType}/${data.room_id || data.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create room");
    }
  };

  const handleJoinRoom = async (code: string) => {
    try {
      const data = await joinRoom.mutateAsync(code) as { room_id?: string; id?: string };
      navigate(`/h2h/${gameType}/${data.room_id || data.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to join room");
    }
  };

  const handleQuickMatch = async (stake: number) => {
    try {
      const data = await quickMatch.mutateAsync(stake) as { room_id?: string; id?: string };
      navigate(`/h2h/${gameType}/${data.room_id || data.id}`, {
        state: { quickMatch: true },
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Matchmaking failed");
    }
  };

  const handleCreateBotRoom = async (stake: number) => {
    try {
      if (gameType === "arena-duel") {
        navigate(`/h2h/${gameType}/match-bot`);
        return;
      }
      const data = await createBotRoom.mutateAsync(stake) as { room_id?: string; id?: string };
      navigate(`/h2h/${gameType}/${data.room_id || data.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to start solo match");
    }
  };

  const loading = createRoom.isPending || createBotRoom.isPending || joinRoom.isPending || quickMatch.isPending;

  return (
    <div className="relative flex-1 min-w-0 overflow-x-hidden scrollbar-hide flex flex-col items-center px-2">
      {/* Subtle Ambient Background - Optimized for Performance */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-slate-50 dark:bg-slate-950">
        <div className="absolute inset-0 bg-linear-to-br from-indigo-500/3 to-purple-500/3" />
      </div>

      <main className="relative z-10 w-full">
        {!roomId ? (
          <H2HLobby
            onCreate={handleCreateRoom}
            onBotCreate={handleCreateBotRoom}
            onJoin={handleJoinRoom}
            onQuickMatch={handleQuickMatch}
            getWaitingRooms={
              gameType === "chess" ? chessApi.getWaitingRooms : 
              gameType === "pool" ? (poolApi.listRooms as unknown as () => Promise<ChessRoom[]>) :
              async () => []
            }
            loading={loading}
          />
        ) : (!room && gameType !== "arena-duel") ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
            <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <div className="text-center">
              <h3 className="text-[10px] md:text-sm lg:text-xl font-black uppercase tracking-widest italic text-indigo-500 dark:text-indigo-400">
                Loading Warzone
              </h3>
              <p className="text-slate-500 text-[10px] md:text-xs mt-1 uppercase font-bold tracking-widest">
                Preparing your battle room...
              </p>
            </div>
          </div>
        ) : (
          <div className="w-full">
            {(() => {
              if (gameType === "arena-duel" && !room) {
                return <ArenaDuel />;
              }
              switch (room.status) {
                case "waiting":
                  return (
                    <H2HWaitingRoom
                      room={
                        room as unknown as React.ComponentProps<
                          typeof H2HWaitingRoom
                        >["room"]
                      }
                    />
                  );
                case "active":
                case "finished":
                  if (gameType === "speed-battle")
                    return (
                      <SpeedBattleArena
                        key={room.id}
                        room={
                          room as unknown as React.ComponentProps<
                            typeof SpeedBattleArena
                          >["room"]
                        }
                      />
                    );
                  if (gameType === "word-scramble")
                    return (
                      <WordScrambleArena
                        key={room.id}
                        room={
                          room as unknown as React.ComponentProps<
                            typeof WordScrambleArena
                          >["room"]
                        }
                      />
                    );
                  if (gameType === "pool")
                    return (
                      <PoolArena
                        key={room.id}
                        room={room as unknown as PoolRoom}
                        user={user}
                      />
                    );
                  if (gameType === "arena-duel")
                    return (
                      <ArenaDuel key={room.id} />
                    );
                  return (
                    <ChessArena
                      key={room.id}
                      room={
                        room as unknown as React.ComponentProps<
                          typeof ChessArena
                        >["room"]
                      }
                      user={user}
                    />
                  );
                default:
                  return (
                    <H2HLobby
                      onCreate={handleCreateRoom}
                      onBotCreate={handleCreateBotRoom}
                      onJoin={handleJoinRoom}
                      onQuickMatch={handleQuickMatch}
                      getWaitingRooms={
                        gameType === "chess"
                          ? chessApi.getWaitingRooms :
                        gameType === "pool"
                          ? (poolApi.listRooms as unknown as () => Promise<ChessRoom[]>)
                          : async () => []
                      }
                      loading={loading}
                    />
                  );
              }
            })()}
          </div>
        )}
      </main>
    </div>
  );
};

export default H2HZone;
