import { Router, Response } from 'express'
import { requireAuth, AuthRequest } from '../../middleware/auth'
import { startSoloSession, endSoloSession } from './soloearn.service'

const router = Router()

router.post('/start', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { gameId, stake } = req.body
    if (gameId === undefined || typeof stake !== 'number') {
      console.error('[SoloEarn] Invalid payload:', req.body);
      return res.status(400).json({ success: false, message: 'Invalid payload provided.' })
    }
    const session = await startSoloSession(req.user!.id, gameId, stake)
    res.json({ success: true, session })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

router.post('/end', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId, multiplier } = req.body
    if (!sessionId || typeof multiplier !== 'number') {
      return res.status(400).json({ success: false, message: 'Invalid payload' })
    }
    const result = await endSoloSession(req.user!.id, sessionId, multiplier)
    res.json({ success: true, ...result })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

export default router
