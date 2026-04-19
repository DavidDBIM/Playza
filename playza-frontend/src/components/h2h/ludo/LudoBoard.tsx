import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GameState, PieceColor } from './useLudoGame';

interface LudoBoardProps {
  gameState: GameState;
  onPieceClick: (id: string) => void;
  myColors: PieceColor[];
}

const LudoBoard: React.FC<LudoBoardProps> = ({ gameState, onPieceClick, myColors }) => {
  const getCellPos = (color: PieceColor, pos: number) => {
    if (pos === -1) {
      const offsetData = {
        red: [{r:2,c:2}, {r:2,c:4}, {r:4,c:2}, {r:4,c:4}],
        green: [{r:2,c:10}, {r:2,c:12}, {r:4,c:10}, {r:4,c:12}],
        yellow: [{r:10,c:10}, {r:10,c:12}, {r:12,c:10}, {r:12,c:12}],
        blue: [{r:10,c:2}, {r:10,c:4}, {r:12,c:2}, {r:12,c:4}]
      };
      return offsetData[color][pos % 4];
    }

    const standardPath = [
       {r:6,c:1}, {r:6,c:2}, {r:6,c:3}, {r:6,c:4}, {r:6,c:5},
       {r:5,c:6}, {r:4,c:6}, {r:3,c:6}, {r:2,c:6}, {r:1,c:6}, {r:0,c:6},
       {r:0,c:7}, {r:0,c:8},
       {r:1,c:8}, {r:2,c:8}, {r:3,c:8}, {r:4,c:8}, {r:5,c:8},
       {r:6,c:9}, {r:6,c:10}, {r:6,c:11}, {r:6,c:12}, {r:6,c:13}, {r:6,c:14},
       {r:7,c:14}, {r:8,c:14},
       {r:8,c:13}, {r:8,c:12}, {r:8,c:11}, {r:8,c:10}, {r:8,c:9},
       {r:9,c:8}, {r:10,c:8}, {r:11,c:8}, {r:12,c:8}, {r:13,c:8}, {r:14,c:8},
       {r:14,c:7}, {r:14,c:6},
       {r:13,c:6}, {r:12,c:6}, {r:11,c:6}, {r:10,c:6}, {r:9,c:6},
       {r:8,c:5}, {r:8,c:4}, {r:8,c:3}, {r:8,c:2}, {r:8,c:1}, {r:8,c:0},
       {r:7,c:0}
    ];

    const getGlobalPos = (c: PieceColor, p: number) => {
      const offsets = { red: 0, green: 13, yellow: 26, blue: 39 };
      return (p + offsets[c]) % 52;
    };

    if (pos >= 0 && pos <= 51) {
      return standardPath[getGlobalPos(color, pos)];
    }

    if (pos >= 52 && pos <= 56) {
      const homeSteps = pos - 52; 
      if (color === "red") return { r: 7, c: 1 + homeSteps };
      if (color === "green") return { r: 1 + homeSteps, c: 7 };
      if (color === "yellow") return { r: 7, c: 13 - homeSteps };
      if (color === "blue") return { r: 13 - homeSteps, c: 7 };
    }

    return { r: 7, c: 7 };
  };

  const colorStyles: Record<PieceColor, string> = {
    red: "bg-red-500",
    green: "bg-emerald-400",
    yellow: "bg-yellow-400",
    blue: "bg-blue-400"
  };

  return (
    <div className="relative w-full max-w-125 aspect-square mx-auto bg-white rounded-xl md:rounded-2xl shadow-2xl overflow-hidden border-4 md:border-8 border-slate-100 min-h-87.5 md:min-h-125">
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 15 15">
        <rect x="0" y="0" width="6" height="6" fill="#fca5a5" />
        <rect x="9" y="0" width="6" height="6" fill="#6ee7b7" />
        <rect x="9" y="9" width="6" height="6" fill="#fde047" />
        <rect x="0" y="9" width="6" height="6" fill="#93c5fd" />

        <polygon points="6,6 9,6 7.5,7.5" fill="#6ee7b7" />
        <polygon points="9,6 9,9 7.5,7.5" fill="#fde047" />
        <polygon points="9,9 6,9 7.5,7.5" fill="#93c5fd" />
        <polygon points="6,9 6,6 7.5,7.5" fill="#fca5a5" />

        <g stroke="#cbd5e1" strokeWidth="0.05">
          {[6, 7, 8, 9].map((i) => (
            <line key={`v${i}`} x1={i} y1={0} x2={i} y2={15} />
          ))}
          {[6, 7, 8, 9].map((i) => (
            <line key={`h${i}`} x1={0} y1={i} x2={15} y2={i} />
          ))}
          {[1, 2, 3, 4, 5, 10, 11, 12, 13, 14].map((i) => (
            <React.Fragment key={`sub${i}`}>
              <line x1={i} y1={6} x2={i} y2={9} />
              <line x1={6} y1={i} x2={9} y2={i} />
            </React.Fragment>
          ))}
        </g>

        <rect x="1" y="6" width="1" height="1" fill="#fca5a5" />
        <rect x="8" y="1" width="1" height="1" fill="#6ee7b7" />
        <rect x="13" y="8" width="1" height="1" fill="#fde047" />
        <rect x="6" y="13" width="1" height="1" fill="#93c5fd" />

        {[1, 2, 3, 4, 5].map((i) => (
          <rect
            key={`rh${i}`}
            x={i}
            y="7"
            width="1"
            height="1"
            fill="#fca5a5"
          />
        ))}
        {[1, 2, 3, 4, 5].map((i) => (
          <rect
            key={`gh${i}`}
            x="7"
            y={i}
            width="1"
            height="1"
            fill="#6ee7b7"
          />
        ))}
        {[9, 10, 11, 12, 13].map((i) => (
          <rect
            key={`yh${i}`}
            x={i}
            y="7"
            width="1"
            height="1"
            fill="#fde047"
          />
        ))}
        {[9, 10, 11, 12, 13].map((i) => (
          <rect
            key={`bh${i}`}
            x="7"
            y={i}
            width="1"
            height="1"
            fill="#93c5fd"
          />
        ))}

        <rect x="1" y="1" width="4" height="4" fill="white" rx="0.5" />
        <rect x="10" y="1" width="4" height="4" fill="white" rx="0.5" />
        <rect x="10" y="10" width="4" height="4" fill="white" rx="0.5" />
        <rect x="1" y="10" width="4" height="4" fill="white" rx="0.5" />
      </svg>

      <AnimatePresence>
        {gameState.pieces.map((piece, i) => {
          const isHome = piece.position === -1;
          const posData = isHome ? i % 4 : piece.position;

          let cell;
          if (isHome) {
            const offsets = {
              red: [
                { r: 1.5, c: 1.5 },
                { r: 1.5, c: 3.5 },
                { r: 3.5, c: 1.5 },
                { r: 3.5, c: 3.5 },
              ],
              green: [
                { r: 1.5, c: 10.5 },
                { r: 1.5, c: 12.5 },
                { r: 3.5, c: 10.5 },
                { r: 3.5, c: 12.5 },
              ],
              yellow: [
                { r: 10.5, c: 10.5 },
                { r: 10.5, c: 12.5 },
                { r: 12.5, c: 10.5 },
                { r: 12.5, c: 12.5 },
              ],
              blue: [
                { r: 10.5, c: 1.5 },
                { r: 10.5, c: 3.5 },
                { r: 12.5, c: 1.5 },
                { r: 12.5, c: 3.5 },
              ],
            };
            cell = offsets[piece.color][posData];
          } else {
            cell = getCellPos(piece.color, piece.position);
          }

          if (!cell) return null;

          const isActiveTurn =
            myColors.includes(gameState.turn) &&
            gameState.hasRolled &&
            piece.color === gameState.turn;
          const canMove =
            (piece.position === -1 && gameState.diceValue === 6) ||
            (piece.position !== -1 &&
              piece.position + gameState.diceValue! <= 57);

          return (
            <motion.div
              key={piece.id}
              initial={false}
              animate={{
                top: `${(cell.r + (isHome ? 0 : 0.5)) * (100 / 15)}%`,
                left: `${(cell.c + (isHome ? 0 : 0.5)) * (100 / 15)}%`,
                transform: "translate(-50%, -50%) scale(1)",
              }}
              whileHover={isActiveTurn && canMove ? { scale: 1.3 } : {}}
              onClick={() => onPieceClick(piece.id)}
              className={`absolute w-[4.5%] h-[4.5%] md:w-[5.5%] md:h-[5.5%] rounded-full shadow-[0_3px_5px_rgba(0,0,0,0.4)] border-[3px] border-white cursor-pointer transition-colors z-10
                ${colorStyles[piece.color]}
                ${isActiveTurn && canMove ? "ring-4 ring-indigo-500 animate-bounce" : ""}
              `}
              style={{ zIndex: 10 + Math.max(0, piece.position) }}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default LudoBoard;
