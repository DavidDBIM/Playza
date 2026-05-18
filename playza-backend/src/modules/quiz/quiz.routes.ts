import { Router } from 'express'
import { requireAuth, AuthRequest } from '../../middleware/auth'
import { supabaseAdmin } from '../../config/supabase'

const router = Router()

// ── GET /quiz/tournaments  — list lobby + upcoming tournaments
router.get('/tournaments', requireAuth, async (_req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('quiz_tournaments')
      .select('*')
      .in('status', ['lobby', 'active', 'completed'])
      .order('scheduled_at', { ascending: true })

    if (error) throw error

    // Attach live player counts
    const enriched = await Promise.all((data ?? []).map(async (t) => {
      const { count } = await supabaseAdmin
        .from('quiz_players')
        .select('id', { count: 'exact', head: true })
        .eq('tournament_id', t.id)
      return { ...t, player_count: count ?? 0 }
    }))

    res.json({ success: true, data: enriched })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// ── GET /quiz/tournaments/:id  — single tournament details
router.get('/tournaments/:id', requireAuth, async (req, res) => {
  try {
    const { data: tournament, error } = await supabaseAdmin
      .from('quiz_tournaments')
      .select('*')
      .eq('id', req.params.id)
      .single()

    if (error || !tournament) {
      res.status(404).json({ success: false, message: 'Tournament not found' })
      return
    }

    const { count: playerCount } = await supabaseAdmin
      .from('quiz_players')
      .select('id', { count: 'exact', head: true })
      .eq('tournament_id', tournament.id)

    res.json({ success: true, data: { ...tournament, player_count: playerCount ?? 0 } })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// ── POST /quiz/tournaments/:id/join  — pay entry fee and join
router.post('/tournaments/:id/join', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const { id: tournamentId } = req.params

    const { data: tournament, error: tErr } = await supabaseAdmin
      .from('quiz_tournaments')
      .select('id, status, entry_fee, title')
      .eq('id', tournamentId)
      .single()

    if (tErr || !tournament) {
      res.status(404).json({ success: false, message: 'Tournament not found' })
      return
    }

    if (!['lobby'].includes(tournament.status)) {
      res.status(400).json({ success: false, message: 'Tournament is not open for joining' })
      return
    }

    // Check already joined
    const { data: existing } = await supabaseAdmin
      .from('quiz_players')
      .select('id')
      .eq('tournament_id', tournamentId)
      .eq('user_id', userId)
      .single()

    if (existing) {
      res.json({ success: true, message: 'Already joined', data: { already_joined: true } })
      return
    }

    // Deduct entry fee from wallet
    if (tournament.entry_fee > 0) {
      const { data: wallet } = await supabaseAdmin
        .from('wallets')
        .select('balance')
        .eq('user_id', userId)
        .single()

      if (!wallet || wallet.balance < tournament.entry_fee) {
        res.status(400).json({ success: false, message: 'Insufficient ZA token balance' })
        return
      }

      await supabaseAdmin.rpc('decrement_wallet_balance', {
        p_user_id: userId,
        p_amount: tournament.entry_fee,
      })

      // Log transaction
      await supabaseAdmin.from('transactions').insert({
        user_id: userId,
        type: 'quiz_entry',
        amount: tournament.entry_fee,
        status: 'completed',
        reference: `QUIZ-${tournamentId}-${Date.now()}`,
        meta: { tournament_id: tournamentId, tournament_title: tournament.title },
      })

      // Add to prize pool
      await supabaseAdmin
        .from('quiz_tournaments')
        .update({ prize_pool: supabaseAdmin.rpc as any }) // handled separately below
        .eq('id', tournamentId)

      await supabaseAdmin.rpc('increment_quiz_prize_pool', {
        p_tournament_id: tournamentId,
        p_amount: tournament.entry_fee,
      }).catch(() => {
        // RPC might not exist yet — update directly
        supabaseAdmin.from('quiz_tournaments')
          .update({ prize_pool: tournament.entry_fee }) // partial fallback
          .eq('id', tournamentId)
      })
    }

    // Register player
    const { data: player, error: pErr } = await supabaseAdmin
      .from('quiz_players')
      .insert({
        tournament_id: tournamentId,
        user_id: userId,
        entry_fee_paid: tournament.entry_fee,
        status: 'alive',
      })
      .select()
      .single()

    if (pErr) throw pErr

    // Init leaderboard row
    const { data: profile } = await supabaseAdmin
      .from('users')
      .select('username, avatar_url')
      .eq('id', userId)
      .single()

    await supabaseAdmin.from('quiz_leaderboard').upsert({
      tournament_id: tournamentId,
      user_id: userId,
      username: profile?.username ?? 'Player',
      avatar_url: profile?.avatar_url ?? null,
      correct_answers: 0,
      avg_time_ms: 0,
      status: 'alive',
    }, { onConflict: 'tournament_id,user_id' })

    res.json({ success: true, data: player, message: `Joined ${tournament.title}!` })
  } catch (err: any) {
    console.error('[Quiz] Join error:', err)
    res.status(400).json({ success: false, message: err.message })
  }
})

// ── GET /quiz/tournaments/:id/leaderboard
router.get('/tournaments/:id/leaderboard', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('quiz_leaderboard')
      .select('rank, username, avatar_url, correct_answers, avg_time_ms, status')
      .eq('tournament_id', req.params.id)
      .order('rank', { ascending: true })
      .limit(50)

    if (error) throw error
    res.json({ success: true, data: data ?? [] })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

export default router
