// ─── Shared types for Quiz Championship ──────────────────────────────────────

export interface QuizTournament {
  id: string
  title: string
  description: string
  entry_fee: number
  prize_pool: number
  status: 'draft' | 'lobby' | 'active' | 'completed' | 'cancelled'
  scheduled_at: string | null
  started_at: string | null
  current_round: number
  current_question: number
  player_count?: number
}

export interface QuizQuestion {
  id: string
  tournament_id: string
  round_number: number
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_option: 'A' | 'B' | 'C' | 'D'
  difficulty: 'easy' | 'medium' | 'hard' | 'expert' | 'legendary'
  time_limit_secs: number
  order_index: number
}

export interface QuizLeaderboardEntry {
  rank: number
  user_id: string
  username: string
  avatar_url: string | null
  correct_answers: number
  avg_time_ms: number
  status: 'alive' | 'eliminated' | 'winner'
}

// Round config: 5 rounds with increasing difficulty
export const ROUND_CONFIG = [
  { round: 1, name: 'Warm Up',        difficulty: 'easy',      time_secs: 60, questions: 10, color: '#22c55e' },
  { round: 2, name: 'Rising',         difficulty: 'medium',    time_secs: 35, questions: 8,  color: '#3b82f6' },
  { round: 3, name: 'Heat Up',        difficulty: 'hard',      time_secs: 30, questions: 7,  color: '#f97316' },
  { round: 4, name: 'Danger Zone',    difficulty: 'expert',    time_secs: 25, questions: 6,  color: '#ef4444' },
  { round: 5, name: 'Final Showdown', difficulty: 'legendary', time_secs: 20, questions: 5,  color: '#a855f7' },
] as const

export const TOTAL_ROUNDS = 5

// Prize distribution for top finishers
export const PRIZE_SPLIT = [0.50, 0.25, 0.15, 0.07, 0.03] // top 5 get a cut
