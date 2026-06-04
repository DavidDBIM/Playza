import { Router } from 'express'
import { requireAdmin, AuthRequest } from '../../middleware/auth'
import { supabaseAdmin } from '../../config/supabase'
import {
  getAllBanners,
  getActiveBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  reorderBanners,
} from './banner.service'

const router = Router()

// ── Public: frontend fetches active slides ────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const all = req.query.all === 'true'
    const data = all ? await getAllBanners() : await getActiveBanners()
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ── Admin: create ─────────────────────────────────────────────────────────────
router.post('/', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const data = await createBanner(req.body)
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// ── Admin: update ─────────────────────────────────────────────────────────────
router.put('/:id', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const data = await updateBanner(req.params.id, req.body)
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// ── Admin: delete ─────────────────────────────────────────────────────────────
router.delete('/:id', requireAdmin, async (req: AuthRequest, res) => {
  try {
    await deleteBanner(req.params.id)
    res.json({ success: true })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// ── Admin: reorder ────────────────────────────────────────────────────────────
router.post('/reorder', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { ids } = req.body
    if (!Array.isArray(ids)) return res.status(400).json({ success: false, message: 'ids must be an array' })
    await reorderBanners(ids)
    res.json({ success: true })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// ── Admin: upload image (base64 → Supabase Storage, no multer needed) ─────────
router.post('/upload', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { base64, filename, mimeType } = req.body
    if (!base64 || !filename) return res.status(400).json({ success: false, message: 'base64 and filename required' })

    // Strip data URI prefix if present: "data:image/png;base64,..."
    const raw = base64.includes(',') ? base64.split(',')[1] : base64
    const buffer = Buffer.from(raw, 'base64')

    const ext = filename.split('.').pop() || 'jpg'
    const path = `banners/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { error } = await supabaseAdmin.storage
      .from('media')         // ← change 'media' to your actual bucket name if different
      .upload(path, buffer, { contentType: mimeType || 'image/jpeg', upsert: false })

    if (error) throw new Error(error.message)

    const { data: urlData } = supabaseAdmin.storage.from('media').getPublicUrl(path)
    res.json({ success: true, url: urlData.publicUrl })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message })
  }
})

export default router
