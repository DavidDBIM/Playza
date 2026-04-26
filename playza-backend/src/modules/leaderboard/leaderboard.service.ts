import { supabaseAdmin } from '../../config/supabase'

export type LeaderboardPeriod = 'today' | '7d' | '30d' | 'all'

export type GameSlug = 'chess' | 'speedbattle' | 'wordscramble' | 'pool' | 'ludo'

// Maps game slugs to their display names
const GAME_NAMES: Record<GameSlug, string> = {
  chess: 'Chess',
  speedbattle: 'Speed Battle',
  wordscramble: 'Word Scramble',
  pool: '8-Ball Pool',
  ludo: 'Ludo',
}

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
    // Use the pza_points snapshot table — fastest for all-time
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

  // For period-scoped leaderboard, sum pza_events within the period
  const { data, error } = await supabaseAdmin
    .from('pza_events')
    .select('user_id, points_awarded, users!inner(username, avatar_url)')
    .gte('created_at', cutoff)

  if (error) throw error

  // Aggregate points per user
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
    .neq('status', 'pending') // only count verified or rewarded referrals

  if (cutoff) {
    query = query.gte('created_at', cutoff)
  }

  const { data, error } = await query

  if (error) throw error

  // Aggregate referral count per referrer
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
// 3. GAME LEADERBOARD (by wins/total prize per game)
// ─────────────────────────────────────────────

// Aggregate wins for Chess or Pool or Ludo (rooms with winner_id column)
async function getRoomWinLeaderboard(
  table: string,
  period: LeaderboardPeriod,
  limit: number
) {
  const cutoff = getPeriodCutoff(period)

  let query = supabaseAdmin
    .from(table)
    .select('winner_id, stake, users!winner_id(username, avatar_url)')
    .eq('status', 'finished')
    .not('winner_id', 'is', null)

  // Exclude bot wins
  if (table === 'speedbattle_rooms') {
    query = query.neq('winner_id', 'bot')
  }

  if (cutoff) {
    query = query.gte('created_at', cutoff)
  }

  const { data, error } = await query
  if (error) throw error

  const map = new Map<string, {
    username: string
    avatar_url: string | null
    wins: number
    total_winnings: number
  }>()

  for (const row of data ?? []) {
    const uid = row.winner_id as string
    const prize = row.stake ? Number(row.stake) * 2 * 0.9 : 0
    const existing = map.get(uid)
    if (existing) {
      existing.wins += 1
      existing.total_winnings += prize
    } else {
      map.set(uid, {
        username: (row.users as any)?.username ?? 'Unknown',
        avatar_url: (row.users as any)?.avatar_url ?? null,
        wins: 1,
        total_winnings: prize,
      })
    }
  }

  return Array.from(map.entries())
    .map(([user_id, v]) => ({ user_id, ...v }))
    .sort((a, b) => b.wins !== a.wins ? b.wins - a.wins : b.total_winnings - a.total_winnings)
    .slice(0, limit)
    .map((row, i) => ({ rank: i + 1, ...row }))
}

// SpeedBattle leaderboard — rank by wins, tiebreak by best WPM
async function getSpeedBattleLeaderboard(period: LeaderboardPeriod, limit: number) {
  const cutoff = getPeriodCutoff(period)

  let roomQuery = supabaseAdmin
    .from('speedbattle_rooms')
    .select('id, winner_id, stake')
    .eq('status', 'finished')
    .not('winner_id', 'is', null)
    .neq('winner_id', 'bot')

  if (cutoff) {
    roomQuery = roomQuery.gte('created_at', cutoff)
  }

  const { data: rooms, error: roomErr } = await roomQuery
  if (roomErr) throw roomErr

  if (!rooms || rooms.length === 0) return []

  const roomIds = rooms.map(r => r.id)

  // Get best result per user across all their wins
  const { data: results, error: resErr } = await supabaseAdmin
    .from('speedbattle_results')
    .select('user_id, wpm, accuracy, users!inner(username, avatar_url)')
    .in('room_id', roomIds)
    .neq('user_id', 'bot')

  if (resErr) throw resErr

  // Build win map from rooms
  const winMap = new Map<string, { wins: number; total_winnings: number }>()
  for (const room of rooms) {
    const uid = room.winner_id as string
    const prize = room.stake ? Number(room.stake) * 2 * 0.9 : 0
    const ex = winMap.get(uid)
    if (ex) {
      ex.wins += 1
      ex.total_winnings += prize
    } else {
      winMap.set(uid, { wins: 1, total_winnings: prize })
    }
  }

  // Build best WPM map
  const wpmMap = new Map<string, { best_wpm: number; username: string; avatar_url: string | null }>()
  for (const row of results ?? []) {
    const uid = row.user_id as string
    const ex = wpmMap.get(uid)
    if (!ex || row.wpm > ex.best_wpm) {
      wpmMap.set(uid, {
        best_wpm: row.wpm,
        username: (row.users as any)?.username ?? 'Unknown',
        avatar_url: (row.users as any)?.avatar_url ?? null,
      })
    }
  }

  return Array.from(winMap.entries())
    .map(([user_id, v]) => {
      const wpmData = wpmMap.get(user_id)
      return {
        user_id,
        username: wpmData?.username ?? 'Unknown',
        avatar_url: wpmData?.avatar_url ?? null,
        wins: v.wins,
        total_winnings: v.total_winnings,
        best_wpm: wpmData?.best_wpm ?? 0,
      }
    })
    .sort((a, b) => b.wins !== a.wins ? b.wins - a.wins : b.best_wpm - a.best_wpm)
    .slice(0, limit)
    .map((row, i) => ({ rank: i + 1, ...row }))
}

// WordScramble leaderboard — rank by wins, tiebreak by best score
async function getWordScrambleLeaderboard(period: LeaderboardPeriod, limit: number) {
  const cutoff = getPeriodCutoff(period)

  let roomQuery = supabaseAdmin
    .from('wordscramble_rooms')
    .select('id, winner_id, stake')
    .eq('status', 'finished')
    .not('winner_id', 'is', null)
    .neq('winner_id', 'bot')

  if (cutoff) {
    roomQuery = roomQuery.gte('created_at', cutoff)
  }

  const { data: rooms, error: roomErr } = await roomQuery
  if (roomErr) throw roomErr

  if (!rooms || rooms.length === 0) return []

  const roomIds = rooms.map(r => r.id)

  const { data: scores, error: scoreErr } = await supabaseAdmin
    .from('wordscramble_scores')
    .select('user_id, score, rounds_won, users!inner(username, avatar_url)')
    .in('room_id', roomIds)
    .neq('user_id', 'bot')

  if (scoreErr) throw scoreErr

  const winMap = new Map<string, { wins: number; total_winnings: number }>()
  for (const room of rooms) {
    const uid = room.winner_id as string
    const prize = room.stake ? Number(room.stake) * 2 * 0.9 : 0
    const ex = winMap.get(uid)
    if (ex) {
      ex.wins += 1
      ex.total_winnings += prize
    } else {
      winMap.set(uid, { wins: 1, total_winnings: prize })
    }
  }

  const scoreMap = new Map<string, { best_score: number; username: string; avatar_url: string | null }>()
  for (const row of scores ?? []) {
    const uid = row.user_id as string
    const ex = scoreMap.get(uid)
    if (!ex || row.score > ex.best_score) {
      scoreMap.set(uid, {
        best_score: row.score,
        username: (row.users as any)?.username ?? 'Unknown',
        avatar_url: (row.users as any)?.avatar_url ?? null,
      })
    }
  }

  return Array.from(winMap.entries())
    .map(([user_id, v]) => {
      const s = scoreMap.get(user_id)
      return {
        user_id,
        username: s?.username ?? 'Unknown',
        avatar_url: s?.avatar_url ?? null,
        wins: v.wins,
        total_winnings: v.total_winnings,
        best_score: s?.best_score ?? 0,
      }
    })
    .sort((a, b) => b.wins !== a.wins ? b.wins - a.wins : b.best_score - a.best_score)
    .slice(0, limit)
    .map((row, i) => ({ rank: i + 1, ...row }))
}

export async function getGameLeaderboard(game: GameSlug, period: LeaderboardPeriod = 'all', limit = 50) {
  switch (game) {
    case 'chess':
      return getRoomWinLeaderboard('chess_rooms', period, limit)
    case 'pool':
      return getRoomWinLeaderboard('pool_rooms', period, limit)
    case 'ludo':
      return getRoomWinLeaderboard('ludo_rooms', period, limit)
    case 'speedbattle':
      return getSpeedBattleLeaderboard(period, limit)
    case 'wordscramble':
      return getWordScrambleLeaderboard(period, limit)
    default:
      throw new Error(`Unknown game: ${game}`)
  }
}

// Returns leaderboard for all supported games at once (for the frontend game tab)
export async function getAllGamesLeaderboard(period: LeaderboardPeriod = 'all', limit = 50) {
  const games = Object.keys(GAME_NAMES) as GameSlug[]
  const results = await Promise.all(
    games.map(async (slug) => {
      try {
        const leaderboard = await getGameLeaderboard(slug, period, limit)
        return {
          slug,
          name: GAME_NAMES[slug],
          leaderboard: leaderboard || [],
        }
      } catch (err) {
        console.error(`Error fetching leaderboard for ${slug}:`, err)
        return {
          slug,
          name: GAME_NAMES[slug],
          leaderboard: [],
        }
      }
    })
  )
  return results
}

// ─────────────────────────────────────────────
// 4. SESSION LEADERBOARD (per individual room)
// ─────────────────────────────────────────────
export async function getSessionLeaderboard(game: GameSlug, roomId: string) {
  switch (game) {
    case 'speedbattle': {
      const { data: room } = await supabaseAdmin
        .from('speedbattle_rooms')
        .select('id, code, status, stake, winner_id, host_id, guest_id, is_bot, host:users!host_id(username, avatar_url)')
        .eq('id', roomId)
        .single()

      if (!room) throw new Error('Room not found')

      const { data: results } = await supabaseAdmin
        .from('speedbattle_results')
        .select('user_id, wpm, accuracy, finished_at, users!inner(username, avatar_url)')
        .eq('room_id', roomId)
        .neq('user_id', 'bot')
        .order('wpm', { ascending: false })

      return {
        room_id: room.id,
        code: room.code,
        status: room.status,
        stake: room.stake,
        winner_id: room.winner_id,
        players: (results ?? []).map((r: any, i: number) => ({
          rank: i + 1,
          user_id: r.user_id,
          username: r.users?.username ?? 'Unknown',
          avatar_url: r.users?.avatar_url ?? null,
          wpm: r.wpm,
          accuracy: r.accuracy,
          finished_at: r.finished_at,
          is_winner: r.user_id === room.winner_id,
        })),
      }
    }

    case 'wordscramble': {
      const { data: room } = await supabaseAdmin
        .from('wordscramble_rooms')
        .select('id, code, status, stake, winner_id, host_id, guest_id')
        .eq('id', roomId)
        .single()

      if (!room) throw new Error('Room not found')

      const { data: scores } = await supabaseAdmin
        .from('wordscramble_scores')
        .select('user_id, score, rounds_won, users!inner(username, avatar_url)')
        .eq('room_id', roomId)
        .neq('user_id', 'bot')
        .order('score', { ascending: false })

      return {
        room_id: room.id,
        code: room.code,
        status: room.status,
        stake: room.stake,
        winner_id: room.winner_id,
        players: (scores ?? []).map((s: any, i: number) => ({
          rank: i + 1,
          user_id: s.user_id,
          username: s.users?.username ?? 'Unknown',
          avatar_url: s.users?.avatar_url ?? null,
          score: s.score,
          rounds_won: s.rounds_won,
          is_winner: s.user_id === room.winner_id,
        })),
      }
    }

    case 'chess':
    case 'pool':
    case 'ludo': {
      const tableMap: Record<string, string> = {
        chess: 'chess_rooms',
        pool: 'pool_rooms',
        ludo: 'ludo_rooms',
      }
      const table = tableMap[game]

      const { data: room } = await supabaseAdmin
        .from(table)
        .select('id, code, status, stake, winner_id, host_id, guest_id, host:users!host_id(username, avatar_url)')
        .eq('id', roomId)
        .single()

      if (!room) throw new Error('Room not found')

      // Build player list from host + guest
      const playerIds = [room.host_id, room.guest_id].filter(Boolean)
      const { data: players } = await supabaseAdmin
        .from('users')
        .select('id, username, avatar_url')
        .in('id', playerIds)

      const sorted = (players ?? []).sort((a) => (a.id === room.winner_id ? -1 : 1))

      return {
        room_id: room.id,
        code: room.code,
        status: room.status,
        stake: room.stake,
        winner_id: room.winner_id,
        players: sorted.map((p, i) => ({
          rank: i + 1,
          user_id: p.id,
          username: p.username,
          avatar_url: p.avatar_url,
          is_winner: p.id === room.winner_id,
        })),
      }
    }

    default:
      throw new Error(`Unknown game: ${game}`)
  }
}
