import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/context/toast";

export type PieceColor = "red" | "green" | "yellow" | "blue";
export type PlayerSide = "host" | "guest";

export interface LudoPiece {
  id: string;
  color: PieceColor;
  position: number; // -1 if at home, 0-51 for main track, 52-56 for home stretch, 57 if finished
}

export interface GameState {
  pieces: LudoPiece[];
  turn: PieceColor;
  diceValue: number | null;
  hasRolled: boolean;
  sixCount: number;
  winner: PlayerSide | null;
  history: string[];
}

const INITIAL_PIECES: LudoPiece[] = [
  { id: "r1", color: "red", position: -1 }, { id: "r2", color: "red", position: -1 }, { id: "r3", color: "red", position: -1 }, { id: "r4", color: "red", position: -1 },
  { id: "g1", color: "green", position: -1 }, { id: "g2", color: "green", position: -1 }, { id: "g3", color: "green", position: -1 }, { id: "g4", color: "green", position: -1 },
  { id: "y1", color: "yellow", position: -1 }, { id: "y2", color: "yellow", position: -1 }, { id: "y3", color: "yellow", position: -1 }, { id: "y4", color: "yellow", position: -1 },
  { id: "b1", color: "blue", position: -1 }, { id: "b2", color: "blue", position: -1 }, { id: "b3", color: "blue", position: -1 }, { id: "b4", color: "blue", position: -1 },
];

const NEXT_TURN: Record<PieceColor, PieceColor> = {
  red: "green",
  green: "yellow",
  yellow: "blue",
  blue: "red",
};

export function useLudoGame(isHost: boolean, isBotRoom: boolean) {
  const [gameState, setGameState] = useState<GameState>({
    pieces: INITIAL_PIECES,
    turn: "red", // Red starts
    diceValue: null,
    hasRolled: false,
    sixCount: 0,
    winner: null,
    history: ["Game started! Host controls Red & Yellow. Rival controls Green & Blue."],
  });

  const [isRolling, setIsRolling] = useState(false);
  const [animatedDice, setAnimatedDice] = useState<number>(1);
  const toast = useToast();

  const myColors: PieceColor[] = isHost ? ["red", "yellow"] : ["green", "blue"];
  const isMyTurn = myColors.includes(gameState.turn);
  const mySide: PlayerSide = isHost ? "host" : "guest";

  const executeRoll = useCallback(() => {
    if (gameState.hasRolled || gameState.winner || (!isMyTurn && !isBotRoom) || isRolling) return;
    
    setIsRolling(true);
    let rolls = 0;
    const finalValue = Math.floor(Math.random() * 6) + 1;
    
    const interval = setInterval(() => {
      setAnimatedDice(Math.floor(Math.random() * 6) + 1);
      rolls++;
      if (rolls >= 10) {
        clearInterval(interval);
        setAnimatedDice(finalValue);
        
        // Settle state
        setGameState(prev => {
          let nextTurn = prev.turn;
          let nextSixCount = prev.sixCount;

          if (finalValue === 6) {
            nextSixCount++;
          } else {
            nextSixCount = 0;
          }

          const pieces = prev.pieces.filter(p => p.color === prev.turn);
          const canMove = pieces.some(p => {
            if (p.position === 57) return false;
            if (p.position === -1) return finalValue === 6;
            return p.position + finalValue <= 57;
          });

          let hasRolled = true;
          let nextDiceValue: number | null = finalValue;
          if (!canMove || nextSixCount === 3) {
            if (nextSixCount === 3) {
              toast.error("Three 6s! Turn lost.");
            } else {
              if (prev.turn === myColors[0] || prev.turn === myColors[1]) {
                 toast.info(`No valid moves for ${prev.turn}.`);
              }
            }
            nextTurn = NEXT_TURN[prev.turn];
            hasRolled = false;
            nextSixCount = 0;
            nextDiceValue = null; // Essential fix: reset dice to unblock next player
          }

          return {
            ...prev,
            diceValue: nextDiceValue,
            hasRolled: canMove ? hasRolled : false,
            turn: nextTurn,
            sixCount: nextSixCount,
            history: [...prev.history, `${prev.turn} rolled a ${finalValue}`],
          };
        });
        setIsRolling(false);
      }
    }, 80);
  }, [gameState.hasRolled, gameState.winner, isMyTurn, isBotRoom, isRolling, myColors, toast]);

  const movePiece = useCallback((pieceId: string) => {
    if (!gameState.hasRolled || gameState.winner || isRolling) return;

    setGameState(prev => {
      const piece = prev.pieces.find(p => p.id === pieceId);
      if (!piece || piece.color !== prev.turn) return prev;

      const value = prev.diceValue!;
      let nextPos = piece.position;

      if (piece.position === -1) {
        if (value === 6) {
          nextPos = 0;
        } else {
          return prev;
        }
      } else {
        if (piece.position + value > 57) return prev;
        nextPos = piece.position + value;
      }

      const newPieces = [...prev.pieces];
      const pIndex = newPieces.findIndex(p => p.id === pieceId);
      
      const getGlobalPos = (c: PieceColor, p: number) => {
        if (p < 0 || p >= 52) return null;
        const offsets = { red: 0, green: 13, yellow: 26, blue: 39 };
        return (p + offsets[c]) % 52;
      };

      const globalPos = getGlobalPos(piece.color, nextPos);
      let captured = false;

      // Safe squares: Start boxes + star boxes
      const isSafe = [0, 8, 13, 21, 26, 34, 39, 47].includes(globalPos || -1);

      if (globalPos !== null && !isSafe) {
        newPieces.forEach(other => {
          if (other.color !== piece.color) {
            const opGlobal = getGlobalPos(other.color, other.position);
            if (opGlobal === globalPos) {
              other.position = -1;
              captured = true;
              toast.success(`${piece.color} captured ${other.color}'s piece!`);
            }
          }
        });
      }

      newPieces[pIndex] = { ...piece, position: nextPos };

      // Win condition: All 8 pieces for a user
      const isRedYellowFinished = newPieces.filter(p => ["red", "yellow"].includes(p.color)).every(p => p.position === 57);
      const isGreenBlueFinished = newPieces.filter(p => ["green", "blue"].includes(p.color)).every(p => p.position === 57);
      
      let winner: PlayerSide | null = null;
      if (isRedYellowFinished) winner = "host";
      if (isGreenBlueFinished) winner = "guest";

      let nextTurn = prev.turn;
      let nextSixCount = prev.sixCount;

      if (value !== 6 && !captured && nextPos !== 57) {
        nextTurn = NEXT_TURN[prev.turn];
        nextSixCount = 0;
      }

      return {
        ...prev,
        pieces: newPieces,
        hasRolled: false,
        diceValue: null,
        turn: nextTurn,
        sixCount: nextSixCount,
        winner,
        history: [...prev.history, `${prev.turn} moved piece to ${nextPos}`],
      };
    });
  }, [gameState.hasRolled, gameState.winner, isRolling, toast]);

  useEffect(() => {
    if (isBotRoom && !myColors.includes(gameState.turn) && !gameState.winner && !isRolling) {
      if (!gameState.hasRolled && gameState.diceValue === null) {
        const t = setTimeout(() => executeRoll(), 1000);
        return () => clearTimeout(t);
      } else if (gameState.hasRolled && gameState.diceValue !== null) {
        const pieces = gameState.pieces.filter(p => p.color === gameState.turn);
        const pieceToMove = pieces.find(p => p.position === -1) && gameState.diceValue === 6 
          ? pieces.find(p => p.position === -1) 
          : pieces.find(p => p.position !== -1 && p.position + gameState.diceValue! <= 57);
        
        if (pieceToMove) {
          const t = setTimeout(() => movePiece(pieceToMove.id), 1200);
          return () => clearTimeout(t);
        }
      }
    }
  }, [isBotRoom, gameState, executeRoll, movePiece, myColors, isRolling]);

  return {
    gameState,
    executeRoll,
    movePiece,
    myColors,
    mySide,
    isMyTurn,
    animatedDice,
    isRolling,
  };
}
