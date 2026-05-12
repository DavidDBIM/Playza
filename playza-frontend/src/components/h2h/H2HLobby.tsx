import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Zap, Swords, Trophy } from 'lucide-react';
import H2HLobbySkeleton from '../skeletons/H2HLobbySkeleton';
import { useGames } from '@/hooks/gamesession/useGameSession';

// Extracted Components
import LobbyHub from './LobbyHub';
import GameModeModal from './GameModeModal';
import QuickMatchView from './QuickMatchView';
import BotMatchView from './BotMatchView';
import InviteFriendView from './InviteFriendView';
import ActionConfirmationModal from './ActionConfirmationModal';
import type { ChessRoom as WaitingRoom } from '@/types/chess';
import type { Game } from '@/types/types';



interface H2HLobbyProps {
  onCreate: (stake: number) => void;
  onBotCreate: (stake: number) => void;
  onJoin: (code: string) => void;
  onQuickMatch: (stake: number) => void;
  getWaitingRooms: () => Promise<WaitingRoom[]>;
  loading: boolean;
}

interface GameType {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  players: string;
  color: string;
  thumbnailUrl: string;
  comingSoon?: boolean;
}

const H2HLobby = ({ onCreate, onBotCreate, onJoin, onQuickMatch, getWaitingRooms, loading }: H2HLobbyProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [view, setView] = useState<'hub' | 'quick' | 'invite' | 'bot'>(location.state?.view || 'hub');
  const [stakeValue, setStakeValue] = useState(100);
  const [customStake, setCustomStake] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [isFinding, setIsFinding] = useState(false);
  const [selectedGame, setSelectedGame] = useState<GameType | null>(null);
  const [inviteMobileTab, setInviteMobileTab] = useState<"create" | "join" | null>(null);
  const [publicRooms, setPublicRooms] = useState<WaitingRoom[]>([]);
  const [quickViewMode, setQuickViewMode] = useState<'list' | 'create'>('list');
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [confirmingAction, setConfirmingAction] = useState<{ type: 'create' | 'join' | 'quick' | 'bot', stake: number, code?: string } | null>(null);

  const fetchPublicRooms = useCallback(async () => {
    setLoadingRooms(true);
    try {
      const rooms = await getWaitingRooms();
      setPublicRooms(rooms);
      setQuickViewMode(rooms.length === 0 ? 'create' : 'list');
    } catch {
      // Failed to fetch public rooms
      setQuickViewMode('create');
    } finally {
      setLoadingRooms(false);
    }
  }, [getWaitingRooms]);

  useEffect(() => {
    if (view === 'quick') {
      fetchPublicRooms();
    }
  }, [view, fetchPublicRooms]);

  // Function to change view and stay in sync with URL state
  const handleSetView = (newView: 'hub' | 'quick' | 'invite' | 'bot') => {
    // We update the location state so that the sync useEffect doesn't override us
    navigate(location.pathname, { state: { ...location.state, view: newView }, replace: true });
    setView(newView);
  };

  // Sync view state with location state (e.g. from H2HZone navigation)
  useEffect(() => {
    if (location.state?.view && location.state.view !== view) {
      setView(location.state.view);
    }
  }, [location.state?.view, view]);

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

  const { data: gamesData, isLoading: gamesLoading } = useGames();

  const games = useMemo(() => {
    const rawGames = (gamesData?.games || []) as Game[];
    const isDev = window.location.hostname === 'localhost';

    return rawGames
      .filter(g => g.mode === 'Head to Head' && (g.is_active || isDev))
      .map(g => ({
        id: g.slug,
        name: g.title,
        icon: g.slug === 'arena-duel' ? Swords : g.slug === 'chess' ? Trophy : Zap,
        players: (g.unique_players || 0).toString(),
        color: g.category === 'Action' ? 'from-orange-500 to-red-600' : 'from-indigo-500 to-purple-600',
        thumbnailUrl: g.thumbnail_url || g.thumbnail
      }));
  }, [gamesData]);

  if (gamesLoading || loading) return <H2HLobbySkeleton />;

  if (games.length === 0) {
    return (
      <div className="py-32 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in zoom-in duration-700 bg-white/5 rounded-3xl border border-dashed border-primary/10">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
          <div className="relative size-24 bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl flex items-center justify-center shadow-2xl mx-auto">
            <span className="text-5xl animate-pulse">⚔️</span>
          </div>
        </div>
        <div className="space-y-2 max-w-sm px-6 mx-auto">
          <h2 className="text-xl font-black text-foreground uppercase italic tracking-tighter">
            Arena Under Construction
          </h2>
          <p className="text-muted-foreground text-[10px] md:text-xs font-bold leading-relaxed uppercase tracking-widest">
            The Head to Head arena is currently undergoing scheduled maintenance. 
            New duels are being calibrated in the database. Check back later.
          </p>
        </div>
      </div>
    );
  }

  const isBtnLoading = loading || isFinding;

  return (
    <div className="w-full mx-auto">
      {view === "hub" && (
        <>
          <LobbyHub 
            games={games} 
            setSelectedGame={setSelectedGame} 
          />
          <GameModeModal
            isOpen={!!selectedGame}
            onClose={() => setSelectedGame(null)}
            onSelectMode={(mode: 'hub' | 'quick' | 'invite' | 'bot') => {
              // If we are already on the page for this game, just set the view locally
              // This fixes the issue of the lobby 'not proceeding' when already on the game route
              const isSameGame = location.pathname.includes(`/h2h/${selectedGame?.id}`);
              
              if (selectedGame?.id && !isSameGame) {
                navigate(`/h2h/${selectedGame.id}`, { state: { view: mode } });
              } else {
                handleSetView(mode);
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
          setView={handleSetView}
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
          setView={handleSetView}
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
          setView={handleSetView}
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

export default H2HLobby;

