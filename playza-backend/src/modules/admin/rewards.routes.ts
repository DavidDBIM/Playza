import { Router } from 'express'
import { requireAdmin, AuthRequest } from '../../middleware/auth'
import { supabaseAdmin } from '../../config/supabase'

const router = Router()

// ──────────────────────────────────────────────────────────
//  GET /admin/rewards/search-users?q=
//  Search users by username or email for the recipient picker
// ──────────────────────────────────────────────────────────
router.get('/search-users', requireAdmin, async (req, res) => {
  try {
    const q = ((req.query.q as string) || '').trim()
    if (!q || q.length < 2) {
      res.json({ success: true, data: [] })
      return
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, username, email, avatar_url')
      .or(`username.ilike.%${q}%,email.ilike.%${q}%`)
      .limit(8)

    if (error) throw error
    res.json({ success: true, data: data ?? [] })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// ──────────────────────────────────────────────────────────
//  POST /admin/rewards/grant
//  Body: { user_id, type: 'pza' | 'za_token', amount, reason }
// ──────────────────────────────────────────────────────────
router.post('/grant', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const adminId = req.user!.id
    const { user_id, type, amount, reason } = req.body

    // Validate inputs
    if (!user_id || !type || !amount || !reason) {
      res.status(400).json({ success: false, message: 'user_id, type, amount, and reason are required' })
      return
    }
    if (!['pza', 'za_token'].includes(type)) {
      res.status(400).json({ success: false, message: "type must be 'pza' or 'za_token'" })
      return
    }
    const pts = parseInt(amount)
    if (!pts || pts <= 0 || pts > 1_000_000) {
      res.status(400).json({ success: false, message: 'Amount must be between 1 and 1,000,000' })
      return
    }

    // Verify target user exists
    const { data: targetUser, error: userErr } = await supabaseAdmin
      .from('users')
      .select('id, username, email')
      .eq('id', user_id)
      .single()

    if (userErr || !targetUser) {
      res.status(404).json({ success: false, message: 'User not found' })
      return
    }

    if (type === 'pza') {
      // ── Grant PZA points ──────────────────────────────

      // Log in pza_events
      await supabaseAdmin.from('pza_events').insert({
        user_id,
        event_type: 'ADMIN_GRANT',
        points_awarded: pts,
        meta: { source: 'admin_grant', admin_id: adminId, reason },
      })

      // Upsert pza_points row
      const { data: existing } = await supabaseAdmin
        .from('pza_points').select('id').eq('user_id', user_id).single()

      if (existing) {
        await supabaseAdmin.rpc('increment_pza_points', {
          p_user_id: user_id,
          p_points: pts,
        })
      } else {
        await supabaseAdmin.from('pza_points').insert({
          user_id,
          total_points: pts,
        })
      }

    } else {
      // ── Grant ZA tokens (wallet credit) ──────────────

      // Check if wallet exists
      const { data: wallet } = await supabaseAdmin
        .from('wallets').select('id').eq('user_id', user_id).single()

      if (!wallet) {
        // Create wallet if missing
        await supabaseAdmin.from('wallets').insert({ user_id, balance: pts })
      } else {
        // Add to existing balance
        await supabaseAdmin.rpc('increment_wallet_balance', {
          p_user_id: user_id,
          p_amount: pts,
        })
      }

      // Log as a transaction
      const { data: updatedWallet } = await supabaseAdmin.from('wallets').select('balance').eq('user_id', user_id).single();

      await supabaseAdmin.from('transactions').insert({
        user_id,
        type: 'admin_grant',
        amount: pts,
        status: 'completed',
        reference: `ADMIN-GRANT-${Date.now()}`,
        meta: { 
          admin_id: adminId, 
          reason,
          post_balance: updatedWallet?.balance || 0
        },
      })
    }

    // ── Write to admin_reward_logs ───────────────────────
    await supabaseAdmin.from('admin_reward_logs').insert({
      admin_id: adminId,
      target_user_id: user_id,
      type,
      amount: pts,
      reason,
    })

    res.json({
      success: true,
      message: `Successfully granted ${pts.toLocaleString()} ${type === 'pza' ? 'PZA Points' : 'ZA Tokens'} to @${targetUser.username}`,
      data: { username: targetUser.username, type, amount: pts },
    })
  } catch (err: any) {
    console.error('[Admin Rewards] Grant error:', err)
    res.status(400).json({ success: false, message: err.message })
  }
})

// ──────────────────────────────────────────────────────────
//  GET /admin/rewards/history?page&limit&type
// ──────────────────────────────────────────────────────────
router.get('/history', requireAdmin, async (req, res) => {
  try {
    const page   = Math.max(1, parseInt(req.query.page  as string) || 1)
    const limit  = Math.min(50, parseInt(req.query.limit as string) || 20)
    const offset = (page - 1) * limit
    const type   = (req.query.type as string) || ''

    let query = supabaseAdmin
      .from('admin_reward_logs')
      .select(
        `id, type, amount, reason, created_at,
         target_user:target_user_id(username, email),
         admin:admin_id(username)`,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (type) query = query.eq('type', type)

    const { data, count, error } = await query
    if (error) throw error

    res.json({
      success: true,
      data: {
        logs: data ?? [],
        total: count ?? 0,
        page,
        pages: Math.ceil((count ?? 0) / limit),
      },
    })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

export default router
