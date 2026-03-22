import { Router } from 'express'
import { supabaseAdmin } from '../../config/supabase'
import { requireAuth, AuthRequest } from '../../middleware/auth'

const router = Router()

router.get('/me', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { data: points } = await supabaseAdmin
      .from('psa_points')
      .select('total_points')
      .eq('user_id', req.user!.id)
      .single()

    const { data: events } = await supabaseAdmin
      .from('psa_events')
      .select('event_type, points_awarded, created_at')
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false })
      .limit(20)

    res.json({
      success: true,
      data: {
        total_points: points?.total_points ?? 0,
        recent_events: events ?? [],
      },
    })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

export default router
