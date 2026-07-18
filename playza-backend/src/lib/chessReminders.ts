import { supabaseAdmin } from '../config/supabase'
import { Resend } from 'resend'
import { generateKnockoutRound1, generateGroupStage } from '../modules/chess-tournament/chess-tournament.service'

const resend = new Resend(process.env.RESEND_API_KEY)

// ── Helpers ───────────────────────────────────────────────────────────────────
async function sendEmail(to: string, subject: string, html: string) {
  try {
    await resend.emails.send({ from: 'Playza <noreply@playza.games>', to, subject, html })
  } catch (err) {
    console.error('[ChessCron] Email failed:', err)
  }
}

async function sendPushToUser(userId: string, title: string, body: string, url?: string) {
  try {
    const { data: tokens } = await supabaseAdmin
      .from('push_tokens').select('token').eq('user_id', userId)
    if (!tokens?.length) return
    const webpush = (await import('web-push')).default
    webpush.setVapidDetails(
      process.env.VAPID_EMAIL || 'mailto:playzadevteam@gmail.com',
      process.env.VAPID_PUBLIC_KEY || '',
      process.env.VAPID_PRIVATE_KEY || ''
    )
    const payload = JSON.stringify({ title, body, url: url ?? '/tournaments' })
    for (const t of tokens) {
      try { await webpush.sendNotification(JSON.parse(t.token), payload) } catch (_) {}
    }
  } catch (err) {
    console.error('[ChessCron] Push error:', err)
  }
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('en-NG', {
    weekday: 'long', day: 'numeric', month: 'long',
    year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function fmtTime(secs: number) {
  if (secs >= 60) return `${Math.floor(secs / 60)} minute${Math.floor(secs / 60) > 1 ? 's' : ''}${secs % 60 > 0 ? ` + ${secs % 60}s increment` : ''}`
  return `${secs}s`
}

async function getChessPlayers(tournamentId: string) {
  const { data } = await supabaseAdmin
    .from('chess_tournament_players')
    .select('user_id, username, users!inner(email, username)')
    .eq('tournament_id', tournamentId)
  return (data ?? []) as unknown as Array<{
    user_id: string
    username: string
    users: { email: string; username: string }
  }>
}

// ── Email Templates ───────────────────────────────────────────────────────────

function registrationClosedHtml(username: string, t: any) {
  const drawTime = new Date(new Date(t.registration_end).getTime() + 30 * 60 * 1000)
  return `
  <div style="font-family:sans-serif;max-width:480px;margin:auto;background:#0e0e1a;color:#fff;border-radius:16px;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#7c3aed,#a855f7);padding:32px 24px;text-align:center;">
      <div style="font-size:48px;margin-bottom:8px;">♟</div>
      <h1 style="margin:0;font-size:22px;font-weight:900;">Registration Closed</h1>
      <p style="margin:8px 0 0;opacity:0.8;font-size:13px;">Your spot is secured!</p>
    </div>
    <div style="padding:24px;">
      <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">
        Hey <strong>${username}</strong>,<br><br>
        Registration for <strong>${t.title}</strong> is now closed.
        Your spot is confirmed — prepare your opening moves!
      </p>
      <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px;margin-bottom:16px;">
        <p style="margin:0 0 8px;font-size:12px;opacity:0.5;text-transform:uppercase;letter-spacing:0.1em;">Tournament Details</p>
        <p style="margin:6px 0;font-weight:700;">♟ ${t.title}</p>
        <p style="margin:6px 0;font-weight:700;">📐 Format: ${t.format === 'group_knockout' ? 'Group Stage → Knockout' : 'Single Elimination'}</p>
        <p style="margin:6px 0;font-weight:700;">⏱️ Time Control: ${fmtTime(t.time_control_secs)}</p>
        ${t.prize_pool > 0 ? `<p style="margin:6px 0;font-weight:700;">💰 Prize Pool: ${t.prize_pool.toLocaleString()} ZA</p>` : ''}
        ${t.entry_fee > 0 ? `<p style="margin:6px 0;font-weight:700;">⚡ Entry Fee Paid: ${t.entry_fee} ZA</p>` : '<p style="margin:6px 0;font-weight:700;color:#4ade80;">🎁 Free Entry</p>'}
      </div>
      <div style="background:rgba(124,58,237,0.12);border:1px solid rgba(124,58,237,0.3);border-radius:12px;padding:14px;margin-bottom:16px;">
        <p style="margin:0;font-size:13px;font-weight:800;color:#c084fc;">
          🎲 The draw happens automatically in 30 minutes!
        </p>
        <p style="margin:6px 0 0;font-size:12px;color:#a855f7;opacity:0.8;">
          Watch the fixtures being drawn live on Playza at ${fmtDate(drawTime.toISOString())}
        </p>
      </div>
      <a href="https://playza.games/tournaments" style="display:block;text-align:center;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;text-decoration:none;padding:14px;border-radius:12px;font-weight:900;font-size:14px;">
        Watch the Draw Live →
      </a>
    </div>
    <div style="padding:16px 24px;text-align:center;opacity:0.4;font-size:11px;">Playza Games · You registered for this chess tournament</div>
  </div>`
}

function drawCompleteHtml(username: string, t: any, fixture: any) {
  const opponentName = fixture?.player1?.username === username
    ? fixture?.player2?.username
    : fixture?.player1?.username
  const isWhite = fixture?.player1_id !== null && fixture?.player1?.username === username
  return `
  <div style="font-family:sans-serif;max-width:480px;margin:auto;background:#0e0e1a;color:#fff;border-radius:16px;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#1e3a5f,#2563eb);padding:32px 24px;text-align:center;">
      <div style="font-size:48px;margin-bottom:8px;">🎲</div>
      <h1 style="margin:0;font-size:22px;font-weight:900;">The Draw is Done!</h1>
      <p style="margin:8px 0 0;opacity:0.8;font-size:13px;">${t.title} fixtures are set</p>
    </div>
    <div style="padding:24px;">
      <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">
        Hey <strong>${username}</strong>,<br><br>
        The bracket for <strong>${t.title}</strong> has been drawn. Here's your first match:
      </p>
      <div style="background:rgba(37,99,235,0.1);border:1px solid rgba(37,99,235,0.3);border-radius:12px;padding:16px;margin-bottom:16px;text-align:center;">
        <p style="margin:0 0 8px;font-size:11px;opacity:0.5;text-transform:uppercase;letter-spacing:0.1em;">${fixture?.round_name ?? 'Round 1'}</p>
        <div style="display:flex;align-items:center;justify-content:center;gap:16px;margin:12px 0;">
          <div style="text-align:center;">
            <div style="width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:900;margin:0 auto 6px;">${username[0]?.toUpperCase()}</div>
            <p style="margin:0;font-weight:800;font-size:13px;color:#a855f7;">You</p>
            <p style="margin:2px 0 0;font-size:10px;opacity:0.5;">${isWhite ? '♔ White' : '♚ Black'}</p>
          </div>
          <div style="font-size:20px;font-weight:900;opacity:0.4;">VS</div>
          <div style="text-align:center;">
            <div style="width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:900;margin:0 auto 6px;">${opponentName?.[0]?.toUpperCase() ?? '?'}</div>
            <p style="margin:0;font-weight:800;font-size:13px;">${opponentName ?? 'TBD'}</p>
            <p style="margin:2px 0 0;font-size:10px;opacity:0.5;">${isWhite ? '♚ Black' : '♔ White'}</p>
          </div>
        </div>
        <p style="margin:8px 0 0;font-size:12px;color:#60a5fa;">⏱️ ${fmtTime(t.time_control_secs)} per side</p>
      </div>
      ${t.scheduled_at ? `
      <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:12px;margin-bottom:16px;">
        <p style="margin:0;font-size:12px;color:#93c5fd;">📅 Tournament starts: <strong>${fmtDate(t.scheduled_at)}</strong></p>
      </div>` : ''}
      <a href="https://playza.games/tournaments" style="display:block;text-align:center;background:linear-gradient(135deg,#1e3a5f,#2563eb);color:#fff;text-decoration:none;padding:14px;border-radius:12px;font-weight:900;font-size:14px;">
        View Full Bracket →
      </a>
    </div>
    <div style="padding:16px 24px;text-align:center;opacity:0.4;font-size:11px;">Playza Games · Chess Tournament</div>
  </div>`
}

function matchReminderHtml(username: string, t: any, fixture: any, minutesLeft: number) {
  const opponentName = fixture?.player1?.username === username
    ? fixture?.player2?.username
    : fixture?.player1?.username
  const urgencyColor = minutesLeft <= 5 ? '#ef4444' : minutesLeft <= 30 ? '#f97316' : '#7c3aed'
  const urgencyEmoji = minutesLeft <= 5 ? '🚨' : minutesLeft <= 30 ? '⚡' : '⏰'
  return `
  <div style="font-family:sans-serif;max-width:480px;margin:auto;background:#0e0e1a;color:#fff;border-radius:16px;overflow:hidden;">
    <div style="background:linear-gradient(135deg,${urgencyColor},${urgencyColor}cc);padding:32px 24px;text-align:center;">
      <div style="font-size:48px;margin-bottom:8px;">${urgencyEmoji}</div>
      <h1 style="margin:0;font-size:22px;font-weight:900;">
        ${minutesLeft <= 5 ? 'Your Match Is Starting!' : `${minutesLeft} Minutes to Your Match!`}
      </h1>
      <p style="margin:8px 0 0;opacity:0.8;font-size:13px;">${fixture?.round_name ?? 'Match'} — ${t.title}</p>
    </div>
    <div style="padding:24px;">
      <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">
        Hey <strong>${username}</strong>,<br><br>
        Your chess match ${minutesLeft <= 5 ? 'is starting <strong>right now</strong>' : `starts in <strong>${minutesLeft} minutes</strong>`}!
        ${minutesLeft <= 5 ? 'Open the app immediately and make your first move.' : 'Get ready and open the app.'}
      </p>
      <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:14px;margin-bottom:16px;text-align:center;">
        <p style="margin:0 0 4px;font-size:11px;opacity:0.5;">Your opponent</p>
        <p style="margin:0;font-size:18px;font-weight:900;">${opponentName ?? 'TBD'}</p>
        <p style="margin:4px 0 0;font-size:11px;color:#a855f7;">⏱️ ${fmtTime(t.time_control_secs)} per side</p>
      </div>
      <a href="https://playza.games/tournaments" style="display:block;text-align:center;background:linear-gradient(135deg,${urgencyColor},${urgencyColor}cc);color:#fff;text-decoration:none;padding:14px;border-radius:12px;font-weight:900;font-size:14px;">
        ${minutesLeft <= 5 ? 'Play Now →' : 'Open Match →'}
      </a>
    </div>
    <div style="padding:16px 24px;text-align:center;opacity:0.4;font-size:11px;">Playza Games · Chess Tournament</div>
  </div>`
}

function tournamentStartingHtml(username: string, t: any) {
  return `
  <div style="font-family:sans-serif;max-width:480px;margin:auto;background:#0e0e1a;color:#fff;border-radius:16px;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#16a34a,#15803d);padding:32px 24px;text-align:center;">
      <div style="font-size:48px;margin-bottom:8px;">🚀</div>
      <h1 style="margin:0;font-size:22px;font-weight:900;">Tournament Is Live!</h1>
      <p style="margin:8px 0 0;opacity:0.8;font-size:13px;">${t.title} has started</p>
    </div>
    <div style="padding:24px;">
      <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">
        Hey <strong>${username}</strong>,<br><br>
        <strong>${t.title}</strong> is now <strong>LIVE</strong>! Your first match is ready. 
        Open the app, find your opponent, and start playing.
      </p>
      ${t.prize_pool > 0 ? `
      <div style="background:rgba(251,191,36,0.08);border:1px solid rgba(251,191,36,0.2);border-radius:12px;padding:14px;margin-bottom:16px;">
        <p style="margin:0;font-size:13px;font-weight:700;color:#fbbf24;">🏆 ${t.prize_pool.toLocaleString()} ZA prize pool — play your best chess!</p>
      </div>` : ''}
      <a href="https://playza.games/tournaments" style="display:block;text-align:center;background:linear-gradient(135deg,#16a34a,#15803d);color:#fff;text-decoration:none;padding:14px;border-radius:12px;font-weight:900;font-size:14px;">
        Play Now →
      </a>
    </div>
    <div style="padding:16px 24px;text-align:center;opacity:0.4;font-size:11px;">Playza Games · Chess Tournament</div>
  </div>`
}

// ── MAIN CHESS CRON — mirrors quiz lifecycle, runs every minute ───────────────
export async function runChessLifecycleJob() {
  try {
    const now = new Date()

    const { data: tournaments } = await supabaseAdmin
      .from('chess_tournaments')
      .select('*')
      .in('status', ['registration', 'lobby'])
      .or('registration_end.not.is.null,scheduled_at.not.is.null')

    if (!tournaments?.length) return

    for (const t of tournaments) {

      // ── 1. Close registration → send closure email, schedule draw ──────────
      // Normally triggered by registration_end passing. But registration_end
      // is optional on the admin create form — if an admin only sets a
      // scheduled_at (match start time) and leaves registration_end blank,
      // this tournament would otherwise sit in "registration" forever, long
      // after its scheduled time has come and gone, since nothing else ever
      // triggers the close/draw. Fall back to scheduled_at in that case.
      const closeTrigger = t.registration_end
        ? new Date(t.registration_end)
        : (!t.registration_end && t.scheduled_at ? new Date(t.scheduled_at) : null)

      if (
        t.status === 'registration' &&
        closeTrigger &&
        closeTrigger <= now &&
        !t.closure_email_sent
      ) {
        console.log(`[ChessCron] Closing registration for "${t.title}"${!t.registration_end ? ' (via scheduled_at fallback — no registration_end set)' : ''}`)

        // If we're using the scheduled_at fallback, the tournament is
        // already late to start — draw immediately rather than adding
        // another 30 minutes of delay on top.
        const drawDelayMs = t.registration_end ? 30 * 60 * 1000 : 0

        await supabaseAdmin
          .from('chess_tournaments')
          .update({
            status: 'lobby',
            closure_email_sent: true,
            draw_scheduled_at: new Date(now.getTime() + drawDelayMs).toISOString(),
          })
          .eq('id', t.id)

        const players = await getChessPlayers(t.id)
        for (const p of players) {
          if (!p.users?.email) continue
          await sendEmail(
            p.users.email,
            `♟ Registration closed — ${t.title}`,
            registrationClosedHtml(p.users.username, t)
          )
          await sendPushToUser(
            p.user_id,
            `♟ Registration closed — ${t.title}`,
            `Your spot is confirmed! The draw happens in 30 minutes — watch live on Playza.`,
            `/tournaments`
          )
        }
        console.log(`[ChessCron] Closure emails sent to ${players.length} players for "${t.title}"`)
      }

      // ── 2. Auto-draw: 30 min after registration closes ─────────────────────
      if (
        t.status === 'lobby' &&
        t.draw_scheduled_at &&
        new Date(t.draw_scheduled_at) <= now &&
        !t.draw_completed
      ) {
        console.log(`[ChessCron] Running auto-draw for "${t.title}"`)

        try {
          // Generate the bracket — same service used when admin manually launches
          const fixtures = t.format === 'group_knockout'
            ? await generateGroupStage(t.id)
            : await generateKnockoutRound1(t.id)

          await supabaseAdmin
            .from('chess_tournaments')
            .update({ draw_completed: true, status: 'active' })
            .eq('id', t.id)

          // Build a fixture map per player so each person's draw email is personalised
          const players = await getChessPlayers(t.id)
          const { data: fixturesWithPlayers } = await supabaseAdmin
            .from('chess_tournament_fixtures')
            .select('*, player1:player1_id(username), player2:player2_id(username)')
            .eq('tournament_id', t.id)
            .eq('round_number', 1)
            .neq('status', 'bye')

          for (const p of players) {
            const myFixture = (fixturesWithPlayers ?? []).find((f: any) =>
              f.player1_id === p.user_id || f.player2_id === p.user_id
            )
            if (!p.users?.email) continue
            await sendEmail(
              p.users.email,
              `🎲 The draw is done! Your first match is set — ${t.title}`,
              drawCompleteHtml(p.users.username, t, myFixture)
            )
            await sendPushToUser(
              p.user_id,
              `🎲 The draw is done!`,
              `Your first match is ready. ${myFixture ? `You face ${myFixture.player1?.username === p.users.username ? myFixture.player2?.username : myFixture.player1?.username}` : 'Check the bracket on Playza'}.`,
              `/tournaments`
            )
          }

          console.log(`[ChessCron] Draw completed for "${t.title}" — ${fixtures.length} fixtures created`)
        } catch (err) {
          console.error(`[ChessCron] Draw failed for "${t.title}":`, err)
        }
      }

      // ── 3. 30-min reminder before scheduled_at ─────────────────────────────
      if (
        t.status === 'lobby' &&
        t.scheduled_at &&
        !t.reminder_30min_sent
      ) {
        const msToStart = new Date(t.scheduled_at).getTime() - now.getTime()
        const minsToStart = msToStart / 60000

        if (minsToStart <= 30 && minsToStart > 0) {
          await supabaseAdmin
            .from('chess_tournaments')
            .update({ reminder_30min_sent: true })
            .eq('id', t.id)

          const players = await getChessPlayers(t.id)
          for (const p of players) {
            if (!p.users?.email) continue
            await sendEmail(
              p.users.email,
              `⚡ ${t.title} starts in 30 minutes!`,
              tournamentStartingHtml(p.users.username, t)
            )
            await sendPushToUser(
              p.user_id,
              `⚡ Chess tournament in 30 minutes!`,
              `${t.title} starts soon — open the app and get ready to play!`,
              `/tournaments`
            )
          }
        }
      }
    }

    // ── 4. Match-level reminders: 30min + 5min before each fixture ──────────
    // Query all pending/scheduled fixtures across all active chess tournaments
    const thirtyMinFrom = new Date(now.getTime() + 29 * 60 * 1000).toISOString()
    const thirtyMinTo   = new Date(now.getTime() + 31 * 60 * 1000).toISOString()
    const fiveMinFrom   = new Date(now.getTime() + 4 * 60 * 1000).toISOString()
    const fiveMinTo     = new Date(now.getTime() + 6 * 60 * 1000).toISOString()

    for (const [fromT, toT, mins, flagField] of [
      [thirtyMinFrom, thirtyMinTo, 30, 'reminder_30min_sent'],
      [fiveMinFrom,   fiveMinTo,   5,  'reminder_5min_sent'],
    ] as const) {
      const { data: upcomingFixtures } = await supabaseAdmin
        .from('chess_tournament_fixtures')
        .select('*, chess_tournaments(*), player1:player1_id(username, users!inner(email)), player2:player2_id(username, users!inner(email))')
        .in('status', ['pending', 'scheduled'])
        .not('scheduled_at', 'is', null)
        .gte('scheduled_at', fromT)
        .lte('scheduled_at', toT)
        // Only remind if not already sent this window
        .is(flagField, null)

      for (const fixture of (upcomingFixtures ?? [])) {
        const t = fixture.chess_tournaments
        if (!t) continue

        await supabaseAdmin
          .from('chess_tournament_fixtures')
          .update({ [flagField]: true })
          .eq('id', fixture.id)

        for (const [playerId, playerData] of [
          [fixture.player1_id, fixture.player1],
          [fixture.player2_id, fixture.player2],
        ] as const) {
          if (!playerId || !playerData) continue
          const email = (playerData as any).users?.email
          const username = (playerData as any).username
          if (!email) continue

          await sendEmail(
            email,
            mins === 5 ? `🚨 Your chess match is starting in 5 minutes!` : `⚡ Your match starts in 30 minutes — ${t.title}`,
            matchReminderHtml(username, t, fixture, mins)
          )
          await sendPushToUser(
            playerId,
            mins === 5 ? `🚨 Match starting now!` : `⚡ Match in 30 minutes`,
            `${fixture.round_name} — ${t.title}. Get ready to play!`,
            `/tournaments`
          )
        }
      }
    }

  } catch (err) {
    console.error('[ChessCron] Lifecycle job error:', err)
  }
}

// ── 24h / 2h reminder job (same pattern as quiz) ─────────────────────────────
export async function runChessReminderJob() {
  try {
    const now = new Date()

    const { data: tournaments } = await supabaseAdmin
      .from('chess_tournaments')
      .select('*')
      .in('status', ['registration', 'lobby'])
      .not('scheduled_at', 'is', null)

    if (!tournaments?.length) return

    for (const t of tournaments) {
      const scheduled  = new Date(t.scheduled_at)
      const diffMs     = scheduled.getTime() - now.getTime()
      const diffHours  = diffMs / (1000 * 60 * 60)
      const is24h      = diffHours >= 23.5 && diffHours <= 24.5
      const is2h       = diffHours >= 1.75 && diffHours <= 2.25
      if (!is24h && !is2h) continue

      const players = await getChessPlayers(t.id)
      if (!players.length) continue

      const scheduledStr = fmtDate(t.scheduled_at)
      const prizeText = t.prize_pool > 0 ? ` 🏆 ${t.prize_pool.toLocaleString()} ZA prize pool.` : ''
      const pushTitle = is24h ? `⏰ ${t.title} — chess tomorrow!` : `🚨 ${t.title} starts in 2 hours!`
      const pushBody  = is24h
        ? `Your chess tournament is tomorrow at ${scheduledStr}.${prizeText}`
        : `Final call! ${t.title} starts in 2 hours.${prizeText}`

      for (const p of players) {
        if (!p.users?.email) continue
        await sendPushToUser(p.user_id, pushTitle, pushBody, `/tournaments`)
        await sendEmail(p.users.email, pushTitle, `
          <div style="font-family:sans-serif;max-width:480px;margin:auto;background:#0e0e1a;color:#fff;border-radius:16px;overflow:hidden;">
            <div style="background:linear-gradient(135deg,#7c3aed,#a855f7);padding:32px 24px;text-align:center;">
              <div style="font-size:48px;margin-bottom:8px;">♟</div>
              <h1 style="margin:0;font-size:22px;font-weight:900;">${t.title}</h1>
              <p style="margin:8px 0 0;opacity:0.8;font-size:13px;">Chess Tournament Reminder</p>
            </div>
            <div style="padding:24px;">
              <p style="font-size:15px;line-height:1.6;">
                Hey <strong>${p.users.username}</strong>,<br><br>
                ${is24h ? `Your chess tournament kicks off <strong>tomorrow</strong>!` : `⚡ Your chess tournament starts in just <strong>2 hours</strong>!`}
              </p>
              <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px;margin:16px 0;">
                <p style="margin:4px 0;font-weight:700;">📅 ${scheduledStr}</p>
                <p style="margin:4px 0;font-weight:700;">⏱️ ${fmtTime(t.time_control_secs)} per side</p>
                ${t.prize_pool > 0 ? `<p style="margin:4px 0;font-weight:700;color:#fbbf24;">🏆 ${t.prize_pool.toLocaleString()} ZA prize pool</p>` : ''}
              </div>
              <a href="https://playza.games/tournaments" style="display:block;text-align:center;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;text-decoration:none;padding:14px;border-radius:12px;font-weight:900;font-size:14px;">View Tournament →</a>
            </div>
            <div style="padding:16px 24px;text-align:center;opacity:0.4;font-size:11px;">Playza Games · Chess Tournament</div>
          </div>`)
      }
    }
  } catch (err) {
    console.error('[ChessCron] Reminder job error:', err)
  }
}