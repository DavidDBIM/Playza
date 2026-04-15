import { supabase, supabaseAdmin } from '../../config/supabase'
import { awardPZA } from '../../lib/pzaEngine'

export async function getProfile(userId: string) {
  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select('id, username, email, phone, first_name, last_name, avatar_url, referral_code, is_email_verified, created_at, tagline, bio, show_activity')
    .eq('id', userId)
    .single()

  if (error) throw error

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

  const { data: bankAccounts } = await supabaseAdmin
    .from('bank_accounts')
    .select('id, bank_name, bank_code, account_number, account_name, is_primary')
    .eq('user_id', userId)
    .order('is_primary', { ascending: false })

  return {
    ...user,
    wallet: wallet ?? { balance: 0, total_deposited: 0, total_withdrawn: 0 },
    pza_points: pza?.total_points ?? 0,
    bank_accounts: bankAccounts ?? [],
  }
}

export async function updateProfile(userId: string, data: {
  first_name?: string
  last_name?: string
  phone?: string
  avatar_url?: string
  tagline?: string
  bio?: string
  show_activity?: boolean
}) {
  // Fetch current profile so we can detect first-time avatar / profile completion
  const { data: current } = await supabaseAdmin
    .from('users')
    .select('avatar_url, first_name, last_name')
    .eq('id', userId)
    .single()

  const { error } = await supabaseAdmin
    .from('users')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) throw error

  // Award AVATAR_UPLOADED only when setting an avatar for the very first time
  if (data.avatar_url && !current?.avatar_url) {
    const { data: alreadyAwarded } = await supabaseAdmin
      .from('pza_events')
      .select('id')
      .eq('user_id', userId)
      .eq('event_type', 'AVATAR_UPLOADED')
      .limit(1)
      .single()

    if (!alreadyAwarded) {
      await awardPZA(userId, 'AVATAR_UPLOADED')
    }
  }

  // Award PROFILE_COMPLETED once first_name + last_name are both set
  const updatedFirst = data.first_name ?? current?.first_name
  const updatedLast  = data.last_name  ?? current?.last_name
  if (updatedFirst && updatedLast) {
    const { data: alreadyAwarded } = await supabaseAdmin
      .from('pza_events')
      .select('id')
      .eq('user_id', userId)
      .eq('event_type', 'PROFILE_COMPLETED')
      .limit(1)
      .single()

    if (!alreadyAwarded) {
      await awardPZA(userId, 'PROFILE_COMPLETED')
    }
  }

  return { message: 'Profile updated' }
}

export async function addBankAccount(userId: string, data: {
  bank_name: string
  bank_code: string
  account_number: string
  account_name: string
}) {
  const { data: existing } = await supabaseAdmin
    .from('bank_accounts')
    .select('id')
    .eq('user_id', userId)
    .eq('account_number', data.account_number)
    .single()

  if (existing) throw new Error('This account is already added')

  const { data: count } = await supabaseAdmin
    .from('bank_accounts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)

  const isPrimary = !count || (count as any).count === 0

  const { error } = await supabaseAdmin.from('bank_accounts').insert({
    user_id: userId,
    bank_name: data.bank_name,
    bank_code: data.bank_code,
    account_number: data.account_number,
    account_name: data.account_name,
    is_primary: isPrimary,
  })

  if (error) throw error
  return { message: 'Bank account added' }
}

export async function setPrimaryBankAccount(userId: string, accountId: string) {
  await supabaseAdmin
    .from('bank_accounts')
    .update({ is_primary: false })
    .eq('user_id', userId)

  const { error } = await supabaseAdmin
    .from('bank_accounts')
    .update({ is_primary: true })
    .eq('id', accountId)
    .eq('user_id', userId)

  if (error) throw error
  return { message: 'Primary account updated' }
}

export async function removeBankAccount(userId: string, accountId: string) {
  const { data: account } = await supabaseAdmin
    .from('bank_accounts')
    .select('is_primary')
    .eq('id', accountId)
    .eq('user_id', userId)
    .single()

  if (!account) throw new Error('Account not found')

  const { error } = await supabaseAdmin
    .from('bank_accounts')
    .delete()
    .eq('id', accountId)
    .eq('user_id', userId)

  if (error) throw error

  if (account.is_primary) {
    const { data: remaining } = await supabaseAdmin
      .from('bank_accounts')
      .select('id')
      .eq('user_id', userId)
      .limit(1)
      .single()

    if (remaining) {
      await supabaseAdmin
        .from('bank_accounts')
        .update({ is_primary: true })
        .eq('id', remaining.id)
    }
  }

  return { message: 'Bank account removed' }
}

export async function getGameHistory(userId: string, page = 1, limit = 20) {
  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, error, count } = await supabaseAdmin
    .from('game_history')
    .select('id, game_name, score, position, winnings, status, played_at', { count: 'exact' })
    .eq('user_id', userId)
    .order('played_at', { ascending: false })
    .range(from, to)

  if (error) throw error

  return {
    history: data ?? [],
    total: count ?? 0,
    page,
    limit,
    total_pages: Math.ceil((count ?? 0) / limit),
  }
}
