import { Router } from 'express'
import { requireAdmin } from '../../middleware/auth'
import { supabaseAdmin } from '../../config/supabase'

const router = Router()

// ── GET /admin/quiz/sponsors — list all sponsors
router.get('/', requireAdmin, async (_req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('tournament_sponsors')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    res.json({ success: true, data: data ?? [] })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// ── POST /admin/quiz/sponsors — create sponsor
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { name, logo_url, website_url } = req.body
    if (!name) { res.status(400).json({ success: false, message: 'name is required' }); return }
    const { data, error } = await supabaseAdmin
      .from('tournament_sponsors')
      .insert({ name, logo_url: logo_url || null, website_url: website_url || null })
      .select()
      .single()
    if (error) throw error
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// ── PATCH /admin/quiz/sponsors/:id — update sponsor
router.patch('/:id', requireAdmin, async (req, res) => {
  try {
    const { name, logo_url, website_url } = req.body
    const { data, error } = await supabaseAdmin
      .from('tournament_sponsors')
      .update({ name, logo_url, website_url })
      .eq('id', req.params.id)
      .select()
      .single()
    if (error) throw error
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// ── DELETE /admin/quiz/sponsors/:id — delete sponsor
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await supabaseAdmin.from('tournament_sponsors').delete().eq('id', req.params.id)
    res.json({ success: true })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// ── PATCH /admin/quiz/tournaments/:id/sponsor — attach sponsor to tournament
router.patch('/attach/:tournamentId', requireAdmin, async (req, res) => {
  try {
    const { sponsor_id, sponsor_banner_url, sponsor_mode } = req.body
    const { data, error } = await supabaseAdmin
      .from('quiz_tournaments')
      .update({
        sponsor_id: sponsor_id || null,
        sponsor_banner_url: sponsor_banner_url || null,
        sponsor_mode: sponsor_mode || null,
      })
      .eq('id', req.params.tournamentId)
      .select()
      .single()
    if (error) throw error
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

export default router
