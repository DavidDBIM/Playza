import { supabaseAdmin } from '../../config/supabase'

export async function getActiveBanners() {
  const { data, error } = await supabaseAdmin
    .from('notifications')
    .select('*')
    .in('type', ['Login Banner', 'Universal Announcement'])
    .eq('status', 'sent')
    .order('created_at', { ascending: false })
    .limit(1) // Just get the latest one

  if (error) throw error
  return data?.[0] || null
}

// Every notification an admin sends (any of the 6 types), regardless of
// whether it's shown as a full-screen banner — this feeds the in-app
// notification center bell so nothing an admin sends disappears into a
// push-notification-only void.
export async function getNotificationsFeed(limit: number = 20) {
  const { data, error } = await supabaseAdmin
    .from('notifications')
    .select('*')
    .eq('status', 'sent')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
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