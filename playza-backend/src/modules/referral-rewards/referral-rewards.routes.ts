import { Router } from 'express'
import { requireAdmin, requireAuth, AuthRequest } from '../../middleware/auth'
import {
  getSignupRewardConfigs,
  createSignupRewardConfig,
  updateSignupRewardConfig,
  deleteSignupRewardConfig,
  getPromoCodes,
  createPromoCode,
  updatePromoCode,
  deletePromoCode,
  getPromoCodeClaims,
  claimPromoCode,
} from './referral-rewards.service'

const router = Router()

// ── ADMIN: Signup reward configs ──────────────────────────────────────────────
router.get('/signup-rewards', requireAdmin, async (req: AuthRequest, res) => {
  try {
    res.json({ success: true, data: await getSignupRewardConfigs() })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message })
  }
})

router.post('/signup-rewards', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const data = await createSignupRewardConfig({
      ...req.body,
      created_by: (req.user as any)?.username ?? 'admin',
    })
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

router.put('/signup-rewards/:id', requireAdmin, async (req: AuthRequest, res) => {
  try {
    res.json({ success: true, data: await updateSignupRewardConfig(req.params.id, req.body) })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

router.delete('/signup-rewards/:id', requireAdmin, async (req: AuthRequest, res) => {
  try {
    await deleteSignupRewardConfig(req.params.id)
    res.json({ success: true })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// ── ADMIN: Promo referral codes ───────────────────────────────────────────────
router.get('/promo-codes', requireAdmin, async (req: AuthRequest, res) => {
  try {
    res.json({ success: true, data: await getPromoCodes() })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message })
  }
})

router.post('/promo-codes', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const data = await createPromoCode({
      ...req.body,
      created_by: (req.user as any)?.username ?? 'admin',
    })
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

router.put('/promo-codes/:id', requireAdmin, async (req: AuthRequest, res) => {
  try {
    res.json({ success: true, data: await updatePromoCode(req.params.id, req.body) })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

router.delete('/promo-codes/:id', requireAdmin, async (req: AuthRequest, res) => {
  try {
    await deletePromoCode(req.params.id)
    res.json({ success: true })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

router.get('/promo-codes/:id/claims', requireAdmin, async (req: AuthRequest, res) => {
  try {
    res.json({ success: true, data: await getPromoCodeClaims(req.params.id) })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ── USER: Apply a promo code ──────────────────────────────────────────────────
router.post('/promo-codes/claim', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { code, referrer_id } = req.body
    if (!code) return res.status(400).json({ success: false, message: 'code is required' })
    const data = await claimPromoCode(req.user!.id, code, referrer_id)
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

export default router
