import axiosInstance from './axiosInstance'

export const speedBattleApi = {
  createRoom: async (stake: number, isBot = false, botDifficulty = 'medium') => {
    const { data } = await axiosInstance.post('/speedbattle/create', { stake, is_bot: isBot, bot_difficulty: botDifficulty })
    return data.data
  },
  joinRoom: async (code: string) => {
    const { data } = await axiosInstance.post('/speedbattle/join', { code })
    return data.data
  },
  getRoom: async (roomId: string) => {
    const { data } = await axiosInstance.get(`/speedbattle/room/${roomId}`)
    return data.data
  },
  submitResult: async (roomId: string, wpm: number, accuracy: number) => {
    const { data } = await axiosInstance.post(`/speedbattle/room/${roomId}/submit`, { wpm, accuracy })
    return data.data
  },
  findQuickMatch: async (stake: number) => {
    const { data } = await axiosInstance.post('/speedbattle/quick', { stake })
    return data.data
  },
}
