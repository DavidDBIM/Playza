import axiosInstance from '@/api/axiosInstance'
import { supabase } from '@/config/supabase'

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

// Public listing — queries Supabase directly so it works for everyone
// without needing a backend auth token
export async function getQuizTournamentsApi(): Promise<QuizTournament[]> {
  const { data, error } = await supabase
    .from('quiz_tournaments')
    .select('*')
    .in('status', ['registration', 'lobby', 'active', 'completed'])
    .order('scheduled_at', { ascending: true })

  if (error) {
    // Fall back to authenticated backend call if Supabase RLS blocks it
    const { data: res } = await axiosInstance.get('/quiz/tournaments')
    return res.data ?? []
  }

  // Enrich with player count
  const enriched = await Promise.all(
    (data ?? []).map(async (t) => {
      const { count } = await supabase
        .from('quiz_players')
        .select('id', { count: 'exact', head: true })
        .eq('tournament_id', t.id)
      return { ...t, player_count: count ?? 0 } as QuizTournament
    })
  )

  return enriched
}

export async function getQuizTournamentApi(id: string): Promise<QuizTournament> {
  const { data } = await axiosInstance.get(`/quiz/tournaments/${id}`)
  return data.data
}

export async function joinQuizTournamentApi(id: string) {
  const { data } = await axiosInstance.post(`/quiz/tournaments/${id}/join`)
  return data
}
