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

    useEffect(() => {
        if (!roomId || !room || room.status === 'finished') return;

        const interval = setInterval(() => {
            fetchRoom(true); 
        }, 2000);

        return () => clearInterval(interval);
    }, [roomId, room?.status, fetchRoom, room]);

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

    if (!roomId) {
        return (
            <div className="relative min-h-[50vh]">
                <H2HLobby 
                    onCreate={handleCreateRoom} 
                    onJoin={handleJoinRoom} 
                    loading={loading}
                />
            </div>
        );
    }

    if (!room) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    switch (room.status) {
        case 'waiting':
            return <WaitingRoom room={room} />;
        case 'active':
            return <H2HArena room={room} user={user} />;
        case 'finished':
            return <H2HWinner room={room} user={user} />;
        default:
            return <H2HLobby onCreate={handleCreateRoom} onJoin={handleJoinRoom} loading={loading} />;
    }
};

export default H2HZone;
