import axiosInstance from './axiosInstance'

export const wordScrambleApi = {
  createRoom: async (stake: number, isBot = false, botDifficulty = 'medium') => {
    const { data } = await axiosInstance.post('/wordscramble/create', { stake, is_bot: isBot, bot_difficulty: botDifficulty })
    return data.data
  },
  joinRoom: async (code: string) => {
    const { data } = await axiosInstance.post('/wordscramble/join', { code })
    return data.data
  },
  getRoom: async (roomId: string) => {
    const { data } = await axiosInstance.get(`/wordscramble/room/${roomId}`)
    return data.data
  },
  submitScore: async (roomId: string, score: number, roundsWon: number) => {
    const { data } = await axiosInstance.post(`/wordscramble/room/${roomId}/submit`, { score, rounds_won: roundsWon })
    return data.data
  },
  findQuickMatch: async (stake: number) => {
    const { data } = await axiosInstance.post('/wordscramble/quick', { stake })
    return data.data
  },
}
