import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  MdEdit,
  MdRocketLaunch,
  MdCategory,
  MdCalendarToday,
  MdStadium,
  MdInfo,
  MdGavel,
  MdSchedule,
  MdTrendingUp,
  MdArrowForward,
  MdLightbulb,
  MdBarChart,
  MdHistory,
  MdShield,
} from "react-icons/md";
import { Button } from "../components/ui/button";
import { ZASymbol } from "../components/currency/ZASymbol";
import { useGames, useGameSessions } from "../hooks/use-games";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { gameSessionService } from "../services/gamesession.service";

import type { Game as GameType, Session } from "../types/game";

interface H2HMatch {
  id: string;
  code?: string;
  host: { username: string; avatar_url?: string };
  guest?: { username: string; avatar_url?: string };
  is_bot?: boolean;
  stake: number;
  status: 'waiting' | 'active' | 'finished' | 'cancelled';
}

interface SoloActivity {
  id: string;
  user_id: string;
  user: { id: string; username: string; avatar_url?: string };
  stake: number;
  multiplier: number;
  payout: number;
  status: 'in_progress' | 'completed';
  created_at: string;
}

interface SoloAggregation {
  user: { id: string; username: string; avatar_url?: string };
  total_runs: number;
  total_staked: number;
  total_payout: number;
  avg_multiplier: number;
}

const Game: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"sessions" | "matches" | "about" | "rules">(
    "sessions",
  );
  const [showCompleted, setShowCompleted] = useState(false);
  const [soloViewMode, setSoloViewMode] = useState<'raw' | 'aggregated'>('aggregated');

  const { data: gamesData, isLoading: gamesLoading } = useGames();

  const game = useMemo(() => {
    const allGames = (gamesData?.games || []) as GameType[];
    const found = allGames.find((g) => g.slug === slug);
    if (!found) return null;

    // Map backend fields
    return {
      ...found,
      thumbnail:
        found.thumbnail_url || found.thumbnail || "/games/placeholder.png",
      isActive: found.is_active,
      durationInSeconds: found.duration_seconds || 300,
      platformFeePercentage: found.platform_fee_percentage || 10,
      createdAt: found.created_at || new Date().toISOString(),
    };
  }, [gamesData, slug]);

  const { data: sessionsData, isLoading: sessionsLoading } = useGameSessions(
    game?.id || "",
  );

  const filteredSessions = useMemo(() => {
    const sessions = (sessionsData?.sessions || []) as Session[];
    if (showCompleted) return sessions;
    return sessions.filter((s) => s.status !== "completed");
  }, [sessionsData, showCompleted]);

  const isH2H = game?.mode === "Head to Head" || game?.mode === "1v1";
  const isSolo = game?.mode === "Solo Earn";

  const { data: h2hData, isLoading: h2hLoading } = useQuery({
    queryKey: ["h2h-matches", slug],
    queryFn: () => gameSessionService.getH2HMatches(slug || ""),
    enabled: !!slug && isH2H,
    refetchInterval: 10000, // Refresh every 10s for live feel
  });

  const { data: soloData, isLoading: soloLoading } = useQuery({
    queryKey: ["solo-activity", slug, soloViewMode],
    queryFn: () => gameSessionService.getSoloActivity(slug || "", soloViewMode),
    enabled: !!slug && isSolo,
    refetchInterval: 10000,
  });

  const h2hMatches = h2hData?.data?.matches || [];
  const soloActivity = soloData?.data?.activity || [];

  const tabs = isH2H
    ? ([
        { id: "matches", label: "Live Matches", icon: MdStadium },
        { id: "about", label: "About", icon: MdInfo },
        { id: "rules", label: "Rules", icon: MdGavel },
      ] as const)
    : isSolo
    ? ([
        { id: "matches", label: "Player Activity", icon: MdStadium },
        { id: "about", label: "About", icon: MdInfo },
        { id: "rules", label: "Rules", icon: MdGavel },
      ] as const)
    : ([
        { id: "sessions", label: "Sessions", icon: MdStadium },
        { id: "about", label: "About", icon: MdInfo },
        { id: "rules", label: "Rules", icon: MdGavel },
      ] as const);

  const currentTab = tabs.find((t) => t.id === activeTab)
    ? activeTab
    : (tabs[0].id as "sessions" | "matches" | "about" | "rules");

  if (gamesLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-10 text-center min-h-[50vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px]">
          Loading Game Data...
        </p>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-10 text-center text-foreground min-h-[50vh]">
        <h2 className="text-2xl font-black text-primary">Game Not Found</h2>
        <p className="text-muted-foreground mt-2 font-medium">
          The requested game details could not be found.
        </p>
        <Button
          onClick={() => navigate("/games")}
          className="mt-4 bg-primary text-white rounded-xl shadow-lg hover:brightness-110 uppercase tracking-widest text-[10px] font-black px-6"
        >
          Back to Games
        </Button>
      </div>
    );
  }


  return (
    <main className="p-4 space-y-4">
      {/* Game Header Section */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-2xl border border-border overflow-hidden bg-muted p-1">
            <img
              src={game.thumbnail}
              alt={game.title}
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-foreground tracking-tight uppercase">
                {game.title}
              </h1>
              <span
                className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-lg border shadow-sm flex items-center gap-1.5 ${
                  game.isActive
                    ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 border-emerald-500/20"
                    : "bg-muted text-muted-foreground border-border"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${game.isActive ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"}`}
                ></span>
                {game.isActive ? "Active" : "Offline"}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-1">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <MdCategory className="text-primary" /> {game.category} •{" "}
                {game.mode}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <MdCalendarToday className="text-primary" />{" "}
                {new Date(game.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.open(game.iframe_url || game.iframeUrl, '_blank')}
            className="px-6 py-2.5 bg-emerald-500 text-white hover:bg-emerald-600 rounded-xl text-xs font-black uppercase tracking-widest shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2"
          >
            <MdRocketLaunch className="text-lg" />
            <span>Launch Live Game</span>
          </button>
          <button
            onClick={() => navigate(`/games/edit/${slug}`)}
            className="px-6 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl text-xs font-black uppercase tracking-widest shadow-md shadow-primary/20 transition-all flex items-center gap-2"
          >
            <MdEdit className="text-lg" />
            <span>Configure Game</span>
          </button>
        </div>
      </div>

      {/* Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
        {/* Primary Tabs & Content */}
        <div className="col-span-1 lg:col-span-8 space-y-8">
          <div className="flex items-center p-1 bg-muted/50 rounded-xl border border-border grow-0 w-fit">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as "sessions" | "matches" | "about" | "rules")}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg text-xs font-black uppercase transition-all ${currentTab === tab.id ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                <tab.icon className="text-lg" /> {tab.label}
              </button>
            ))}
          </div>{" "}
          {currentTab === "matches" && (isH2H || isSolo) && (
            <div className="space-y-4 animate-in fade-in duration-500">
              <div className="flex justify-between items-center mb-2 px-1">
                <h3 className="text-sm font-black uppercase tracking-wider text-foreground">
                  {isSolo ? (soloViewMode === 'aggregated' ? "Player Aggregation" : "Live Solo Feed") : "Live & Recent Matches"}
                </h3>
                {isSolo && (
                  <div className="flex bg-muted p-1 rounded-lg border border-border">
                    <button 
                      onClick={() => setSoloViewMode('aggregated')}
                      className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-md transition-all ${soloViewMode === 'aggregated' ? "bg-card text-primary shadow-sm" : "text-muted-foreground"}`}
                    >
                      Aggregated
                    </button>
                    <button 
                      onClick={() => setSoloViewMode('raw')}
                      className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-md transition-all ${soloViewMode === 'raw' ? "bg-card text-primary shadow-sm" : "text-muted-foreground"}`}
                    >
                      Raw Feed
                    </button>
                  </div>
                )}
              </div>
              <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-muted/50 border-b border-border">
                        {isSolo ? (
                          soloViewMode === 'aggregated' ? (
                            <>
                              <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Player</th>
                              <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Rounds</th>
                              <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Avg Multiplier</th>
                              <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Total Staked</th>
                              <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Net Profit/Loss</th>
                            </>
                          ) : (
                            <>
                              <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Time</th>
                              <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Player</th>
                              <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Multiplier</th>
                              <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Stake</th>
                              <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Payout</th>
                            </>
                          )
                        ) : (
                          <>
                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Match ID</th>
                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Players</th>
                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Stake</th>
                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Platform Fee</th>
                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Status</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {isSolo ? (
                        soloLoading ? (
                          <tr>
                            <td colSpan={5} className="py-10 text-center">
                              <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
                              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Fetching Solo Data...</p>
                            </td>
                          </tr>
                        ) : soloActivity.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-10 text-center">
                              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">No solo activity recorded yet</p>
                            </td>
                          </tr>
                        ) : (
                          soloViewMode === 'aggregated' ? (
                            soloActivity.map((agg: SoloAggregation) => (
                              <tr key={agg.user.id} className="hover:bg-muted/30 transition-colors">
                                <td className="px-4 py-4">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                                      {agg.user.avatar_url ? <img src={agg.user.avatar_url} alt={agg.user.username} className="w-full h-full" /> : <span className="text-[8px] font-black uppercase">{agg.user.username[0]}</span>}
                                    </div>
                                    <span className="text-xs font-bold text-foreground">{agg.user.username}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-4 text-center font-black text-xs">{agg.total_runs}</td>
                                <td className="px-4 py-4 text-right">
                                  <span className={`text-xs font-black px-2 py-0.5 rounded ${agg.avg_multiplier >= 1 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                    {agg.avg_multiplier.toFixed(2)}x
                                  </span>
                                </td>
                                <td className="px-4 py-4 text-right font-black text-xs font-number">
                                  <div className="flex items-center justify-end gap-1"><ZASymbol className="scale-75" /> {agg.total_staked.toLocaleString()}</div>
                                </td>
                                <td className="px-4 py-4 text-right">
                                  <span className={`text-xs font-black font-number flex items-center justify-end gap-1 ${(agg.total_staked - agg.total_payout) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    <ZASymbol className="scale-75" />
                                    {(agg.total_staked - agg.total_payout).toLocaleString()}
                                  </span>
                                </td>
                              </tr>
                            ))
                          ) : (
                            soloActivity.map((run: SoloActivity) => (
                              <tr key={run.id} className="hover:bg-muted/30 transition-colors">
                                <td className="px-4 py-4 text-[10px] font-bold text-muted-foreground uppercase">{format(new Date(run.created_at), 'HH:mm:ss')}</td>
                                <td className="px-4 py-4">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-primary">{run.user.username}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-4 text-center">
                                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${run.multiplier >= 1 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'}`}>
                                    {Number(run.multiplier).toFixed(2)}x
                                  </span>
                                </td>
                                <td className="px-4 py-4 text-right font-black text-xs font-number">
                                  <div className="flex items-center justify-end gap-1"><ZASymbol className="scale-75" /> {Number(run.stake).toLocaleString()}</div>
                                </td>
                                <td className="px-4 py-4 text-right font-black text-xs font-number">
                                  <div className="flex items-center justify-end gap-1 text-foreground"><ZASymbol className="scale-75" /> {Number(run.payout || 0).toLocaleString()}</div>
                                </td>
                              </tr>
                            ))
                          )
                        )
                      ) : (
                        h2hLoading ? (
                          <tr>
                            <td colSpan={5} className="py-10 text-center">
                              <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
                              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Synchronizing Match Feed...</p>
                            </td>
                          </tr>
                        ) : h2hMatches.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-10 text-center">
                              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">No matches found for this game</p>
                            </td>
                          </tr>
                        ) : (
                          h2hMatches.map((match: H2HMatch) => (
                            <tr key={match.id} className="hover:bg-muted/30 transition-colors">
                              <td className="px-4 py-4 text-xs font-black text-foreground uppercase tracking-wider">
                                {match.code || match.id.slice(0, 8)}
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-3">
                                  <span className="text-xs font-bold text-primary">{match.host?.username || "Player"}</span>
                                  <span className="text-[10px] font-black text-muted-foreground uppercase">VS</span>
                                  <span className={`text-xs font-bold ${match.guest ? "text-rose-500" : "text-muted-foreground italic"}`}>
                                    {match.guest?.username || (match.is_bot ? "System Bot" : "Waiting...")}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-4 text-right">
                                <span className="text-xs font-black text-foreground font-number flex items-center justify-end gap-1">
                                  <ZASymbol className="scale-75" />
                                  {Number(match.stake).toLocaleString()}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-right">
                                <span className={`text-xs font-black font-number flex items-center justify-end gap-1 ${match.status === 'finished' ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                                  <ZASymbol className="scale-75" />
                                  {match.status === 'finished' 
                                    ? (Number(match.stake) * 2 * (game.platformFeePercentage / 100)).toLocaleString()
                                    : "—"}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-center">
                                <span className={`inline-flex px-2 py-1 text-[9px] font-black uppercase tracking-widest rounded ${
                                  match.status === 'finished' ? "bg-primary/20 text-primary" : 
                                  match.status === 'waiting' ? "bg-amber-500/20 text-amber-500" : 
                                  "bg-blue-500/20 text-blue-500"
                                }`}>
                                  {match.status} 
                                  {match.status === 'active' && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 ml-1.5 animate-pulse"></span>}
                                </span>
                              </td>
                            </tr>
                          ))
                        )
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="p-4 bg-muted/20 border-t border-border flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Showing Live Activity</span>
                  <button className="px-4 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-[10px] font-black uppercase tracking-widest transition-all">View Full Logs</button>
                </div>
              </div>
            </div>
          )}
          {currentTab === "sessions" && !isH2H && !isSolo && (
            <div className="space-y-4 animate-in fade-in duration-500">
              <div className="flex justify-between items-center mb-2 px-1">
                <h3 className="text-sm font-black uppercase tracking-wider text-foreground">
                  {showCompleted ? "All Match Sessions" : "Active Match Sessions"}
                </h3>
                <button 
                  onClick={() => setShowCompleted(!showCompleted)}
                  className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-all"
                >
                  {showCompleted ? "Hide Completed" : "Show Completed"}
                </button>
              </div>

              {sessionsLoading ? (
                <div className="py-20 flex flex-col items-center justify-center gap-4">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Fetching Sessions...
                  </p>
                </div>
              ) : filteredSessions.length > 0 ? (
                filteredSessions.map((session: Session) => (
                  <div
                    key={session.id}
                    className="bg-card p-6 rounded-2xl border border-border hover:border-primary/50 transition-all group relative overflow-hidden shadow-sm hover:shadow-md cursor-pointer"
                    onClick={() => navigate(`/sessions/${session.id}`)}
                  >
                    {session.status === "active" && (
                      <div className="absolute top-0 right-0 px-3 py-1 bg-emerald-500 text-white font-black text-[9px] uppercase tracking-widest rounded-bl-xl shadow-lg flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-white animate-pulse"></span>
                        Live
                      </div>
                    )}
                    {session.status === "completed" && (
                      <div className="absolute top-0 right-0 px-3 py-1 bg-primary text-black font-black text-[9px] uppercase tracking-widest rounded-bl-xl shadow-lg flex items-center gap-1.5">
                        Completed & Payout
                      </div>
                    )}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="space-y-4 flex-1">
                        <div>
                          <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">
                            {session.type}
                          </p>
                          <h4 className="text-lg font-black text-foreground uppercase tracking-tight">
                            {session.title || "Standard Tournament"}
                          </h4>
                        </div>
                        <div className="flex flex-wrap items-center gap-8">
                          <div className="flex flex-col">
                            <span className="text-[9px] text-muted-foreground uppercase font-black tracking-wider">
                              Prize Pool
                            </span>
                            <span className="text-xl font-black text-primary font-number tracking-tight flex items-center gap-1">
                              <ZASymbol />{session.pool_amount?.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex flex-col flex-1 max-w-48">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[9px] text-muted-foreground uppercase font-black tracking-wider">
                                Entry Fee
                              </span>
                              <span className="text-[10px] font-black text-foreground font-number flex items-center gap-1">
                                <ZASymbol />{session.entry_fee?.toLocaleString()}
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                              <div className="w-[100%] h-full bg-primary/20 rounded-full"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-start md:items-end gap-3">
                        <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-lg border border-border">
                          <MdSchedule className="text-primary text-sm" />{" "}
                          {format(
                            new Date(session.start_time),
                            "MMM dd, HH:mm",
                          )}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            className="h-9 w-9 bg-muted hover:bg-muted/80 text-foreground rounded-xl flex items-center justify-center transition-all border border-border"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MdEdit />
                          </button>
                          <button className="px-4 h-9 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md shadow-primary/20 transition-all">
                            Manage
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-20 bg-muted/20 border border-dashed border-border rounded-2xl flex flex-col items-center justify-center text-center p-8">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <MdStadium className="text-muted-foreground text-xl" />
                  </div>
                  <h4 className="text-sm font-black uppercase tracking-wider text-foreground">
                    No Sessions Found
                  </h4>
                  <p className="text-xs text-muted-foreground font-medium mt-1">
                    There are no active or upcoming sessions for this game.
                  </p>
                  <button
                    onClick={() => navigate(`/games/edit/${slug}#sessions`)}
                    className="mt-4 px-6 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    Create Session
                  </button>
                </div>
              )}
            </div>
          )}
          {currentTab === "about" && (
            <div className="animate-in fade-in duration-500 space-y-4">
              <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                <h3 className="text-sm font-black uppercase tracking-wider mb-4 text-foreground">
                  Game Definition
                </h3>
                <p className="text-muted-foreground leading-relaxed text-sm font-medium mb-6">
                  {game.title} is a high-stakes competitive experience designed
                  for the platform. Engineered with a robust matchmaking system,
                  it offers a seamless competitive environment where verified
                  players compete in ranked tournaments.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-xl border border-border">
                    <MdBarChart className="text-primary text-2xl shrink-0" />
                    <div>
                      <h4 className="text-[10px] font-black text-foreground uppercase tracking-wider mb-0.5">
                        Duration
                      </h4>
                      <p className="text-xs text-muted-foreground font-black font-number uppercase tracking-tight">
                        {game.durationInSeconds} Seconds
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-xl border border-border">
                    <MdHistory className="text-primary text-2xl shrink-0" />
                    <div>
                      <h4 className="text-[10px] font-black text-foreground uppercase tracking-wider mb-0.5">
                        Platform Fee
                      </h4>
                      <p className="text-xs text-muted-foreground font-black font-number uppercase tracking-tight">
                        {game.platformFeePercentage}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    icon: MdShield,
                    label: "Integrity",
                    sub: "Anti-Cheat Enabled",
                  },
                  {
                    icon: MdTrendingUp,
                    label: "Growth",
                    sub: "+12% Engagement",
                  },
                  {
                    icon: MdRocketLaunch,
                    label: "Engine",
                    sub: "Playza Native",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="bg-card p-4 rounded-xl border border-border text-center shadow-sm"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <item.icon className="text-primary text-lg" />
                    </div>
                    <h4 className="text-[10px] font-black text-foreground uppercase tracking-wider mb-1">
                      {item.label}
                    </h4>
                    <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-tight">
                      {item.sub}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {currentTab === "rules" && (
            <div className="animate-in fade-in duration-500 space-y-6">
              {/* Dynamic Rules from DB */}
              <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                <h3 className="text-sm font-black uppercase tracking-wider mb-6 flex items-center gap-2 text-foreground">
                  <MdGavel className="text-primary" /> Rules & Scoring
                </h3>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-black text-primary uppercase tracking-widest">Rules</h4>
                    <p className="text-xs font-bold text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {game.rules || game.how_to_play?.rules || "No specific rules defined for this game."}
                    </p>
                  </div>
                  <div className="space-y-2 border-t border-border pt-4">
                    <h4 className="text-[10px] font-black text-primary uppercase tracking-widest">Controls</h4>
                    <p className="text-xs font-bold text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {game.controls || game.how_to_play?.controls || "Standard platform controls apply."}
                    </p>
                  </div>
                  <div className="space-y-2 border-t border-border pt-4">
                    <h4 className="text-[10px] font-black text-primary uppercase tracking-widest">Scoring Logic</h4>
                    <p className="text-xs font-bold text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {game.scoring || game.how_to_play?.scoring || "Points are awarded based on performance metrics."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Standard Platform Rules */}
              <div className="bg-muted/30 p-6 rounded-2xl border border-border shadow-sm">
                <h3 className="text-sm font-black uppercase tracking-wider mb-6 flex items-center gap-2 text-foreground">
                  <MdShield className="text-primary" /> Platform Protocols
                </h3>
                <div className="space-y-4">
                  {[
                    "Fair Play: Any manipulation of game state results in an immediate ban.",
                    "Session Integrity: Players must maintain a stable connection to qualify.",
                    "Prize Escrow: Funds are held until session validation is complete.",
                  ].map((rule, i) => (
                    <div key={i} className="flex gap-4 group">
                      <span className="text-primary font-black italic text-lg opacity-50 font-number">
                        0{i + 1}
                      </span>
                      <p className="text-xs font-bold text-muted-foreground leading-relaxed border-l border-border pl-4">
                        {rule}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Analytics Sidebar */}
        <aside className="col-span-1 lg:col-span-4 space-y-6">
          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-wider mb-6 flex items-center gap-2 text-muted-foreground">
              <MdTrendingUp className="text-primary text-lg" /> {isSolo ? "House Economics" : "Performance Pulse"}
            </h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-end mb-1">
                  <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">
                    {isSolo ? "Net House Profit" : "Total Revenue (7D)"}
                  </span>
                  <span className="text-emerald-500 font-black text-[9px] flex items-center gap-1 font-number">
                    <MdTrendingUp /> LIVE
                  </span>
                </div>
                <div className="text-3xl font-black text-foreground font-number tracking-tighter flex items-center gap-1">
                  <ZASymbol />{(game.total_revenue || 0).toLocaleString()}
                </div>
                <div className="h-12 w-full mt-4 flex items-end gap-1 opacity-60">
                  {[0.4, 0.6, 0.55, 0.8, 0.7, 0.9, 1].map((h, i) => (
                    <div
                      key={i}
                      style={{ height: `${h * 100}%` }}
                      className={`flex-1 rounded-sm transition-all duration-500 ${i === 6 ? "bg-primary" : "bg-primary/20"}`}
                    ></div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-muted/50 rounded-xl border border-border text-center">
                  <span className="text-[8px] text-muted-foreground font-black uppercase tracking-widest block mb-0.5">
                    {isSolo ? "RTP Rate" : "Avg Vol"}
                  </span>
                  <span className="text-lg font-black text-foreground font-number uppercase">
                    {isSolo ? "92.4%" : "42m"}
                  </span>
                </div>
                <div className="p-3 bg-muted/50 rounded-xl border border-border text-center">
                  <span className="text-[8px] text-muted-foreground font-black uppercase tracking-widest block mb-0.5">
                    Engaged
                  </span>
                  <span className="text-lg font-black text-foreground font-number uppercase">
                    {(game.unique_players || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            <button className="w-full mt-6 h-10 bg-muted hover:bg-muted/80 text-primary rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
              {isSolo ? "Detailed RTP Report" : "Full Analytics Report"}
              <MdArrowForward className="text-lg" />
            </button>
          </div>

          <div className="bg-card p-5 rounded-2xl border border-border shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-4">
              Diagnostics
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                <span className="text-muted-foreground">Node Status</span>
                <span className="text-emerald-500 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Optimal
                </span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                <span className="text-muted-foreground">Ping Rate</span>
                <span className="text-foreground font-number tracking-tight">
                  12ms
                </span>
              </div>
            </div>
          </div>

          <div className="p-5 bg-amber-100 dark:bg-amber-900/10 rounded-2xl border border-amber-500/20 relative overflow-hidden group">
            <p className="text-xs font-bold text-amber-800 dark:text-amber-400 leading-relaxed italic relative z-10 mb-3">
              "Note: Distribution logic for the Midnight Storm Championship
              requires a review before the 04:00 window."
            </p>
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500 text-[10px] font-black uppercase tracking-widest relative z-10">
              <MdLightbulb className="text-base" /> Admin Notice
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
};

export default Game;
