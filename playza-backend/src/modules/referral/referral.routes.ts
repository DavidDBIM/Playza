import { Router } from 'express'
import { supabaseAdmin } from '../../config/supabase'
import {
  getReferralStats,
  requestReferralPayout,
  getUserPayoutRequests,
} from './referral.service'
import { requireAuth, AuthRequest } from '../../middleware/auth'

const router = Router()

// â”€â”€ Public â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

router.get('/validate/:code', async (req, res) => {
  try {
    const { data } = await supabaseAdmin
      .from('users')
      .select('username, referral_code')
      .eq('referral_code', req.params.code.toUpperCase())
      .single()

    if (!data) {
      res.status(404).json({ success: false, message: 'Invalid referral code' })
      return
    }

    res.json({ success: true, data: { valid: true, referrer: data.username } })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// â”€â”€ User â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// Get referral stats (includes pending_za, total_za_earned)
router.get('/stats', requireAuth, async (req: AuthRequest, res) => {
  try {
    const data = await getReferralStats(req.user!.id)
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// Submit a payout request for available referral ZA
router.post('/request-payout', requireAuth, async (req: AuthRequest, res) => {
  try {
    const data = await requestReferralPayout(req.user!.id)
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// Get own payout request history
router.get('/payout-requests', requireAuth, async (req: AuthRequest, res) => {
  try {
    const data = await getUserPayoutRequests(req.user!.id)
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

export default router
