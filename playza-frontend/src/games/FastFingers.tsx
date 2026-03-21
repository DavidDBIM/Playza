import { useState, useEffect } from 'react';
import { X, Trophy, Clock } from 'lucide-react';

interface FastFingersProps {
  mode: 'demo' | 'live';
  onExit: () => void;
}

const SAMPLE_WORDS = [
  'speed', 'quick', 'fast', 'typing', 'keyboard', 'fingers', 'practice', 'champion',
  'winner', 'player', 'game', 'score', 'blazing', 'lightning', 'rapid', 'swift'
];

export function FastFingers({ mode, onExit }: FastFingersProps) {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [currentWord, setCurrentWord] = useState('');
  const [userInput, setUserInput] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [wordsCompleted, setWordsCompleted] = useState(0);

  useEffect(() => {
    generateWord();
  }, []);

  useEffect(() => {
    if (timeLeft > 0 && !gameOver) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setGameOver(true);
    }
  }, [timeLeft, gameOver]);

  const generateWord = () => {
    const randomWord = SAMPLE_WORDS[Math.floor(Math.random() * SAMPLE_WORDS.length)];
    setCurrentWord(randomWord);
    setUserInput('');
  };

  const handleInputChange = (value: string) => {
    setUserInput(value);
    if (value === currentWord) {
      const points = mode === 'live' ? 150 : 75;
      setScore(score + points);
      setWordsCompleted(wordsCompleted + 1);
      generateWord();
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-900 via-slate-900 to-slate-800 text-slate-900 dark:text-white px-4 py-24">
      <div className="max-w-2xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-4xl">⚡</div>
            <div>
              <h2 className="text-2xl font-bold">Fast Fingers</h2>
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
            <div className="text-2xl mb-1">📝</div>
            <div className="text-2xl font-bold text-green-400">
              {wordsCompleted}
            </div>
            <div className="text-xs text-gray-400">Words</div>
          </div>
        </div>

        {!gameOver ? (
          <div className="bg-linear-to-b from-gray-800 to-gray-900 rounded-2xl p-8 border-2 border-gray-700">
            <div className="text-center mb-8">
              <p className="text-gray-400 mb-4">Type this word:</p>
              <h3 className="text-6xl font-bold mb-8 text-yellow-400 tracking-wide">
                {currentWord}
              </h3>
            </div>
            <input
              type="text"
              value={userInput}
              onChange={(e) => handleInputChange(e.target.value)}
              className="w-full bg-gray-700 border-2 border-gray-600 rounded-xl px-6 py-4 text-3xl text-center font-bold outline-none focus:border-green-500"
              placeholder="Type here..."
              autoFocus
            />
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">
                {userInput.split("").map((char, i) => (
                  <span
                    key={i}
                    className={
                      char === currentWord[i]
                        ? "text-green-400"
                        : "text-red-400"
                    }
                  >
                    {char}
                  </span>
                ))}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-linear-to-b from-gray-800 to-gray-900 rounded-2xl p-8 border-2 border-yellow-600/50 text-center">
            <div className="text-6xl mb-4">⚡</div>
            <h3 className="text-3xl font-bold mb-2">Time's Up!</h3>
            <div className="text-5xl font-bold text-yellow-400 mb-2">
              {score}
            </div>
            <p className="text-gray-400 mb-2">Final Score</p>
            <p className="text-gray-500 mb-6">{wordsCompleted} words typed</p>
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
