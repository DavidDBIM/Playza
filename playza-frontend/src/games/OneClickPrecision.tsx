import { useState, useEffect } from 'react';
import { X, Trophy, Clock } from 'lucide-react';

interface OneClickPrecisionProps {
  mode: 'demo' | 'live';
  onExit: () => void;
}

export function OneClickPrecision({ mode, onExit }: OneClickPrecisionProps) {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [targetPosition, setTargetPosition] = useState({ x: 50, y: 50 });
  const [targetSize, setTargetSize] = useState(80);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    generateTarget();
  }, []);

  useEffect(() => {
    if (timeLeft > 0 && !gameOver) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setGameOver(true);
    }
  }, [timeLeft, gameOver]);

  const generateTarget = () => {
    const x = Math.random() * 80 + 10; // 10% to 90%
    const y = Math.random() * 70 + 15; // 15% to 85%
    const size = Math.max(30, 80 - (hits * 3)); // Shrinks as you progress
    setTargetPosition({ x, y });
    setTargetSize(size);
  };

  const handleTargetClick = () => {
    const points = mode === 'live' ? 200 : 100;
    const bonus = Math.max(0, 50 - targetSize);
    setScore(score + points + bonus);
    setHits(hits + 1);
    generateTarget();
  };

  const handleMissClick = () => {
    setMisses(misses + 1);
  };

  const accuracy = hits + misses > 0 ? Math.round((hits / (hits + misses)) * 100) : 0;

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-900 via-slate-900 to-slate-800 text-slate-900 dark:text-white px-4 py-24">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-4xl">🎯</div>
            <div>
              <h2 className="text-2xl font-bold">One-Click Precision</h2>
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
            <div className="text-2xl mb-1">✓</div>
            <div className="text-xl font-bold text-green-400">{hits}</div>
            <div className="text-xs text-gray-400">Hits</div>
          </div>
          <div className="bg-linear-to-b from-gray-800 to-gray-900 rounded-xl p-4 border border-gray-700 text-center">
            <div className="text-2xl mb-1">📊</div>
            <div className="text-xl font-bold text-purple-400">{accuracy}%</div>
            <div className="text-xs text-gray-400">Accuracy</div>
          </div>
        </div>

        {!gameOver ? (
          <div
            className="relative bg-linear-to-b from-gray-800 to-gray-900 rounded-2xl border-2 border-gray-700 overflow-hidden"
            style={{ height: "500px" }}
            onClick={handleMissClick}
          >
            <div className="absolute inset-0 flex items-center justify-center text-gray-600 text-sm">
              Click the targets!
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleTargetClick();
              }}
              className="absolute bg-red-600 hover:bg-red-500 rounded-full transition-all shadow-lg animate-pulse"
              style={{
                left: `${targetPosition.x}%`,
                top: `${targetPosition.y}%`,
                width: `${targetSize}px`,
                height: `${targetSize}px`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center text-slate-900 dark:text-white font-bold text-2xl">
                🎯
              </div>
            </button>
          </div>
        ) : (
          <div className="bg-linear-to-b from-gray-800 to-gray-900 rounded-2xl p-8 border-2 border-yellow-600/50 text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-3xl font-bold mb-2">Perfect!</h3>
            <div className="text-5xl font-bold text-yellow-400 mb-2">
              {score}
            </div>
            <p className="text-gray-400 mb-2">Final Score</p>
            <p className="text-gray-500 mb-2">
              {hits} hits • {accuracy}% accuracy
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
