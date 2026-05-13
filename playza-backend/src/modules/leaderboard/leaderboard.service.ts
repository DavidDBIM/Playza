import { supabaseAdmin } from '../../config/supabase'

export type LeaderboardPeriod = 'today' | '7d' | '30d' | 'all'

// Returns a date cutoff string based on period
function getPeriodCutoff(period: LeaderboardPeriod): string | null {
  const now = new Date()
  if (period === 'today') {
    now.setHours(0, 0, 0, 0)
    return now.toISOString()
  }
  if (period === '7d') {
    now.setDate(now.getDate() - 7)
    return now.toISOString()
  }
  if (period === '30d') {
    now.setDate(now.getDate() - 30)
    return now.toISOString()
  }
  return null // 'all' — no cutoff
}

// ─────────────────────────────────────────────
// 1. LOYALTY LEADERBOARD (by PZA points)
// ─────────────────────────────────────────────
export async function getLoyaltyLeaderboard(period: LeaderboardPeriod = 'all', limit = 50) {
  const cutoff = getPeriodCutoff(period)

  if (period === 'all' || !cutoff) {
    const { data, error } = await supabaseAdmin
      .from('pza_points')
      .select('user_id, total_points, users!inner(username, avatar_url)')
      .order('total_points', { ascending: false })
      .limit(limit)

    if (error) throw error

    return (data ?? []).map((row: any, i: number) => ({
      rank: i + 1,
      user_id: row.user_id,
      username: row.users?.username ?? 'Unknown',
      avatar_url: row.users?.avatar_url ?? null,
      pza_points: row.total_points,
    }))
  }

  const { data, error } = await supabaseAdmin
    .from('pza_events')
    .select('user_id, points_awarded, users!inner(username, avatar_url)')
    .gte('created_at', cutoff)

  if (error) throw error

  const map = new Map<string, { username: string; avatar_url: string | null; points: number }>()
  for (const row of data ?? []) {
    const existing = map.get(row.user_id)
    if (existing) {
      existing.points += row.points_awarded
    } else {
      map.set(row.user_id, {
        username: (row.users as any)?.username ?? 'Unknown',
        avatar_url: (row.users as any)?.avatar_url ?? null,
        points: row.points_awarded,
      })
    }
  }

  return Array.from(map.entries())
    .map(([user_id, v]) => ({ user_id, ...v, pza_points: v.points }))
    .sort((a, b) => b.pza_points - a.pza_points)
    .slice(0, limit)
    .map((row, i) => ({ rank: i + 1, ...row }))
}

// ─────────────────────────────────────────────
// 2. REFERRAL LEADERBOARD (by verified referral count)
// ─────────────────────────────────────────────
export async function getReferralLeaderboard(period: LeaderboardPeriod = 'all', limit = 50) {
  const cutoff = getPeriodCutoff(period)

  let query = supabaseAdmin
    .from('referrals')
    .select('referrer_id, users!referrer_id(username, avatar_url)')
    .neq('status', 'pending')

  if (cutoff) {
    query = query.gte('created_at', cutoff)
  }

  const { data, error } = await query

  if (error) throw error

  const map = new Map<string, { username: string; avatar_url: string | null; total_referrals: number }>()
  for (const row of data ?? []) {
    const existing = map.get(row.referrer_id)
    if (existing) {
      existing.total_referrals += 1
    } else {
      map.set(row.referrer_id, {
        username: (row.users as any)?.username ?? 'Unknown',
        avatar_url: (row.users as any)?.avatar_url ?? null,
        total_referrals: 1,
      })
    }
  }

  return Array.from(map.entries())
    .map(([user_id, v]) => ({ user_id, ...v }))
    .sort((a, b) => b.total_referrals - a.total_referrals)
    .slice(0, limit)
    .map((row, i) => ({ rank: i + 1, ...row }))
}

// ─────────────────────────────────────────────
// 3. ARENA GAME LEADERBOARD (The real data)
// ─────────────────────────────────────────────

/**
 * Fetch leaderboard for a specific Arena game
 */
export async function getArenaLeaderboard(gameId: string, period: LeaderboardPeriod = 'all', limit = 50) {
  const cutoff = getPeriodCutoff(period)

  // Query game_leaderboard joined with sessions to filter by game_id
  let query = supabaseAdmin
    .from('game_leaderboard')
    .select(`
      user_id,
      best_score,
      payout_amount,
      session:session_id!inner(game_id, end_time),
      users:user_id(username, avatar_url)
    `)
    .eq('session.game_id', gameId)

  if (cutoff) {
    query = query.gte('session.end_time', cutoff)
  }

  const { data, error } = await query
  if (error) throw error

  // Aggregate by user (Top Score + Total Payout)
  const userMap = new Map<string, any>()
  data?.forEach((entry: any) => {
    const uid = entry.user_id
    if (!userMap.has(uid)) {
      userMap.set(uid, {
        username: entry.users?.username || 'Unknown',
        avatar_url: entry.users?.avatar_url,
        score: entry.best_score,
        reward: Number(entry.payout_amount || 0)
      })
    } else {
      const existing = userMap.get(uid)
      if (entry.best_score > existing.score) existing.score = entry.best_score
      existing.reward += Number(entry.payout_amount || 0)
    }
  })

  return Array.from(userMap.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item, index) => ({ rank: index + 1, ...item }))
}

/**
 * Returns leaderboard for all Arena games dynamically
 */
export async function getAllArenaGamesLeaderboard(period: LeaderboardPeriod = 'all', limit = 10) {
  // Get all Arena games from DB
  const { data: games, error } = await supabaseAdmin
    .from('games')
    .select('id, title, slug')
    .eq('mode', 'Arena')

  if (error) throw error

  const results = await Promise.all(
    games.map(async (game) => {
      try {
        const leaderboard = await getArenaLeaderboard(game.id, period, limit)
        return {
          slug: game.slug,
          name: game.title,
          leaderboard: leaderboard || [],
        }
      } catch (err) {
        console.error(`Error fetching arena leaderboard for ${game.slug}:`, err)
        return {
          slug: game.slug,
          name: game.title,
          leaderboard: [],
        }
      }
    })
  )
  return results
}
