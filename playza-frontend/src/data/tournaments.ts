export interface Tournament {
  id: string;
  name: string;
  gameId: string;
  entryFee: number;
  prizePool: number;
  status: "upcoming" | "live" | "completed";
  startDate: string;
  endDate: string;
}

export interface TournamentStage {
  id: string;
  tournamentId: string;
  name: "Qualifiers" | "Semi Finals" | "Final";
  startTime: string;
  endTime: string;
  maxPlayers: number;
  qualifiedCount: number;
}

export interface TournamentParticipant {
  id: string;
  userId: string;
  tournamentId: string;
  currentStageId: string;
  status: "active" | "eliminated" | "qualified";
  totalScore: number;
}

export const tournaments: Tournament[] = [
  {
    id: "tour_1",
    name: "Shadow Strategy Championship",
    gameId: "33", // Bullet Fury
    entryFee: 3000,
    prizePool: 150000,
    status: "live",
    startDate: "2026-03-27T00:00:00Z",
    endDate: "2026-04-05T23:59:59Z",
  },
  {
    id: "tour_2",
    name: "High Stakes Winter Classic",
    gameId: "32", // VelocityGL
    entryFee: 5000,
    prizePool: 300000,
    status: "upcoming",
    startDate: "2026-04-10T12:00:00Z",
    endDate: "2026-04-25T18:00:00Z",
  },
  {
    id: "tour_3",
    name: "Quick Trivia Cup",
    gameId: "29", // Crystal Match
    entryFee: 1000,
    prizePool: 50000,
    status: "completed",
    startDate: "2026-03-10T00:00:00Z",
    endDate: "2026-03-15T23:59:59Z",
  },
  {
    id: "tour_4",
    name: "Dominion Arena Pro League",
    gameId: "54", // StrikeForce
    entryFee: 2500,
    prizePool: 75000,
    status: "live",
    startDate: "2026-03-24T00:00:00Z",
    endDate: "2026-03-30T18:00:00Z",
  },
  {
    id: "tour_5",
    name: "Champions Gauntlet Masters",
    gameId: "55", // Cyber Surge
    entryFee: 10000,
    prizePool: 1000000,
    status: "upcoming",
    startDate: "2026-05-01T00:00:00Z",
    endDate: "2026-05-15T23:59:59Z",
  },
];

export const tournamentStages: TournamentStage[] = [
  {
    id: "stage_1_q",
    tournamentId: "tour_1",
    name: "Qualifiers",
    startTime: "2026-03-27T00:00:00Z",
    endTime: "2026-03-30T23:59:59Z",
    maxPlayers: 1000,
    qualifiedCount: 100,
  },
  {
    id: "stage_1_s",
    tournamentId: "tour_1",
    name: "Semi Finals",
    startTime: "2026-04-01T00:00:00Z",
    endTime: "2026-04-02T23:59:59Z",
    maxPlayers: 100,
    qualifiedCount: 10,
  },
  {
    id: "stage_1_f",
    tournamentId: "tour_1",
    name: "Final",
    startTime: "2026-04-05T18:00:00Z",
    endTime: "2026-04-05T23:59:59Z",
    maxPlayers: 10,
    qualifiedCount: 1,
  },
];

export const tournamentParticipants: TournamentParticipant[] = [
  {
    id: "part_1",
    userId: "user_me",
    tournamentId: "tour_1",
    currentStageId: "stage_1_s",
    status: "active",
    totalScore: 14500,
  },
  {
    id: "part_2",
    userId: "user_other",
    tournamentId: "tour_1",
    currentStageId: "stage_1_s",
    status: "eliminated",
    totalScore: 8200,
  }
];
