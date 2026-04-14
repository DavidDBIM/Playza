import axiosInstance from "./axiosInstance";

export const createLudoRoom = async (stake: number) => {
  const { data } = await axiosInstance.post("/ludo/create", { stake });
  return data.data;
};

export const joinLudoRoom = async (code: string) => {
  const { data } = await axiosInstance.post("/ludo/join", { code });
  return data.data;
};

export const getLudoRoom = async (roomId: string) => {
  const { data } = await axiosInstance.get(`/ludo/room/${roomId}`);
  return data.data;
};

export const rollDice = async (roomId: string) => {
  const { data } = await axiosInstance.post(`/ludo/room/${roomId}/roll`);
  return data.data;
};

export const makeMove = async (roomId: string, pieceId: string) => {
  const { data } = await axiosInstance.post(`/ludo/room/${roomId}/move`, { pieceId });
  return data.data;
};

export const resignLudoGame = async (roomId: string) => {
  const { data } = await axiosInstance.post(`/ludo/room/${roomId}/resign`);
  return data.data;
};

export const createBotRoom = async (stake: number) => {
  const { data } = await axiosInstance.post("/ludo/bot", { stake });
  return data.data;
};

export const findQuickMatch = async (stake: number) => {
  const { data } = await axiosInstance.post("/ludo/quick", { stake });
  return data.data;
};

export const getWaitingRooms = async () => {
  const { data } = await axiosInstance.get("/ludo/waiting");
  return data.data;
};
