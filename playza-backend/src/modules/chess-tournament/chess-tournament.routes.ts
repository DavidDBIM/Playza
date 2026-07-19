import { Router, Response } from 'express'
import { supabaseAdmin } from '../../config/supabase'
import { requireAuth, AuthRequest } from '../../middleware/auth'
import { Resend } from 'resend'

const router = Router()
const resend = new Resend(process.env.RESEND_API_KEY)

function fmtTime(secs: number) {
  if (secs >= 60) return `${Math.floor(secs / 60)} minute${Math.floor(secs / 60) > 1 ? 's' : ''}${secs % 60 > 0 ? ` + ${secs % 60}s increment` : ''}`
  return `${secs}s`
}

async function sendChessRegistrationEmail(
  to: string,
  username: string,
  tournament: { id: string; title: string; registration_end: string | null; scheduled_at: string | null; entry_fee: number; prize_pool: number; time_control_secs: number; format: string }
) {
  try {
    const closesStr = tournament.registration_end
      ? new Date(tournament.registration_end).toLocaleDateString('en-NG', {
          weekday: 'long', day: 'numeric', month: 'long',
          year: 'numeric', hour: '2-digit', minute: '2-digit',
          timeZone: 'Africa/Lagos',
        })
      : 'TBA'

    await resend.emails.send({
      from: 'Playza <noreply@playza.games>',
      to,
      subject: `✅ You're registered — ${tournament.title}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;background:#0e0e1a;color:#fff;border-radius:16px;overflow:hidden;">
          <div style="background:linear-gradient(135deg,#7c3aed,#a855f7);padding:32px 24px;text-align:center;">
            <div style="font-size:48px;margin-bottom:8px;">♟</div>
            <h1 style="margin:0;font-size:22px;font-weight:900;">You're In!</h1>
            <p style="margin:8px 0 0;opacity:0.8;font-size:13px;">Registration Confirmed</p>
          </div>
          <div style="padding:24px;">
            <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">
              Hey <strong>${username}</strong>,<br><br>
              Your spot in <strong>${tournament.title}</strong> is confirmed. Sharpen your openings!
            </p>
            <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px;margin-bottom:20px;">
              <p style="margin:0 0 8px;font-size:12px;opacity:0.5;text-transform:uppercase;letter-spacing:0.1em;">Tournament Details</p>
              <p style="margin:6px 0;font-weight:700;">♟ ${tournament.title}</p>
              <p style="margin:6px 0;font-weight:700;">📐 Format: ${tournament.format === 'group_knockout' ? 'Group Stage → Knockout' : 'Single Elimination'}</p>
              <p style="margin:6px 0;font-weight:700;">⏱️ Time Control: ${fmtTime(tournament.time_control_secs)}</p>
              <p style="margin:6px 0;font-weight:700;">🔒 Registration Closes: ${closesStr}</p>
              ${tournament.prize_pool > 0 ? `<p style="margin:6px 0;font-weight:700;">💰 Prize Pool: ${tournament.prize_pool.toLocaleString()} ZA</p>` : ''}
              ${tournament.entry_fee > 0 ? `<p style="margin:6px 0;font-weight:700;">⚡ Entry Fee Paid: ${tournament.entry_fee} ZA</p>` : '<p style="margin:6px 0;font-weight:700;color:#4ade80;">🎁 Free Entry</p>'}
            </div>
            <div style="background:rgba(124,58,237,0.1);border:1px solid rgba(124,58,237,0.25);border-radius:12px;padding:14px;margin-bottom:20px;">
              <p style="margin:0;font-size:13px;font-weight:700;color:#c084fc;">⏰ We'll email you when the bracket is drawn and before every match.</p>
            </div>
            <a href="https://playza.games/chess-tournament/${tournament.id}"
              style="display:block;text-align:center;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;text-decoration:none;padding:14px;border-radius:12px;font-weight:900;font-size:14px;">
              View Tournament →
            </a>
          </div>
          <div style="padding:16px 24px;text-align:center;opacity:0.4;font-size:11px;">
            Playza Games · You registered for this chess tournament
          </div>
        </div>
      `,
    })
  } catch (err) {
    console.error('[ChessTournament] Registration email failed:', err)
  }
}

// ── List tournaments — includes user_registered if auth header present ────────
router.get('/tournaments', async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query
    // Try to extract userId from auth header (optional auth — public endpoint)
    let userId: string | undefined
    const authHeader = req.headers.authorization
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const { data } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''))
        userId = data.user?.id
      } catch (_) {}
    }

    let query = supabaseAdmin.from('chess_tournaments').select('*').order('created_at', { ascending: false })
    if (status) query = query.eq('status', status as string)

    const { data: tournaments, error } = await query
    if (error) throw error
    if (!tournaments?.length) return res.json({ success: true, data: [] })

    const ids = tournaments.map(t => t.id)

    // Batch player counts
    const { data: counts } = await supabaseAdmin
      .from('chess_tournament_players')
      .select('tournament_id')
      .in('tournament_id', ids)

    const countMap: Record<string, number> = {}
    for (const row of (counts ?? [])) countMap[row.tournament_id] = (countMap[row.tournament_id] ?? 0) + 1

    // Batch user registrations — single query, not N queries
    const registeredSet = new Set<string>()
    if (userId) {
      const { data: myRegs } = await supabaseAdmin
        .from('chess_tournament_players')
        .select('tournament_id')
        .in('tournament_id', ids)
        .eq('user_id', userId)
      for (const r of (myRegs ?? [])) registeredSet.add(r.tournament_id)
    }

    const enriched = tournaments.map(t => ({
      ...t,
      player_count: countMap[t.id] ?? 0,
      user_registered: registeredSet.has(t.id),
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

// ── Per-user registration status — Step 3 fix ──────────────────────────────
router.get('/tournaments/:id/my-status', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id
    const { data: player } = await supabaseAdmin
      .from('chess_tournament_players')
      .select('status, final_rank, prize_won, group_number, seed')
      .eq('tournament_id', req.params.id)
      .eq('user_id', userId)
      .maybeSingle()

    // Also find their current active fixture if tournament is live
    const { data: activeFixture } = await supabaseAdmin
      .from('chess_tournament_fixtures')
      .select('id, round_number, round_name, chess_room_id, status, player1_id, player2_id, player1:player1_id(username), player2:player2_id(username)')
      .eq('tournament_id', req.params.id)
      .eq('status', 'active')
      .or(`player1_id.eq.${userId},player2_id.eq.${userId}`)
      .maybeSingle()

    res.json({
      success: true,
      data: {
        registered: !!player,
        status: player?.status ?? null,
        final_rank: player?.final_rank ?? null,
        prize_won: player?.prize_won ?? null,
        group_number: player?.group_number ?? null,
        active_fixture: activeFixture ?? null,
      }
    })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// ── Bracket / fixtures ─────────────────────────────────────────────────────
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

// ── Group standings ────────────────────────────────────────────────────────
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

// ── Register ───────────────────────────────────────────────────────────────
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

    // Check already registered
    const { data: existing } = await supabaseAdmin
      .from('chess_tournament_players')
      .select('id')
      .eq('tournament_id', tournamentId)
      .eq('user_id', userId)
      .maybeSingle()
    if (existing) return res.status(400).json({ success: false, message: 'Already registered' })

    if (tournament.entry_fee > 0) {
      const { data: wallet } = await supabaseAdmin.from('wallets').select('balance').eq('user_id', userId).single()
      if (!wallet || wallet.balance < tournament.entry_fee) {
        return res.status(400).json({ success: false, message: 'Insufficient balance' })
      }
      await supabaseAdmin.rpc('decrement_wallet_balance', { p_user_id: userId, p_amount: tournament.entry_fee })
      await supabaseAdmin.from('transactions').insert({
        user_id: userId, type: 'chess_tournament_entry', amount: tournament.entry_fee,
        status: 'completed', reference: `CHESS-ENTRY-${tournamentId}-${userId}`,
        meta: { tournament_id: tournamentId },
      })
      await supabaseAdmin.from('chess_tournaments').update({ prize_pool: tournament.prize_pool + tournament.entry_fee }).eq('id', tournamentId)
    }

    const { data: userRow } = await supabaseAdmin.from('users').select('username, avatar_url, email').eq('id', userId).single()

    const { error } = await supabaseAdmin.from('chess_tournament_players').insert({
      tournament_id: tournamentId, user_id: userId,
      username: userRow?.username ?? 'Player', avatar_url: userRow?.avatar_url ?? null,
    })
    if (error) throw error

    if (userRow?.email) {
      sendChessRegistrationEmail(userRow.email, userRow.username ?? 'Player', tournament)
    }

    res.json({ success: true })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

export default router