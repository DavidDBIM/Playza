import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import H2HLobby from '@/components/h2h/H2HLobby';
import H2HWaitingRoom from '@/components/h2h/H2HWaitingRoom';
import ChessArena from '@/components/h2h/chess/ChessArena';
import SpeedBattleArena from '@/components/h2h/speed-battle/SpeedBattleArena';
import WordScrambleArena from '@/components/h2h/word-scramble/WordScrambleArena';
import H2HWinner from '@/components/h2h/H2HWinner';
import * as chessApi from '@/api/chess.api';
import { speedBattleApi } from '@/api/speedbattle.api';
import { wordScrambleApi } from '@/api/wordscramble.api';
import { useAuth } from '@/context/auth';
import type { UserProfile } from '@/context/auth';
import { useToast } from '@/context/toast';

const H2HZone = () => {
    const toast = useToast();
    const { gameType = 'chess', roomId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth() as { user: UserProfile | null };
    const [room, setRoom] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);

    const getApi = useCallback(() => {
        if (gameType === 'speed-battle') return speedBattleApi;
        if (gameType === 'word-scramble') return wordScrambleApi;
        return chessApi;
    }, [gameType]);

    const fetchRoom = useCallback(async (isPoll = false) => {
        if (!roomId) return;
        try {
            const data = await (gameType === 'chess' 
                ? chessApi.getChessRoom(roomId)
                : (getApi() as any).getRoom(roomId));
            setRoom(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Connection lost";
            console.warn("[H2HZone] Sync error:", errorMessage);
            
            // Only redirect if it's the INITIAL load and it's not a poll
            // We use a functional update style or just check if roomId is set but room is null
            if (!isPoll) {
                setRoom(prev => {
                    if (!prev) {
                        toast.error("Failed to enter warzone. Returning to lobby.");
                        navigate(`/h2h/${gameType}`);
                    }
                    return prev;
                });
            }
        }
    }, [roomId, navigate, toast, gameType, getApi]);

    useEffect(() => {
        if (roomId) {
            fetchRoom();
        } else {
            setRoom(null);
        }
    }, [roomId, fetchRoom]);

    const roomStatus = room?.status;
    const hasRoom = !!room;

    useEffect(() => {
        if (!roomId || !hasRoom || roomStatus === 'finished') return;
        const interval = setInterval(() => fetchRoom(true), 2000);
        return () => clearInterval(interval);
    }, [roomId, hasRoom, roomStatus, fetchRoom]);

    const handleCreateRoom = async (stake: number) => {
        setLoading(true);
        try {
            const data = await (gameType === 'chess'
                ? chessApi.createChessRoom(stake)
                : (getApi() as any).createRoom(stake));
            navigate(`/h2h/${gameType}/${data.room_id || data.id}`);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to create room";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleJoinRoom = async (code: string) => {
        setLoading(true);
        try {
            const data = await (gameType === 'chess'
                ? chessApi.joinChessRoom(code)
                : (getApi() as any).joinRoom(code));
            navigate(`/h2h/${gameType}/${data.room_id || data.id}`);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to join room";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleQuickMatch = async (stake: number) => {
        setLoading(true);
        try {
            const data = await (gameType === 'chess'
                ? chessApi.findQuickMatch(stake)
                : (getApi() as any).findQuickMatch(stake));
            navigate(`/h2h/${gameType}/${data.room_id || data.id}`, { state: { quickMatch: true } });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Matchmaking failed";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBotRoom = async (stake: number) => {
        setLoading(true);
        try {
            const data = gameType === 'chess' 
                ? await chessApi.createBotRoom(stake)
                : await (getApi() as any).createRoom(stake, true, 'medium'); // speed battle and word scramble
            navigate(`/h2h/${gameType}/${data.room_id || data.id}`);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to start solo match";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
      <div className="relative flex-1 min-w-0 overflow-x-hidden scrollbar-hide">
        {/* Subtle Ambient Background - Optimized for Performance */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-linear-to-br from-indigo-500/5 via-transparent to-purple-500/5 opacity-50"></div>
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[80px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[80px]"></div>
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] mix-blend-overlay"></div>
        </div>

        <main className="relative z-10 transition-all duration-500">
          {!roomId ? (
            <H2HLobby
              onCreate={handleCreateRoom}
              onBotCreate={handleCreateBotRoom}
              onJoin={handleJoinRoom}
              onQuickMatch={handleQuickMatch}
              getWaitingRooms={gameType === 'chess' ? chessApi.getWaitingRooms : async () => []}
              loading={loading}
            />
          ) : !room ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 animate-in fade-in duration-500">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full animate-ping"></div>
                <div className="relative animate-spin rounded-xl h-12 w-12 border-b-2 border-indigo-500" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-black uppercase tracking-widest italic text-indigo-400">
                  Loading Warzone
                </h3>
                <p className="text-slate-500 text-xs mt-1 uppercase font-bold tracking-widest">
                  Preparing your battle room...
                </p>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in duration-500">
              {(() => {
                switch (room.status) {
                  case "waiting":
                    return <H2HWaitingRoom room={room} />;
                  case "active":
                    if (gameType === 'speed-battle') return <SpeedBattleArena key={room.id} room={room} />;
                    if (gameType === 'word-scramble') return <WordScrambleArena key={room.id} room={room} />;
                    return <ChessArena key={room.id} room={room} user={user} />;
                  case "finished":
                    return <H2HWinner room={room} user={user} />;
                  default:
                    return (
                      <H2HLobby
                        onCreate={handleCreateRoom}
                        onBotCreate={handleCreateBotRoom}
                        onJoin={handleJoinRoom}
                        onQuickMatch={handleQuickMatch}
                        getWaitingRooms={gameType === 'chess' ? chessApi.getWaitingRooms : async () => []}
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
