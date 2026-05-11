import { Router } from 'express'
import { requireAdmin, AuthRequest } from '../../middleware/auth'
import { supabaseAdmin } from '../../config/supabase'

const router = Router()
const SOCIAL_TASK_PZA = 200

// GET /admin/social-tasks
router.get('/', requireAdmin, async (req, res) => {
  try {
    const page   = Math.max(1, parseInt(req.query.page  as string) || 1)
    const limit  = Math.min(50, parseInt(req.query.limit as string) || 15)
    const offset = (page - 1) * limit
    const search  = ((req.query.search  as string) || '').trim()
    const status  = (req.query.status  as string) || ''
    const task_id = (req.query.task_id as string) || ''

    let query = supabaseAdmin
      .from('social_task_submissions')
      .select(
        `id, user_id, task_id, screenshot_url, status, admin_note, created_at, reviewed_at,
         users!inner(username, email)`,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status)  query = query.eq('status', status)
    if (task_id) query = query.eq('task_id', task_id)
    if (search)  query = query.or(`users.username.ilike.%${search}%,users.email.ilike.%${search}%`)

    const { data, count, error } = await query
    if (error) throw error

    res.json({
      success: true,
      data: {
        submissions: data ?? [],
        total: count ?? 0,
        page,
        pages: Math.ceil((count ?? 0) / limit),
      },
    })
  } catch (err: any) {
    console.error('[Admin SocialTask] List error:', err)
    res.status(400).json({ success: false, message: err.message })
  }
})

// POST /admin/social-tasks/:id/review
router.post('/:id/review', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const { action, admin_note } = req.body

    if (!['approve', 'reject'].includes(action)) {
      res.status(400).json({ success: false, message: "action must be 'approve' or 'reject'" })
      return
    }

    const { data: submission, error: fetchErr } = await supabaseAdmin
      .from('social_task_submissions')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchErr || !submission) {
      res.status(404).json({ success: false, message: 'Submission not found' })
      return
    }

    if (submission.status !== 'pending') {
      res.status(400).json({ success: false, message: `This submission is already ${submission.status}.` })
      return
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected'

    await supabaseAdmin
      .from('social_task_submissions')
      .update({ status: newStatus, admin_note: admin_note || null, reviewed_at: new Date().toISOString() })
      .eq('id', id)

    if (action === 'approve') {
      const POINTS = SOCIAL_TASK_PZA

      await supabaseAdmin.from('pza_events').insert({
        user_id: submission.user_id,
        event_type: submission.task_id,
        points_awarded: POINTS,
        meta: { source: 'social_task_review', submission_id: id },
      })

      const { data: existing } = await supabaseAdmin
        .from('pza_points').select('id').eq('user_id', submission.user_id).single()

      if (existing) {
        await supabaseAdmin.rpc('increment_pza_points', {
          p_user_id: submission.user_id,
          p_points: POINTS,
        })
      } else {
        await supabaseAdmin.from('pza_points').insert({
          user_id: submission.user_id,
          total_points: POINTS,
        })
      }

      await supabaseAdmin
        .from('claimed_tasks')
        .upsert(
          { user_id: submission.user_id, task_id: submission.task_id, points_awarded: POINTS },
          { onConflict: 'user_id,task_id', ignoreDuplicates: true }
        )
    }

    res.json({
      success: true,
      data: {
        id,
        status: newStatus,
        points_awarded: action === 'approve' ? SOCIAL_TASK_PZA : 0,
        message: action === 'approve'
          ? `Approved. ${SOCIAL_TASK_PZA} PZA credited to user.`
          : 'Submission rejected.',
      },
    })
  } catch (err: any) {
    console.error('[Admin SocialTask] Review error:', err)
    res.status(400).json({ success: false, message: err.message })
  }
})

export default router
