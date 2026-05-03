export interface SoloGame {
  id: string;
  title: string;
  label: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Extreme";
  thumbnail: string;
  path: string; // Internal iframe path
}

export const soloGames: SoloGame[] = [
  {
    id: "reflex-shooter",
    title: "Reflex Shooter",
    label: "Reaction Challenge",
    description: "Test your aim and reaction time against moving targets spawned algorithmically.",
    difficulty: "Medium",
    thumbnail: "/images/solo/reflex_shooter.png",
    path: "/gameLib/Reflex-Shooter/index.html"
  },
  {
    id: "path-nav",
    title: "Path Navigation",
    label: "Survival Runner",
    description: "Navigate a rapidly escalating 3D pathway. One wrong turn means instant failure.",
    difficulty: "Hard",
    thumbnail: "/images/solo/path_nav.png",
    path: "/gameLib/Path-Nav/index.html"
  },
  {
    id: "flux-tap",
    title: "Flux Tap",
    label: "Logic Puzzle",
    description: "Adapt to changing visual rules in this rapid node-state changing puzzle.",
    difficulty: "Easy",
    thumbnail: "/images/solo/flux_tap.png",
    path: "/gameLib/Flux-Tap/index.html"
  },
  {
    id: "memory-rush",
    title: "Memory Rush",
    label: "Recall Test",
    description: "Memorize random pattern sequences and recreate them flawlessly before time runs out.",
    difficulty: "Extreme",
    thumbnail: "/images/solo/memory_rush.png",
    path: "/gameLib/Memory-Rush/index.html"
  },
  {
    id: "aim-trainer-pro",
    title: "Aim Trainer Pro",
    label: "Precision & Speed",
    description: "Hone your accuracy and reflexes by shooting targets before they disappear.",
    difficulty: "Medium",
    thumbnail: "/images/solo/aim_trainer.png", // using placeholder, or wait... maybe I should use reflex_shooter.png as placeholder?
    path: "/gameLib/Aim-Trainer-Pro/index.html"
  },
  {
    id: "bubble-shooter-blitz",
    title: "Bubble Blitz",
    label: "Puzzle Strategy",
    description: "Pop matching bubbles rapidly before the ceiling crushes you.",
    difficulty: "Easy",
    thumbnail: "/images/solo/flux_tap.png", // using flux_tap as placeholder
    path: "/gameLib/Bubble-Shooter-Blitz/index.html"
  }
];
