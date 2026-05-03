import api from './axiosInstance';

export const startSoloSession = async (gameId: string | number | undefined, stake: number) => {
  const res = await api.post('/soloearn/start', { gameId, stake });
  return res.data;
};

export const endSoloSession = async (sessionId: string, multiplier: number) => {
  const res = await api.post('/soloearn/end', { sessionId, multiplier });
  return res.data;
};
