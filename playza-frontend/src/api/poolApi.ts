
import axiosInstance from './axiosInstance'


export const poolApi = {
  listRooms: async () => {
    const response = await axiosInstance.get(`/pool/rooms`)
    return response.data
  },

  createRoom: async (stake: number) => {
    const response = await axiosInstance.post(`/pool/create`, { stake })
    return response.data
  },

  joinRoom: async (code: string) => {
    const response = await axiosInstance.post(`/pool/join`, { code })
    return response.data
  },

  getRoom: async (roomId: string) => {
    const response = await axiosInstance.get(`/pool/room/${roomId}`)
    return response.data
  },

  executeShot: async (roomId: string, shot: { angle: number; power: number; spin: { x: number; y: number } }) => {
    const response = await axiosInstance.post(`/pool/shot`, { roomId, shot })
    return response.data
  },

  quickMatch: async (stake: number) => {
    const response = await axiosInstance.post(`/pool/quickmatch`, { stake })
    return response.data
  },

  findQuickMatch: async (stake: number) => {
    const response = await axiosInstance.post(`/pool/quickmatch`, { stake })
    return response.data
  },

  resign: async (roomId: string) => {
    const response = await axiosInstance.post(`/pool/resign`, { roomId })
    return response.data
  },
}