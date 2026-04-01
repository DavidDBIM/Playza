import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { Zap, Swords, Trophy } from 'lucide-react';
import { getWaitingRooms } from '@/api/chess.api';
import H2HLobbySkeleton from '../../skeletons/H2HLobbySkeleton';
import type { ChessRoom } from '@/types/chess';

// Extracted Components
import LobbyHub from '../LobbyHub';
import GameModeModal from '../GameModeModal';
import QuickMatchView from './QuickMatchView';
import BotMatchView from './BotMatchView';
import InviteFriendView from './InviteFriendView';
import ActionConfirmationModal from '../ActionConfirmationModal';

interface ChessLobbyProps {
  onCreate: (stake: number) => void;
  onBotCreate: (stake: number) => void;
  onJoin: (code: string) => void;
  onQuickMatch: (stake: number) => void;
  loading: boolean;
}

interface GameType {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  players: string;
  color: string;
  comingSoon?: boolean;
}

const ChessLobby = ({ onCreate, onBotCreate, onJoin, onQuickMatch, loading }: ChessLobbyProps) => {
  const navigate = useNavigate();
  const [view, setView] = useState<'hub' | 'quick' | 'invite' | 'bot'>('hub');
  const [stakeValue, setStakeValue] = useState(100);
  const [customStake, setCustomStake] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [isFinding, setIsFinding] = useState(false);
  const [selectedGame, setSelectedGame] = useState<GameType | null>(null);
  const [inviteMobileTab, setInviteMobileTab] = useState<"create" | "join" | null>(null);
  const [publicRooms, setPublicRooms] = useState<ChessRoom[]>([]);
  const [quickViewMode, setQuickViewMode] = useState<'list' | 'create'>('list');
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [confirmingAction, setConfirmingAction] = useState<{ type: 'create' | 'join' | 'quick' | 'bot', stake: number, code?: string } | null>(null);

  const fetchPublicRooms = useCallback(async () => {
    setLoadingRooms(true);
    try {
      const rooms = await getWaitingRooms();
      setPublicRooms(rooms);
      setQuickViewMode(rooms.length === 0 ? 'create' : 'list');
    } catch (err) {
      console.error("Failed to fetch public rooms", err);
      setQuickViewMode('create');
    } finally {
      setLoadingRooms(false);
    }
  }, []);

  useEffect(() => {
    if (view === 'quick') {
      fetchPublicRooms();
    }
  }, [view, fetchPublicRooms]);

  const handleQuickMatch = () => {
    const finalStake = customStake ? parseInt(customStake) : stakeValue;
    setConfirmingAction({ type: 'quick', stake: finalStake });
  };

  const handleBotMatch = () => {
    const finalStake = customStake ? parseInt(customStake) : stakeValue;
    setConfirmingAction({ type: 'bot', stake: finalStake });
  };

  const handleCreateChallenge = () => {
    const finalStake = customStake ? parseInt(customStake) : 100;
    setConfirmingAction({ type: 'create', stake: finalStake });
  };

  const executeConfirmedAction = async () => {
    if (!confirmingAction) return;
    const { type, stake, code } = confirmingAction;
    setConfirmingAction(null);
    
    setIsFinding(true);
    try {
      if (type === 'create') await onCreate(stake);
      if (type === 'bot') await onBotCreate(stake);
      if (type === 'quick') await onQuickMatch(stake);
      if (type === 'join' && code) await onJoin(code);
    } finally {
      setIsFinding(false);
    }
  };

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinCode.length === 6) {
      setConfirmingAction({ type: 'join', stake: 0, code: joinCode.toUpperCase() });
    }
  };

  const addStake = (amount: number) => {
    const current = customStake === '' ? 0 : parseInt(customStake);
    setCustomStake((current + amount).toString());
  };

  const isBtnLoading = loading || isFinding;

  const games: GameType[] = [
    { id: 'chess', name: 'Grand Chess', icon: Swords, players: '2.4k', color: 'from-indigo-500 to-purple-600' },
    { id: 'speed-battle', name: 'Speed Battle', icon: Zap, players: '1.2k', color: 'from-blue-500 to-indigo-600' },
    { id: 'word-scramble', name: 'Word Scramble', icon: Trophy, players: '900', color: 'from-purple-500 to-pink-600' },
    { id: 'ludo', name: 'Ludo Pro', icon: Trophy, players: '1.8k', color: 'from-emerald-500 to-teal-600', comingSoon: true },
    { id: 'pool', name: '8-Ball Pool', icon: Zap, players: '3.1k', color: 'from-amber-500 to-orange-600', comingSoon: true },
  ];

  return (
    <div className="w-full mx-auto animate-in fade-in duration-500">
      {view === "hub" && (
        <>
          <LobbyHub 
            games={games} 
            selectedGame={selectedGame} 
            setSelectedGame={setSelectedGame} 
            setView={setView} 
          />
          <GameModeModal
            isOpen={!!selectedGame}
            onClose={() => setSelectedGame(null)}
            onSelectMode={(mode: 'hub' | 'quick' | 'invite' | 'bot') => {
              if (selectedGame?.id === 'speed-battle') {
                navigate('/speed-battle');
              } else if (selectedGame?.id === 'word-scramble') {
                navigate('/word-scramble');
              } else {
                setView(mode);
              }
            }}
          />
        </>
      )}

      {view === "quick" && loadingRooms && <H2HLobbySkeleton />}

      {view === "quick" && !loadingRooms && (
        <QuickMatchView
          publicRooms={publicRooms}
          quickViewMode={quickViewMode}
          setQuickViewMode={setQuickViewMode}
          stakeValue={stakeValue}
          setStakeValue={setStakeValue}
          customStake={customStake}
          setCustomStake={setCustomStake}
          handleQuickMatch={handleQuickMatch}
          setConfirmingAction={setConfirmingAction}
          isBtnLoading={isBtnLoading}
          setView={setView}
        />
      )}

      {view === "bot" && (
        <BotMatchView
          stakeValue={stakeValue}
          setStakeValue={setStakeValue}
          customStake={customStake}
          setCustomStake={setCustomStake}
          handleBotMatch={handleBotMatch}
          loading={loading}
          setView={setView}
        />
      )}

      {view === "invite" && (
        <InviteFriendView
          inviteMobileTab={inviteMobileTab}
          setInviteMobileTab={setInviteMobileTab}
          customStake={customStake}
          setCustomStake={setCustomStake}
          addStake={addStake}
          handleCreateChallenge={handleCreateChallenge}
          handleJoinByCode={handleJoinByCode}
          joinCode={joinCode}
          setJoinCode={setJoinCode}
          loading={loading}
          setView={setView}
        />
      )}

      <ActionConfirmationModal 
        confirmingAction={confirmingAction}
        onCancel={() => setConfirmingAction(null)}
        onConfirm={executeConfirmedAction}
        isLoading={isBtnLoading}
      />
    </div>
  );
};

export default ChessLobby;

