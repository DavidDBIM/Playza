import axiosInstance from "./axiosInstance";

export const createDartsRoom = async (stake: number, startingScore: number) => {
  const { data } = await axiosInstance.post("/darts/create", { stake, startingScore });
  return data.data;
};

export const joinDartsRoom = async (code: string) => {
  const { data } = await axiosInstance.post("/darts/join", { code });
  return data.data;
};

export const getDartsRoom = async (roomId: string) => {
  const { data } = await axiosInstance.get(`/darts/room/${roomId}`);
  return data.data;
};

// dx/dy are normalized landing coordinates (fractions of the board radius,
// 0,0 = dead center) — the server recomputes the score itself from these,
// it never trusts a client-reported score.
export const submitDartsThrow = async (roomId: string, dx: number, dy: number) => {
  const { data } = await axiosInstance.post(`/darts/room/${roomId}/throw`, { dx, dy });
  return data.data;
};

export const resignDartsGame = async (roomId: string) => {
  const { data } = await axiosInstance.post(`/darts/room/${roomId}/resign`);
  return data.data;
};

export const createBotRoom = async (stake: number, startingScore: number) => {
  const { data } = await axiosInstance.post("/darts/bot", { stake, startingScore });
  return data.data;
};

export const findQuickMatch = async (stake: number, startingScore: number) => {
  const { data } = await axiosInstance.post("/darts/quick", { stake, startingScore });
  return data.data;
};

export const getWaitingRooms = async () => {
  const { data } = await axiosInstance.get("/darts/waiting");
  return data.data;
};

export const cancelRoom = async (roomId: string) => {
  const { data } = await axiosInstance.post(`/darts/room/${roomId}/cancel`);
  return data;
};