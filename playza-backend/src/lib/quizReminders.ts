import { supabaseAdmin } from '../config/supabase'
import { Resend } from 'resend'
import { adminStartTournament } from '../modules/quiz/quiz.gateway'
import type { Server as SocketServer } from 'socket.io'

const resend = new Resend(process.env.RESEND_API_KEY)
let _io: SocketServer | null = null
export function setQuizReminderIo(io: SocketServer) { _io = io }

// ── Email helper ──────────────────────────────────────────────────────────────
async function sendEmail(to: string, subject: string, html: string) {
  try {
    await resend.emails.send({ from: 'Playza <noreply@playza.games>', to, subject, html })
  } catch (err) {
    console.error('[QuizReminder] Email failed:', err)
  }
}

// ── Push notification helper ──────────────────────────────────────────────────
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
    console.error('[QuizReminder] Push error:', err)
  }
}

// ── Format date for emails ────────────────────────────────────────────────────
function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('en-NG', {
    weekday: 'long', day: 'numeric', month: 'long',
    year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

// ── Get all registered players for a tournament ───────────────────────────────
async function getPlayers(tournamentId: string) {
  const { data } = await supabaseAdmin
    .from('quiz_players')
    .select('user_id, users!inner(email, username)')
    .eq('tournament_id', tournamentId)
  return (data ?? []) as Array<{ user_id: string; users: { email: string; username: string } }>
}

// ── Email templates ───────────────────────────────────────────────────────────
function registrationClosedHtml(username: string, t: any) {
  const startDate = t.scheduled_at ? fmtDate(t.scheduled_at) : 'TBA'
  return `
    <div style="font-family:sans-serif;max-width:480px;margin:auto;background:#0e0e1a;color:#fff;border-radius:16px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#7c3aed,#a855f7);padding:32px 24px;text-align:center;">
        <div style="font-size:48px;margin-bottom:8px;">🔒</div>
        <h1 style="margin:0;font-size:22px;font-weight:900;">Registration Closed</h1>
        <p style="margin:8px 0 0;opacity:0.8;font-size:13px;">Your spot is secured!</p>
      </div>
      <div style="padding:24px;">
        <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">
          Hey <strong>${username}</strong>,<br><br>
          Registration for <strong>${t.title}</strong> is now closed. 
          Your spot is confirmed — get ready to compete!
        </p>
        <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px;margin-bottom:16px;">
          <p style="margin:0 0 8px;font-size:12px;opacity:0.5;text-transform:uppercase;letter-spacing:0.1em;">Tournament Details</p>
          <p style="margin:6px 0;font-weight:700;">🏆 ${t.title}</p>
          <p style="margin:6px 0;font-weight:700;">📅 Starts: ${startDate}</p>
          ${t.prize_pool > 0 ? `<p style="margin:6px 0;font-weight:700;">💰 Prize Pool: ${t.prize_pool.toLocaleString()} ZA</p>` : ''}
          ${t.entry_fee > 0 ? `<p style="margin:6px 0;font-weight:700;">⚡ Entry Fee Paid: ${t.entry_fee} ZA</p>` : '<p style="margin:6px 0;font-weight:700;color:#4ade80;">🎁 Free Entry</p>'}
          <p style="margin:6px 0;font-weight:700;">🔥 5 Rounds of Elimination</p>
        </div>
        <div style="background:rgba(124,58,237,0.1);border:1px solid rgba(124,58,237,0.25);border-radius:12px;padding:14px;margin-bottom:16px;">
          <p style="margin:0;font-size:13px;font-weight:700;color:#c084fc;">
            ⏰ You'll receive a reminder 30 minutes before the game starts.
          </p>
        </div>
        <a href="https://playza.games/quiz/${t.id}" style="display:block;text-align:center;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;text-decoration:none;padding:14px;border-radius:12px;font-weight:900;font-size:14px;">
          View Tournament Lobby →
        </a>
      </div>
      <div style="padding:16px 24px;text-align:center;opacity:0.4;font-size:11px;">Playza Games · You registered for this tournament</div>
    </div>`
}

function thirtyMinReminderHtml(username: string, t: any) {
  const startDate = t.scheduled_at ? fmtDate(t.scheduled_at) : 'TBA'
  return `
    <div style="font-family:sans-serif;max-width:480px;margin:auto;background:#0e0e1a;color:#fff;border-radius:16px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#ef4444,#dc2626);padding:32px 24px;text-align:center;">
        <div style="font-size:48px;margin-bottom:8px;">⚡</div>
        <h1 style="margin:0;font-size:22px;font-weight:900;">30 Minutes to Go!</h1>
        <p style="margin:8px 0 0;opacity:0.8;font-size:13px;">${t.title} is starting soon</p>
      </div>
      <div style="padding:24px;">
        <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">
          Hey <strong>${username}</strong>,<br><br>
          <strong>${t.title}</strong> starts in just <strong>30 minutes</strong>! Open the app and get ready.
        </p>
        <div style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.25);border-radius:12px;padding:16px;margin-bottom:16px;">
          <p style="margin:0 0 8px;font-size:12px;opacity:0.5;text-transform:uppercase;letter-spacing:0.1em;">Starting</p>
          <p style="margin:0;font-size:18px;font-weight:900;color:#ef4444;">📅 ${startDate}</p>
        </div>
        ${t.prize_pool > 0 ? `
        <div style="background:rgba(251,191,36,0.08);border:1px solid rgba(251,191,36,0.2);border-radius:12px;padding:14px;margin-bottom:16px;">
          <p style="margin:0;font-size:13px;font-weight:700;color:#fbbf24;">🏆 Prize Pool: ${t.prize_pool.toLocaleString()} ZA — Last one standing wins!</p>
        </div>` : ''}
        <p style="font-size:13px;opacity:0.6;margin-bottom:16px;">
          Wrong answer = eliminated. Answer fast to survive all 5 rounds.
        </p>
        <a href="https://playza.games/quiz/${t.id}" style="display:block;text-align:center;background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff;text-decoration:none;padding:14px;border-radius:12px;font-weight:900;font-size:14px;">
          Open Lobby Now →
        </a>
      </div>
      <div style="padding:16px 24px;text-align:center;opacity:0.4;font-size:11px;">Playza Games · You registered for this tournament</div>
    </div>`
}

function gameStartingHtml(username: string, t: any) {
  return `
    <div style="font-family:sans-serif;max-width:480px;margin:auto;background:#0e0e1a;color:#fff;border-radius:16px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#16a34a,#15803d);padding:32px 24px;text-align:center;">
        <div style="font-size:48px;margin-bottom:8px;">🚀</div>
        <h1 style="margin:0;font-size:22px;font-weight:900;">Game Is Live!</h1>
        <p style="margin:8px 0 0;opacity:0.8;font-size:13px;">${t.title} has started</p>
      </div>
      <div style="padding:24px;">
        <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">
          Hey <strong>${username}</strong>,<br><br>
          <strong>${t.title}</strong> is now <strong>LIVE</strong>! Open the app immediately — the first question is waiting!
        </p>
        <a href="https://playza.games/quiz/${t.id}" style="display:block;text-align:center;background:linear-gradient(135deg,#16a34a,#15803d);color:#fff;text-decoration:none;padding:14px;border-radius:12px;font-weight:900;font-size:14px;">
          Play Now →
        </a>
      </div>
      <div style="padding:16px 24px;text-align:center;opacity:0.4;font-size:11px;">Playza Games · You registered for this tournament</div>
    </div>`
}

// ── MAIN CRON JOB — runs every minute ────────────────────────────────────────
export async function runQuizLifecycleJob() {
  try {
    const now = new Date()

    // Fetch all active tournaments that might need action
    const { data: tournaments } = await supabaseAdmin
      .from('quiz_tournaments')
      .select('*')
      .in('status', ['registration', 'lobby', 'draft'])
      .or('registration_end.not.is.null,scheduled_at.not.is.null')

    if (!tournaments?.length) return

    for (const t of tournaments) {
      // ── 1. Close registration ─────────────────────────────────────────────
      if (
        t.status === 'registration' &&
        t.registration_end &&
        new Date(t.registration_end) <= now &&
        !t.closure_email_sent
      ) {
        console.log(`[QuizCron] Closing registration for "${t.title}"`)

        // Flip to lobby
        await supabaseAdmin
          .from('quiz_tournaments')
          .update({ status: 'lobby', closure_email_sent: true })
          .eq('id', t.id)

        // Send closure emails to all registered players
        const players = await getPlayers(t.id)
        for (const p of players) {
          if (!p.users?.email) continue
          await sendEmail(
            p.users.email,
            `🔒 Registration closed — ${t.title}`,
            registrationClosedHtml(p.users.username, t)
          )
          await sendPushToUser(
            p.user_id,
            `🔒 Registration closed — ${t.title}`,
            `Your spot is confirmed! Game starts ${t.scheduled_at ? fmtDate(t.scheduled_at) : 'soon'}.`,
            `/quiz/${t.id}`
          )
        }
        console.log(`[QuizCron] Closure emails sent to ${players.length} players for "${t.title}"`)
      }

      // ── 2. Send 30-min reminder ───────────────────────────────────────────
      if (
        t.status === 'lobby' &&
        t.scheduled_at &&
        !t.reminder_30min_sent
      ) {
        const msToStart = new Date(t.scheduled_at).getTime() - now.getTime()
        const minsToStart = msToStart / 60000

        if (minsToStart <= 30 && minsToStart > 0) {
          console.log(`[QuizCron] Sending 30-min reminders for "${t.title}"`)

          await supabaseAdmin
            .from('quiz_tournaments')
            .update({ reminder_30min_sent: true })
            .eq('id', t.id)

          const players = await getPlayers(t.id)
          for (const p of players) {
            if (!p.users?.email) continue
            await sendEmail(
              p.users.email,
              `⚡ ${t.title} starts in 30 minutes!`,
              thirtyMinReminderHtml(p.users.username, t)
            )
            await sendPushToUser(
              p.user_id,
              `⚡ 30 minutes to go!`,
              `${t.title} starts in 30 minutes. Open the app now!`,
              `/quiz/${t.id}`
            )
          }
          console.log(`[QuizCron] 30-min reminders sent to ${players.length} players for "${t.title}"`)
        }
      }

      // ── 3. Auto-launch at scheduled_at ────────────────────────────────────
      if (
        t.status === 'lobby' &&
        t.scheduled_at &&
        new Date(t.scheduled_at) <= now
      ) {
        console.log(`[QuizCron] Auto-launching "${t.title}"`)

        if (!_io) {
          console.error('[QuizCron] Socket not ready — cannot auto-launch')
          continue
        }

        try {
          // Activate alive players
          await supabaseAdmin
            .from('quiz_players')
            .update({ status: 'alive' })
            .eq('tournament_id', t.id)
            .eq('status', 'registered')

          await supabaseAdmin
            .from('quiz_tournaments')
            .update({ status: 'lobby' })
            .eq('id', t.id)

          // Launch via gateway (broadcasts quiz:game_start to all connected players)
          await adminStartTournament(t.id, _io)

          // Send "game is live" email
          const players = await getPlayers(t.id)
          for (const p of players) {
            if (!p.users?.email) continue
            await sendEmail(
              p.users.email,
              `🚀 ${t.title} is LIVE now!`,
              gameStartingHtml(p.users.username, t)
            )
          }
          console.log(`[QuizCron] "${t.title}" auto-launched successfully`)
        } catch (err) {
          console.error(`[QuizCron] Auto-launch failed for "${t.title}":`, err)
        }
      }
    }
  } catch (err) {
    console.error('[QuizCron] Lifecycle job error:', err)
  }
}

// ── Legacy 24h/2h reminder job — keep for manual tournaments ─────────────────
export async function runQuizReminderJob() {
  try {
    const now = new Date()

    const { data: tournaments } = await supabaseAdmin
      .from('quiz_tournaments')
      .select('id, title, scheduled_at, prize_pool, entry_fee')
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

      const players = await getPlayers(t.id)
      if (!players.length) continue

      const scheduledStr = fmtDate(t.scheduled_at)
      const prizeText    = t.prize_pool > 0 ? ` Prize pool: ${t.prize_pool.toLocaleString()} ZA.` : ''

      for (const p of players) {
        if (!p.users?.email) continue
        const pushTitle = is24h ? `⏰ ${t.title} starts tomorrow!` : `🚨 ${t.title} starts in 2 hours!`
        const pushBody  = is24h
          ? `Don't forget — your quiz tournament is tomorrow at ${scheduledStr}.${prizeText}`
          : `Final call! ${t.title} starts in 2 hours (${scheduledStr}).${prizeText}`

        await sendPushToUser(p.user_id, pushTitle, pushBody, `/quiz/${t.id}`)

        const html = `
          <div style="font-family:sans-serif;max-width:480px;margin:auto;background:#0e0e1a;color:#fff;border-radius:16px;overflow:hidden;">
            <div style="background:linear-gradient(135deg,#7c3aed,#a855f7);padding:32px 24px;text-align:center;">
              <div style="font-size:48px;margin-bottom:8px;">👑</div>
              <h1 style="margin:0;font-size:22px;font-weight:900;">${t.title}</h1>
              <p style="margin:8px 0 0;opacity:0.8;font-size:13px;">Quiz Championship Reminder</p>
            </div>
            <div style="padding:24px;">
              <p style="font-size:15px;line-height:1.6;">
                Hey <strong>${p.users.username}</strong>,<br><br>
                ${is24h ? `Your quiz tournament kicks off <strong>tomorrow</strong>!` : `⚡ Your quiz tournament starts in just <strong>2 hours</strong>!`}
              </p>
              <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px;margin:16px 0;">
                <p style="margin:4px 0;font-weight:700;">📅 ${scheduledStr}</p>
                ${t.prize_pool > 0 ? `<p style="margin:4px 0;font-weight:700;">🏆 ${t.prize_pool.toLocaleString()} ZA</p>` : ''}
              </div>
              <a href="https://playza.games/quiz/${t.id}" style="display:block;text-align:center;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;text-decoration:none;padding:14px;border-radius:12px;font-weight:900;font-size:14px;">View Tournament →</a>
            </div>
          </div>`

        await sendEmail(p.users.email, pushTitle, html)
      }
    }
  } catch (err) {
    console.error('[QuizReminder] Legacy reminder error:', err)
  }
}
