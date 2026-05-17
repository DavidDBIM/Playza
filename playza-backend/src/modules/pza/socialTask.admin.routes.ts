import { Router } from 'express'
import { requireAdmin, AuthRequest } from '../../middleware/auth'
import { supabaseAdmin } from '../../config/supabase'
import { notifyUser } from '../admin/admin.service'

const router = Router()

const VALID_PLATFORMS = ['twitter', 'youtube', 'facebook', 'tiktok', 'instagram', 'medium']

const PLATFORM_ACTIONS: Record<string, string[]> = {
  twitter:   ['follow', 'like', 'retweet', 'quote', 'comment'],
  youtube:   ['subscribe', 'like', 'comment'],
  facebook:  ['like_page', 'share', 'comment'],
  tiktok:    ['follow', 'like', 'comment'],
  instagram: ['follow', 'like', 'comment'],
  medium:    ['follow', 'clap'],
}

// GET /admin/social-tasks/platform-actions
router.get('/platform-actions', requireAdmin, (_req, res) => {
  res.json({ success: true, data: PLATFORM_ACTIONS })
})

// GET /admin/social-tasks/configs
router.get('/configs', requireAdmin, async (_req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('social_task_configs')
      .select('*')
      .order('platform', { ascending: true })
      .order('created_at', { ascending: false })
    if (error) throw error
    res.json({ success: true, data: data ?? [] })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// POST /admin/social-tasks/configs
router.post('/configs', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { platform, action_type, title, description, target_url, points } = req.body

    if (!VALID_PLATFORMS.includes(platform)) {
      res.status(400).json({ success: false, message: 'Invalid platform' })
      return
    }
    if (!(PLATFORM_ACTIONS[platform] ?? []).includes(action_type)) {
      res.status(400).json({ success: false, message: 'Invalid action_type for platform' })
      return
    }
    if (!title?.trim() || !description?.trim() || !target_url?.trim()) {
      res.status(400).json({ success: false, message: 'title, description and target_url are required' })
      return
    }

    const { data, error } = await supabaseAdmin
      .from('social_task_configs')
      .insert({ platform, action_type, title: title.trim(), description: description.trim(), target_url: target_url.trim(), points: parseInt(points) || 200, is_active: true })
      .select()
      .single()
    if (error) throw error
    res.status(201).json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// PATCH /admin/social-tasks/configs/:id
router.patch('/configs/:id', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const updates: Record<string, unknown> = {}
    const { title, description, target_url, points, is_active } = req.body
    if (title !== undefined)       updates.title       = String(title).trim()
    if (description !== undefined) updates.description = String(description).trim()
    if (target_url !== undefined)  updates.target_url  = String(target_url).trim()
    if (points !== undefined)      updates.points      = parseInt(String(points)) || 200
    if (is_active !== undefined)   updates.is_active   = Boolean(is_active)
    if (!Object.keys(updates).length) {
      res.status(400).json({ success: false, message: 'No fields to update' })
      return
    }
    const { data, error } = await supabaseAdmin
      .from('social_task_configs')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single()
    if (error) throw error
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// DELETE /admin/social-tasks/configs/:id
router.delete('/configs/:id', requireAdmin, async (req, res) => {
  try {
    const { error } = await supabaseAdmin.from('social_task_configs').delete().eq('id', req.params.id)
    if (error) throw error
    res.json({ success: true })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// GET /admin/social-tasks
router.get('/', requireAdmin, async (req, res) => {
  try {
    const page    = Math.max(1, parseInt(req.query.page as string) || 1)
    const limit   = Math.min(50, parseInt(req.query.limit as string) || 15)
    const offset  = (page - 1) * limit
    const search  = ((req.query.search as string) || '').trim()
    const status  = (req.query.status as string) || ''
    const platform = (req.query.platform as string) || ''
    const task_config_id = (req.query.task_config_id as string) || ''

    let query = supabaseAdmin
      .from('social_task_submissions')
      .select('id, user_id, task_id, screenshot_url, status, admin_note, created_at, reviewed_at, users!inner(username, email)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status)         query = query.eq('status', status)
    if (task_config_id) query = query.eq('task_id', task_config_id)
    if (search)         query = query.or(`users.username.ilike.%${search}%,users.email.ilike.%${search}%`)

    if (platform) {
      const { data: configs } = await supabaseAdmin.from('social_task_configs').select('id').eq('platform', platform)
      const ids = (configs ?? []).map((c: any) => c.id)
      if (!ids.length) return res.json({ success: true, data: { submissions: [], total: 0, page, pages: 0 } })
      query = query.in('task_id', ids)
    }

    const { data, count, error } = await query
    if (error) throw error
    res.json({ success: true, data: { submissions: data ?? [], total: count ?? 0, page, pages: Math.ceil((count ?? 0) / limit) } })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// POST /admin/social-tasks/:id/review
router.post('/:id/review', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { action, admin_note } = req.body
    if (!['approve', 'reject'].includes(action)) {
      res.status(400).json({ success: false, message: "action must be 'approve' or 'reject'" })
      return
    }

    const { data: submission, error: fetchErr } = await supabaseAdmin
      .from('social_task_submissions').select('*').eq('id', req.params.id).single()
    if (fetchErr || !submission) { res.status(404).json({ success: false, message: 'Not found' }); return }
    if (submission.status !== 'pending') { res.status(400).json({ success: false, message: `Already ${submission.status}` }); return }

    const { data: config } = await supabaseAdmin.from('social_task_configs').select('points, title').eq('id', submission.task_id).single()
    const pts = config?.points ?? 200

    await supabaseAdmin.from('social_task_submissions')
      .update({ status: action === 'approve' ? 'approved' : 'rejected', admin_note: admin_note || null, reviewed_at: new Date().toISOString() })
      .eq('id', req.params.id)

    if (action === 'approve') {
      await supabaseAdmin.from('pza_events').insert({ user_id: submission.user_id, event_type: submission.task_id, points_awarded: pts, meta: { source: 'social_task_review', submission_id: req.params.id } })
      const { data: existing } = await supabaseAdmin.from('pza_points').select('id').eq('user_id', submission.user_id).single()
      if (existing) {
        await supabaseAdmin.rpc('increment_pza_points', { p_user_id: submission.user_id, p_points: pts })
      } else {
        await supabaseAdmin.from('pza_points').insert({ user_id: submission.user_id, total_points: pts })
      }
      await supabaseAdmin.from('claimed_tasks').upsert({ user_id: submission.user_id, task_id: submission.task_id, points_awarded: pts }, { onConflict: 'user_id,task_id', ignoreDuplicates: true })
    }

    // ── Notify user of the outcome via push notification ────────────────────
    const taskTitle = config?.title ?? 'Social Task'
    if (action === 'approve') {
      await notifyUser(
        submission.user_id,
        '🎉 Social Task Approved!',
        `Your "${taskTitle}" submission was approved. +${pts} PZA added to your balance.`,
        '/loyalty'
      )
    } else {
      const reason = admin_note
        ? ` Reason: ${admin_note}`
        : ' Please resubmit with a clearer screenshot showing your username and the completed action.'
      await notifyUser(
        submission.user_id,
        '❌ Social Task Rejected',
        `Your "${taskTitle}" submission was declined.${reason}`,
        '/loyalty'
      )
    }

    res.json({ success: true, data: { status: action === 'approve' ? 'approved' : 'rejected', points_awarded: action === 'approve' ? pts : 0 } })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

export default router
