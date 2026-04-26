import { supabaseAdmin } from '../../config/supabase'

export async function getActiveBanners() {
  const { data, error } = await supabaseAdmin
    .from('notifications')
    .select('*')
    .eq('type', 'Login Banner')
    .eq('status', 'sent')
    .order('created_at', { ascending: false })
    .limit(1) // Just get the latest one

  if (error) throw error
  return data?.[0] || null
}

export async function registerPushToken(userId: string, subscription: any, deviceType: string = 'web') {
  const token = typeof subscription === 'string' ? subscription : JSON.stringify(subscription);
  
  const { error } = await supabaseAdmin
    .from('push_tokens')
    .upsert({
      user_id: userId,
      token,
      device_type: deviceType,
      created_at: new Date().toISOString()
    }, { onConflict: 'token' })

  if (error) throw error
  return { success: true }
}
