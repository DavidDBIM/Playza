import { supabaseAdmin } from '../../config/supabase'

export async function getDashboardMetrics() {
  const [
    { count: totalUsers },
    { count: activeUsers },
    { data: walletTotals },
    { count: pendingWithdrawals },
    { count: totalReferrals },
    { count: verifiedReferrals },
    { count: newUsersWeek },
    { count: verifiedUsers },
  ] = await Promise.all([
    supabaseAdmin.from('users').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('is_active', true).eq('is_email_verified', true),
    supabaseAdmin.from('wallets').select('balance, total_deposited, total_withdrawn'),
    supabaseAdmin.from('transactions').select('*', { count: 'exact', head: true }).eq('type', 'withdrawal').eq('status', 'pending'),
    supabaseAdmin.from('referrals').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('referrals').select('*', { count: 'exact', head: true }).neq('status', 'pending'),
    supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('is_email_verified', true),
  ])

  const totalDeposited = walletTotals?.reduce((sum, w) => sum + Number(w.total_deposited), 0) ?? 0
  const totalWithdrawn = walletTotals?.reduce((sum, w) => sum + Number(w.total_withdrawn), 0) ?? 0
  const platformReserve = walletTotals?.reduce((sum, w) => sum + Number(w.balance), 0) ?? 0

  return {
    total_users: totalUsers ?? 0,
    active_users: activeUsers ?? 0,
    total_deposited: totalDeposited,
    total_withdrawn: totalWithdrawn,
    platform_profit: totalDeposited - totalWithdrawn,
    platform_reserve: platformReserve,
    pending_withdrawals_count: pendingWithdrawals ?? 0,
    total_referrals: totalReferrals ?? 0,
    verified_referrals: verifiedReferrals ?? 0,
    referral_conversion_rate: totalReferrals
      ? ((verifiedReferrals ?? 0) / totalReferrals * 100).toFixed(1) + '%'
      : '0%',
    new_users_week: newUsersWeek ?? 0,
    verified_users: verifiedUsers ?? 0,
  }
}

export async function getAllUsersAdmin(page = 1, limit = 20, search = '', status = '', period = '') {
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabaseAdmin
    .from('users')
    .select(`
      id, username, email, phone, avatar_url,
      first_name, last_name, referral_code,
      is_email_verified, is_active, created_at,
      wallets(balance, total_deposited, total_withdrawn),
      pza_points(total_points)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (search) {
    query = query.or(`username.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`)
  }

  if (status === 'active') query = query.eq('is_active', true).eq('is_email_verified', true)
  if (status === 'inactive') query = query.eq('is_active', false)
  if (status === 'unverified') query = query.eq('is_email_verified', false)

  if (period && period !== 'all') {
    const now = new Date()
    if (period === 'today') now.setHours(0, 0, 0, 0)
    else if (period === '7d') now.setDate(now.getDate() - 7)
    else if (period === '30d') now.setDate(now.getDate() - 30)
    query = query.gte('created_at', now.toISOString())
  }

  const { data, error, count } = await query

  if (error) throw error

  return {
    users: data,
    total: count ?? 0,
    page,
    limit,
    total_pages: Math.ceil((count ?? 0) / limit),
  }
}

export async function getAdminSingleUser(userId: string) {
  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select(`
      id, username, email, phone, avatar_url,
      first_name, last_name, referral_code,
      is_email_verified, is_active, created_at,
      wallets(balance, total_deposited, total_withdrawn),
      pza_points(total_points)
    `)
    .eq('id', userId)
    .single()

  if (error) throw error
  if (!user) throw new Error('User not found')

  const { data: referrals, count: referralCount } = await supabaseAdmin
    .from('referrals')
    .select('id, status, created_at, users!referred_id(username)', { count: 'exact' })
    .eq('referrer_id', userId)
    .order('created_at', { ascending: false })
    .limit(10)

  const { data: pzaEvents } = await supabaseAdmin
    .from('pza_events')
    .select('id, event_type, points_awarded, created_at, details')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20)

  const { data: gameHistory } = await supabaseAdmin
    .from('game_history')
    .select('id, game_name, status, winnings, played_at')
    .eq('user_id', userId)
    .order('played_at', { ascending: false })
    .limit(20)

  const { data: transactions } = await supabaseAdmin
    .from('transactions')
    .select('id, type, amount, status, created_at, reference')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20)

  return {
    ...user,
    referrals: referrals ?? [],
    total_referrals: referralCount ?? 0,
    pza_history: pzaEvents ?? [],
    game_history: gameHistory ?? [],
    transactions: transactions ?? [],
  }
}

export async function updateUserStatus(userId: string, action: 'activate' | 'deactivate' | 'ban') {
  const updates: Record<string, boolean> = {
    activate: { is_active: true } as any,
    deactivate: { is_active: false } as any,
    ban: { is_active: false } as any,
  }[action] ?? {}

  const { error } = await supabaseAdmin
    .from('users')
    .update(updates)
    .eq('id', userId)

  if (error) throw error
  return { message: `User ${action}d successfully` }
}

export async function getAllTransactionsAdmin(page = 1, limit = 20, type = '', status = '') {
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabaseAdmin
    .from('transactions')
    .select(`
      id, user_id, type, amount, status, reference, created_at,
      users(username, email)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (type) query = query.eq('type', type)
  if (status) query = query.eq('status', status)

  const { data, error, count } = await query

  if (error) throw error

  return {
    transactions: data,
    total: count ?? 0,
    page,
    limit,
    total_pages: Math.ceil((count ?? 0) / limit),
  }
}

export async function getTransactionByIdAdmin(id: string) {
  const { data, error } = await supabaseAdmin
    .from('transactions')
    .select(`
      id, user_id, type, amount, status, reference, created_at,
      users(username, email)
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}
