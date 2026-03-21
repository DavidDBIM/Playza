import { useState, useEffect } from 'react';
import { X, Trophy, Clock } from 'lucide-react';

interface BrainBlitzProps {
  mode: 'demo' | 'live';
  onExit: () => void;
}

export function BrainBlitz({ mode, onExit }: BrainBlitzProps) {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [question, setQuestion] = useState({ num1: 0, num2: 0, answer: 0 });
  const [userAnswer, setUserAnswer] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [streak, setStreak] = useState(0);

  const generateQuestion = () => {
    const num1 = Math.floor(Math.random() * 20) + 1;
    const num2 = Math.floor(Math.random() * 20) + 1;
    setQuestion({ num1, num2, answer: num1 + num2 });
    setUserAnswer("");
  };
  
  useEffect(() => {
    generateQuestion();
  }, []);

  useEffect(() => {
    if (timeLeft > 0 && !gameOver) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setGameOver(true);
    }
  }, [timeLeft, gameOver]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(userAnswer) === question.answer) {
      const points = mode === 'live' ? 100 : 50;
      setScore(score + points + (streak * 10));
      setStreak(streak + 1);
      generateQuestion();
    } else {
      setStreak(0);
      generateQuestion();
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-900 via-slate-900 to-slate-800 text-slate-900 dark:text-white px-4 py-24">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-4xl">🧠</div>
            <div>
              <h2 className="text-2xl font-bold">Brain Blitz</h2>
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
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-linear-to-b from-gray-800 to-gray-900 rounded-xl p-4 border border-gray-700 text-center">
            <Trophy className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
            <div className="text-2xl font-bold text-yellow-400">{score}</div>
            <div className="text-xs text-gray-400">Score</div>
          </div>
          <div className="bg-linear-to-b from-gray-800 to-gray-900 rounded-xl p-4 border border-gray-700 text-center">
            <Clock className="w-6 h-6 text-blue-400 mx-auto mb-1" />
            <div className="text-2xl font-bold text-blue-400">{timeLeft}s</div>
            <div className="text-xs text-gray-400">Time Left</div>
          </div>
          <div className="bg-linear-to-b from-gray-800 to-gray-900 rounded-xl p-4 border border-gray-700 text-center">
            <div className="text-2xl mb-1">🔥</div>
            <div className="text-2xl font-bold text-orange-400">{streak}</div>
            <div className="text-xs text-gray-400">Streak</div>
          </div>
        </div>

        {!gameOver ? (
          <div className="bg-linear-to-b from-gray-800 to-gray-900 rounded-2xl p-8 border-2 border-gray-700">
            <div className="text-center mb-8">
              <h3 className="text-6xl font-bold mb-4">
                {question.num1} + {question.num2} = ?
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="number"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                className="w-full bg-gray-700 border-2 border-gray-600 rounded-xl px-6 py-4 text-3xl text-center font-bold outline-none focus:border-green-500"
                placeholder="?"
                autoFocus
              />
              <button
                type="submit"
                className="w-full bg-linear-to-b from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-slate-900 dark:text-white font-bold py-4 rounded-xl transition-all shadow-lg"
              >
                Submit Answer
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-linear-to-b from-gray-800 to-gray-900 rounded-2xl p-8 border-2 border-yellow-600/50 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-3xl font-bold mb-2">Game Over!</h3>
            <div className="text-5xl font-bold text-yellow-400 mb-4">
              {score}
            </div>
            <p className="text-gray-400 mb-6">Final Score</p>
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
