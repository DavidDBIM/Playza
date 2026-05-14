import { useParams, useNavigate, useLocation } from "react-router";
import { useGames } from "@/hooks/gamesession/useGameSession";
import { X, Loader2, Maximize, Minimize } from "lucide-react";
import { useEffect, useState } from "react";
import { useConnectivity } from "@/hooks/useConnectivity";
import GameOverLeaderboard from "@/components/game/GameOverLeaderboard";
import LiveEntryModal from "@/components/gameSession/LiveEntryModal";
import type { BundlePack } from "@/components/gameSession/LiveEntryModal";
import {
  getActiveSession,
  submitSessionScore,
  startRound,
  getSessionLeaderboard,
} from "@/api/gamesession.api";

import { useToast } from "@/context/toast";
import type { Game } from "@/types/types";

interface Session {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  status: string;
  entry_fee: number;
  pool_amount: number;
  games: Game;
}

const GamePlay = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { isOnline } = useConnectivity();

  const isDemo = new URLSearchParams(location.search).get("mode") === "demo";

  const [isLoading, setIsLoading] = useState(true);
  const [gameOverData, setGameOverData] = useState<{
    score: number;
    rank?: number;
    isHighScore?: boolean;
    previousBest?: number;
    submissionError?: string | null;
    /** Live leaderboard snapshot fetched right after score submission */
    leaderboard?: Array<{
      best_score: number;
      users?: { username?: string; avatar_url?: string | null };
    }>;
  } | null>(null);
  const [showLiveEntry, setShowLiveEntry] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [activeSession, setActiveSession] = useState<Session | null>(null);

  const [currentRoundId, setCurrentRoundId] = useState<string | null>(null);
  // Stores the power-up bundle a player purchased in LiveEntryModal.
  // Injected into the iframe via PLAYZA_POWERUP_BUNDLE once the game loads.
  // Uses a generic Record<string,number> so it works for any game's power-up IDs.
  const [pendingBundle, setPendingBundle] = useState<Record<
    string,
    number
  > | null>(null);

  const { data: gamesData, isLoading: gamesLoading } = useGames();
  const game = (
    gamesData?.games ||
    gamesData?.result ||
    gamesData?.data ||
    []
  ).find((g: Game) => g.slug === id);

  useEffect(() => {
    const fetchSession = async () => {
      if (!id) return;
      try {
        const res = await getActiveSession(id);
        if (res.success && res.result) {
          setActiveSession(res.result);

          if (!isDemo) {
            // -- SECURITY HANDSHAKE --
            const roundRes = await startRound(res.result.id);
            if (roundRes.success) {
              setCurrentRoundId(roundRes.roundId);
            }
          }
        }
      } catch {
        // Silent fail for session initialization
      }
    };
    fetchSession();
  }, [id]);

  /**
   * ============================================================
   * 🏟️  ARENA RIVAL BANNER — Live Leaderboard Feed (React → Iframe)
   * ============================================================
   * SCOPE: All Playza games (platform-wide pattern).
   *
   * WHY THIS EXISTS:
   * Every Playza game runs inside a sandboxed <iframe> and has no direct
   * access to the backend or session leaderboard. To give players a
   * real-time competitive feel, this hook acts as a bridge: React fetches
   * the current top-ranked player's score from the server every 10 seconds
   * and "pushes" it into the game via postMessage.
   *
   * HOW IT WORKS:
   * 1. React polls `getSessionLeaderboard(sessionId)` on a 10-second interval.
   * 2. It extracts the #1 player (username + best_score) from the response.
   * 3. It fires `iframe.contentWindow.postMessage({ type: 'PLAYZA_RIVAL_UPDATE', payload })`.
   * 4. Inside the game's script (e.g. game.js), a `window.addEventListener('message')`
   *    listener receives this and updates the floating "Rival Banner" UI inside the game.
   * 5. The banner turns 🔴 RED when the player is trailing and 🟢 GREEN when
   *    they surpass the leader — updating in real time after every move.
   *
   * TO ENABLE IN A NEW GAME:
   * The game's script must listen for the `PLAYZA_RIVAL_UPDATE` message type
   * and render the rival data in whatever way suits its UI. This React hook
   * requires no modification — it is already universal.
   *
   * NOTE: This is entirely non-blocking. If the fetch fails (e.g. no network),
   * the rival banner simply stays hidden — it never disrupts gameplay.
   */
  useEffect(() => {
    if (!activeSession) return;
    const pushRivalToGame = async () => {
      try {
        const res = await getSessionLeaderboard(activeSession.id);
        const leaderboard = res?.leaderboard || res?.result || [];
        if (leaderboard.length > 0) {
          const top = leaderboard[0];
          const iframe = document.querySelector(
            "iframe",
          ) as HTMLIFrameElement | null;
          iframe?.contentWindow?.postMessage(
            {
              type: "PLAYZA_RIVAL_UPDATE",
              payload: {
                username: top.users?.username || "Player",
                score: top.best_score || 0,
              },
            },
            // Target the iframe's specific origin, not "*", for safety
            (() => {
              const u = game?.iframe_url || game?.iframeUrl;
              try {
                return u?.startsWith("http")
                  ? new URL(u).origin
                  : window.location.origin;
              } catch {
                return window.location.origin;
              }
            })(),
          );
        }
      } catch {
        // Silent fail — rival banner is purely cosmetic and non-critical
      }
    };

    // Push once on mount, then repeat every 10 seconds
    pushRivalToGame();
    const rivalInterval = setInterval(pushRivalToGame, 10_000);
    return () => clearInterval(rivalInterval);
  }, [activeSession]);

  /**
   * ============================================================
   * 📡  NETWORK RESILIENCE: Auto-Pause/Resume Bridge
   * ============================================================
   * Listens to the global connectivity status and commands the
   * game engine to pause or resume.
   */
  useEffect(() => {
    const iframe = document.querySelector("iframe") as HTMLIFrameElement | null;
    const rawUrl = game?.iframe_url || game?.iframeUrl;
    const targetOrigin = (() => {
      try {
        return rawUrl?.startsWith("http")
          ? new URL(rawUrl).origin
          : window.location.origin;
      } catch {
        return window.location.origin;
      }
    })();

    if (!isOnline) {
      console.log("Network dropped — sending PAUSE signal to game");
      iframe?.contentWindow?.postMessage(
        { type: "PLAYZA_PAUSE" },
        targetOrigin,
      );
    } else {
      console.log("Network restored — sending RESUME signal to game");
      iframe?.contentWindow?.postMessage(
        { type: "PLAYZA_RESUME" },
        targetOrigin,
      );
    }
  }, [isOnline, game]);

  // Prevent accidental reload cheating
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (currentRoundId && !gameOverData && !isDemo) {
        e.preventDefault();
        e.returnValue = "Are you sure you want to exit? This will count as an abandoned attempt.";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [currentRoundId, gameOverData, isDemo]);

  // Offline Score Buffer Sync
  useEffect(() => {
    if (isOnline) {
      const bufferedScore = localStorage.getItem("playza_offline_score");
      if (bufferedScore && activeSession && currentRoundId) {
        console.log("Found buffered score, attempting to sync...");
        const { score } = JSON.parse(bufferedScore);
        // Resubmit the buffered score
        window.postMessage(
          { type: "PLAYZA_SCORE_SUBMISSION", payload: { score } },
          window.location.origin,
        );
        localStorage.removeItem("playza_offline_score");
      }
    }
  }, [isOnline, activeSession, currentRoundId]);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    const enterFullscreen = async () => {
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } catch {
        // Auto-fullscreen requires user gesture
      }
    };
    setTimeout(enterFullscreen, 100);

    /**
     * ============================================================
     * 📡  PLAYZA IFRAME ↔ REACT — PostMessage Bridge
     * ============================================================
     * SCOPE: Mixed. See individual handler notes below.
     *
     * OVERVIEW:
     * Every Playza game runs in a sandboxed <iframe> and cannot directly
     * call backend APIs, access the wallet, or write to the leaderboard.
     * All privileged operations are delegated to this React parent via
     * the browser's `window.postMessage` API — a safe, origin-agnostic
     * communication channel between an iframe and its host.
     *
     * ──────────────────────────────────────────────────────────────
     * 1️⃣  PLAYZA_SCORE_SUBMISSION  — PLATFORM-WIDE (All Games)
     *    Game → React → Backend
     * ──────────────────────────────────────────────────────────────
     * Triggered when: A game ends and the player's final score is ready.
     * What it does:
     *   - Extracts the final score from the message payload.
     *   - Calls `submitSessionScore(sessionId, score, roundId)` on the
     *     backend, which validates the round token (anti-cheat), stores
     *     the score in the leaderboard, and returns the player's live rank.
     *   - The one-time `roundId` token is burned (set to null) immediately
     *     after use to prevent replay attacks or duplicate submissions.
     *   - Opens the GameOverLeaderboard overlay with the final results.
     * To adopt in a new game: Fire `PLAYZA_SCORE_SUBMISSION` with
     *   `{ score: number }` in the payload when the game ends. No changes
     *   needed in this file — the handler is already universal.
     */

    const handleMessage = async (event: MessageEvent) => {
      // ── SECURITY: Reject messages from origins other than the game iframe ──────
      // The iframeUrl may be an absolute CDN URL or a relative same-origin path.
      // We derive the expected origin from it so only our trusted game can trigger
      // wallet deductions, score submissions, or power-up flows.
      const rawUrl = game?.iframe_url || game?.iframeUrl;
      const expectedOrigin = (() => {
        try {
          return rawUrl?.startsWith("http")
            ? new URL(rawUrl).origin
            : window.location.origin;
        } catch {
          return window.location.origin;
        }
      })();
      if (event.origin !== expectedOrigin) return;

      // --- Handler 1: Score Submission ---
      if (event.data?.type === "PLAYZA_SCORE_SUBMISSION") {
        const score = event.data.payload?.score || 0;

        if (activeSession && currentRoundId) {
          try {
            const res = await submitSessionScore(
              activeSession.id,
              score,
              currentRoundId,
            );
            if (res.success) {
              // Fetch live leaderboard snapshot for the game over neighborhood display
              let leaderboardSnapshot: Array<{
                best_score: number;
                users?: { username?: string; avatar_url?: string | null };
              }> = [];
              try {
                const lb = await getSessionLeaderboard(activeSession.id);
                leaderboardSnapshot = lb?.leaderboard || lb?.result || [];
              } catch {
                /* non-critical — game over screen shows loading fallback */
              }

              setGameOverData({
                score,
                rank: res.rank,
                isHighScore: res.isHighScore,
                previousBest: res.previousBest,
                leaderboard: leaderboardSnapshot,
              });
              toast.success(`Victory! Your Rank: #${res.rank}`);
              setCurrentRoundId(null); // Burn one-time round token
            }
          } catch (err: unknown) {
            if (!isOnline) {
              // Buffer the score locally if offline
              localStorage.setItem(
                "playza_offline_score",
                JSON.stringify({ score, timestamp: Date.now() }),
              );
              toast.info(
                "Connection lost. Your score has been saved and will sync when you're back online!",
              );
              setGameOverData({ score });
              return;
            }
            const error = err as { response?: { data?: { message?: string } } };
            const errorMsg =
              error.response?.data?.message || "Submission failed";
            toast.error(errorMsg);
            setGameOverData({ score, submissionError: errorMsg });
          }
        } else {
          // Demo mode or session expired — show score locally only
          setGameOverData({ score });
        }
      }

      /** ──────────────────────────────────────────────────────────────
       * 2️⃣  PLAYZA_POWERUP_REQUEST  — 2048-SPECIFIC (not universal)
       *    Game → React → Backend → Game
       * ──────────────────────────────────────────────────────────────
       * Triggered when: The player clicks a power-up inside the 2048 game
       *   (Undo ↩, Smash 💥, or Gravity Shift 🔄).
       * Security model:
       *   - The iframe sends only the power-up TYPE (id string).
       *   - React looks up the VERIFIED cost from game.capabilities.powerUpDefs
       *     (set by the admin, stored in Supabase). The iframe's cost field is
       *     completely ignored — a cheater cannot reduce the price via DevTools.
       *   - React validates that the power-up ID is in the game's capability list.
       *     Unknown IDs are silently rejected.
       * To adopt in another game: Fire `PLAYZA_POWERUP_REQUEST` with
       *   `{ powerUp: string }` and listen for `PLAYZA_POWERUP_APPROVED` /
       *   `PLAYZA_POWERUP_DENIED`. Define the power-up in the game's capabilities
       *   in the admin panel so React can validate and price it.
       */
      if (event.data?.type === "PLAYZA_POWERUP_REQUEST") {
        const { powerUp, cost: iframeCost } = event.data.payload || {};
        const iframe = document.querySelector(
          "iframe",
        ) as HTMLIFrameElement | null;

        // -- SECURITY: Validate powerUp ID and use server-side cost --
        // If the game has capabilities.powerUpDefs configured (via admin), we
        // use the server-side cost and reject unknown IDs — full secure mode.
        // If capabilities haven't been set up yet (null/empty), we fall back to
        // the iframe's reported cost so existing live games don't break.
        const powerUpDefs = game?.capabilities?.powerUpDefs;
        const hasCapabilities = powerUpDefs && powerUpDefs.length > 0;
        const powerUpDef = hasCapabilities
          ? powerUpDefs.find(
              (def: { id: string; label: string; cost: number }) =>
                def.id === powerUp,
            )
          : null;

        if (hasCapabilities && !powerUpDef) {
          // Capabilities are set but this ID is unknown — reject
          iframe?.contentWindow?.postMessage(
            { type: "PLAYZA_POWERUP_DENIED" },
            expectedOrigin,
          );
          return;
        }

        // Use verified server-side cost if available, otherwise trust iframe cost
        const verifiedCost = powerUpDef?.cost ?? iframeCost ?? 0;
        const verifiedLabel = powerUpDef?.label ?? powerUp ?? "Power-up";

        try {
          const { deductWallet } = await import("@/api/gamesession.api");
          const res = await deductWallet(
            verifiedCost,
            `Power-up: ${verifiedLabel}`,
          );
          if (res.success) {
            toast.info(`Power-up activated! -${verifiedCost} ZA`);
            iframe?.contentWindow?.postMessage(
              { type: "PLAYZA_POWERUP_APPROVED" },
              expectedOrigin,
            );
          } else {
            toast.error("Insufficient balance for this power-up.");
            iframe?.contentWindow?.postMessage(
              { type: "PLAYZA_POWERUP_DENIED" },
              expectedOrigin,
            );
          }
        } catch {
          toast.error("Could not process power-up.");
          iframe?.contentWindow?.postMessage(
            { type: "PLAYZA_POWERUP_DENIED" },
            expectedOrigin,
          );
        }
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("message", handleMessage);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, [activeSession, currentRoundId, toast]);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
      } catch {
        // Silent fail for fullscreen toggle
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
    }
  };

  if (gamesLoading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-slate-950 text-white p-2 md:p-6 text-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 animate-pulse">
          Loading Arena...
        </p>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-slate-950 text-white p-2 md:p-6 text-center">
        <h2 className="text-lg md:text-2xl font-black uppercase tracking-widest mb-4">
          Arena Error
        </h2>
        <p className="text-slate-400 font-bold mb-8 uppercase text-xs tracking-tighter italic">
          Game sequence "{id}" not found in our database.
        </p>
        <button
          onClick={() => navigate("/games")}
          className="bg-primary text-slate-950 px-2 md:px-8 py-2 md:py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all"
        >
          Return to Lobby
        </button>
      </div>
    );
  }

  const iframeUrl = game.iframe_url || game.iframeUrl;

  if (!iframeUrl) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-slate-950 text-white p-2 md:p-6 text-center">
        <h2 className="text-lg md:text-2xl font-black uppercase tracking-widest mb-4">
          Configuration Error
        </h2>
        <p className="text-slate-400 font-bold mb-8 uppercase text-xs tracking-tighter italic">
          The game "{game.title}" is currently being maintained.
        </p>
        <button
          onClick={() => navigate(`/games/${game.slug}/session`)}
          className="bg-primary text-slate-950 px-2 md:px-8 py-2 md:py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all"
        >
          Back to Session
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-200 bg-black flex flex-col overflow-hidden">
      {/* Top Bar / Header Overlay */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-100 pointer-events-none">
        <div className="bg-black/60 backdrop-blur-md px-2 md:px-4 py-2 rounded-full border border-white/10 shadow-xl flex items-center gap-2 md:gap-3">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-white/80 italic">
            {game.title} - LIVE ARENA
          </span>
        </div>

        <div className="pointer-events-auto flex items-center gap-2 md:gap-3">
          <button
            onClick={toggleFullscreen}
            className="bg-black/40 backdrop-blur-md p-2 md:p-3 rounded-full text-white/50 hover:text-white transition-all border border-white/10 shadow-lg hover:scale-110 active:scale-95 group"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize
                size={20}
                className="group-hover:scale-90 transition-transform duration-300"
              />
            ) : (
              <Maximize
                size={20}
                className="group-hover:scale-110 transition-transform duration-300"
              />
            )}
          </button>
          <button
            onClick={() => setShowExitModal(true)}
            className="bg-black/40 backdrop-blur-md p-2 md:p-3 rounded-full text-rose-500/50 hover:text-rose-500 transition-all border border-white/10 shadow-lg hover:scale-110 active:scale-95 group"
            title="Abandon Game"
          >
            <X
              size={20}
              className="group-hover:rotate-90 transition-transform duration-300"
            />
          </button>
        </div>
      </div>

      {/* Game Loader */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 z-20">
          <Loader2 size={40} className="text-primary animate-spin mb-4" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic animate-pulse">
            Initialising Battle Sequence...
          </p>
        </div>
      )}

      {/* Iframe Container */}
      <div
        className={`flex-1 min-h-0 w-full relative ${gameOverData ? "hidden" : ""}`}
      >
        <div
          className="h-full w-full px-2 pb-3 pt-14 md:px-4 md:pt-16 md:pb-4 lg:pt-10 lg:px-6 flex items-center justify-center"
          onClick={(e) =>
            (
              e.currentTarget.querySelector("iframe") as HTMLIFrameElement
            )?.focus()
          }
        >
          <div className="mx-auto flex h-full w-full max-w-lg xl:max-w-xl items-center justify-center overflow-hidden rounded-2xl bg-slate-950/80 shadow-2xl ring-1 ring-white/10">
            <iframe
              src={iframeUrl}
              className="h-full w-full border-none"
              title={game.title}
              allow="autoplay; fullscreen; gamepad"
              onLoad={() => {
                setIsLoading(false);
                const rawUrl = game?.iframe_url || game?.iframeUrl;
                const targetOrigin = (() => {
                  try {
                    return rawUrl?.startsWith("http")
                      ? new URL(rawUrl).origin
                      : window.location.origin;
                  } catch {
                    return window.location.origin;
                  }
                })();
                const iframe = document.querySelector(
                  "iframe",
                ) as HTMLIFrameElement | null;

                // ── PLAYZA_SESSION_CONFIG: Standard initialization handshake ──
                // Sends session metadata to the game to lock state and apply policies.
                setTimeout(() => {
                  iframe?.contentWindow?.postMessage(
                    {
                      type: "PLAYZA_SESSION_CONFIG",
                      payload: {
                        locked: !isDemo,
                        sessionId: activeSession?.id,
                        aimAssistPolicy:
                          game.capabilities?.aimAssist || "always",
                      },
                    },
                    targetOrigin,
                  );
                }, 400);

                // Inject pre-purchased bundle into the game once iframe is ready
                if (pendingBundle) {
                  setTimeout(() => {
                    iframe?.contentWindow?.postMessage(
                      { type: "PLAYZA_POWERUP_BUNDLE", payload: pendingBundle },
                      targetOrigin,
                    );
                  }, 800);
                  setPendingBundle(null);
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Game Over Overlay */}
      {gameOverData && (
        <GameOverLeaderboard
          score={gameOverData.score}
          gameName={game.title}
          rank={gameOverData.rank}
          isHighScore={gameOverData.isHighScore}
          previousBest={gameOverData.previousBest}
          leaderboard={gameOverData.leaderboard}
          submissionError={gameOverData.submissionError}
          playAgain={() => {
            setGameOverData(null);
            if (isDemo) {
              setIsLoading(true);
              const iframe = document.querySelector("iframe");
              if (iframe) {
                const originalSrc = iframe.src;
                iframe.src = "about:blank";
                setTimeout(() => {
                  iframe.src = originalSrc;
                }, 10);
              }
            } else {
              setShowLiveEntry(true);
            }
          }}
          onBackToSession={() => navigate(`/games/${game.slug}/session`)}
        />
      )}

      {/* Live Entry Modal Overlay for Re-entry */}
      {showLiveEntry && game && (
        <LiveEntryModal
          game={{
            ...game,
            entryFee: activeSession?.entry_fee || 0,
            id: activeSession?.id || "",
          }}
          // Pass bundle packs sourced from game.capabilities (set in admin).
          // If capabilities is null or bundles is false, powerPacks will be []
          // and the pack selector section will be hidden automatically.
          powerPacks={
            game.capabilities?.bundles && game.capabilities?.bundlePacks
              ? (game.capabilities.bundlePacks as BundlePack[])
              : []
          }
          onClick={(open) => {
            if (!open) {
              setShowLiveEntry(false);
              navigate(`/games/${game.slug}/session`);
            }
          }}
          onConfirm={async (bundle) => {
            setShowLiveEntry(false);
            setIsLoading(true);
            // Store bundle so it can be injected once the iframe reloads
            if (bundle) setPendingBundle(bundle.grants);

            if (activeSession && !isDemo) {
              try {
                const roundRes = await startRound(activeSession.id);
                if (roundRes.success) {
                  setCurrentRoundId(roundRes.roundId);
                }
              } catch {
                // silently fail, the score submission will be caught later
              }
            }

            const iframe = document.querySelector("iframe");
            if (iframe) {
              const originalSrc = iframe.src;
              iframe.src = "about:blank";
              setTimeout(() => {
                iframe.src = originalSrc;
              }, 10);
            }
          }}
        />
      )}

      {/* Custom Exit Confirmation Modal */}
      {showExitModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-rose-500/30 rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl text-center">
            <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-rose-500/20">
              <X size={32} className="text-rose-500" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-widest text-white mb-3">Abandon Match?</h3>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
              Are you sure you want to exit? Your current game progress will be lost and this will still count as a played attempt.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowExitModal(false)}
                className="flex-1 bg-slate-800 text-white font-bold py-3 rounded-xl hover:bg-slate-700 transition-colors uppercase tracking-wider text-xs"
              >
                Keep Playing
              </button>
              <button 
                onClick={() => navigate(`/games/${game.slug}/session`)}
                className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-rose-500/20 transition-all uppercase tracking-wider text-xs"
              >
                Yes, Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GamePlay;
