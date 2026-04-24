import axiosInstance from "./axiosInstance";

export const createSoccerRoom = async (stake: number) => {
  const { data } = await axiosInstance.post("/soccer/create", { stake });
  return data.data;
};

export const getSoccerRoom = async (roomId: string) => {
  const { data } = await axiosInstance.get(`/soccer/room/${roomId}`);
  return data.data;
};

export const joinSoccerRoom = async (code: string) => {
  const { data } = await axiosInstance.post("/soccer/join", { code });
  return data.data;
};

export const getSoccerRoom = async (roomId: string) => {
  const { data } = await axiosInstance.get(`/soccer/room/${roomId}`);
  return data.data;
};

export const createBotRoom = async (stake: number, difficulty: "easy" | "medium" | "hard" = "medium") => {
  const { data } = await axiosInstance.post("/soccer/bot", { stake, difficulty });
  return data.data;
};

export const findQuickMatch = async (stake: number) => {
  const { data } = await axiosInstance.post("/soccer/quick", { stake });
  return data.data;
};

export const getWaitingRooms = async () => {
  const { data } = await axiosInstance.get("/soccer/waiting");
  return data.data;
};

export const updateGameState = async (roomId: string, gameState: any) => {
  const { data } = await axiosInstance.post(`/soccer/room/${roomId}/state`, { gameState });
  return data.data;
};

export const finishGame = async (roomId: string, winnerId: string | null) => {
  const { data } = await axiosInstance.post(`/soccer/room/${roomId}/finish`, { winnerId });
  return data.data;
};

export const createTournament = async (params: {
  name: string;
  size: 4 | 8 | 16 | 32;
  stake: number;
  difficulty?: "easy" | "medium" | "hard";
}) => {
  const { data } = await axiosInstance.post("/soccer/tournament/create", params);
  return data.data;
};

export const joinTournament = async (tournamentId: string) => {
  const { data } = await axiosInstance.post(`/soccer/tournament/${tournamentId}/join`);
  return data.data;
};

export const getTournament = async (tournamentId: string) => {
  const { data } = await axiosInstance.get(`/soccer/tournament/${tournamentId}`);
  return data.data;
};

export const getActiveTournaments = async () => {
  const { data } = await axiosInstance.get("/soccer/tournament/active");
  return data.data;
};
