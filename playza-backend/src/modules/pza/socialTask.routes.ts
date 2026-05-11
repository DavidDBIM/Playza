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

// POST /pza/social-task/submit
// Body: JSON { task_id: string, screenshot_base64: string, screenshot_mime: string }
// No multer needed — uses express.json({ limit: "10mb" }) already in index.ts
router.post('/submit', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const { task_id, screenshot_base64, screenshot_mime } = req.body

    if (!task_id || !VALID_TASK_IDS.has(task_id)) {
      res.status(400).json({ success: false, message: 'Invalid task_id' })
      return
    }

    if (!screenshot_base64 || !screenshot_mime) {
      res.status(400).json({ success: false, message: 'Screenshot is required' })
      return
    }

    // Prevent duplicate submission
    const { data: existing } = await supabaseAdmin
      .from('social_task_submissions')
      .select('id, status')
      .eq('user_id', userId)
      .eq('task_id', task_id)
      .single()

    if (existing) {
      const msg = existing.status === 'approved'
        ? 'You already completed this task and received your PZA.'
        : 'You already submitted this task — admin is reviewing your screenshot.'
      res.status(400).json({ success: false, message: msg })
      return
    }

    // Decode base64 and upload to Supabase Storage
    const base64Data = screenshot_base64.includes(',')
      ? screenshot_base64.split(',')[1]
      : screenshot_base64
    const buffer = Buffer.from(base64Data, 'base64')
    const ext = (screenshot_mime.split('/')[1] || 'jpg').replace('jpeg', 'jpg')
    const storagePath = `social-tasks/${userId}/${task_id}-${Date.now()}.${ext}`

    const { error: uploadError } = await supabaseAdmin.storage
      .from('social-screenshots')
      .upload(storagePath, buffer, { contentType: screenshot_mime, upsert: false })

    if (uploadError) {
      console.error('[SocialTask] Storage upload error:', uploadError)
      res.status(500).json({ success: false, message: 'Failed to upload screenshot. Please try again.' })
      return
    }

    const { data: urlData } = supabaseAdmin.storage
      .from('social-screenshots')
      .getPublicUrl(storagePath)

    const { data: submission, error: insertError } = await supabaseAdmin
      .from('social_task_submissions')
      .insert({
        user_id: userId,
        task_id,
        screenshot_url: urlData.publicUrl,
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
        status: 'pending',
        created_at: submission.created_at,
        message: 'Screenshot submitted! Admin will review within 24–48 hours.',
      },
    })
  } catch (err: any) {
    console.error('[SocialTask] Submit error:', err)
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

export default router
