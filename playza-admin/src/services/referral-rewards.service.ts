import { supabaseAdmin } from '../../config/supabase'

// ── SIGNUP REWARD CONFIG ──────────────────────────────────────────────────────

export async function getSignupRewardConfigs() {
  const { data, error } = await supabaseAdmin
    .from('signup_reward_config')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createSignupRewardConfig(input: {
  reward_limit: number
  reward_amount: number
  reward_type: 'za' | 'pza'
  description: string
  is_active: boolean
  created_by: string
}) {
  // Deactivate all others first so only one is active at a time
  if (input.is_active) {
    await supabaseAdmin
      .from('signup_reward_config')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('is_active', true)
  }

  const { data, error } = await supabaseAdmin
    .from('signup_reward_config')
    .insert([{ ...input }])
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function updateSignupRewardConfig(id: string, input: Partial<{
  reward_limit: number
  reward_amount: number
  reward_type: 'za' | 'pza'
  description: string
  is_active: boolean
}>) {
  if (input.is_active) {
    await supabaseAdmin
      .from('signup_reward_config')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('is_active', true)
      .neq('id', id)
  }

  const { data, error } = await supabaseAdmin
    .from('signup_reward_config')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function deleteSignupRewardConfig(id: string) {
  const { error } = await supabaseAdmin
    .from('signup_reward_config')
    .delete()
    .eq('id', id)
  if (error) throw new Error(error.message)
  return { success: true }
}

// Called during user registration to auto-grant signup reward
export async function claimSignupRewardForUser(userId: string) {
  // Get active config
  const { data: config } = await supabaseAdmin
    .from('signup_reward_config')
    .select('*')
    .eq('is_active', true)
    .single()

  if (!config) return null

  // Check if limit reached
  if (config.total_claimed >= config.reward_limit) return null

  // Check if user already claimed
  const { data: existing } = await supabaseAdmin
    .from('signup_reward_claims')
    .select('id')
    .eq('config_id', config.id)
    .eq('user_id', userId)
    .single()

  if (existing) return null

  // Credit the wallet
  const column = config.reward_type === 'pza' ? 'pza_balance' : 'balance'
  const { data: wallet } = await supabaseAdmin
    .from('wallets')
    .select('id, balance, pza_balance')
    .eq('user_id', userId)
    .single()

  if (!wallet) return null

  await supabaseAdmin
    .from('wallets')
    .update({
      [column]: ((wallet as any)[column] ?? 0) + config.reward_amount,
    })
    .eq('user_id', userId)

  // Record the claim
  await supabaseAdmin.from('signup_reward_claims').insert({
    config_id: config.id,
    user_id: userId,
    amount: config.reward_amount,
    reward_type: config.reward_type,
  })

  // Increment counter
  await supabaseAdmin
    .from('signup_reward_config')
    .update({ total_claimed: config.total_claimed + 1, updated_at: new Date().toISOString() })
    .eq('id', config.id)

  // Log transaction
  await supabaseAdmin.from('transactions').insert({
    user_id: userId,
    type: 'signup_bonus',
    amount: config.reward_amount,
    status: 'completed',
    description: `Welcome bonus: ${config.reward_amount} ${config.reward_type.toUpperCase()} for being one of the first ${config.reward_limit} users`,
    created_at: new Date().toISOString(),
  })

  return { amount: config.reward_amount, reward_type: config.reward_type }
}

// ── PROMO REFERRAL CODES ──────────────────────────────────────────────────────

export async function getPromoCodes() {
  const { data, error } = await supabaseAdmin
    .from('promo_referral_codes')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createPromoCode(input: {
  code: string
  description: string
  bonus_amount: number
  referrer_bonus: number
  reward_type: 'za' | 'pza'
  max_uses: number | null
  is_active: boolean
  expires_at: string | null
  created_by: string
}) {
  const { data, error } = await supabaseAdmin
    .from('promo_referral_codes')
    .insert([{ ...input, code: input.code.toUpperCase() }])
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function updatePromoCode(id: string, input: Partial<{
  code: string
  description: string
  bonus_amount: number
  referrer_bonus: number
  reward_type: 'za' | 'pza'
  max_uses: number | null
  is_active: boolean
  expires_at: string | null
}>) {
  const { data, error } = await supabaseAdmin
    .from('promo_referral_codes')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function deletePromoCode(id: string) {
  const { error } = await supabaseAdmin
    .from('promo_referral_codes')
    .delete()
    .eq('id', id)
  if (error) throw new Error(error.message)
  return { success: true }
}

export async function getPromoCodeClaims(codeId: string) {
  const { data, error } = await supabaseAdmin
    .from('promo_code_claims')
    .select('*, users!user_id(username, email)')
    .eq('code_id', codeId)
    .order('claimed_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data ?? []
}

// Called when user applies a promo code (e.g. during registration or profile)
export async function claimPromoCode(userId: string, code: string, referrerId?: string) {
  const { data: promoCode } = await supabaseAdmin
    .from('promo_referral_codes')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .single()

  if (!promoCode) throw new Error('Invalid or inactive promo code')

  if (promoCode.expires_at && new Date(promoCode.expires_at) < new Date()) {
    throw new Error('This promo code has expired')
  }

  if (promoCode.max_uses !== null && promoCode.uses_count >= promoCode.max_uses) {
    throw new Error('This promo code has reached its usage limit')
  }

  const { data: existing } = await supabaseAdmin
    .from('promo_code_claims')
    .select('id')
    .eq('code_id', promoCode.id)
    .eq('user_id', userId)
    .single()

  if (existing) throw new Error('You have already used this promo code')

  const column = promoCode.reward_type === 'pza' ? 'pza_balance' : 'balance'

  // Credit referee
  const { data: wallet } = await supabaseAdmin
    .from('wallets')
    .select('id, balance, pza_balance')
    .eq('user_id', userId)
    .single()

  if (!wallet) throw new Error('Wallet not found')

  await supabaseAdmin
    .from('wallets')
    .update({ [column]: ((wallet as any)[column] ?? 0) + promoCode.bonus_amount })
    .eq('user_id', userId)

  await supabaseAdmin.from('transactions').insert({
    user_id: userId,
    type: 'promo_bonus',
    amount: promoCode.bonus_amount,
    status: 'completed',
    description: `Promo code bonus: ${promoCode.code}`,
    created_at: new Date().toISOString(),
  })

  // Credit referrer if provided and referrer_bonus > 0
  if (referrerId && promoCode.referrer_bonus > 0) {
    const { data: refWallet } = await supabaseAdmin
      .from('wallets')
      .select('id, balance, pza_balance')
      .eq('user_id', referrerId)
      .single()

    if (refWallet) {
      await supabaseAdmin
        .from('wallets')
        .update({ [column]: ((refWallet as any)[column] ?? 0) + promoCode.referrer_bonus })
        .eq('user_id', referrerId)

      await supabaseAdmin.from('transactions').insert({
        user_id: referrerId,
        type: 'referrer_promo_bonus',
        amount: promoCode.referrer_bonus,
        status: 'completed',
        description: `Referral bonus from promo code: ${promoCode.code}`,
        created_at: new Date().toISOString(),
      })
    }
  }

  // Record claim + increment uses
  await supabaseAdmin.from('promo_code_claims').insert({
    code_id: promoCode.id,
    user_id: userId,
    referrer_id: referrerId ?? null,
    bonus_amount: promoCode.bonus_amount,
    referrer_bonus: promoCode.referrer_bonus,
    reward_type: promoCode.reward_type,
  })

  await supabaseAdmin
    .from('promo_referral_codes')
    .update({ uses_count: promoCode.uses_count + 1, updated_at: new Date().toISOString() })
    .eq('id', promoCode.id)

  return { success: true, amount: promoCode.bonus_amount, reward_type: promoCode.reward_type }
}
