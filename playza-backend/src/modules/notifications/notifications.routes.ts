import { Router } from 'express'
import { getActiveBanners, getNotificationsFeed, registerPushToken } from './notifications.service'
import { requireAuth, AuthRequest } from '../../middleware/auth'

const router = Router()

router.get('/banner', async (req, res) => {
  try {
    const data = await getActiveBanners()
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// Powers the header bell / notification center — every notification an
// admin has sent, not just the banner-eligible types.
router.get('/feed', requireAuth, async (req: AuthRequest, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50)
    const data = await getNotificationsFeed(limit)
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

router.post('/register', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { token, deviceType } = req.body
    const data = await registerPushToken(req.user!.id, token, deviceType)
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

export default router