import { useState, useEffect } from 'react';
import { X, Trophy, Clock } from 'lucide-react';

interface SpeedTapArenaProps {
  mode: 'demo' | 'live';
  onExit: () => void;
}

export function SpeedTapArena({ mode, onExit }: SpeedTapArenaProps) {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [taps, setTaps] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [combo, setCombo] = useState(0);
  const [lastTapTime, setLastTapTime] = useState(Date.now());

  useEffect(() => {
    if (timeLeft > 0 && !gameOver) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setGameOver(true);
    }
  }, [timeLeft, gameOver]);

  useEffect(() => {
    // Reset combo if no tap for 1 second
    const comboTimer = setInterval(() => {
      if (Date.now() - lastTapTime > 1000 && combo > 0) {
        setCombo(0);
      }
    }, 100);
    return () => clearInterval(comboTimer);
  }, [lastTapTime, combo]);

  const handleTap = () => {
    if (gameOver) return;

    const now = Date.now();
    const timeSinceLastTap = now - lastTapTime;
    
    // Combo logic: fast taps increase combo
    let newCombo = combo;
    if (timeSinceLastTap < 300) {
      newCombo = combo + 1;
    } else {
      newCombo = 0;
    }
    
    setCombo(newCombo);
    setLastTapTime(now);
    
    const basePoints = mode === 'live' ? 10 : 5;
    const comboBonus = newCombo * 2;
    setScore(score + basePoints + comboBonus);
    setTaps(taps + 1);
  };

  const tapsPerSecond = taps > 0 ? (taps / (30 - timeLeft)).toFixed(1) : '0.0';

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-900 via-slate-900 to-slate-800 text-slate-900 dark:text-white px-4 py-24">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-4xl">🔥</div>
            <div>
              <h2 className="text-2xl font-bold">SpeedTap Arena</h2>
              <p className="text-sm text-gray-400">
                {mode === "live" ? "🔴 LIVE MODE" : "🎮 DEMO MODE"}
              </p>
            </div>
          </div>
          <button
            onClick={onExit}
            className="bg-gray-800 hover:bg-gray-700 p-2 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="bg-linear-to-b from-gray-800 to-gray-900 rounded-xl p-4 border border-gray-700 text-center">
            <Trophy className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
            <div className="text-xl font-bold text-yellow-400">{score}</div>
            <div className="text-xs text-gray-400">Score</div>
          </div>
          <div className="bg-linear-to-b from-gray-800 to-gray-900 rounded-xl p-4 border border-gray-700 text-center">
            <Clock className="w-6 h-6 text-blue-400 mx-auto mb-1" />
            <div className="text-xl font-bold text-blue-400">{timeLeft}s</div>
            <div className="text-xs text-gray-400">Time</div>
          </div>
          <div className="bg-linear-to-b from-gray-800 to-gray-900 rounded-xl p-4 border border-gray-700 text-center">
            <div className="text-2xl mb-1">👆</div>
            <div className="text-xl font-bold text-green-400">{taps}</div>
            <div className="text-xs text-gray-400">Taps</div>
          </div>
          <div className="bg-linear-to-b from-gray-800 to-gray-900 rounded-xl p-4 border border-gray-700 text-center">
            <div className="text-2xl mb-1">🔥</div>
            <div className="text-xl font-bold text-orange-400">{combo}x</div>
            <div className="text-xs text-gray-400">Combo</div>
          </div>
        </div>

        {!gameOver ? (
          <div className="space-y-4">
            <div className="bg-linear-to-b from-gray-800 to-gray-900 rounded-2xl p-6 border-2 border-gray-700 text-center">
              <p className="text-gray-400 mb-4">Tap as fast as you can!</p>
              <p className="text-5xl font-bold text-yellow-400 mb-2">
                {tapsPerSecond}
              </p>
              <p className="text-sm text-gray-500">taps per second</p>
            </div>

            <button
              onClick={handleTap}
              className={`w-full h-64 rounded-2xl font-bold text-3xl transition-all ${
                combo > 10
                  ? "bg-linear-to-b from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 shadow-2xl shadow-red-500/50 scale-105"
                  : combo > 5
                    ? "bg-linear-to-b from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 shadow-xl shadow-orange-500/30"
                    : "bg-linear-to-b from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 shadow-lg"
              } active:scale-95`}
            >
              <div className="text-6xl mb-2">👆</div>
              TAP HERE!
              {combo > 0 && (
                <div className="text-5xl mt-4 text-yellow-300 animate-pulse">
                  {combo}x COMBO! 🔥
                </div>
              )}
            </button>
          </div>
        ) : (
          <div className="bg-linear-to-b from-gray-800 to-gray-900 rounded-2xl p-8 border-2 border-yellow-600/50 text-center">
            <div className="text-6xl mb-4">🔥</div>
            <h3 className="text-3xl font-bold mb-2">Blazing Fast!</h3>
            <div className="text-5xl font-bold text-yellow-400 mb-2">
              {score}
            </div>
            <p className="text-gray-400 mb-2">Final Score</p>
            <p className="text-gray-500 mb-2">
              {taps} total taps • {tapsPerSecond} taps/sec
            </p>
            {mode === "live" && (
              <div className="bg-green-900/40 border border-green-600/50 rounded-xl p-4 mb-6">
                <p className="text-green-400 font-semibold">
                  💰 Earned: {Math.floor(score / 10)} ZG
                </p>
              </div>
            )}
            <button
              onClick={onExit}
              className="w-full bg-linear-to-b from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-slate-900 dark:text-white font-bold py-4 rounded-xl transition-all"
            >
              Back to Games
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
