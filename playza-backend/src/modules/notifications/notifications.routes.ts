import { Router } from 'express'
import { getActiveBanners, registerPushToken } from './notifications.service'
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
