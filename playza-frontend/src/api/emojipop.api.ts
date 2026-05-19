import axiosInstance from './axiosInstance'

export const emojipopApi = {
  createRoom: async (stake: number, isBot = false, botDifficulty = 'medium') => {
    const { data } = await axiosInstance.post('/emojipop/create', { stake, is_bot: isBot, bot_difficulty: botDifficulty })
    return data.data
  },
  joinRoom: async (code: string) => {
    const { data } = await axiosInstance.post('/emojipop/join', { code })
    return data.data
  },
  getRoom: async (roomId: string) => {
    const { data } = await axiosInstance.get(`/emojipop/room/${roomId}`)
    return data.data
  },
  submitResult: async (roomId: string, score: number) => {
    const { data } = await axiosInstance.post(`/emojipop/room/${roomId}/submit`, { score })
    return data.data
  },
  findQuickMatch: async (stake: number) => {
    const { data } = await axiosInstance.post('/emojipop/quick', { stake })
    return data.data
  },
}
