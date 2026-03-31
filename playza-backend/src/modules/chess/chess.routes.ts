import { Router, Response } from 'express'
import { requireAuth, AuthRequest } from '../../middleware/auth'
import { createChessRoom, joinChessRoom, getRoom, makeMove, resignGame, createBotRoom, findQuickMatch } from './chess.service'

const router = Router()

router.post('/bot', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { stake = 0 } = req.body
    const data = await createBotRoom(req.user!.id, stake)
    res.status(201).json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

router.post('/create', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { stake = 0 } = req.body
    const data = await createChessRoom(req.user!.id, stake)
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

router.post('/join', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { code } = req.body
    if (!code) { res.status(400).json({ success: false, message: 'Room code required' }); return }
    const data = await joinChessRoom(req.user!.id, code)
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

router.get('/room/:roomId', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const data = await getRoom(req.params.roomId, req.user!.id)
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

router.post('/room/:roomId/move', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { from, to, promotion } = req.body
    const data = await makeMove(req.params.roomId, req.user!.id, { from, to, promotion })
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

export default router
