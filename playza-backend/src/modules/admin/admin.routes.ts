import { Router } from 'express'
import { requireAuth, AuthRequest } from '../../middleware/auth'
import { supabaseAdmin } from '../../config/supabase'
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

// ──────────────────────────────────────────────
//  AMBASSADOR APPLICATIONS
// ──────────────────────────────────────────────

// GET /admin/ambassadors — list all applications with pagination & filter
router.get('/ambassadors', requireAuth, async (req: AuthRequest, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const status = (req.query.status as string) || ''     // pending | approved | rejected
    const search = (req.query.search as string) || ''
    const qualification = (req.query.qualification as string) || ''

    const offset = (page - 1) * limit

    let query = supabaseAdmin
      .from('ambassador_applications')
      .select(`
        id, full_name, email, phone, qualification_type,
        platforms, follower_count, social_handles, content_niche,
        motivation, status, admin_note, created_at, reviewed_at,
        user_id,
        users:user_id (username, avatar_url)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) query = query.eq('status', status)
    if (qualification) query = query.eq('qualification_type', qualification)
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    const { data, count, error } = await query
    if (error) throw error

    res.json({
      success: true,
      data: {
        applications: data ?? [],
        total: count ?? 0,
        page,
        limit,
        pages: Math.ceil((count ?? 0) / limit),
      },
    })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// GET /admin/ambassadors/:id — single application detail
router.get('/ambassadors/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('ambassador_applications')
      .select(`
        *, users:user_id (username, email, avatar_url, created_at),
        pza:user_id (total_points)
      `)
      .eq('id', req.params.id)
      .single()

    if (error) throw error
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// PATCH /admin/ambassadors/:id/review — approve or reject
router.patch('/ambassadors/:id/review', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { action, admin_note } = req.body   // action: 'approve' | 'reject'
    if (!['approve', 'reject'].includes(action)) {
      res.status(400).json({ success: false, message: 'action must be approve or reject' })
      return
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected'

    const { data, error } = await supabaseAdmin
      .from('ambassador_applications')
      .update({ status: newStatus, admin_note: admin_note ?? null, reviewed_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single()

    if (error) throw error

    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

export default router
