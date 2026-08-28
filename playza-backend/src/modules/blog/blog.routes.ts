import { Router } from 'express'
import { requireAdmin, AuthRequest } from '../../middleware/auth'
import { supabaseAdmin } from '../../config/supabase'
import {
  getAllPosts,
  getPublishedPosts,
  getPostBySlug,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  incrementViewCount,
} from './blog.service'

const router = Router()

async function ensureBlogBucket() {
  const bucketId = 'blog'
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

// ── Public: list published posts only ───────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : undefined
    const data = await getPublishedPosts(limit)
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ── Admin: list every post, including unpublished drafts ───────────────────
router.get('/admin/all', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const data = await getAllPosts()
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ── Public: single post by slug (also bumps the view counter) ──────────────
router.get('/slug/:slug', async (req, res) => {
  try {
    const data = await getPostBySlug(req.params.slug, true)
    incrementViewCount(data.id).catch(() => {})
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(404).json({ success: false, message: 'Post not found' })
  }
})

// ── Admin: single post by id (for editing, includes drafts) ────────────────
router.get('/:id', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const data = await getPostById(req.params.id)
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(404).json({ success: false, message: 'Post not found' })
  }
})

router.post('/', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const data = await createPost(req.body)
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

router.put('/:id', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const data = await updatePost(req.params.id, req.body)
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

router.delete('/:id', requireAdmin, async (req: AuthRequest, res) => {
  try {
    await deletePost(req.params.id)
    res.json({ success: true })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// Only allow real image types — blocks svg (XSS risk), html, and other dangerous uploads
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024 // 5MB

router.post('/upload', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { base64, filename, mimeType } = req.body
    if (!base64 || !filename) return res.status(400).json({ success: false, message: 'base64 and filename required' })

    const match = base64.match(/^data:(.+?);base64,(.+)$/)
    const raw = match ? match[2] : base64
    const mime = match ? match[1] : (mimeType || 'image/jpeg')

    if (!ALLOWED_MIME_TYPES.includes(mime)) {
      return res.status(400).json({ success: false, message: `Unsupported file type: ${mime}. Allowed: jpg, png, webp, gif` })
    }

    const buffer = Buffer.from(raw, 'base64')
    if (buffer.byteLength > MAX_UPLOAD_BYTES) {
      return res.status(400).json({ success: false, message: 'File too large. Maximum size is 5MB.' })
    }

    const ext = mime.split('/')[1]?.replace('jpeg', 'jpg') ?? 'jpg'
    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '').slice(0, 60)
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}-${safeName}.${ext}`

    const bucketId = await ensureBlogBucket()

    const { error } = await supabaseAdmin.storage
      .from(bucketId)
      .upload(path, buffer, { contentType: mime, upsert: false })

    if (error) throw new Error(error.message)

    const { data: urlData } = supabaseAdmin.storage.from(bucketId).getPublicUrl(path)
    res.json({ success: true, url: urlData.publicUrl })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message })
  }
})

export default router