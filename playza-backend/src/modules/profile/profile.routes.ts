import { Router, Response } from 'express'
import { requireAuth, AuthRequest } from '../../middleware/auth'
import {
  getProfile,
  updateProfile,
  addBankAccount,
  setPrimaryBankAccount,
  removeBankAccount,
  getGameHistory,
} from './profile.service'

const router = Router()

router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const data = await getProfile(req.user!.id)
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

router.patch('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { first_name, last_name, phone, avatar_url, tagline, bio, show_activity } = req.body
    const data = await updateProfile(req.user!.id, { first_name, last_name, phone, avatar_url, tagline, bio, show_activity })
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

router.get('/history', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const data = await getGameHistory(req.user!.id, page, limit)
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

router.get('/bank-accounts', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { data } = await import('../../config/supabase').then(m => m.supabaseAdmin
      .from('bank_accounts')
      .select('id, bank_name, bank_code, account_number, account_name, is_primary')
      .eq('user_id', req.user!.id)
      .order('is_primary', { ascending: false })
    )
    res.json({ success: true, data: data ?? [] })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

router.post('/bank-accounts', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { bank_name, bank_code, account_number, account_name } = req.body
    if (!bank_name || !bank_code || !account_number || !account_name) {
      res.status(400).json({ success: false, message: 'All bank account fields are required' })
      return
    }
    const data = await addBankAccount(req.user!.id, { bank_name, bank_code, account_number, account_name })
    res.status(201).json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

router.patch('/bank-accounts/:accountId/primary', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const data = await setPrimaryBankAccount(req.user!.id, req.params.accountId)
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

router.delete('/bank-accounts/:accountId', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const data = await removeBankAccount(req.user!.id, req.params.accountId)
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

export default router
