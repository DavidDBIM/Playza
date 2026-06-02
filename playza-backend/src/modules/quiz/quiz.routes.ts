import { Router } from 'express'
import { requireAuth, AuthRequest } from '../../middleware/auth'
import { supabaseAdmin } from '../../config/supabase'
import { Resend } from 'resend'

const router = Router()
const resend = new Resend(process.env.RESEND_API_KEY)

// ── Send registration confirmation email ──────────────────────────────────────
async function sendRegistrationEmail(
  to: string,
  username: string,
  tournament: { title: string; scheduled_at: string | null; entry_fee: number; prize_pool: number; id: string }
) {
  try {
    const scheduledStr = tournament.scheduled_at
      ? new Date(tournament.scheduled_at).toLocaleDateString('en-NG', {
          weekday: 'long', day: 'numeric', month: 'long',
          year: 'numeric', hour: '2-digit', minute: '2-digit',
        })
      : 'TBA'

    await resend.emails.send({
      from: 'Playza <noreply@playza.games>',
      to,
      subject: `✅ You're registered — ${tournament.title}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;background:#0e0e1a;color:#fff;border-radius:16px;overflow:hidden;">
          <div style="background:linear-gradient(135deg,#7c3aed,#a855f7);padding:32px 24px;text-align:center;">
            <div style="font-size:48px;margin-bottom:8px;">🎉</div>
            <h1 style="margin:0;font-size:22px;font-weight:900;">You're In!</h1>
            <p style="margin:8px 0 0;opacity:0.8;font-size:13px;">Registration Confirmed</p>
          </div>
          <div style="padding:24px;">
            <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">
              Hey <strong>${username}</strong>,<br><br>
              Your spot in <strong>${tournament.title}</strong> is confirmed. Get ready to compete!
            </p>
            <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px;margin-bottom:20px;">
              <p style="margin:0 0 8px;font-size:12px;opacity:0.5;text-transform:uppercase;letter-spacing:0.1em;">Tournament Details</p>
              <p style="margin:6px 0;font-weight:700;">🏆 ${tournament.title}</p>
              <p style="margin:6px 0;font-weight:700;">📅 ${scheduledStr}</p>
              ${tournament.prize_pool > 0 ? `<p style="margin:6px 0;font-weight:700;">💰 Prize Pool: ${tournament.prize_pool.toLocaleString()} ZA</p>` : ''}
              ${tournament.entry_fee > 0 ? `<p style="margin:6px 0;font-weight:700;">⚡ Entry Fee Paid: ${tournament.entry_fee} ZA</p>` : '<p style="margin:6px 0;font-weight:700;color:#4ade80;">🎁 Free Entry</p>'}
              <p style="margin:6px 0;font-weight:700;">🔥 5 Rounds of Elimination</p>
            </div>
            <div style="background:rgba(124,58,237,0.1);border:1px solid rgba(124,58,237,0.25);border-radius:12px;padding:14px;margin-bottom:20px;">
              <p style="margin:0;font-size:13px;font-weight:700;color:#c084fc;">⏰ You'll receive reminders 24 hours and 2 hours before the game starts.</p>
            </div>
            <p style="font-size:13px;opacity:0.6;margin-bottom:20px;">
              Wrong answer = eliminated. Answer fast to survive all 5 rounds. Last one standing wins the prize pool!
            </p>
            <a href="https://playza.games/quiz/${tournament.id}"
              style="display:block;text-align:center;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;text-decoration:none;padding:14px;border-radius:12px;font-weight:900;font-size:14px;">
              View Tournament →
            </a>
          </div>
          <div style="padding:16px 24px;text-align:center;opacity:0.4;font-size:11px;">
            Playza Games · You registered for this tournament
          </div>
        </div>
      `,
    })
  } catch (err) {
    console.error('[Quiz] Registration email failed:', err)
  }
}

// ── GET /quiz/tournaments  — public listing (auth optional)
router.get('/tournaments', async (req, res) => {
  try {
    let userId: string | null = null
    const authHeader = req.headers.authorization
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1]
        const { data: { user } } = await supabaseAdmin.auth.getUser(token)
        userId = user?.id ?? null
      } catch (_) {}
    }

    const { data, error } = await supabaseAdmin
      .from('quiz_tournaments')
      .select('*')
      .in('status', ['registration', 'lobby', 'active', 'completed'])
      .order('scheduled_at', { ascending: true })

    if (error) throw error
    const tournaments = data ?? []
    const ids = tournaments.map(t => t.id)

    if (ids.length === 0) {
      return res.json({ success: true, data: [] })
    }

    // Single query for all player counts instead of N queries
    const { data: playerCounts } = await supabaseAdmin
      .from('quiz_players')
      .select('tournament_id')
      .in('tournament_id', ids)

    const countMap: Record<string, number> = {}
    for (const row of (playerCounts ?? [])) {
      countMap[row.tournament_id] = (countMap[row.tournament_id] ?? 0) + 1
    }

    // Single query for user registrations (only if logged in)
    const registeredSet = new Set<string>()
    if (userId) {
      const { data: registrations } = await supabaseAdmin
        .from('quiz_players')
        .select('tournament_id')
        .in('tournament_id', ids)
        .eq('user_id', userId)
      for (const row of (registrations ?? [])) {
        registeredSet.add(row.tournament_id)
      }
    }

    const enriched = tournaments.map(t => ({
      ...t,
      player_count: countMap[t.id] ?? 0,
      user_registered: registeredSet.has(t.id),
      max_players: t.max_players ?? null,
      prize_distribution: t.prize_distribution ?? null,
      platform_fee_percentage: t.platform_fee_percentage ?? 10,
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

    res.json({
      success: true,
      data: {
        ...tournament,
        player_count: playerCount ?? 0,
        user_registered: userRegistered,
        max_players: tournament.max_players ?? null,
        prize_distribution: tournament.prize_distribution ?? null,
        platform_fee_percentage: tournament.platform_fee_percentage ?? 10,
      },
    })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// ── POST /quiz/tournaments/:id/join
router.post('/tournaments/:id/join', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const { id: tournamentId } = req.params

    const { data: tournament, error: tErr } = await supabaseAdmin
      .from('quiz_tournaments')
      .select('id, status, entry_fee, title, scheduled_at, prize_pool, max_players')
      .eq('id', tournamentId)
      .single()

    if (tErr || !tournament) {
      res.status(404).json({ success: false, message: 'Tournament not found' })
      return
    }

    if (!['registration', 'lobby'].includes(tournament.status)) {
      const msg =
        tournament.status === 'draft'     ? 'This tournament is not open for registration yet.' :
        tournament.status === 'active'    ? 'This tournament has already started.' :
        tournament.status === 'completed' ? 'This tournament has ended.' :
        'Tournament is not accepting registrations.'
      res.status(400).json({ success: false, message: msg })
      return
    }

    // ── Check max players cap ─────────────────────────────────────────────────
    if (tournament.max_players) {
      const { count: currentCount } = await supabaseAdmin
        .from('quiz_players')
        .select('id', { count: 'exact', head: true })
        .eq('tournament_id', tournamentId)

      if ((currentCount ?? 0) >= tournament.max_players) {
        res.status(400).json({
          success: false,
          message: `This tournament is full! Maximum ${tournament.max_players} players allowed.`,
        })
        return
      }
    }

    // ── Check already registered ──────────────────────────────────────────────
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

    // ── Deduct entry fee ──────────────────────────────────────────────────────
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

    // ── Register player ───────────────────────────────────────────────────────
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

    // ── Init leaderboard row ──────────────────────────────────────────────────
    const { data: profile } = await supabaseAdmin
      .from('users')
      .select('username, avatar_url, email')
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
      ? new Date(tournament.scheduled_at).toLocaleDateString('en-NG', {
          weekday: 'long', day: 'numeric', month: 'long',
          year: 'numeric', hour: '2-digit', minute: '2-digit',
        })
      : 'TBA'

    // ── Send confirmation email (non-blocking) ────────────────────────────────
    if (profile?.email) {
      sendRegistrationEmail(profile.email, profile.username ?? 'Player', tournament)
    }

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
