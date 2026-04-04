
import type { PoolRoom } from '@/game/pool/types'
import axiosInstance from './axiosInstance'


export const poolApi = {
  listRooms: async (): Promise<PoolRoom[]> => {
    const { data } = await axiosInstance.get(`/pool/rooms`)
    return data.data
  },

  createRoom: async (stake: number): Promise<PoolRoom> => {
    const { data } = await axiosInstance.post(`/pool/create`, { stake })
    return data.data
  },

  joinRoom: async (code: string): Promise<PoolRoom> => {
    const { data } = await axiosInstance.post(`/pool/join`, { code })
    return data.data
  },

  getRoom: async (roomId: string): Promise<PoolRoom> => {
    const { data } = await axiosInstance.get(`/pool/room/${roomId}`)
    return data.data
  },

  executeShot: async (roomId: string, shot: { angle: number; power: number; spin: { x: number; y: number } }): Promise<{ success: boolean; data?: PoolRoom }> => {
    const { data } = await axiosInstance.post(`/pool/shot`, { roomId, shot })
    return data
  },

  quickMatch: async (stake: number): Promise<PoolRoom> => {
    const { data } = await axiosInstance.post(`/pool/quickmatch`, { stake })
    return data.data
  },

  findQuickMatch: async (stake: number): Promise<PoolRoom> => {
    const { data } = await axiosInstance.post(`/pool/quickmatch`, { stake })
    return data.data
  },

  resign: async (roomId: string): Promise<{ success: boolean }> => {
    const { data } = await axiosInstance.post(`/pool/resign`, { roomId })
    return data
  },
}