import { supabaseAdmin } from '../config/supabase'
import { Resend } from 'resend'
import { generateKnockoutRound1, generateGroupStage, startScheduledFixtures } from '../modules/chess-tournament/chess-tournament.service'

const resend = new Resend(process.env.RESEND_API_KEY)

// ── Helpers ───────────────────────────────────────────────────────────────────
async function sendEmail(to: string, subject: string, html: string, text?: string) {
  try {
    await resend.emails.send({
      from: 'Playza Tournaments <tournaments@playza.games>',
      to, subject, html,
      // A plain-text part alongside the HTML makes this read as a genuine
      // transactional message to spam/promotions classifiers — HTML-only
      // sends are more associated with bulk/marketing mail.
      text: text ?? html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
    })
  } catch (err) {
    console.error('[ChessCron] Email failed:', err)
  }
}

// Shared shell for every chess tournament email — deliberately plain and
// transactional-looking (white background, a single thin colored accent
// bar, no gradients, no big emoji hero banners, small solid-color button)
// instead of the marketing-style design used previously. Gmail's Promotions
// classifier weighs visual style heavily; this reads much closer to a
// receipt or a GitHub/Stripe-style notification than a promotional email.
function transactionalShell(opts: { accentColor: string; preheader: string; body: string; ctaLabel?: string; ctaUrl?: string }) {
  const { accentColor, preheader, body, ctaLabel, ctaUrl } = opts
  return `
  <div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;max-width:520px;margin:auto;background:#ffffff;color:#1a1a1a;">
    <!-- Preheader: hidden preview text shown in the inbox list, before the subject reads as marketing copy -->
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>
    <div style="border-top:3px solid ${accentColor};padding:20px 24px 4px;">
      <p style="margin:0;font-size:13px;font-weight:700;color:#555;">Playza Tournaments</p>
    </div>
    <div style="padding:8px 24px 24px;">
      ${body}
      ${ctaLabel && ctaUrl ? `
      <p style="margin:20px 0 0;">
        <a href="${ctaUrl}" style="display:inline-block;background:${accentColor};color:#ffffff;text-decoration:none;padding:10px 20px;border-radius:6px;font-weight:600;font-size:14px;">${ctaLabel}</a>
      </p>` : ''}
    </div>
    <div style="padding:14px 24px;border-top:1px solid #eee;">
      <p style="margin:0;font-size:11px;color:#999;">
        Playza Games · This is a tournament notification for a match you're registered in.
        <a href="https://playza.games/profile" style="color:#999;">Manage notification preferences</a>
      </p>
    </div>
  </div>`
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
  // hour12 must be explicit — 'en-NG' can default to 24-hour under Node's
  // ICU data, which is what produced a bare "0:50" with no AM/PM in the
  // reminder emails. Using UTC (labelled explicitly) instead of silently
  // assuming every player is in Lagos time, since players can be anywhere —
  // showing an unlabelled local time led to people reading it as their own
  // local time and showing up at the wrong actual moment.
  return new Date(iso).toLocaleString('en-US', {
    weekday: 'long', day: 'numeric', month: 'long',
    year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true,
    timeZone: 'UTC',
  }) + ' UTC'
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

function registrationClosedHtml(username: string, t: any, drawTime: Date, drawDelayMinutes: number) {
  const body = `
    <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">Hi ${username},</p>
    <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">
      Registration for <strong>${t.title}</strong> is now closed. Your spot is confirmed.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:16px;">
      <tr><td style="padding:6px 0;color:#555;font-size:13px;width:140px;">Tournament</td><td style="padding:6px 0;font-size:13px;font-weight:600;">${t.title}</td></tr>
      <tr><td style="padding:6px 0;color:#555;font-size:13px;">Format</td><td style="padding:6px 0;font-size:13px;font-weight:600;">${t.format === 'group_knockout' ? 'Group Stage → Knockout' : 'Single Elimination'}</td></tr>
      <tr><td style="padding:6px 0;color:#555;font-size:13px;">Time control</td><td style="padding:6px 0;font-size:13px;font-weight:600;">${fmtTime(t.time_control_secs)}</td></tr>
      ${t.prize_pool > 0 ? `<tr><td style="padding:6px 0;color:#555;font-size:13px;">Prize pool</td><td style="padding:6px 0;font-size:13px;font-weight:600;">${t.prize_pool.toLocaleString()} ZA</td></tr>` : ''}
      ${t.entry_fee > 0 ? `<tr><td style="padding:6px 0;color:#555;font-size:13px;">Entry fee paid</td><td style="padding:6px 0;font-size:13px;font-weight:600;">${t.entry_fee} ZA</td></tr>` : ''}
    </table>
    <p style="font-size:14px;line-height:1.6;margin:0 0 4px;">
      The bracket draw happens automatically${drawDelayMinutes > 0 ? ` in ${drawDelayMinutes} minutes` : ' now'}, on <strong>${fmtDate(drawTime.toISOString())}</strong>.
    </p>`
  return transactionalShell({
    accentColor: '#7c3aed',
    preheader: `Registration for ${t.title} is closed — the draw happens ${drawDelayMinutes > 0 ? `in ${drawDelayMinutes} minutes` : 'now'}.`,
    body,
    ctaLabel: 'View tournament',
    ctaUrl: 'https://playza.games/tournaments',
  })
}

function drawCompleteHtml(username: string, t: any, fixture: any) {
  const opponentName = fixture?.player1?.username === username
    ? fixture?.player2?.username
    : fixture?.player1?.username
  const isWhite = fixture?.player1_id !== null && fixture?.player1?.username === username
  const body = `
    <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">Hi ${username},</p>
    <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">
      The bracket for <strong>${t.title}</strong> has been drawn. Here's your first match:
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1px solid #e5e5e5;border-radius:8px;">
      <tr>
        <td style="padding:12px 16px;font-size:12px;color:#555;">${fixture?.round_name ?? 'Round 1'}</td>
      </tr>
      <tr>
        <td style="padding:0 16px 14px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
            <tr>
              <td width="45%" style="font-size:14px;font-weight:700;">${username} <span style="font-weight:400;color:#888;">(${isWhite ? 'White' : 'Black'})</span></td>
              <td width="10%" style="text-align:center;font-size:12px;color:#999;">vs</td>
              <td width="45%" style="font-size:14px;font-weight:700;text-align:right;">${opponentName ?? 'TBD'} <span style="font-weight:400;color:#888;">(${isWhite ? 'Black' : 'White'})</span></td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    <p style="font-size:13px;color:#555;margin:14px 0 0;">Time control: ${fmtTime(t.time_control_secs)} per side</p>
    ${fixture?.scheduled_at ? `<p style="font-size:14px;margin:8px 0 0;">Your first match is on <strong>${fmtDate(fixture.scheduled_at)}</strong>.</p>` : ''}`
  return transactionalShell({
    accentColor: '#2563eb',
    preheader: `Your first match in ${t.title} is against ${opponentName ?? 'your opponent'}.`,
    body,
    ctaLabel: 'View full bracket',
    ctaUrl: 'https://playza.games/tournaments',
  })
}

function matchReminderHtml(username: string, t: any, fixture: any, minutesLeft: number) {
  const opponentName = fixture?.player1?.username === username
    ? fixture?.player2?.username
    : fixture?.player1?.username
  const accentColor = minutesLeft <= 5 ? '#dc2626' : '#7c3aed'
  const body = `
    <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">Hi ${username},</p>
    <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">
      Your chess match ${minutesLeft <= 5 ? '<strong>is starting now</strong>' : `starts in <strong>${minutesLeft} minutes</strong>`} —
      ${fixture?.round_name ?? 'match'} in <strong>${t.title}</strong>.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:16px;">
      <tr><td style="padding:6px 0;color:#555;font-size:13px;width:140px;">Opponent</td><td style="padding:6px 0;font-size:13px;font-weight:600;">${opponentName ?? 'TBD'}</td></tr>
      <tr><td style="padding:6px 0;color:#555;font-size:13px;">Time control</td><td style="padding:6px 0;font-size:13px;font-weight:600;">${fmtTime(t.time_control_secs)} per side</td></tr>
    </table>
    <p style="font-size:14px;line-height:1.6;margin:0;">
      ${minutesLeft <= 5 ? 'Open the app now to make your first move.' : 'Open the app when you\'re ready to play.'}
    </p>`
  return transactionalShell({
    accentColor,
    preheader: minutesLeft <= 5 ? 'Your chess match is starting now.' : `Your chess match starts in ${minutesLeft} minutes.`,
    body,
    ctaLabel: minutesLeft <= 5 ? 'Play now' : 'Open match',
    ctaUrl: 'https://playza.games/tournaments',
  })
}

function tournamentStartingHtml(username: string, t: any) {
  const body = `
    <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">Hi ${username},</p>
    <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">
      <strong>${t.title}</strong> starts in 30 minutes. Your first match will be ready shortly after — open the app when you get a chance.
    </p>
    ${t.prize_pool > 0 ? `<p style="font-size:14px;color:#555;margin:0;">Prize pool: <strong style="color:#1a1a1a;">${t.prize_pool.toLocaleString()} ZA</strong></p>` : ''}`
  return transactionalShell({
    accentColor: '#16a34a',
    preheader: `${t.title} starts in 30 minutes.`,
    body,
    ctaLabel: 'Open tournament',
    ctaUrl: 'https://playza.games/tournaments',
  })
}

// ── MAIN CHESS CRON — mirrors quiz lifecycle, runs every minute ───────────────
export async function runChessLifecycleJob() {
  try {
    // This starts any scheduled fixture (next round, or a draw-rematch) whose
    // kickoff time has arrived — needs to run every tick regardless of the
    // registration/lobby query below, since it applies to already-active
    // tournaments too.
    await startScheduledFixtures()

    const now = new Date()

    const { data: tournaments } = await supabaseAdmin
      .from('chess_tournaments')
      .select('*')
      .in('status', ['registration', 'lobby'])
      .or('registration_end.not.is.null,scheduled_at.not.is.null')

    if (!tournaments?.length) return

    for (const t of tournaments) {

      try {

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
        const drawDelayMinutes = Math.round(drawDelayMs / 60000)
        const drawTime = new Date(now.getTime() + drawDelayMs)

        await supabaseAdmin
          .from('chess_tournaments')
          .update({
            status: 'lobby',
            closure_email_sent: true,
            draw_scheduled_at: drawTime.toISOString(),
          })
          .eq('id', t.id)

        const players = await getChessPlayers(t.id)
        for (const p of players) {
          if (!p.users?.email) continue
          await sendEmail(
            p.users.email,
            `Registration closed for ${t.title}`,
            registrationClosedHtml(p.users.username, t, drawTime, drawDelayMinutes)
          )
          await sendPushToUser(
            p.user_id,
            `♟ Registration closed — ${t.title}`,
            drawDelayMinutes > 0
              ? `Your spot is confirmed! The draw happens in ${drawDelayMinutes} minutes — watch live on Playza.`
              : `Your spot is confirmed! The draw is happening right now — watch live on Playza.`,
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
              `Your first match is set — ${t.title}`,
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
              `${t.title} starts in 30 minutes`,
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

      } catch (err) {
        // Isolated per-tournament: one broken tournament (bad data, a
        // transient DB error, etc.) is logged and skipped, instead of
        // silently aborting the whole tick and leaving every other
        // tournament in this batch — including perfectly healthy ones —
        // stuck without their draw/reminders running.
        console.error(`[ChessCron] Failed processing tournament "${t.title}" (${t.id}):`, err)
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
            mins === 5 ? `Your chess match is starting now` : `Your match starts in 30 minutes — ${t.title}`,
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