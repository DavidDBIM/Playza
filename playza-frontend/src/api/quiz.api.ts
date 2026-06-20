import axiosInstance from '@/api/axiosInstance'

export interface PrizeTier {
  rank: number
  percentage: number
}

export interface TournamentSponsor {
  id: string
  name: string
  logo_url: string | null
  website_url: string | null
}

export interface QuizTournament {
  id: string
  title: string
  description: string
  entry_fee: number
  prize_pool: number
  max_players: number | null
  prize_distribution: PrizeTier[] | null
  platform_fee_percentage: number | null
  registration_end: string | null
  status: 'draft' | 'registration' | 'lobby' | 'active' | 'completed' | 'cancelled'
  scheduled_at: string | null
  started_at: string | null
  current_round: number
  player_count: number
  user_registered?: boolean
  // Sponsor fields
  sponsor_id?: string | null
  sponsor_mode?: 'collab' | 'banner' | null
  sponsor_banner_url?: string | null
  sponsor?: TournamentSponsor | null
  // Archive / trust display fields (completed tournaments only)
  winner_username?: string | null
  winner_prize?: number | null
}

export async function getQuizTournamentsApi(): Promise<QuizTournament[]> {
  const { data } = await axiosInstance.get('/quiz/tournaments')
  return data.data ?? []
}

export async function getQuizTournamentApi(id: string): Promise<QuizTournament> {
  const { data } = await axiosInstance.get(`/quiz/tournaments/${id}`)
  return data.data
}

export async function getLobbyPlayersApi(id: string): Promise<{ user_id: string; username: string; avatar_url: string | null }[]> {
  const { data } = await axiosInstance.get(`/quiz/tournaments/${id}/lobby`)
  return data.data ?? []
}

export async function joinQuizTournamentApi(id: string) {
  const { data } = await axiosInstance.post(`/quiz/tournaments/${id}/join`)
  return data
}
