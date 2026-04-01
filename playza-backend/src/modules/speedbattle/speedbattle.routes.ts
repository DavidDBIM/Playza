import { Router, Response } from 'express'
import { requireAuth, AuthRequest } from '../../middleware/auth'
import { createRoom, joinRoom, getRoom, submitResult, findQuickMatch } from './speedbattle.service'

const router = Router()

router.post('/create', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { stake = 0, is_bot = false, bot_difficulty = 'medium' } = req.body
    const data = await createRoom(req.user!.id, stake, is_bot, bot_difficulty)
    res.status(201).json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

router.post('/join', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { code } = req.body
    if (!code) { res.status(400).json({ success: false, message: 'Room code required' }); return }
    const data = await joinRoom(req.user!.id, code)
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

router.post('/room/:roomId/submit', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { wpm, accuracy } = req.body
    if (!wpm || !accuracy) { res.status(400).json({ success: false, message: 'wpm and accuracy required' }); return }
    const data = await submitResult(req.params.roomId, req.user!.id, wpm, accuracy)
    res.json({ success: true, data })
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

export default router
