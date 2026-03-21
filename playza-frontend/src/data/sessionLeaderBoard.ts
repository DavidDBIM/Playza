export type LeaderboardItem = {
  type: "player";
  rank: number;
  name: string;
  avatar?: string; // optional for out-of-zone
  points: number;
  prize: number;
  highlight?: "gold" | "silver" | "bronze" | "me";
};

export const rankTitle = [
  { type: "divider", label: "Leaders" },
  { type: "divider", label: "Runner Ups" },
  { type: "cutoff", label: "Winning Zone Cutoff" },
];

export const LEADERBOARD_DATA: LeaderboardItem[] = [
  {
    type: "player",
    rank: 1,
    name: "ShadowNinja",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ShadowNinja",
    points: 84290,
    prize: 250,
    highlight: "gold",
  },
  {
    type: "player",
    rank: 2,
    name: "FruitMaster_99",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=FruitMaster",
    points: 82150,
    prize: 150,
    highlight: "silver",
  },
  {
    type: "player",
    rank: 3,
    name: "KatanaZero",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=KatanaZero",
    points: 79800,
    prize: 100,
    highlight: "bronze",
  },
  {
    type: "player",
    rank: 4,
    name: "QuickSlicer",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=QuickSlicer",
    points: 75400,
    prize: 75,
  },
  {
    type: "player",
    rank: 5,
    name: "MelonManiac",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=MelonManiac",
    points: 72100,
    prize: 60,
  },
  {
    type: "player",
    rank: 6,
    name: "SliceAndDice",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=SliceAndDice",
    points: 70050,
    prize: 50,
  },
  {
    type: "player",
    rank: 7,
    name: "GuselTony",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=GuselTony",
    points: 68920,
    prize: 45,
    highlight: "me",
  },
  {
    type: "player",
    rank: 8,
    name: "BladeRunner",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=BladeRunner",
    points: 65200,
    prize: 30,
  },
  {
    type: "player",
    rank: 9,
    name: "NeonStrike",
    points: 62400,
    prize: 20,
  },
  {
    type: "player",
    rank: 10,
    name: "CyberPunk",
    points: 60100,
    prize: 15,
  },
  {
    type: "player",
    rank: 11,
    name: "WolferineKing",
    points: 58200,
    prize: 10,
  },
  {
    type: "player",
    rank: 12,
    name: "TotiGamer",
    points: 56500,
    prize: 5,
  },
  {
    type: "player",
    rank: 13,
    name: "DangerPlayer",
    points: 54100,
    prize: 0,
  },
  {
    type: "player",
    rank: 14,
    name: "CubWinner",
    points: 52300,
    prize: 0,
  },
  {
    type: "player",
    rank: 15,
    name: "KingLove",
    points: 51000,
    prize: 0,
  },
  {
    type: "player",
    rank: 16,
    name: "SonicBlade",
    points: 49500,
    prize: 0,
  },
  {
    type: "player",
    rank: 17,
    name: "GamerPro_Z",
    points: 48200,
    prize: 0,
  },
  {
    type: "player",
    rank: 18,
    name: "AlphaWolf",
    points: 47000,
    prize: 0,
  },
  {
    type: "player",
    rank: 19,
    name: "PhantomSlayer",
    points: 45500,
    prize: 0,
  },
  {
    type: "player",
    rank: 20,
    name: "ZeroGravity",
    points: 44000,
    prize: 0,
  },
];
