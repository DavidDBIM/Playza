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

export const tournaments: Tournament[] = [];
export const tournamentStages: TournamentStage[] = [];
export const tournamentParticipants: TournamentParticipant[] = [];
