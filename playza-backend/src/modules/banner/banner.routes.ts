import { Router } from 'express'
import { requireAdmin, AuthRequest } from '../../middleware/auth'
import {
  getAllBanners,
  getActiveBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  reorderBanners,
} from './banner.service'
import multer from 'multer'
import { supabaseAdmin } from '../../config/supabase'
import { v4 as uuidv4 } from 'uuid'

const router = Router()

// ── Public: frontend fetches active slides ────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    // Admin query param: return all (active + inactive) for admin panel
    const all = req.query.all === 'true'
    const data = all ? await getAllBanners() : await getActiveBanners()
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ── Admin: create new banner slide ────────────────────────────────────────────
router.post('/', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const data = await createBanner(req.body)
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// ── Admin: update banner slide ────────────────────────────────────────────────
router.put('/:id', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const data = await updateBanner(req.params.id, req.body)
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// ── Admin: delete banner slide ────────────────────────────────────────────────
router.delete('/:id', requireAdmin, async (req: AuthRequest, res) => {
  try {
    await deleteBanner(req.params.id)
    res.json({ success: true })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// ── Admin: reorder slides ─────────────────────────────────────────────────────
router.post('/reorder', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { ids } = req.body
    if (!Array.isArray(ids)) {
      return res.status(400).json({ success: false, message: 'ids must be an array' })
    }
    await reorderBanners(ids)
    res.json({ success: true })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// ── Admin: upload banner image to Supabase Storage ────────────────────────────
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } })

router.post('/upload', requireAdmin, upload.single('image'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' })
    }

    const ext = req.file.originalname.split('.').pop()
    const fileName = `banners/${uuidv4()}.${ext}`

    const { error } = await supabaseAdmin.storage
      .from('media')           // ← your Supabase storage bucket name
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      })

    if (error) throw new Error(error.message)

    const { data: urlData } = supabaseAdmin.storage
      .from('media')
      .getPublicUrl(fileName)

    res.json({ success: true, url: urlData.publicUrl })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message })
  }
})

export default router
