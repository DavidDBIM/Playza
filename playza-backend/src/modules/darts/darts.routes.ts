import { Router, Response } from 'express'
import { requireAuth, optionalAuth, AuthRequest } from '../../middleware/auth'
import {
  createDartsRoom,
  joinDartsRoom,
  createBotRoom,
  findQuickMatch,
  listWaitingRooms,
  getRoom,
  submitThrow,
  resignGame,
  cancelDartsRoom,
} from './darts.service'

const router = Router()

router.post('/bot', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { stake = 0, startingScore = 301 } = req.body
    const data = await createBotRoom(req.user!.id, stake, startingScore)
    res.status(201).json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

router.post('/create', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { stake = 0, startingScore = 301 } = req.body
    const data = await createDartsRoom(req.user!.id, stake, startingScore)
    res.status(201).json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

router.post('/quick', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { stake = 0, startingScore = 301 } = req.body
    const data = await findQuickMatch(req.user!.id, stake, startingScore)
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
    const { code } = req.body
    if (!code) { res.status(400).json({ success: false, message: 'Room code required' }); return }
    const data = await joinDartsRoom(req.user!.id, code)
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

router.get('/room/:roomId', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const data = await getRoom(req.params.roomId, req.user?.id ?? null)
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// Body: { dx, dy } — normalized landing coordinates (fractions of the board
// radius, dx/dy = 0 is dead center) as computed by the client's own aim +
// precision-timing throw. The server re-derives the score itself from these
// coordinates — it never trusts a client-reported score directly.
router.post('/room/:roomId/throw', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { dx, dy } = req.body
    if (typeof dx !== 'number' || typeof dy !== 'number') {
      res.status(400).json({ success: false, message: 'dx and dy are required numbers' })
      return
    }
    const data = await submitThrow(req.params.roomId, req.user!.id, dx, dy)
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

router.post('/room/:roomId/resign', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const data = await resignGame(req.params.roomId, req.user!.id)
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

router.post('/room/:roomId/cancel', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    await cancelDartsRoom(req.params.roomId, req.user!.id)
    res.json({ success: true, message: 'Room cancelled' })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

export default router