import { supabaseAdmin } from '../../config/supabase'

export async function getAllUsers(page = 1, limit = 20) {
  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, error, count } = await supabaseAdmin
    .from('users')
    .select('id, username, email, phone, avatar_url, referral_code, is_email_verified, is_active, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) throw error

  return {
    users: data,
    total: count,
    page,
    limit,
    total_pages: Math.ceil((count ?? 0) / limit),
  }
}

export async function getSingleUser(userId: string) {
  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select('id, username, email, phone, avatar_url, first_name, last_name, referral_code, is_email_verified, is_active, created_at')
    .eq('id', userId)
    .single()

  if (error) throw error
  if (!user) throw new Error('User not found')

  const { data: wallet } = await supabaseAdmin
    .from('wallets')
    .select('balance, total_deposited, total_withdrawn')
    .eq('user_id', userId)
    .single()

  const { data: pza } = await supabaseAdmin
    .from('pza_points')
    .select('total_points')
    .eq('user_id', userId)
    .single()

  const { data: referrals } = await supabaseAdmin
    .from('referrals')
    .select('id', { count: 'exact' })
    .eq('referrer_id', userId)

  return {
    ...user,
    wallet: wallet ?? { balance: 0, total_deposited: 0, total_withdrawn: 0 },
    pza_points: pza?.total_points ?? 0,
    total_referrals: referrals?.length ?? 0,
  }
}

export async function updateUser(userId: string, data: {
  first_name?: string
  last_name?: string
  phone?: string
  avatar_url?: string
}) {
  const { error } = await supabaseAdmin
    .from('users')
    .update(data)
    .eq('id', userId)

  if (error) throw error
  return { message: 'Profile updated' }
}

export async function deactivateUser(userId: string) {
  const { error } = await supabaseAdmin
    .from('users')
    .update({ is_active: false })
    .eq('id', userId)

  if (error) throw error
  return { message: 'User deactivated' }
}
