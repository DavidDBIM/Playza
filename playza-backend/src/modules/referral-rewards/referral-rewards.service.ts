import { supabaseAdmin } from '../../config/supabase'

export interface BannerSlideInput {
  tag: string
  title: string
  subtitle: string
  description: string
  button_text: string
  button_link: string
  image_url: string | null
  color: string
  accent: string
  is_active: boolean
  sort_order: number
}

// ── helper: credit ZA or PZA using the correct RPC pattern ───────────────────
async function creditReward(userId: string, amount: number, type: 'za' | 'pza', description: string) {
  if (type === 'pza') {
    // Use same pattern as awardPZA
    const { data: existing } = await supabaseAdmin
      .from('pza_points')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (existing) {
      await supabaseAdmin.rpc('increment_pza_points', {
        p_user_id: userId,
        p_points: amount,
      })
    } else {
      await supabaseAdmin.from('pza_points').insert({
        user_id: userId,
        total_points: amount,
      })
    }

    await supabaseAdmin.from('pza_events').insert({
      user_id: userId,
      event_type: 'SIGNUP',
      points_awarded: amount,
      meta: { reason: description },
    })
  } else {
    // ZA — use increment_wallet_balance RPC (same as admin rewards)
    const { data: wallet } = await supabaseAdmin
      .from('wallets')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (!wallet) {
      await supabaseAdmin.from('wallets').insert({ user_id: userId, balance: amount })
    } else {
      await supabaseAdmin.rpc('increment_wallet_balance', {
        p_user_id: userId,
        p_amount: amount,
      })
    }

    await supabaseAdmin.from('transactions').insert({
      user_id: userId,
      type: 'signup_bonus',
      amount,
      status: 'completed',
      reference: `SIGNUP-BONUS-${Date.now()}`,
      meta: { reason: description },
    })
  }
}

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

export async function claimSignupRewardForUser(userId: string) {
  // Get active config
  const { data: config } = await supabaseAdmin
    .from('signup_reward_config')
    .select('*')
    .eq('is_active', true)
    .single()

  if (!config) return null

  // Check limit
  if (config.total_claimed >= config.reward_limit) return null

  // Check already claimed
  const { data: existing } = await supabaseAdmin
    .from('signup_reward_claims')
    .select('id')
    .eq('config_id', config.id)
    .eq('user_id', userId)
    .single()
  if (existing) return null

  // Credit using correct RPC
  await creditReward(
    userId,
    config.reward_amount,
    config.reward_type,
    `Welcome bonus: first ${config.reward_limit} users`
  )

  // Record claim
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

export async function claimPromoCode(userId: string, code: string, referrerId?: string) {
  const { data: promoCode } = await supabaseAdmin
    .from('promo_referral_codes')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .single()

  if (!promoCode) throw new Error('Invalid or inactive promo code')
  if (promoCode.expires_at && new Date(promoCode.expires_at) < new Date()) throw new Error('This promo code has expired')
  if (promoCode.max_uses !== null && promoCode.uses_count >= promoCode.max_uses) throw new Error('This promo code has reached its usage limit')

  // Check already claimed
  const { data: existing } = await supabaseAdmin
    .from('promo_code_claims')
    .select('id')
    .eq('code_id', promoCode.id)
    .eq('user_id', userId)
    .single()
  if (existing) throw new Error('You have already used this promo code')

  // Credit referee using correct RPC
  await creditReward(
    userId,
    promoCode.bonus_amount,
    promoCode.reward_type,
    `Promo code bonus: ${promoCode.code}`
  )

  // Credit referrer if applicable
  if (referrerId && promoCode.referrer_bonus > 0) {
    await creditReward(
      referrerId,
      promoCode.referrer_bonus,
      promoCode.reward_type,
      `Referral bonus from promo code: ${promoCode.code}`
    )
  }

  // Record claim
  await supabaseAdmin.from('promo_code_claims').insert({
    code_id: promoCode.id,
    user_id: userId,
    referrer_id: referrerId ?? null,
    bonus_amount: promoCode.bonus_amount,
    referrer_bonus: promoCode.referrer_bonus,
    reward_type: promoCode.reward_type,
  })

  // Increment uses
  await supabaseAdmin
    .from('promo_referral_codes')
    .update({ uses_count: promoCode.uses_count + 1, updated_at: new Date().toISOString() })
    .eq('id', promoCode.id)

  return { success: true, amount: promoCode.bonus_amount, reward_type: promoCode.reward_type }
}
