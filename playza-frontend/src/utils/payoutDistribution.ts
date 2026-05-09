export function calculateDistributionCurve(totalPlayers: number): number[] {
  let winnerCount = 1;
  if (totalPlayers >= 100) winnerCount = Math.floor(totalPlayers * 0.2);
  else if (totalPlayers >= 31) winnerCount = 10;
  else if (totalPlayers >= 16) winnerCount = 5;
  else if (totalPlayers >= 6) winnerCount = 3;
  else winnerCount = 1;

  winnerCount = Math.min(winnerCount, totalPlayers);
  if (winnerCount < 1) winnerCount = 1;

  if (winnerCount === 1) return [1.0];
  if (winnerCount === 3) return [0.5, 0.3, 0.2];
  if (winnerCount === 5) return [0.4, 0.25, 0.15, 0.1, 0.1];
  if (winnerCount === 10) return [0.30, 0.20, 0.12, 0.10, 0.08, 0.06, 0.05, 0.04, 0.03, 0.02];

  const distribution: number[] = [0.25, 0.15, 0.10];
  const remainingPool = 0.50;
  const remainingWinners = winnerCount - 3;
  
  if (remainingWinners > 0) {
    const weights = [];
    let weightSum = 0;
    const k = Math.log(4) / remainingWinners;
    for (let i = 0; i < remainingWinners; i++) {
      const w = Math.exp(-k * i);
      weights.push(w);
      weightSum += w;
    }
    for (let i = 0; i < remainingWinners; i++) {
      distribution.push((weights[i] / weightSum) * remainingPool);
    }
  }

  const sum = distribution.reduce((a,b) => a+b, 0);
  return distribution.map(d => Number((d / sum).toFixed(4)));
}
