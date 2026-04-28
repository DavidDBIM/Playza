import { supabaseAdmin } from '../../config/supabase'

export async function submitFeedback(userId: string, payload: {
  type: string;
  title: string;
  message: string;
  game_name?: string;
}) {
  const { data, error } = await supabaseAdmin
    .from('feedback')
    .insert([
      {
        user_id: userId,
        type: payload.type,
        title: payload.title,
        message: payload.message,
        game_name: payload.game_name,
        created_at: new Date().toISOString()
      }
    ])
    .select()
    .single()

  if (error) throw error
  return data
}
