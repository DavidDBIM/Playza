import { Router, Response } from 'express'
import { requireAuth, AuthRequest } from '../../middleware/auth'
import { cached } from '../../utils/cache'
import {
  getLoyaltyLeaderboard,
  getReferralLeaderboard,
  getGameLeaderboard,
  getAllGamesLeaderboard,
  getSessionLeaderboard,
  type LeaderboardPeriod,
  type GameSlug,
} from './leaderboard.service'

const router = Router()

const VALID_PERIODS: LeaderboardPeriod[] = ['today', '7d', '30d', 'all']
const VALID_GAMES: GameSlug[] = ['chess', 'speedbattle', 'wordscramble', 'pool', 'ludo']

// Leaderboards don't need to be live-accurate to the second — a short cache
// massively cuts database load under traffic spikes with no visible effect
// for users (ranks rarely change within a 20s window anyway).
const LEADERBOARD_TTL_MS = 20_000

function parsePeriod(raw: unknown): LeaderboardPeriod {
  return VALID_PERIODS.includes(raw as LeaderboardPeriod)
    ? (raw as LeaderboardPeriod)
    : 'all'
}

function parseLimit(raw: unknown, max = 100): number {
  const n = parseInt(raw as string, 10)
  if (isNaN(n) || n < 1) return 50
  return Math.min(n, max)
}

// GET /api/leaderboard/loyalty?period=all&limit=50
// Returns PZA loyalty leaderboard
router.get('/loyalty', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const period = parsePeriod(req.query.period)
    const limit = parseLimit(req.query.limit)
    const data = await cached(
      `leaderboard:loyalty:${period}:${limit}`,
      LEADERBOARD_TTL_MS,
      () => getLoyaltyLeaderboard(period, limit)
    )
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// GET /api/leaderboard/referral?period=all&limit=50
// Returns referral leaderboard (by verified referral count)
router.get('/referral', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const period = parsePeriod(req.query.period)
    const limit = parseLimit(req.query.limit)
    const data = await cached(
      `leaderboard:referral:${period}:${limit}`,
      LEADERBOARD_TTL_MS,
      () => getReferralLeaderboard(period, limit)
    )
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// GET /api/leaderboard/games?period=all&limit=50
// Returns leaderboard for ALL games at once (for the Games tab)
router.get('/games', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const period = parsePeriod(req.query.period)
    const limit = parseLimit(req.query.limit)
    const data = await cached(
      `leaderboard:games-all:${period}:${limit}`,
      LEADERBOARD_TTL_MS,
      () => getAllGamesLeaderboard(period, limit)
    )
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// GET /api/leaderboard/games/:game?period=all&limit=50
// Returns leaderboard for a single game (chess | speedbattle | wordscramble | pool | ludo)
router.get('/games/:game', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const game = req.params.game as GameSlug
    if (!VALID_GAMES.includes(game)) {
      res.status(400).json({ success: false, message: `Invalid game. Must be one of: ${VALID_GAMES.join(', ')}` })
      return
    }
    const period = parsePeriod(req.query.period)
    const limit = parseLimit(req.query.limit)
    const data = await cached(
      `leaderboard:game:${game}:${period}:${limit}`,
      LEADERBOARD_TTL_MS,
      () => getGameLeaderboard(game, period, limit)
    )
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// GET /api/leaderboard/session/:game/:roomId
// Returns leaderboard for a specific room/session — NOT cached, this is a
// live in-progress game and must always reflect the current state.
router.get('/session/:game/:roomId', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const game = req.params.game as GameSlug
    if (!VALID_GAMES.includes(game)) {
      res.status(400).json({ success: false, message: `Invalid game. Must be one of: ${VALID_GAMES.join(', ')}` })
      return
    }
    const data = await getSessionLeaderboard(game, req.params.roomId)
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

export default router
