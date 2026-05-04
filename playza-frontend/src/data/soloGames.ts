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
    id: "core-overload",
    title: "Core Overload",
    label: "Risk vs Reward",
    description: "Charge the volatile core by holding it. Release before the stability needle hits the red danger zone. Push your luck!",
    difficulty: "Extreme",
    thumbnail: "/images/solo/core_overload.png",
    path: "/gameLib/Core-Overload/index.html"
  },
  {
    id: "neon-stacker",
    title: "Neon Stacker",
    label: "Precision & Timing",
    description: "Stack the neon blocks perfectly. Any overhang gets sliced off, making the next block harder. Build the tower to reach 2.0x.",
    difficulty: "Hard",
    thumbnail: "/images/solo/neon_stacker.png",
    path: "/gameLib/Neon-Stacker/index.html"
  }
];
