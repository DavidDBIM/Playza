import { supabaseAdmin } from '../../config/supabase'

export async function getLeaderboard(limit = 100) {
  return []
}

export async function submitScore(userId: string, score: number) {
  return { success: true }
}
