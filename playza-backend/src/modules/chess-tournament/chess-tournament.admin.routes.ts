import { Router, Response } from 'express'
import { supabaseAdmin } from '../../config/supabase'
import { requireAdmin, AuthRequest } from '../../middleware/auth'
import { generateKnockoutRound1, generateGroupStage } from './chess-tournament.service'

const router = Router()

// ── List all tournaments (admin view, no status filter) ────────────────────
router.get('/tournaments', requireAdmin, async (_req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('chess_tournaments')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    res.json({ success: true, data: data ?? [] })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// ── Create a new tournament ──────────────────────────────────────────────────
router.post('/tournaments', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const {
      title, description, banner_url,
      format,              // 'knockout' | 'group_knockout'
      bracket_size,        // 4 | 8 | 16 | 32 | 64
      group_count,         // group_knockout only
      matches_per_player,  // group_knockout only (informational — derived from round-robin size)
      advance_per_group,   // group_knockout only
      time_control_secs = 600,
      increment_secs = 0,
      entry_fee = 0,
      platform_fee_percentage = 10,
      prize_distribution,
      consolation_pza = 0,
      registration_end,
      scheduled_at,
    } = req.body

    if (!title) return res.status(400).json({ success: false, message: 'Title is required' })
    if (![4, 8, 16, 32, 64].includes(bracket_size)) {
      return res.status(400).json({ success: false, message: 'bracket_size must be 4, 8, 16, 32, or 64' })
    }
    if (format === 'group_knockout' && (!group_count || !advance_per_group)) {
      return res.status(400).json({ success: false, message: 'group_count and advance_per_group are required for group_knockout format' })
    }

    const { data, error } = await supabaseAdmin
      .from('chess_tournaments')
      .insert({
        title, description, banner_url,
        format: format ?? 'knockout',
        bracket_size,
        group_count: format === 'group_knockout' ? group_count : null,
        matches_per_player: format === 'group_knockout' ? matches_per_player : null,
        advance_per_group: format === 'group_knockout' ? advance_per_group : null,
        time_control_secs,
        increment_secs,
        entry_fee,
        platform_fee_percentage,
        prize_distribution,
        consolation_pza,
        registration_end,
        scheduled_at,
        created_by: req.user!.id,
      })
      .select()
      .single()

    if (error) throw error
    res.status(201).json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// ── Update a tournament (only while still in 'registration' status) ────────
router.patch('/tournaments/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { data: existing } = await supabaseAdmin
      .from('chess_tournaments')
      .select('status')
      .eq('id', req.params.id)
      .single()
    if (!existing) return res.status(404).json({ success: false, message: 'Tournament not found' })
    if (existing.status !== 'registration') {
      return res.status(400).json({ success: false, message: 'Can only edit tournaments still in registration' })
    }

    const allowedFields = [
      'title', 'description', 'banner_url', 'bracket_size', 'group_count',
      'matches_per_player', 'advance_per_group', 'time_control_secs',
      'increment_secs', 'entry_fee', 'platform_fee_percentage',
      'prize_distribution', 'consolation_pza', 'registration_end', 'scheduled_at',
    ]
    const updates: Record<string, any> = {}
    for (const f of allowedFields) if (f in req.body) updates[f] = req.body[f]

    const { data, error } = await supabaseAdmin
      .from('chess_tournaments')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single()

    if (error) throw error
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// ── Launch a tournament — closes registration and generates Round 1 / group stage ──
router.post('/tournaments/:id/launch', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { data: tournament } = await supabaseAdmin
      .from('chess_tournaments')
      .select('*')
      .eq('id', req.params.id)
      .single()
    if (!tournament) return res.status(404).json({ success: false, message: 'Tournament not found' })
    if (tournament.status !== 'registration') {
      return res.status(400).json({ success: false, message: 'Tournament already launched' })
    }

    const { count } = await supabaseAdmin
      .from('chess_tournament_players')
      .select('id', { count: 'exact', head: true })
      .eq('tournament_id', tournament.id)

    if (!count || count < 2) {
      return res.status(400).json({ success: false, message: 'Need at least 2 registered players to launch' })
    }

    const fixtures = tournament.format === 'group_knockout'
      ? await generateGroupStage(tournament.id)
      : await generateKnockoutRound1(tournament.id)

    res.json({ success: true, data: { fixtures } })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// ── Cancel a tournament still in registration ───────────────────────────────
router.post('/tournaments/:id/cancel', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { data: tournament } = await supabaseAdmin
      .from('chess_tournaments')
      .select('status, entry_fee')
      .eq('id', req.params.id)
      .single()
    if (!tournament) return res.status(404).json({ success: false, message: 'Tournament not found' })
    if (tournament.status === 'active' || tournament.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Cannot cancel a tournament that has already started' })
    }

    // Refund entry fees if any were collected
    if (tournament.entry_fee > 0) {
      const { data: players } = await supabaseAdmin
        .from('chess_tournament_players')
        .select('user_id')
        .eq('tournament_id', req.params.id)

      for (const p of (players ?? [])) {
        await supabaseAdmin.rpc('increment_wallet_balance', { p_user_id: p.user_id, p_amount: tournament.entry_fee })
        await supabaseAdmin.from('transactions').insert({
          user_id: p.user_id,
          type: 'chess_tournament_refund',
          amount: tournament.entry_fee,
          status: 'completed',
          reference: `CHESS-REFUND-${req.params.id}-${p.user_id}`,
          meta: { tournament_id: req.params.id },
        })
      }
    }

    await supabaseAdmin.from('chess_tournaments').update({ status: 'cancelled' }).eq('id', req.params.id)
    res.json({ success: true })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// ── Schedule match times per round ───────────────────────────────────────────
// Admin sets when each round's matches start — cron uses scheduled_at to
// send 30min + 5min match reminders to each player.
// Body: { round_number: 1, scheduled_at: "2025-06-25T15:00:00Z" }
// This sets scheduled_at on every fixture in that round.
router.post('/tournaments/:id/schedule-round', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { round_number, scheduled_at } = req.body
    if (!round_number || !scheduled_at) {
      return res.status(400).json({ success: false, message: 'round_number and scheduled_at are required' })
    }

    const { data: fixtures, error } = await supabaseAdmin
      .from('chess_tournament_fixtures')
      .update({ scheduled_at, status: 'scheduled' })
      .eq('tournament_id', req.params.id)
      .eq('round_number', round_number)
      .in('status', ['pending', 'scheduled'])
      .select()

    if (error) throw error
    res.json({ success: true, data: { updated: fixtures?.length ?? 0 } })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// ── Schedule a specific fixture ───────────────────────────────────────────────
// Body: { scheduled_at: "2025-06-25T15:00:00Z" }
router.post('/tournaments/:id/fixtures/:fixtureId/schedule', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { scheduled_at } = req.body
    if (!scheduled_at) return res.status(400).json({ success: false, message: 'scheduled_at is required' })

    const { data, error } = await supabaseAdmin
      .from('chess_tournament_fixtures')
      .update({ scheduled_at, status: 'scheduled' })
      .eq('id', req.params.fixtureId)
      .eq('tournament_id', req.params.id)
      .select()
      .single()

    if (error) throw error
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// ── Auto-schedule all rounds from a start time ────────────────────────────────
// Body: { start_time: "2025-06-25T15:00:00Z", minutes_per_round: 90 }
// Round 1 = start_time, Round 2 = start_time + 90min, etc.
router.post('/tournaments/:id/auto-schedule', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { start_time, minutes_per_round = 90 } = req.body
    if (!start_time) return res.status(400).json({ success: false, message: 'start_time is required' })

    const { data: fixtures } = await supabaseAdmin
      .from('chess_tournament_fixtures')
      .select('id, round_number')
      .eq('tournament_id', req.params.id)
      .not('is_bye', 'eq', true)
      .order('round_number', { ascending: true })

    const rounds = [...new Set((fixtures ?? []).map(f => f.round_number))].sort((a, b) => a - b)
    const startMs = new Date(start_time).getTime()
    let updated = 0

    for (let i = 0; i < rounds.length; i++) {
      const roundTime = new Date(startMs + i * minutes_per_round * 60 * 1000).toISOString()
      const roundFixtures = (fixtures ?? []).filter(f => f.round_number === rounds[i]).map(f => f.id)

      await supabaseAdmin
        .from('chess_tournament_fixtures')
        .update({ scheduled_at: roundTime, status: 'scheduled' })
        .in('id', roundFixtures)

      updated += roundFixtures.length
    }

    // Also update tournament scheduled_at to match the first round
    await supabaseAdmin
      .from('chess_tournaments')
      .update({ scheduled_at: start_time })
      .eq('id', req.params.id)

    res.json({ success: true, data: { rounds: rounds.length, fixtures_updated: updated } })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// ── Delete a tournament — only once it's cancelled or completed ────────────
router.delete('/tournaments/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params

    const { data: tournament } = await supabaseAdmin
      .from('chess_tournaments')
      .select('status')
      .eq('id', id)
      .single()

    if (!tournament) {
      return res.status(404).json({ success: false, message: 'Tournament not found' })
    }
    if (!['cancelled', 'completed'].includes(tournament.status)) {
      return res.status(400).json({ success: false, message: 'Only cancelled or completed tournaments can be deleted.' })
    }

    await supabaseAdmin.from('chess_tournament_standings').delete().eq('tournament_id', id)
    await supabaseAdmin.from('chess_tournament_fixtures').delete().eq('tournament_id', id)
    await supabaseAdmin.from('chess_tournament_players').delete().eq('tournament_id', id)
    await supabaseAdmin.from('chess_tournaments').delete().eq('id', id)

    res.json({ success: true, message: 'Tournament deleted successfully.' })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

export default router