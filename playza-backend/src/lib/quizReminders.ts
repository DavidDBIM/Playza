import { supabaseAdmin } from '../config/supabase'

// ── Send email via Supabase (uses your existing SMTP setup) ──────────────────
async function sendReminderEmail(to: string, subject: string, html: string) {
  // Supabase doesn't expose a direct send-email API, so we use the admin
  // invite flow as a transport, OR you can add resend/nodemailer here.
  // For now we log and use push notifications as fallback.
  console.log(`[QuizReminder] Email to ${to}: ${subject}`)
  // TODO: plug in your SMTP here e.g. resend, nodemailer
  // e.g. await resend.emails.send({ from: 'noreply@playza.games', to, subject, html })
}

// ── Send push notification via web-push ──────────────────────────────────────
async function sendPushToUser(userId: string, title: string, body: string, url?: string) {
  try {
    const { data: tokens } = await supabaseAdmin
      .from('push_tokens')
      .select('token, device_type')
      .eq('user_id', userId)

    if (!tokens || tokens.length === 0) return

    const webpush = (await import('web-push')).default
    webpush.setVapidDetails(
      process.env.VAPID_EMAIL || 'mailto:playzadevteam@gmail.com',
      process.env.VAPID_PUBLIC_KEY || '',
      process.env.VAPID_PRIVATE_KEY || ''
    )

    const payload = JSON.stringify({ title, body, url: url ?? '/tournaments' })

    for (const t of tokens) {
      try {
        await webpush.sendNotification(JSON.parse(t.token), payload)
      } catch (_) {}
    }
  } catch (err) {
    console.error('[QuizReminder] Push error:', err)
  }
}

// ── Main reminder job — run every 30 minutes ─────────────────────────────────
export async function runQuizReminderJob() {
  try {
    const now = new Date()

    // Fetch all registration-phase tournaments with a scheduled_at date
    const { data: tournaments } = await supabaseAdmin
      .from('quiz_tournaments')
      .select('id, title, scheduled_at, prize_pool, entry_fee')
      .in('status', ['registration', 'lobby'])
      .not('scheduled_at', 'is', null)

    if (!tournaments || tournaments.length === 0) return

    for (const t of tournaments) {
      const scheduled = new Date(t.scheduled_at)
      const diffMs    = scheduled.getTime() - now.getTime()
      const diffHours = diffMs / (1000 * 60 * 60)

      // 24-hour reminder  (send between 23.5h and 24.5h before)
      const is24h = diffHours >= 23.5 && diffHours <= 24.5
      // 2-hour reminder   (send between 1.75h and 2.25h before)
      const is2h  = diffHours >= 1.75 && diffHours <= 2.25

      if (!is24h && !is2h) continue

      // Fetch all registered players for this tournament
      const { data: players } = await supabaseAdmin
        .from('quiz_players')
        .select('user_id, users!inner(email, username)')
        .eq('tournament_id', t.id)
        .in('status', ['registered', 'alive'])

      if (!players || players.length === 0) continue

      const timeLabel   = is24h ? '24 hours' : '2 hours'
      const prizeText   = t.prize_pool > 0 ? ` Prize pool: ${t.prize_pool.toLocaleString()} ZA.` : ''
      const scheduledStr = scheduled.toLocaleString('en-NG', {
        weekday: 'long', day: 'numeric', month: 'long',
        year: 'numeric', hour: '2-digit', minute: '2-digit',
      })

      for (const p of players) {
        const user = (p as any).users
        if (!user) continue

        const pushTitle = is24h
          ? `⏰ ${t.title} starts tomorrow!`
          : `🚨 ${t.title} starts in 2 hours!`

        const pushBody = is24h
          ? `Don't forget — your quiz tournament is tomorrow at ${scheduledStr}.${prizeText} Be ready!`
          : `Final call! ${t.title} starts in 2 hours (${scheduledStr}).${prizeText} Open the app now!`

        // Push notification
        await sendPushToUser(p.user_id, pushTitle, pushBody, `/quiz/${t.id}`)

        // Email reminder
        const subject = pushTitle
        const html = `
          <div style="font-family:sans-serif;max-width:480px;margin:auto;background:#0e0e1a;color:#fff;border-radius:16px;overflow:hidden;">
            <div style="background:linear-gradient(135deg,#7c3aed,#a855f7);padding:32px 24px;text-align:center;">
              <div style="font-size:48px;margin-bottom:8px;">👑</div>
              <h1 style="margin:0;font-size:22px;font-weight:900;">${t.title}</h1>
              <p style="margin:8px 0 0;opacity:0.8;font-size:13px;">Quiz Championship Reminder</p>
            </div>
            <div style="padding:24px;">
              <p style="font-size:15px;line-height:1.6;">
                Hey <strong>${user.username}</strong>,<br><br>
                ${is24h
                  ? `Your quiz tournament kicks off <strong>tomorrow</strong>!`
                  : `⚡ Your quiz tournament starts in just <strong>2 hours</strong>!`}
              </p>
              <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px;margin:16px 0;">
                <p style="margin:0 0 8px;font-size:12px;opacity:0.5;text-transform:uppercase;letter-spacing:0.1em;">Tournament Details</p>
                <p style="margin:4px 0;font-weight:700;">📅 ${scheduledStr}</p>
                ${t.prize_pool > 0 ? `<p style="margin:4px 0;font-weight:700;">🏆 Prize Pool: ${t.prize_pool.toLocaleString()} ZA</p>` : ''}
                <p style="margin:4px 0;font-weight:700;">⚡ 5 rounds of elimination</p>
              </div>
              <p style="font-size:13px;opacity:0.6;">Open the Playza app and navigate to Tournaments when the game goes live. Wrong answer = eliminated. Last one standing wins!</p>
              <a href="https://playza.games/quiz/${t.id}" style="display:block;text-align:center;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;text-decoration:none;padding:14px;border-radius:12px;font-weight:900;font-size:14px;margin-top:16px;">
                View Tournament →
              </a>
            </div>
            <div style="padding:16px 24px;text-align:center;opacity:0.4;font-size:11px;">
              Playza Games · You registered for this tournament
            </div>
          </div>
        `

        await sendReminderEmail(user.email, subject, html)

        console.log(`[QuizReminder] ${timeLabel} reminder sent to ${user.username} for "${t.title}"`)
      }
    }
  } catch (err) {
    console.error('[QuizReminder] Job error:', err)
  }
}
