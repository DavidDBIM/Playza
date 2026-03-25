import { supabaseAdmin } from '../../config/supabase'

const REFERRAL_MILESTONES: Record<number, number> = {
  1: 5,
  10: 50,
  50: 200,
  100: 500,
  500: 1000,
  1000: 5000,
  5000: 10000,
}

export async function getReferralStats(userId: string) {
  const { data: referrals, error } = await supabaseAdmin
    .from('referrals')
    .select('id, status, created_at, referred_id, users!referred_id(username)')
    .eq('referrer_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error

  const total = referrals?.length ?? 0
  const verified = referrals?.filter(r => r.status !== 'pending').length ?? 0

  const { data: profile } = await supabaseAdmin
    .from('users')
    .select('referral_code')
    .eq('id', userId)
    .single()

  return {
    referral_code: profile?.referral_code,
    total_referrals: total,
    verified_referrals: verified,
    referrals,
    next_milestone: getNextMilestone(total),
  }
}

function getNextMilestone(current: number) {
  const milestones = Object.keys(REFERRAL_MILESTONES).map(Number).sort((a, b) => a - b)
  const next = milestones.find(m => m > current)
  if (!next) return null
  return { target: next, remaining: next - current, pza_reward: REFERRAL_MILESTONES[next] }
}
