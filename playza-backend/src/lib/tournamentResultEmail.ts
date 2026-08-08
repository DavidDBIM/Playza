import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// ── Helpers ───────────────────────────────────────────────────────────────────
async function sendEmail(to: string, subject: string, html: string, text?: string) {
  try {
    await resend.emails.send({
      from: 'Playza Tournaments <tournaments@playza.games>',
      to, subject, html,
      // A plain-text part alongside the HTML makes this read as a genuine
      // transactional message to spam/promotions classifiers, same reasoning
      // as the reminder emails in chessReminders.ts.
      text: text ?? html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
    })
  } catch (err) {
    console.error('[TournamentResultEmail] send failed:', err)
  }
}

// Same plain, transactional-looking shell used for reminder emails — kept as
// its own small copy here (rather than importing from chessReminders.ts) so
// this module has no dependency on the chess-specific reminder cron and can
// be safely reused by quiz, and any future tournament type, without pulling
// in chess-only imports.
function transactionalShell(opts: { accentColor: string; bgTint: string; preheader: string; body: string; ctaLabel?: string; ctaUrl?: string }) {
  const { accentColor, bgTint, preheader, body, ctaLabel, ctaUrl } = opts
  return `
  <div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;max-width:520px;margin:auto;background:${bgTint};color:#1a1a1a;">
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
    <div style="padding:14px 24px;border-top:1px solid rgba(0,0,0,0.06);">
      <p style="margin:0;font-size:11px;color:#999;">
        Playza Games · This is a tournament notification for a tournament you took part in.
        <a href="https://playza.games/profile" style="color:#999;">Manage notification preferences</a>
      </p>
    </div>
  </div>`
}

function ordinal(n: number) {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return `${n}${s[(v - 20) % 10] ?? s[v] ?? s[0]}`
}

export interface TournamentResultEmailInput {
  to: string
  username: string
  gameLabel: 'Chess' | 'Quiz'
  tournamentTitle: string
  /** Final placement if known (1 = champion). Null if genuinely unranked. */
  rank: number | null
  /** ZA prize amount won — 0 means no prize money, only (maybe) consolation PZA. */
  prize: number
  /** PZA points credited for participating, regardless of outcome — Playza's
   * tournaments credit this to every registered player, win or lose. */
  consolationPza: number
  tournamentUrl: string
}

// One function, two outcomes — every participant in a finished tournament
// gets exactly one of these emails: a win email if they placed in the
// prizes, or a "here's what you got for playing" email otherwise. Both
// mention the PZA consolation reward when one was actually credited, since
// that applies to winners and non-winners alike.
export async function sendTournamentResultEmail(opts: TournamentResultEmailInput) {
  const { to, username, gameLabel, tournamentTitle, rank, prize, consolationPza, tournamentUrl } = opts
  if (!to) return

  const won = prize > 0
  const accentColor = won ? '#16a34a' : '#7c3aed'
  const bgTint = won ? '#f0fdf4' : '#faf5ff'
  const rankLabel = rank ? `${ordinal(rank)} place` : null

  const subject = won
    ? `🏆 You won ${prize} ZA in ${tournamentTitle}!`
    : `${tournamentTitle} has ended — here's your PZA reward`

  const headline = won
    ? `Congratulations, ${username}! 🏆`
    : `${tournamentTitle} is over, ${username}`

  const body = `
    <h2 style="margin:0 0 12px;font-size:20px;font-weight:800;color:#111;">${headline}</h2>
    ${won ? `
      <p style="margin:0 0 8px;font-size:15px;line-height:1.5;">
        You finished ${rankLabel ?? 'in the prizes'} in <strong>${tournamentTitle}</strong> (${gameLabel} Tournament) and won <strong>${prize} ZA</strong> — already credited to your wallet.
      </p>
    ` : `
      <p style="margin:0 0 8px;font-size:15px;line-height:1.5;">
        <strong>${tournamentTitle}</strong> (${gameLabel} Tournament) has wrapped up${rankLabel ? ` — you finished ${rankLabel}` : ''}. You didn't place in the prizes this time, but every player gets something for showing up.
      </p>
    `}
    ${consolationPza > 0 ? `
      <p style="margin:12px 0 0;font-size:15px;line-height:1.5;">
        <strong>${consolationPza} PZA points</strong> have been credited to your account as a consolation reward for taking part — check your balance in the app.
      </p>
    ` : ''}
    <p style="margin:16px 0 0;font-size:14px;line-height:1.5;color:#555;">
      Ready for the next one? New tournaments open regularly — jump back in and climb the leaderboard.
    </p>
  `

  const html = transactionalShell({
    accentColor,
    bgTint,
    preheader: won ? `You won ${prize} ZA in ${tournamentTitle}` : `${tournamentTitle} has ended — see your PZA reward`,
    body,
    ctaLabel: won ? 'View Your Winnings' : 'Browse Tournaments',
    ctaUrl: tournamentUrl,
  })

  await sendEmail(to, subject, html)
}