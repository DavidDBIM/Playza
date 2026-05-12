import { supabaseAdmin } from '../config/supabase'

export type PZAEvent =
  | 'SIGNUP'
  | 'EMAIL_VERIFIED'
  | 'PROFILE_COMPLETED'
  | 'AVATAR_UPLOADED'
  | 'FIRST_GAME_PLAYED'
  | 'FIVE_GAMES_PLAYED'
  | 'TEN_GAMES_PLAYED'
  | 'FIRST_TICKET_BOUGHT'
  | 'MATCH_COMPLETED'
  | 'MATCH_WON'
  | 'WIN_STREAK_3'
  | 'TOURNAMENT_JOINED'
  | 'TOURNAMENT_FINISHED'
  | 'TOURNAMENT_WON'
  | 'STREAK_3_GAMES'
  | 'STREAK_7_GAMES'
  | 'STREAK_14_GAMES'
  | 'STREAK_21_GAMES'
  | 'STREAK_30_GAMES'
  | 'REFERRAL_SIGNED_UP'
  | 'REFERRAL_EMAIL_VERIFIED'
  | 'REFERRAL_FIRST_DEPOSIT'
  | 'REFERRAL_DEPOSIT_1K'
  | 'REFERRAL_DEPOSIT_10K'
  | 'REFERRAL_FIRST_GAME'
  | 'REFERRAL_FIVE_GAMES'
  | 'REFERRAL_TEN_GAMES'
  | 'REFERRAL_CAMPAIGN_JOINED'
  | 'RANK_BRONZE'
  | 'RANK_SILVER'
  | 'RANK_GOLD'
  | 'RANK_PLATINUM'
  | 'WEEKLY_LEADERBOARD_TOP'
  | 'MATCH_COMMENT'
  | 'CONTENT_LIKED_SHARED'
  | 'COMMUNITY_EVENT_JOINED'
  | 'CHEATER_REPORTED'
  | 'CONTENT_CREATED'
  | 'WEEKEND_CHALLENGE'
  | 'HOLIDAY_TOURNAMENT'
  | 'DAILY_STREAK_CLAIM'
  | 'FIRST_100_TICKET'
  | 'FIRST_100_EVENT'

export const PZA_POINTS: Record<PZAEvent, number> = {
  SIGNUP: 5,
  EMAIL_VERIFIED: 10,
  PROFILE_COMPLETED: 30,
  AVATAR_UPLOADED: 20,
  FIRST_GAME_PLAYED: 200,
  FIVE_GAMES_PLAYED: 1000,
  TEN_GAMES_PLAYED: 2000,
  FIRST_TICKET_BOUGHT: 50,
  MATCH_COMPLETED: 1000,
  MATCH_WON: 1000,
  WIN_STREAK_3: 200,
  TOURNAMENT_JOINED: 100,
  TOURNAMENT_FINISHED: 1000,
  TOURNAMENT_WON: 2000,
  STREAK_3_GAMES: 30,
  STREAK_7_GAMES: 80,
  STREAK_14_GAMES: 150,
  STREAK_21_GAMES: 250,
  STREAK_30_GAMES: 500,
  REFERRAL_SIGNED_UP: 5,
  REFERRAL_EMAIL_VERIFIED: 10,
  REFERRAL_FIRST_DEPOSIT: 200,
  REFERRAL_DEPOSIT_1K: 500,
  REFERRAL_DEPOSIT_10K: 5000,
  REFERRAL_FIRST_GAME: 200,
  REFERRAL_FIVE_GAMES: 500,
  REFERRAL_TEN_GAMES: 1000,
  REFERRAL_CAMPAIGN_JOINED: 100,
  RANK_BRONZE: 500,
  RANK_SILVER: 3000,
  RANK_GOLD: 20000,
  RANK_PLATINUM: 100000,
  WEEKLY_LEADERBOARD_TOP: 1000,
  MATCH_COMMENT: 10,
  CONTENT_LIKED_SHARED: 5,
  COMMUNITY_EVENT_JOINED: 50,
  CHEATER_REPORTED: 200,
  CONTENT_CREATED: 500,
  WEEKEND_CHALLENGE: 200,
  HOLIDAY_TOURNAMENT: 500,
  DAILY_STREAK_CLAIM: 10,
  FIRST_100_TICKET: 1000,
  FIRST_100_EVENT: 200,
}

export function getPZAPoints(event: PZAEvent): number {
  return PZA_POINTS[event] || 0
}

export async function awardPZA(userId: string, event: PZAEvent, multiplier = 1) {
  const points = PZA_POINTS[event] * multiplier

  await supabaseAdmin.from('pza_events').insert({
    user_id: userId,
    event_type: event,
    points_awarded: points,
  })

  const { data: existing } = await supabaseAdmin
    .from('pza_points')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (existing) {
    await supabaseAdmin.rpc('increment_pza_points', {
      p_user_id: userId,
      p_points: points,
    })
  } else {
    await supabaseAdmin.from('pza_points').insert({
      user_id: userId,
      total_points: points,
    })
  }

  // After every point award, check if the user has crossed a new rank threshold
  await checkAndAwardRanks(userId)

  return points
}

// Rank thresholds: minimum total points to earn each rank bonus
const RANK_THRESHOLDS: { event: PZAEvent; minPoints: number }[] = [
  { event: 'RANK_BRONZE',   minPoints: 0 },       // awarded to everyone on first claim
  { event: 'RANK_SILVER',   minPoints: 5000 },
  { event: 'RANK_GOLD',     minPoints: 25000 },
  { event: 'RANK_PLATINUM', minPoints: 100000 },
]

/**
 * Check the user's current total points and fire any rank events they've
 * unlocked but not yet received. Safe to call multiple times — each rank
 * event is only ever inserted once per user.
 */
export async function checkAndAwardRanks(userId: string) {
  // Get current total points
  const { data: pzaRow } = await supabaseAdmin
    .from('pza_points')
    .select('total_points')
    .eq('user_id', userId)
    .single()

  const totalPoints = pzaRow?.total_points ?? 0

  // Get all rank events already awarded to this user
  const { data: awardedEvents } = await supabaseAdmin
    .from('pza_events')
    .select('event_type')
    .eq('user_id', userId)
    .in('event_type', RANK_THRESHOLDS.map(r => r.event))

  const awarded = new Set((awardedEvents ?? []).map((e: any) => e.event_type))

  for (const rank of RANK_THRESHOLDS) {
    if (totalPoints >= rank.minPoints && !awarded.has(rank.event)) {
      // Insert the pza_event row directly (don't call awardPZA to avoid recursion)
      const pts = PZA_POINTS[rank.event]
      await supabaseAdmin.from('pza_events').insert({
        user_id: userId,
        event_type: rank.event,
        points_awarded: pts,
      })
      await supabaseAdmin.rpc('increment_pza_points', {
        p_user_id: userId,
        p_points: pts,
      })
      // Also insert into claimed_tasks so the frontend shows it as fully done
      await supabaseAdmin.from('claimed_tasks').upsert(
        { user_id: userId, task_id: rank.event, points_awarded: pts },
        { onConflict: 'user_id,task_id', ignoreDuplicates: true }
      )
    }
  }
}
