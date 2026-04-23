import axiosInstance from "./axiosInstance";

export const createChessRoom = async (stake: number) => {
  const { data } = await axiosInstance.post("/chess/create", { stake });
  return data.data;
};

export const joinChessRoom = async (code: string) => {
  const { data } = await axiosInstance.post("/chess/join", { code });
  return data.data;
};

export const getChessRoom = async (roomId: string) => {
  const { data } = await axiosInstance.get(`/chess/room/${roomId}`);
  return data.data;
};

export const makeChessMove = async (roomId: string, move: { from: string; to: string; promotion?: string }) => {
  const { data } = await axiosInstance.post(`/chess/room/${roomId}/move`, move);
  return data.data;
};

export const resignChessGame = async (roomId: string) => {
  const { data } = await axiosInstance.post(`/chess/room/${roomId}/resign`);
  return data.data;
};

export const createBotRoom = async (stake: number) => {
  const { data } = await axiosInstance.post("/chess/bot", { stake });
  return data.data;
};

export const findQuickMatch = async (stake: number) => {
  const { data } = await axiosInstance.post("/chess/quick", { stake });
  return data.data;
};

export const getWaitingRooms = async () => {
  const { data } = await axiosInstance.get("/chess/waiting");
  return data.data;
};

export const cancelRoom = async (roomId: string) => {
  const { data } = await axiosInstance.post(`/chess/room/${roomId}/cancel`);
  return data;
};
