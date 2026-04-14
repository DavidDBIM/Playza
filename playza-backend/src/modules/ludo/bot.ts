export const SYSTEM_BOT_ID = 'SYSTEM_BOT'

// The bot logic here is basic, just taking the first available valid move when prompted.
// Real game logic dictates move validity in service, so we don't need complex AST here.
export function getBotLudoMove(pieces: any[], diceValue: number, colorFilter: string[]) {
  const myPieces = pieces.filter((p: any) => colorFilter.includes(p.color));
  
  // Try to move out of home if dice is 6
  if (diceValue === 6) {
    const homePiece = myPieces.find((p: any) => p.position === -1);
    if (homePiece) return homePiece.id;
  }
  
  // Otherwise move randomly among movable pieces
  const movable = myPieces.filter((p: any) => p.position !== -1 && p.position + diceValue <= 57);
  if (movable.length > 0) {
    return movable[Math.floor(Math.random() * movable.length)].id;
  }
  return null;
}
