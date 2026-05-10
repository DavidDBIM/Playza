import { Router } from 'express'
import { requireAuth, AuthRequest } from '../../middleware/auth'
import { supabaseAdmin } from '../../config/supabase'

const router = Router()

const VALID_TASK_IDS = new Set([
  'FOLLOW_FACEBOOK',
  'FOLLOW_TWITTER',
  'FOLLOW_INSTAGRAM',
  'FOLLOW_MEDIUM',
  'FOLLOW_YOUTUBE',
])

// ──────────────────────────────────────────────────────────
//  POST /pza/social-task/submit
//  Body: multipart/form-data  { task_id, screenshot (file) }
//  Auth: user JWT
// ──────────────────────────────────────────────────────────
router.post('/submit', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const { task_id } = req.body

    // ── Validate task_id
    if (!task_id || !VALID_TASK_IDS.has(task_id)) {
      res.status(400).json({ success: false, message: 'Invalid task_id' })
      return
    }

    // ── Validate file present  (multer puts it on req.file)
    const file = (req as any).file as Express.Multer.File | undefined
    if (!file) {
      res.status(400).json({ success: false, message: 'Screenshot file is required' })
      return
    }

    // ── Check if already submitted (pending or approved)
    const { data: existing } = await supabaseAdmin
      .from('social_task_submissions')
      .select('id, status')
      .eq('user_id', userId)
      .eq('task_id', task_id)
      .single()

    if (existing) {
      const msg =
        existing.status === 'approved'
          ? 'You already completed this task and received your PZA.'
          : 'You already submitted this task. Admin is reviewing your screenshot.'
      res.status(400).json({ success: false, message: msg })
      return
    }

    // ── Upload screenshot to Supabase Storage
    const ext = file.mimetype.split('/')[1] || 'jpg'
    const storagePath = `social-tasks/${userId}/${task_id}-${Date.now()}.${ext}`

    const { error: uploadError } = await supabaseAdmin.storage
      .from('social-screenshots')
      .upload(storagePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      })

    if (uploadError) {
      console.error('[SocialTask] Storage upload error:', uploadError)
      res.status(500).json({ success: false, message: 'Failed to upload screenshot. Please try again.' })
      return
    }

    // ── Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('social-screenshots')
      .getPublicUrl(storagePath)

    const screenshotUrl = urlData.publicUrl

    // ── Insert submission record
    const { data: submission, error: insertError } = await supabaseAdmin
      .from('social_task_submissions')
      .insert({
        user_id: userId,
        task_id,
        screenshot_url: screenshotUrl,
        status: 'pending',
      })
      .select()
      .single()

    if (insertError) throw insertError

    res.json({
      success: true,
      data: {
        id: submission.id,
        task_id: submission.task_id,
        status: submission.status,
        created_at: submission.created_at,
        message: 'Screenshot submitted! Admin will review within 24–48 hours.',
      },
    })
  } catch (err: any) {
    console.error('[SocialTask] Submit error:', err)
    res.status(400).json({ success: false, message: err.message })
  }
})

// ──────────────────────────────────────────────────────────
//  GET /pza/social-task/my-submissions
//  Returns all submissions for the logged-in user
// ──────────────────────────────────────────────────────────
router.get('/my-submissions', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id

    const { data } = await supabaseAdmin
      .from('social_task_submissions')
      .select('id, task_id, status, created_at, reviewed_at, admin_note')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    res.json({ success: true, data: data ?? [] })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

export default router
