import { Router, Response } from 'express'
import { supabaseAdmin } from '../../config/supabase'
import { requireAuth, AuthRequest } from '../../middleware/auth'

const router = Router()

// ── List tournaments (with optional status filter) ─────────────────────────
router.get('/tournaments', async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query
    const userId = req.headers.authorization ? (req as any).user?.id : undefined

    let query = supabaseAdmin.from('chess_tournaments').select('*').order('created_at', { ascending: false })
    if (status) query = query.eq('status', status as string)

    const { data: tournaments, error } = await query
    if (error) throw error

    const ids = (tournaments ?? []).map(t => t.id)
    if (!ids.length) return res.json({ success: true, data: [] })

    const { data: counts } = await supabaseAdmin
      .from('chess_tournament_players')
      .select('tournament_id')
      .in('tournament_id', ids)

    const countMap: Record<string, number> = {}
    for (const row of (counts ?? [])) countMap[row.tournament_id] = (countMap[row.tournament_id] ?? 0) + 1

    const enriched = (tournaments ?? []).map(t => ({
      ...t,
      player_count: countMap[t.id] ?? 0,
    }))

    res.json({ success: true, data: enriched })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// ── Single tournament detail ────────────────────────────────────────────────
router.get('/tournaments/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { data: tournament, error } = await supabaseAdmin
      .from('chess_tournaments')
      .select('*')
      .eq('id', req.params.id)
      .single()
    if (error || !tournament) return res.status(404).json({ success: false, message: 'Tournament not found' })

    const { count } = await supabaseAdmin
      .from('chess_tournament_players')
      .select('id', { count: 'exact', head: true })
      .eq('tournament_id', tournament.id)

    res.json({ success: true, data: { ...tournament, player_count: count ?? 0 } })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// ── Bracket / fixtures for a tournament ─────────────────────────────────────
router.get('/tournaments/:id/fixtures', async (req: AuthRequest, res: Response) => {
  try {
    const { data: fixtures, error } = await supabaseAdmin
      .from('chess_tournament_fixtures')
      .select('*, player1:player1_id(username, avatar_url), player2:player2_id(username, avatar_url)')
      .eq('tournament_id', req.params.id)
      .order('round_number', { ascending: true })
      .order('bracket_position', { ascending: true })
    if (error) throw error

    res.json({ success: true, data: fixtures ?? [] })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// ── Group standings table ───────────────────────────────────────────────────
router.get('/tournaments/:id/standings', async (req: AuthRequest, res: Response) => {
  try {
    const { data: standings, error } = await supabaseAdmin
      .from('chess_tournament_standings')
      .select('*')
      .eq('tournament_id', req.params.id)
      .order('group_number', { ascending: true })
      .order('points', { ascending: false })
    if (error) throw error

    res.json({ success: true, data: standings ?? [] })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// ── Register for a tournament ───────────────────────────────────────────────
router.post('/tournaments/:id/register', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id
    const tournamentId = req.params.id

    const { data: tournament } = await supabaseAdmin
      .from('chess_tournaments')
      .select('*')
      .eq('id', tournamentId)
      .single()
    if (!tournament) return res.status(404).json({ success: false, message: 'Tournament not found' })
    if (tournament.status !== 'registration') return res.status(400).json({ success: false, message: 'Registration is closed' })

    const { count } = await supabaseAdmin
      .from('chess_tournament_players')
      .select('id', { count: 'exact', head: true })
      .eq('tournament_id', tournamentId)
    if ((count ?? 0) >= tournament.bracket_size) {
      return res.status(400).json({ success: false, message: 'Tournament is full' })
    }

    if (tournament.entry_fee > 0) {
      const { data: wallet } = await supabaseAdmin.from('wallets').select('balance').eq('user_id', userId).single()
      if (!wallet || wallet.balance < tournament.entry_fee) {
        return res.status(400).json({ success: false, message: 'Insufficient balance' })
      }
      await supabaseAdmin.rpc('decrement_wallet_balance', { p_user_id: userId, p_amount: tournament.entry_fee })
      await supabaseAdmin.from('transactions').insert({
        user_id: userId,
        type: 'chess_tournament_entry',
        amount: tournament.entry_fee,
        status: 'completed',
        reference: `CHESS-ENTRY-${tournamentId}-${userId}`,
        meta: { tournament_id: tournamentId },
      })
      await supabaseAdmin
        .from('chess_tournaments')
        .update({ prize_pool: tournament.prize_pool + tournament.entry_fee })
        .eq('id', tournamentId)
    }

    const { data: userRow } = await supabaseAdmin.from('users').select('username, avatar_url').eq('id', userId).single()

    const { error } = await supabaseAdmin.from('chess_tournament_players').insert({
      tournament_id: tournamentId,
      user_id: userId,
      username: userRow?.username ?? 'Player',
      avatar_url: userRow?.avatar_url ?? null,
    })
    if (error) {
      if (error.code === '23505') return res.status(400).json({ success: false, message: 'Already registered' })
      throw error
    }

    res.json({ success: true })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

export default router
