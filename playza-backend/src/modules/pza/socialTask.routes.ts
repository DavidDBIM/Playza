import { Router } from 'express'
import { requireAuth, AuthRequest } from '../../middleware/auth'
import { supabaseAdmin } from '../../config/supabase'

const router = Router()

// GET /pza/social-task/configs  — public, used by frontend Loyalty page
router.get('/configs', async (_req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('social_task_configs')
      .select('id, platform, action_type, title, description, target_url, points')
      .eq('is_active', true)
      .order('platform', { ascending: true })
      .order('created_at', { ascending: true })
    if (error) throw error
    res.json({ success: true, data: data ?? [] })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// GET /pza/social-task/my-submissions
router.get('/my-submissions', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { data } = await supabaseAdmin
      .from('social_task_submissions')
      .select('id, task_id, status, created_at, reviewed_at, admin_note')
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false })
    res.json({ success: true, data: data ?? [] })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// POST /pza/social-task/submit
router.post('/submit', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const { task_id, screenshot_base64, screenshot_mime } = req.body

    if (!task_id) {
      res.status(400).json({ success: false, message: 'task_id is required' })
      return
    }

    const { data: config, error: configErr } = await supabaseAdmin
      .from('social_task_configs')
      .select('id, title, points, is_active')
      .eq('id', task_id)
      .single()

    if (configErr || !config) {
      res.status(400).json({ success: false, message: 'Invalid or unknown task.' })
      return
    }
    if (!config.is_active) {
      res.status(400).json({ success: false, message: 'This task is no longer active.' })
      return
    }
    if (!screenshot_base64 || !screenshot_mime) {
      res.status(400).json({ success: false, message: 'Screenshot is required' })
      return
    }

    const { data: existing } = await supabaseAdmin
      .from('social_task_submissions')
      .select('id, status')
      .eq('user_id', userId)
      .eq('task_id', task_id)
      .single()

    if (existing) {
      if (existing.status === 'approved') {
        res.status(400).json({ success: false, message: 'You already completed this task and received your PZA.' })
        return
      }
      if (existing.status === 'pending') {
        res.status(400).json({ success: false, message: 'You already submitted this task — admin is reviewing your screenshot.' })
        return
      }
      // status === 'rejected': delete the old submission so the user can resubmit below
      await supabaseAdmin
        .from('social_task_submissions')
        .delete()
        .eq('id', existing.id)
    }

    const base64Data = String(screenshot_base64).includes(',')
      ? String(screenshot_base64).split(',')[1]
      : String(screenshot_base64)
    const buffer = Buffer.from(base64Data, 'base64')
    const ext = (String(screenshot_mime).split('/')[1] || 'jpg').replace('jpeg', 'jpg')
    const storagePath = `social-tasks/${userId}/${task_id}-${Date.now()}.${ext}`

    const { error: uploadError } = await supabaseAdmin.storage
      .from('social-screenshots')
      .upload(storagePath, buffer, { contentType: screenshot_mime, upsert: false })

    if (uploadError) {
      res.status(500).json({ success: false, message: 'Failed to upload screenshot.' })
      return
    }

    const { data: urlData } = supabaseAdmin.storage.from('social-screenshots').getPublicUrl(storagePath)

    const { data: submission, error: insertError } = await supabaseAdmin
      .from('social_task_submissions')
      .insert({ user_id: userId, task_id, screenshot_url: urlData.publicUrl, status: 'pending' })
      .select()
      .single()

    if (insertError) throw insertError

    res.json({
      success: true,
      data: {
        id: submission.id,
        task_id: submission.task_id,
        status: 'pending',
        created_at: submission.created_at,
        message: 'Screenshot submitted! You will receive ' + config.points + ' PZA upon approval.',
      },
    })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

export default router
