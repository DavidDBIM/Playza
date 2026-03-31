import { supabase, supabaseAdmin } from '../../config/supabase'

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
  const { error } = await supabaseAdmin
    .from('users')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) throw error
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
  const { data: account (error) throw error
  return { message: 'Profile updated' }
}

ex