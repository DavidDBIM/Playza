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
    const code = req.params.code.toUpperCase()

    // 1. Check user referral codes first
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('username, referral_code')
      .eq('referral_code', code)
      .single()

    if (userData) {
      res.json({ success: true, data: { valid: true, referrer: userData.username, type: 'user' } })
      return
    }

    // 2. Also check promo referral codes
    const { data: promoData } = await supabaseAdmin
      .from('promo_referral_codes')
      .select('code, description, bonus_amount, reward_type, is_active, expires_at, max_uses, uses_count')
      .eq('code', code)
      .eq('is_active', true)
      .single()

    if (promoData) {
      const expired = promoData.expires_at && new Date(promoData.expires_at) < new Date()
      const full = promoData.max_uses !== null && promoData.uses_count >= promoData.max_uses
      if (expired || full) {
        res.status(404).json({ success: false, message: expired ? 'This promo code has expired' : 'This promo code has reached its limit' })
        return
      }
      res.json({ success: true, data: { valid: true, referrer: 'Playza', type: 'promo', bonus_amount: promoData.bonus_amount, reward_type: promoData.reward_type, description: promoData.description } })
      return
    }

    res.status(404).json({ success: false, message: 'Invalid referral code' })
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
