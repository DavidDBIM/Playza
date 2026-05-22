import { Router } from 'express'
import { requireAuth, AuthRequest } from '../../middleware/auth'
import { supabaseAdmin } from '../../config/supabase'

const router = Router()

// ── GET /quiz/tournaments  — list registration-open + upcoming + active (public, no auth needed)
router.get('/tournaments', async (_req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('quiz_tournaments')
      .select('*')
      .in('status', ['registration', 'lobby', 'active', 'completed'])
      .order('scheduled_at', { ascending: true })

    if (error) throw error

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

// ── GET /quiz/tournaments/:id
router.get('/tournaments/:id', requireAuth, async (req: AuthRequest, res) => {
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

    // Check if current user already registered
    let userRegistered = false
    if (req.user?.id) {
      const { data: existing } = await supabaseAdmin
        .from('quiz_players')
        .select('id, status, entry_fee_paid')
        .eq('tournament_id', tournament.id)
        .eq('user_id', req.user.id)
        .single()
      userRegistered = !!existing
    }

    res.json({ success: true, data: { ...tournament, player_count: playerCount ?? 0, user_registered: userRegistered } })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// ── POST /quiz/tournaments/:id/join  — pay entry fee and register
// Works when status is 'registration' (pre-event sign-up) or 'lobby' (day-of)
router.post('/tournaments/:id/join', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const { id: tournamentId } = req.params

    const { data: tournament, error: tErr } = await supabaseAdmin
      .from('quiz_tournaments')
      .select('id, status, entry_fee, title, scheduled_at')
      .eq('id', tournamentId)
      .single()

    if (tErr || !tournament) {
      res.status(404).json({ success: false, message: 'Tournament not found' })
      return
    }

    // Only allow joining during registration or lobby phase
    if (!['registration', 'lobby'].includes(tournament.status)) {
      const msg =
        tournament.status === 'draft'     ? 'This tournament is not open for registration yet.' :
        tournament.status === 'active'    ? 'This tournament has already started.' :
        tournament.status === 'completed' ? 'This tournament has ended.' :
        'Tournament is not accepting registrations.'
      res.status(400).json({ success: false, message: msg })
      return
    }

    // Check already registered
    const { data: existing } = await supabaseAdmin
      .from('quiz_players')
      .select('id')
      .eq('tournament_id', tournamentId)
      .eq('user_id', userId)
      .single()

    if (existing) {
      res.json({ success: true, message: 'You are already registered for this tournament!', data: { already_joined: true } })
      return
    }

    // Deduct entry fee
    if (tournament.entry_fee > 0) {
      const { data: wallet } = await supabaseAdmin
        .from('wallets')
        .select('balance')
        .eq('user_id', userId)
        .single()

      if (!wallet || wallet.balance < tournament.entry_fee) {
        res.status(400).json({ success: false, message: `Insufficient ZA balance. You need ${tournament.entry_fee} ZA to register.` })
        return
      }

      await supabaseAdmin.rpc('decrement_wallet_balance', {
        p_user_id: userId,
        p_amount: tournament.entry_fee,
      })

      await supabaseAdmin.from('transactions').insert({
        user_id: userId,
        type: 'quiz_entry',
        amount: tournament.entry_fee,
        status: 'completed',
        reference: `QUIZ-${tournamentId}-${Date.now()}`,
        meta: { tournament_id: tournamentId, tournament_title: tournament.title },
      })

      // Add entry to prize pool
      try {
        const { data: current } = await supabaseAdmin
          .from('quiz_tournaments')
          .select('prize_pool')
          .eq('id', tournamentId)
          .single()
        await supabaseAdmin
          .from('quiz_tournaments')
          .update({ prize_pool: (current?.prize_pool ?? 0) + tournament.entry_fee })
          .eq('id', tournamentId)
      } catch (_) {}
    }

    // Register player — 'alive' is the valid DB status for an active participant
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

    const scheduledDate = tournament.scheduled_at
      ? new Date(tournament.scheduled_at).toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      : 'TBA'

    res.json({
      success: true,
      data: player,
      message: `Registered! ${tournament.entry_fee > 0 ? `${tournament.entry_fee} ZA deducted. ` : ''}Your spot is confirmed for ${scheduledDate}. We'll remind you before it starts.`,
    })
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
