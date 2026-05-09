import { Router } from 'express'
import * as GameSessionService from './gamesession.service'
import { requireAuth as authenticate, requireAdmin } from '../../middleware/auth'

const router = Router()

// Admin Routes
router.post('/games', authenticate, requireAdmin, async (req, res) => {
  try {
    const { gameData, sessions } = req.body
    const game = await GameSessionService.createGameWithSessions(gameData, sessions)
    res.json({ success: true, game })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
})
router.post('/sessions/:id/finalize', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await GameSessionService.finalizeSessionAndPayout(req.params.id)
    res.json(result)
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
})

router.patch('/sessions/:id/status', authenticate, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body
    const result = await GameSessionService.updateSessionStatus(req.params.id, status)
    res.json(result)
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
})

router.post('/games/:id/retire', authenticate, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body
    const game = await GameSessionService.retireGame(req.params.id, status)
    res.json({ success: true, game })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Public/User Routes
router.get('/games', async (req, res) => {
  try {
    const games = await GameSessionService.getAllGames()
    res.json({ success: true, games })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
})

router.get('/sessions/:slug/active', async (req, res) => {
  try {
    const result = await GameSessionService.getActiveSession(req.params.slug)

    res.json({ success: true, result })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
})

router.post('/sessions/:id/join', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id
    const result = await GameSessionService.joinSession(userId, req.params.id)
    res.json(result)
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
})

router.post('/sessions/:id/start-round', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id
    const result = await GameSessionService.startRound(userId, req.params.id)
    res.json(result)
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
})

router.post('/sessions/:id/submit-score', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id
    const { score, roundId } = req.body
    const result = await GameSessionService.submitSessionScore(userId, req.params.id, score, roundId)
    res.json(result)
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
})

router.get('/sessions/:id/leaderboard', async (req, res) => {
  try {
    const result = await GameSessionService.getSessionLeaderboard(req.params.id)
    res.json(result)
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
})

router.get('/sessions/:id/my-stats', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id
    const result = await GameSessionService.getUserSessionStats(userId, req.params.id)
    res.json(result)
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
})

router.get('/games/:id/sessions', async (req, res) => {
  try {
    const result = await GameSessionService.getGameSessions(req.params.id)
    res.json(result)
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
})

router.get('/sessions/:id/details', async (req, res) => {
  try {
    const result = await GameSessionService.getSessionDetails(req.params.id)
    res.json(result)
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
})

export default router





