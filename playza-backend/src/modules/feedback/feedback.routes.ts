import { Router } from 'express'
import { requireAuth, AuthRequest } from '../../middleware/auth'
import { submitFeedback } from './feedback.service'

const router = Router()

// User route: Submit feedback
router.post('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const data = await submitFeedback(req.user!.id, req.body)
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

export default router
