import { supabaseAdmin } from '../../config/supabase'

const ZA_PER_VERIFIED_REFERRAL = 500   // ZA earned per qualified referral
const REFERRAL_MILESTONES: Record<number, number> = {
  1: 5,
  10: 50,
  50: 200,
  100: 500,
  500: 1000,
  1000: 5000,
  5000: 10000,
}

// Called once a referred user actually finishes a real tournament (chess or
// quiz) — the concrete activity that has to happen before the referrer's
// 500 ZA becomes earnable. Before this existed, the reward was counted the
// instant the referred person's email was verified, with no requirement
// that they ever played anything — wide open to someone farming 500 ZA per
// throwaway account. This reuses the 'rewarded' status the referrals table
// already had defined (it just was never actually used by any code path),
// so no schema migration is needed.
export async function maybeQualifyReferral(userId: string) {
  try {
    const { data: referredUser } = await supabaseAdmin
      .from('users')
      .select('referred_by')
      .eq('id', userId)
      .single()

    if (!referredUser?.referred_by) return

    const { data: referral } = await supabaseAdmin
      .from('referrals')
      .select('id, status')
      .eq('referrer_id', referredUser.referred_by)
      .eq('referred_id', userId)
      .maybeSingle()

    // Already qualified, or somehow no referral row exists — nothing to do.
    // (status starts at 'email_verified' per auth.service.ts, so this only
    // ever moves forward once, from 'email_verified' to 'rewarded'.)
    if (!referral || referral.status === 'rewarded') return

    const { error } = await supabaseAdmin
      .from('referrals')
      .update({ status: 'rewarded', updated_at: new Date().toISOString() })
      .eq('id', referral.id)

    if (error) console.error(`[Referral] Failed to mark referral ${referral.id} as rewarded:`, error)
  } catch (err) {
    console.error(`[Referral] Qualify check failed for user ${userId}:`, err)
  }
}

export async function getReferralStats(userId: string) {
  const { data: referrals, error } = await supabaseAdmin
    .from('referrals')
    .select('id, status, created_at, referred_id, users!referred_id(username)')
    .eq('referrer_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error

  const total = referrals?.length ?? 0
  // Only referrals that actually reached the qualifying activity (played a
  // tournament — see maybeQualifyReferral) count toward the 500 ZA. Merely
  // verifying an email is tracked separately (small PZA points only) but no
  // longer counted here.
  const verified = referrals?.filter(r => r.status === 'rewarded').length ?? 0

  const { data: profile } = await supabaseAdmin
    .from('users')
    .select('referral_code')
    .eq('id', userId)
    .single()

  // Total ZA earned from referrals
  const totalZaEarned = verified * ZA_PER_VERIFIED_REFERRAL

  // ZA already paid out (approved requests)
  const { data: approvedRequests } = await supabaseAdmin
    .from('referral_payout_requests')
    .select('amount')
    .eq('user_id', userId)
    .eq('status', 'approved')

  const paidOut = (approvedRequests ?? []).reduce((sum: number, r: { amount: number }) => sum + r.amount, 0)

  // ZA in a pending request (can't request again while one is pending)
  const { data: pendingRequests } = await supabaseAdmin
    .from('referral_payout_requests')
    .select('amount')
    .eq('user_id', userId)
    .eq('status', 'pending')

  const inFlight = (pendingRequests ?? []).reduce((sum: number, r: { amount: number }) => sum + r.amount, 0)

  // pendingZa = what's earnable but not yet requested/paid
  const pendingZa = Math.max(0, totalZaEarned - paidOut - inFlight)

  return {
    referral_code: profile?.referral_code,
    total_referrals: total,
    verified_referrals: verified,
    referrals,
    next_milestone: getNextMilestone(total),
    pending_za: pendingZa,
    total_za_earned: totalZaEarned,
  }
}

export async function requestReferralPayout(userId: string) {
  // Get current stats to determine amount
  const statsResult = await getReferralStats(userId)
  const amount = statsResult.pending_za

  if (amount <= 0) {
    throw new Error('No referral ZA available to request.')
  }

  // Prevent duplicate pending requests
  const { data: existing } = await supabaseAdmin
    .from('referral_payout_requests')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'pending')
    .limit(1)

  if (existing && existing.length > 0) {
    throw new Error('You already have a pending payout request.')
  }

  const { data, error } = await supabaseAdmin
    .from('referral_payout_requests')
    .insert({
      user_id: userId,
      amount,
      status: 'pending',
      created_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getUserPayoutRequests(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('referral_payout_requests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

// â”€â”€ Admin functions â”€â”€

export async function getAllPayoutRequests(filters: {
  status?: string
  page?: number
  limit?: number
  search?: string
}) {
  const { status, page = 1, limit = 20, search } = filters
  const offset = (page - 1) * limit

  let query = supabaseAdmin
    .from('referral_payout_requests')
    .select(`
      *,
      users!user_id(id, username, email, wallet:wallets(balance))
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  const { data, error, count } = await query
  if (error) throw error

  // If searching filter client-side (small enough data)
  let results = data ?? []
  if (search) {
    const q = search.toLowerCase()
    results = results.filter((r: any) =>
      r.users?.username?.toLowerCase().includes(q) ||
      r.users?.email?.toLowerCase().includes(q)
    )
  }

  return {
    requests: results,
    total: count ?? 0,
    page,
    limit,
    pages: Math.ceil((count ?? 0) / limit),
  }
}

export async function reviewPayoutRequest(
  requestId: string,
  action: 'approved' | 'rejected',
  adminNote: string | undefined,
  adminId: string
) {
  // Fetch the request
  const { data: request, error: fetchErr } = await supabaseAdmin
    .from('referral_payout_requests')
    .select('*')
    .eq('id', requestId)
    .single()

  if (fetchErr || !request) throw new Error('Request not found')
  if (request.status !== 'pending') throw new Error('Request already reviewed')

  // Update request status
  const { error: updateErr } = await supabaseAdmin
    .from('referral_payout_requests')
    .update({
      status: action,
      admin_note: adminNote ?? null,
      reviewed_at: new Date().toISOString(),
      reviewed_by: adminId,
    })
    .eq('id', requestId)

  if (updateErr) throw updateErr

  // If approved: credit user wallet
  if (action === 'approved') {
    // Atomic RPC instead of a manual select-then-update — avoids losing an
    // update if the user's balance changes from something else (a deposit,
    // a game payout) in between the read and the write.
    const { error: creditErr } = await supabaseAdmin.rpc('adjust_wallet_balance', {
      p_user_id: request.user_id,
      p_amount: request.amount,
    })
    if (creditErr) throw creditErr

    // Log transaction — must match the transactions table's actual columns
    // (id, user_id, type, amount, status, reference, meta, created_at).
    // The previous version wrote a `description` field that column doesn't
    // exist, so this insert was silently failing on every approved payout —
    // the ZA still landed in the wallet, but it never showed up in the
    // user's transaction history.
    const { error: txErr } = await supabaseAdmin.from('transactions').insert({
      user_id: request.user_id,
      type: 'referral_payout',
      amount: request.amount,
      status: 'completed',
      reference: `REFERRAL-PAYOUT-${requestId}`,
      meta: { reason: 'Referral ZA payout approved', request_id: requestId },
    })
    if (txErr) console.error(`[Referral] Transaction log failed for payout ${requestId}:`, txErr)
  }

  return { success: true, action }
}

function getNextMilestone(current: number) {
  const milestones = Object.keys(REFERRAL_MILESTONES).map(Number).sort((a, b) => a - b)
  const next = milestones.find(m => m > current)
  if (!next) return null
  return { target: next, remaining: next - current, pza_reward: REFERRAL_MILESTONES[next] }
}