import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import H2HLobby from '@/components/h2h/H2HLobby';
import WaitingRoom from '@/components/h2h/WaitingRoom';
import H2HArena from '@/components/h2h/H2HArena';
import H2HWinner from '@/components/h2h/H2HWinner';
import { createChessRoom, joinChessRoom, getChessRoom } from '@/api/chess.api';
import { useAuth } from '@/context/auth';
import type { ChessRoom } from '@/types/chess';
import type { UserProfile } from '@/context/auth';
import { useToast } from '@/context/toast';

const H2HZone = () => {
    const toast = useToast();
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth() as { user: UserProfile | null };
    const [room, setRoom] = useState<ChessRoom | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchRoom = useCallback(async (isPoll = false) => {
        if (!roomId) return;
        try {
            const data = await getChessRoom(roomId);
            setRoom(data);
        } catch (err) {
            if (!isPoll) {
                const errorMessage = err instanceof Error ? err.message : "Failed to load room";
                toast.error(errorMessage);
                navigate('/h2h');
            }
        }
    }, [roomId, navigate, toast]);

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
            const data = await createChessRoom(stake);
            navigate(`/h2h/${data.room_id}`);
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
            const data = await joinChessRoom(code);
            navigate(`/h2h/${data.room_id}`);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to join room";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-black text-white overflow-x-hidden">
            {/* Ambient Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse [animation-delay:2s]"></div>
                <div className="absolute top-[20%] right-[-5%] w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-[100px] animate-pulse [animation-delay:4s]"></div>
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay"></div>
            </div>

            <main className="relative z-10 p-4 md:p-8 transition-all duration-500">
                {!roomId ? (
                    <H2HLobby
                        onCreate={handleCreateRoom}
                        onJoin={handleJoinRoom}
                        loading={loading}
                    />
                ) : !room ? (
                    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 animate-in fade-in zoom-in duration-500">
                        <div className="relative">
                            <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full animate-ping"></div>
                            <div className="relative animate-spin rounded-[2rem] h-12 w-12 border-b-2 border-indigo-500" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-black uppercase tracking-widest italic text-indigo-400">Loading Warzone</h3>
                            <p className="text-slate-500 text-xs mt-1 uppercase font-bold tracking-widest">Preparing your battle room...</p>
                        </div>
                    </div>
                ) : (
                    <div className="animate-in fade-in duration-500">
                        {(() => {
                            switch (room.status) {
                                case 'waiting':
                                    return <WaitingRoom room={room} />;
                                case 'active':
                                    return <H2HArena key={room.id} room={room} user={user} />;
                                case 'finished':
                                    return <H2HWinner room={room} user={user} />;
                                default:
                                    return <H2HLobby onCreate={handleCreateRoom} onJoin={handleJoinRoom} loading={loading} />;
                            }
                        })()}
                    </div>
                )}
            </main>
        </div>
    );
};

export default H2HZone;
