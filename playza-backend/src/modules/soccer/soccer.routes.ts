import { Router, Response } from 'express'
import { requireAuth, AuthRequest } from '../../middleware/auth'
import {
  createSoccerRoom,
  joinSoccerRoom,
  getSoccerRoom,
  createBotRoom,
  findQuickMatch,
  listWaitingRooms,
  updateGameState,
  finishSoccerGame,
  createTournament,
  joinTournament,
  getTournament,
  getActiveTournaments,
} from './soccer.service'

const router = Router()

router.post('/create', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { stake = 0, gameMode = 'timed', team0Name, team0Color } = req.body
    const data = await createSoccerRoom(req.user!.id, stake, { gameMode, team0Name, team0Color })
    res.status(201).json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

router.post('/bot', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { stake = 0, difficulty = 'medium', gameMode = 'timed' } = req.body
    const data = await createBotRoom(req.user!.id, stake, difficulty, gameMode)
    res.status(201).json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

router.post('/quick', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { stake = 0 } = req.body
    const data = await findQuickMatch(req.user!.id, stake)
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

router.get('/waiting', async (req: AuthRequest, res: Response) => {
  try {
    const data = await listWaitingRooms()
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

router.post('/join', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { code, team1Name, team1Color } = req.body
    if (!code) { res.status(400).json({ success: false, message: 'Room code required' }); return }
    const data = await joinSoccerRoom(req.user!.id, code, { team1Name, team1Color })
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

router.get('/room/:roomId', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const data = await getSoccerRoom(req.params.roomId, req.user!.id)
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

router.post('/room/:roomId/state', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { gameState } = req.body
    const data = await updateGameState(req.params.roomId, req.user!.id, gameState)
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

router.post('/room/:roomId/finish', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { winnerId } = req.body
    const data = await finishSoccerGame(req.params.roomId, req.user!.id, winnerId)
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// ── Tournament routes
router.post('/tournament/create', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { name, size, stake = 0, difficulty = 'medium' } = req.body
    const data = await createTournament(req.user!.id, { name, size, stake, difficulty })
    res.status(201).json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

router.post('/tournament/:tournamentId/join', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const data = await joinTournament(req.params.tournamentId, req.user!.id)
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

router.get('/tournament/:tournamentId', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const data = await getTournament(req.params.tournamentId, req.user!.id)
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

router.get('/tournament/active', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const data = await getActiveTournaments(req.user!.id)
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

export default router
