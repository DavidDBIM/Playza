import { Router, Response } from 'express'
import { requireAuth, AuthRequest } from '../../middleware/auth'
import { createPin, changePin, verifyPin, hasPinSet, changePassword, updateNotificationPreferences } from './security.service'

const router = Router()

router.get('/pin/status', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const hasPin = await hasPinSet(req.user!.id)
    res.json({ success: true, data: { has_pin: hasPin } })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

router.post('/pin/create', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { pin } = req.body
    if (!pin) { res.status(400).json({ success: false, message: 'PIN is required' }); return }
    const data = await createPin(req.user!.id, pin)
    res.status(201).json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

router.post('/pin/change', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { old_pin, new_pin } = req.body
    if (!old_pin || !new_pin) { res.status(400).json({ success: false, message: 'old_pin and new_pin are required' }); return }
    const data = await changePin(req.user!.id, old_pin, new_pin)
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

router.post('/pin/verify', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { pin } = req.body
    if (!pin) { res.status(400).json({ success: false, message: 'PIN is required' }); return }
    await verifyPin(req.user!.id, pin)
    res.json({ success: true, data: { valid: true } })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

router.post('/password/change', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { current_password, new_password } = req.body
    if (!current_password || !new_password) {
      res.status(400).json({ success: false, message: 'current_password and new_password are required' })
      return
    }
    if (new_password.length < 8) {
      res.status(400).json({ success: false, message: 'New password must be at least 8 characters' })
      return
    }
    const data = await changePassword(req.user!.id, req.user!.email, current_password, new_password)
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

router.patch('/notifications', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { match_alerts, marketing_emails, show_activity } = req.body
    const data = await updateNotificationPreferences(req.user!.id, { match_alerts, marketing_emails, show_activity })
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

export default router
