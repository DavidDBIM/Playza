import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const poolApi = {
  listRooms: async () => {
    const response = await axios.get(`${API_URL}/pool/rooms`)
    return response.data
  },

  createRoom: async (stake: number) => {
    const response = await axios.post(`${API_URL}/pool/create`, { stake })
    return response.data
  },

  joinRoom: async (code: string) => {
    const response = await axios.post(`${API_URL}/pool/join`, { code })
    return response.data
  },

  getRoom: async (roomId: string) => {
    const response = await axios.get(`${API_URL}/pool/room/${roomId}`)
    return response.data
  },

  executeShot: async (roomId: string, shot: { angle: number; power: number; spin: { x: number; y: number } }) => {
    const response = await axios.post(`${API_URL}/pool/shot`, { roomId, shot })
    return response.data
  },

  quickMatch: async (stake: number) => {
    const response = await axios.post(`${API_URL}/pool/quickmatch`, { stake })
    return response.data
  },

  resign: async (roomId: string) => {
    const response = await axios.post(`${API_URL}/pool/resign`, { roomId })
    return response.data
  },
}