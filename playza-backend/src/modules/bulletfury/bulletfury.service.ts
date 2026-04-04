import { supabaseAdmin } from '../../config/supabase'

export async function getLeaderboard(limit = 100) {
  // Mock data for now, consistent with VelocityGL pattern
  // In the future, this will fetch from a 'tournament_scores' table
  return []
}

export async function submitScore(userId: string, score: number) {
  // This will handle persistent score saving
  // await supabaseAdmin.from('game_history').insert({ user_id: userId, game_name: 'Bullet Fury', score })
  return { success: true }
}
