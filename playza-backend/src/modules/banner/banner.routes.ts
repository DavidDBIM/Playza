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

async function ensureBannerBucket() {
  const bucketId = 'banners'
  const { data: buckets } = await supabaseAdmin.storage.listBuckets()
  const exists = buckets?.some((b: any) => b.name === bucketId)
  if (!exists) {
    await supabaseAdmin.storage.createBucket(bucketId, {
      public: true,
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
    })
  }
  return bucketId
}

router.get('/', async (req, res) => {
  try {
    const all = req.query.all === 'true'
    const data = all ? await getAllBanners() : await getActiveBanners()
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message })
  }
})

router.post('/', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const data = await createBanner(req.body)
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

router.put('/:id', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const data = await updateBanner(req.params.id, req.body)
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

router.delete('/:id', requireAdmin, async (req: AuthRequest, res) => {
  try {
    await deleteBanner(req.params.id)
    res.json({ success: true })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

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

router.post('/upload', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { base64, filename, mimeType } = req.body
    if (!base64 || !filename) return res.status(400).json({ success: false, message: 'base64 and filename required' })

    const match = base64.match(/^data:(.+?);base64,(.+)$/)
    const raw = match ? match[2] : base64
    const mime = match ? match[1] : (mimeType || 'image/jpeg')
    const ext = mime.split('/')[1]?.replace('jpeg', 'jpg') ?? 'jpg'
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const bucketId = await ensureBannerBucket()

    const { error } = await supabaseAdmin.storage
      .from(bucketId)
      .upload(path, Buffer.from(raw, 'base64'), { contentType: mime, upsert: false })

    if (error) throw new Error(error.message)

    const { data: urlData } = supabaseAdmin.storage.from(bucketId).getPublicUrl(path)
    res.json({ success: true, url: urlData.publicUrl })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message })
  }
})

export default router
