export function calculatePrizePool(
  entryFee: number,
  players: number,
  platformFeePercentage: number,
) {
  const totalCollected = entryFee * players;
  const platformCut = totalCollected * (platformFeePercentage / 100);

  return Math.floor(totalCollected - platformCut);
}
