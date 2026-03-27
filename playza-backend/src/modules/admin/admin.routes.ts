import { Router } from 'express'
import { requireAuth, AuthRequest } from '../../middleware/auth'
import {
  getDashboardMetrics,
  getAllUsersAdmin,
  getAdminSingleUser,
  updateUserStatus,
  getAllTransactionsAdmin,
} from './admin.service'

const router = Router()

router.get('/dashboard', requireAuth, async (req: AuthRequest, res) => {
  try {
    const data = await getDashboardMetrics()
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

router.get('/users', requireAuth, async (req: AuthRequest, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const search = (req.query.search as string) || ''
    const status = (req.query.status as string) || ''
    const data = await getAllUsersAdmin(page, limit, search, status)
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

router.get('/users/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const data = await getAdminSingleUser(req.params.id)
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

router.patch('/users/:id/status', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { action } = req.body
    if (!['activate', 'deactivate', 'ban'].includes(action)) {
      res.status(400).json({ success: false, message: 'Invalid action' })
      return
    }
    const data = await updateUserStatus(req.params.id, action)
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

router.get('/transactions', requireAuth, async (req: AuthRequest, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const type = (req.query.type as string) || ''
    const status = (req.query.status as string) || ''
    const data = await getAllTransactionsAdmin(page, limit, type, status)
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

export default router
