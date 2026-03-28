import { Router, Request, Response } from 'express'
import { requireAuth, AuthRequest } from '../../middleware/auth'
import {
  getWallet,
  initializeDeposit,
  verifyDeposit,
  requestWithdrawal,
  getTransactionHistory,
  verifyBankAccount,
  getBankList,
  paystackWebhook,
} from './wallet.service'

const router = Router()

router.get('/balance', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const data = await getWallet(req.user!.id)
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

router.post('/deposit/initialize', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { amount, currency } = req.body
    const data = await initializeDeposit(req.user!.id, amount, req.user!.email, currency)
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

router.get('/deposit/verify/:reference', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const data = await verifyDeposit(req.params.reference)
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

router.post('/withdraw', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { amount, bank_code, account_number, account_name } = req.body
    const data = await requestWithdrawal(req.user!.id, amount, bank_code, account_number, account_name)
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

router.get('/transactions', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const data = await getTransactionHistory(req.user!.id, page, limit)
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

router.get('/banks', async (req: Request, res: Response) => {
  try {
    const data = await getBankList()
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

router.post('/verify-account', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { account_number, bank_code } = req.body
    const data = await verifyBankAccount(account_number, bank_code)
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

router.post('/webhook/paystack', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-paystack-signature'] as string
    await paystackWebhook(req.body, signature)
    res.sendStatus(200)
  } catch (err: any) {
    res.sendStatus(400)
  }
})

export default router
