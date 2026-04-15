import type { Game } from "@/types/types";

export const tournamentGames: Game[] = [
  {
    id: "14",
    title: "Speed Tap Arena",
    slug: "speed-tap-arena",
    thumbnail: "/games/speed-tap.png",
    iframeUrl: "/games/speed-tap-arena",
    category: "Arcade",
    mode: "Tournament",
    entryFee: 1000,
    difficulty: "Hard",
    durationInSeconds: 60,
    status: "live",
    activePlayers: 450,
    ctaLabel: "Tap Fast",
    badge: "HOT",
    platformFeePercentage: 10,
    howToPlay: {
      controls:
        "Tap the green targets as they appear. Avoid red traps. Hit blue for multiplier and white to freeze time.",
      rules:
        "Score as many points as possible before time runs out. The game gets faster and more chaotic over time.",
      scoring:
        "+10 for targets, -5 for traps. Combo multipliers build up with consecutive hits.",
    },
    createdAt: "2026-04-15T00:00:00Z",
    updatedAt: "2026-04-15T00:00:00Z",
  },
];
