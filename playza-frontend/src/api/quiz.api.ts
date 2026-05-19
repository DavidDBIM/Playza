import axiosInstance from '@/api/axiosInstance'

export interface QuizTournament {
  id: string
  title: string
  description: string
  entry_fee: number
  prize_pool: number
  status: 'draft' | 'registration' | 'lobby' | 'active' | 'completed' | 'cancelled'
  scheduled_at: string | null
  started_at: string | null
  current_round: number
  player_count: number
  user_registered?: boolean
}

export async function getQuizTournamentsApi(): Promise<QuizTournament[]> {
  const { data } = await axiosInstance.get('/quiz/tournaments')
  return data.data ?? []
}

export async function getQuizTournamentApi(id: string): Promise<QuizTournament> {
  const { data } = await axiosInstance.get(`/quiz/tournaments/${id}`)
  return data.data
}

export async function joinQuizTournamentApi(id: string) {
  const { data } = await axiosInstance.post(`/quiz/tournaments/${id}/join`)
  return data
}
