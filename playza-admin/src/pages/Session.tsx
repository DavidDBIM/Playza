import React from "react";
import { useParams } from "react-router";
import { MdTrendingUp, MdBolt, MdFilterList, MdRefresh } from "react-icons/md";
import { Button } from "../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { 
  useSessionDetails, 
  useUpdateSessionStatus, 
  useFinalizeSession 
} from "../hooks/use-games";
import { ConfirmDialog } from "../components/ui/confirm-dialog";
import { ZASymbol } from "../components/currency/ZASymbol";

interface GameDetails {
  title: string;
  platform_fee_percentage: number;
}

interface SessionData {
  id: string;
  title: string;
  status: string;
  max_players: number;
  pool_amount: number;
  winners_count: number;
  start_time: string;
  end_time: string;
  games: GameDetails;
  financials: {
    gross: number;
    platformFee: number;
    netPrizePool: number;
    platformFeePercentage: number;
  };
}

interface RosterEntry {
  id: string;
  user_id: string;
  best_score: number;
  attempts: number;
  updated_at: string;
  users: {
    username: string;
    avatar_url: string;
    phone: string;
  };
}

const Session: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  const { 
    data: sessionDetails, 
    isLoading: loading, 
    refetch: fetchDetails 
  } = useSessionDetails(id!);
  
  const updateStatusMutation = useUpdateSessionStatus();
  const finalizeMutation = useFinalizeSession();

  const session = React.useMemo(() => sessionDetails ? {
    ...sessionDetails.session,
    financials: sessionDetails.financials
  } as SessionData : null, [sessionDetails]);
  
  const roster = React.useMemo(() => (sessionDetails?.roster || []) as RosterEntry[], [sessionDetails]);

  const isProcessing = updateStatusMutation.isPending || finalizeMutation.isPending;

  const [countdown, setCountdown] = React.useState("");
  const [confirmConfig, setConfirmConfig] = React.useState<{
    isOpen: boolean;
    title: string;
    description: string;
    type: 'danger' | 'warning' | 'success' | 'info';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    description: "",
    type: 'warning',
    onConfirm: () => {},
  });

  React.useEffect(() => {
    const timer = setInterval(() => {
      if (!session) return;
      const now = new Date().getTime();
      const start = new Date(sessionDetails.session.start_time).getTime();
      const end = new Date(sessionDetails.session.end_time).getTime();

      const target = session.status === "upcoming" ? start : end;
      const diff = target - now;

      if (diff <= 0) {
        setCountdown(session.status === "upcoming" ? "Starting Now..." : "Ended");
        return;
      }

      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(`${h}h ${m}m ${s}s`);
    }, 1000);
    return () => clearInterval(timer);
  }, [session, sessionDetails]);

  // Auto-sync every 3 seconds
  React.useEffect(() => {
    const sync = setInterval(() => fetchDetails(), 3000);
    return () => clearInterval(sync);
  }, [fetchDetails]);

  const handleFinalize = async () => {
    if (!session) return;

    const now = new Date().getTime();
    const endTime = new Date(session.end_time).getTime();

    if (now < endTime) {
      toast.error(`Restriction: This session cannot be finalized until the timer reaches zero. (${countdown} remaining)`, {
        description: "Admins are not allowed to trigger payouts while the arena is still active.",
        duration: 5000,
      });
      return;
    }

    setConfirmConfig({
      isOpen: true,
      title: "Finalize Session?",
      description: "Are you sure you want to finalize this session and trigger payouts? This cannot be undone.",
      type: 'danger',
      onConfirm: async () => {
        try {
          const res = await finalizeMutation.mutateAsync(id!);
          if (res.success) {
            toast.success(`Session finalized! ${res.winnersCount} players paid out.`);
          } else {
            toast.error(res.message || "Finalization failed");
          }
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : "Error finalizing session";
          toast.error(message);
        } finally {
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleStatusUpdate = async (newStatus: string) => {
    setConfirmConfig({
      isOpen: true,
      title: `${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)} Session?`,
      description: `Are you sure you want to set this session to ${newStatus}?`,
      type: newStatus === 'active' ? 'success' : 'danger',
      onConfirm: async () => {
        try {
          await updateStatusMutation.mutateAsync({ sessionId: id!, status: newStatus });
          toast.success(`Session is now ${newStatus}`);
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : "Failed to update status";
          toast.error(message);
        } finally {
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground animate-pulse">
          Syncing Session Roster...
        </p>
      </div>
    );
  }

  const game = session?.games;
  const isEnded = session?.status === "completed";

  return (
    <main className={`p-4 space-y-4 min-h-screen relative overflow-hidden transition-colors duration-1000 ${isEnded ? 'bg-emerald-500/2' : 'bg-background'}`}>
      {/* Visual Status Glows - High-Density Sharp Aesthetics */}
      {isEnded ? (
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[120%] h-125 bg-emerald-500/5 blur-[160px] rounded-full pointer-events-none z-0" />
      ) : session?.status === 'active' ? (
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[120%] h-125 bg-primary/10 blur-[160px] rounded-full pointer-events-none z-0" />
      ) : (
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[120%] h-125 bg-slate-500/5 blur-[160px] rounded-full pointer-events-none z-0" />
      )}

      {/* Grid Pattern Overlay for "Sharp" look */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[40px_40px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] z-0" />

      <div className="relative z-10 space-y-8">
        {/* Hero Session Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-400/30">
              <MdTrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-foreground tracking-tight">
                  {session?.title || "Match Session"}
                </h1>
                <span
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black tracking-widest uppercase rounded-lg border shadow-sm transition-all duration-500 ${
                    isEnded
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30 shadow-emerald-500/10"
                      : session?.status === "active"
                        ? "bg-primary/10 text-primary border-primary/30 shadow-primary/10"
                        : "bg-slate-500/10 text-slate-500 border-slate-500/20"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${isEnded ? "bg-emerald-500" : session?.status === "active" ? "bg-primary animate-pulse" : "bg-slate-500"}`}
                  ></span>
                  {session?.status}
                </span>
                {!isEnded && session?.status !== "cancelled" && (
                  <span className="flex items-center gap-2 px-3 py-1 bg-background/50 backdrop-blur-md text-foreground text-[10px] font-black tracking-widest uppercase rounded-lg border border-border/50 shadow-sm">
                    <span className="text-primary animate-pulse">●</span>
                    {session?.status === "upcoming" ? "Starts: " : "Ends: "}
                    <span className="font-number">{countdown}</span>
                  </span>
                )}
                <span className="flex items-center gap-2 px-3 py-1 bg-background/50 backdrop-blur-md border border-border/50 rounded-lg text-[9px] font-black uppercase tracking-widest text-muted-foreground shadow-sm">
                  <span className="opacity-50">Arena Window:</span> 
                  <span className="text-foreground">
                    {session && new Date(session.start_time).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} - {session && new Date(session.end_time).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </span>
              </div>
              <p className="text-sm text-muted-foreground font-medium">
                Arena ID: #{id} • Game: {game?.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => fetchDetails()}
              variant="outline"
              size="icon"
              className="rounded-xl h-10 w-10"
            >
              <MdRefresh className="text-lg" />
            </Button>

            {session?.status === "upcoming" && (
              <Button
                disabled={isProcessing}
                onClick={() => handleStatusUpdate("active")}
                className="px-6 py-2 bg-emerald-500 text-white hover:bg-emerald-600 rounded-xl text-xs font-black uppercase tracking-widest shadow-md shadow-emerald-500/20 transition-all"
              >
                {isProcessing ? <Loader2 className="animate-spin" /> : "Activate Now"}
              </Button>
            )}

            {session?.status === "active" && (
              <Button
                disabled={isProcessing}
                onClick={handleFinalize}
                className="px-6 py-2 bg-primary text-black hover:bg-primary/90 rounded-xl text-xs font-black uppercase tracking-widest shadow-md shadow-primary/20 transition-all"
              >
                {isProcessing ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Finalize & Payout"
                )}
              </Button>
            )}

            {session?.status !== "cancelled" && !isEnded && (
              <button
                disabled={isProcessing}
                onClick={() => handleStatusUpdate("cancelled")}
                className="px-4 py-2 bg-rose-500 text-white hover:bg-rose-600 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
              >
                Cancel Arena
              </button>
            )}
          </div>
        </div>

        {/* Top Level Stats Bento */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Active Roster",
              value: roster.length,
              sub: `Capacity: ${session?.max_players || 0}`,
              color: "text-foreground",
            },
            {
              label: "Base Pool",
              value: <div className="flex items-center gap-1"><ZASymbol />{Number(session?.financials?.gross || 0).toLocaleString()}</div>,
              sub: "Gross Amount",
              color: "text-muted-foreground",
            },
            {
              label: "Net Prize",
              value: <div className="flex items-center gap-1"><ZASymbol />{Number(session?.financials?.netPrizePool || 0).toLocaleString()}</div>,
              sub: <div className="flex items-center gap-1">Fee: <ZASymbol />{Number(session?.financials?.platformFee || 0).toLocaleString()} ({session?.financials?.platformFeePercentage || 10}%)</div>,
              color: "text-emerald-500",
            },
            {
              label: "Winners Zone",
              value: session?.winners_count || 0,
              sub: "Paid Slots",
              color: "text-primary",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-card border border-border p-5 rounded-2xl shadow-sm relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-20 group-hover:opacity-100 transition-opacity"></div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-2">
                {stat.label}
              </p>
              <div className="flex flex-col">
                <span
                  className={`text-2xl font-black tracking-tight ${stat.color}`}
                >
                  {stat.value}
                </span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase mt-1 tracking-tight">
                  {stat.sub}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Main Control Grid */}
        <section className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Player List (8/12) */}
          <div className="col-span-1 xl:col-span-8 space-y-6">
            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
                <h2 className="text-sm font-black text-foreground uppercase tracking-wider">
                  Session Roster
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground font-black uppercase tracking-wider text-[10px] flex items-center gap-2 hover:text-foreground"
                >
                  <MdFilterList className="text-base" /> Filter
                </Button>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/50 border-b border-border">
                    <TableRow className="hover:bg-transparent border-none">
                      <TableHead className="px-6 py-3 text-[10px] uppercase tracking-widest h-auto font-black text-muted-foreground">
                        Rank
                      </TableHead>
                      <TableHead className="px-6 py-3 text-[10px] uppercase tracking-widest h-auto font-black text-muted-foreground">
                        Player
                      </TableHead>
                      <TableHead className="px-6 py-3 text-[10px] uppercase tracking-widest text-center h-auto font-black text-muted-foreground">
                        Best Score
                      </TableHead>
                      <TableHead className="px-6 py-3 text-[10px] uppercase tracking-widest text-center h-auto font-black text-muted-foreground">
                        Attempts
                      </TableHead>
                      <TableHead className="px-6 py-3 text-[10px] uppercase tracking-widest h-auto font-black text-muted-foreground">
                        Contact
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-border">
                    {roster.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="h-48 text-center text-muted-foreground font-black uppercase text-xs"
                        >
                          No participants found
                        </TableCell>
                      </TableRow>
                    ) : (
                      roster.map((entry, i) => {
                        const rank = i + 1;
                        const isWinner = rank <= (session?.winners_count || 5);
                        return (
                          <TableRow
                            key={entry.id}
                            className="hover:bg-muted/30 transition-colors border-none"
                          >
                            <TableCell className="px-6 py-4">
                              <span
                                className={`font-black italic text-sm ${isWinner ? "text-primary" : "text-muted-foreground"}`}
                              >
                                #{rank.toString().padStart(2, "0")}
                              </span>
                            </TableCell>
                            <TableCell className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl overflow-hidden border border-border">
                                  <img
                                    src={
                                      entry.users?.avatar_url ||
                                      "/default-avatar.png"
                                    }
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div>
                                  <p className="font-black text-sm text-foreground uppercase tracking-tight">
                                    {entry.users?.username}
                                  </p>
                                  <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">
                                    UID: {entry.user_id.substring(0, 8)}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="px-6 py-4 text-center font-black text-foreground text-base">
                              {entry.best_score.toLocaleString()}
                            </TableCell>
                            <TableCell className="px-6 py-4 text-center font-bold text-muted-foreground">
                              {entry.attempts}
                            </TableCell>
                            <TableCell className="px-6 py-4">
                              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                {entry.users?.phone || "Hidden"}
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          {/* Right Rail: Activity Log */}
          <div className="col-span-1 xl:col-span-4 space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col h-100">
              <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-6 flex items-center justify-between">
                Arena Logs
                <MdBolt className="text-xl text-amber-500" />
              </h2>
              <div className="flex-1 overflow-y-auto space-y-5 custom-scrollbar">
                {roster.slice(0, 10).map((entry, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="mt-1.5 w-1 h-3 rounded-full bg-primary shrink-0"></div>
                    <div>
                      <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5 font-number">
                        {new Date(entry.updated_at).toLocaleTimeString()}
                      </p>
                      <p className="text-xs font-bold leading-relaxed text-foreground">
                        <span className="text-primary uppercase tracking-tight mr-1">
                          ENTRY:
                        </span>
                        <span>
                          {entry.users?.username} updated score to{" "}
                          {entry.best_score.toLocaleString()}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      <ConfirmDialog
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        description={confirmConfig.description}
        type={confirmConfig.type}
        isLoading={isProcessing}
      />
    </main>
  );
};

export default Session;
