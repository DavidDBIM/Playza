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

// ── Group-stage tiebreak breakdown email ─────────────────────────────────
//
// Sent ONLY to players who were genuinely tied with at least one other
// player on points at the end of their group — never to a player who
// simply finished with fewer points than the group above them, since
// there's nothing to explain there. Shows the actual head-to-head numbers
// that decided the tie, so "you didn't advance" never looks like a fluke.
export interface TiebreakBreakdownRow {
  user_id: string
  username: string
  points: number
  head_to_head_points: number
  head_to_head_margin: number
  overall_margin: number
  sonneborn_berger: number
  registered_at: string
  final_group_rank: number
}

export type TiebreakDecidedBy = 'head_to_head' | 'head_to_head_margin' | 'overall_margin' | 'sonneborn_berger' | 'registration_order'

const DECIDED_BY_LABEL: Record<TiebreakDecidedBy, string> = {
  head_to_head: 'head-to-head results',
  head_to_head_margin: 'head-to-head game margin',
  overall_margin: 'overall game margin across the group',
  sonneborn_berger: 'Sonneborn-Berger score (strength of who you beat)',
  registration_order: 'registration time — every other measurable result was completely identical, right down to Sonneborn-Berger, so the tie genuinely could not be broken by results alone',
}

export interface TiebreakBreakdownEmailInput {
  to: string
  username: string
  tournamentTitle: string
  advanced: boolean
  decidedBy: TiebreakDecidedBy
  breakdown: TiebreakBreakdownRow[]
  tournamentUrl: string
}

export async function sendTiebreakBreakdownEmail(opts: TiebreakBreakdownEmailInput) {
  const { to, username, tournamentTitle, advanced, decidedBy, breakdown, tournamentUrl } = opts
  if (!to) return

  const accentColor = advanced ? '#16a34a' : '#f59e0b'
  const bgTint = advanced ? '#f0fdf4' : '#fffbeb'
  const sorted = [...breakdown].sort((a, b) => a.final_group_rank - b.final_group_rank)

  const subject = advanced
    ? `You were tied in ${tournamentTitle} — here's how you advanced`
    : `You were tied in ${tournamentTitle} — here's the tiebreak breakdown`

  const rowsHtml = sorted.map(row => `
    <tr style="${row.username === username ? 'background:rgba(0,0,0,0.03);' : ''}">
      <td style="padding:6px 8px;font-size:13px;font-weight:${row.username === username ? '800' : '500'};border-bottom:1px solid rgba(0,0,0,0.06);">${row.final_group_rank}. ${row.username}${row.username === username ? ' (you)' : ''}</td>
      <td style="padding:6px 8px;font-size:13px;text-align:center;border-bottom:1px solid rgba(0,0,0,0.06);">${row.points}</td>
      <td style="padding:6px 8px;font-size:13px;text-align:center;border-bottom:1px solid rgba(0,0,0,0.06);">${row.head_to_head_points}</td>
      <td style="padding:6px 8px;font-size:13px;text-align:center;border-bottom:1px solid rgba(0,0,0,0.06);">${row.head_to_head_margin > 0 ? '+' : ''}${row.head_to_head_margin}</td>
      <td style="padding:6px 8px;font-size:13px;text-align:center;border-bottom:1px solid rgba(0,0,0,0.06);">${row.overall_margin > 0 ? '+' : ''}${row.overall_margin}</td>
      <td style="padding:6px 8px;font-size:13px;text-align:center;border-bottom:1px solid rgba(0,0,0,0.06);">${row.sonneborn_berger}</td>
    </tr>
  `).join('')

  const body = `
    <h2 style="margin:0 0 12px;font-size:20px;font-weight:800;color:#111;">
      ${advanced ? `You made it through, ${username} 👍` : `Close one, ${username}`}
    </h2>
    <p style="margin:0 0 10px;font-size:15px;line-height:1.5;">
      You finished level on points with ${sorted.length - 1} other player${sorted.length - 1 === 1 ? '' : 's'} in your group in <strong>${tournamentTitle}</strong>. Here's every number that was checked:
    </p>
    <table style="width:100%;border-collapse:collapse;margin-top:8px;">
      <thead>
        <tr>
          <th style="padding:6px 8px;font-size:10px;text-transform:uppercase;letter-spacing:0.05em;color:#888;text-align:left;">Player</th>
          <th style="padding:6px 8px;font-size:10px;text-transform:uppercase;letter-spacing:0.05em;color:#888;">Pts</th>
          <th style="padding:6px 8px;font-size:10px;text-transform:uppercase;letter-spacing:0.05em;color:#888;">H2H Pts</th>
          <th style="padding:6px 8px;font-size:10px;text-transform:uppercase;letter-spacing:0.05em;color:#888;">H2H Margin</th>
          <th style="padding:6px 8px;font-size:10px;text-transform:uppercase;letter-spacing:0.05em;color:#888;">Overall Margin</th>
          <th style="padding:6px 8px;font-size:10px;text-transform:uppercase;letter-spacing:0.05em;color:#888;">SB Score</th>
        </tr>
      </thead>
      <tbody>${rowsHtml}</tbody>
    </table>
    <p style="margin:14px 0 0;font-size:13px;line-height:1.6;padding:10px 12px;background:${bgTint};border-radius:8px;border:1px solid ${accentColor}33;">
      <strong>Decided by:</strong> ${DECIDED_BY_LABEL[decidedBy]}.
    </p>
    <p style="margin:12px 0 0;font-size:12px;line-height:1.5;color:#777;">
      Checked in order: head-to-head results (games you played against just the tied players) → head-to-head margin → overall game margin (whole group) → Sonneborn-Berger score (sum of the group points of everyone you beat, half for a draw — the standard way to break a tie where head-to-head is symmetric, e.g. A beat B, B beat C, C beat A) → registration time, as an absolute last resort.
    </p>
  `

  const html = transactionalShell({
    accentColor,
    bgTint,
    preheader: `See the tiebreak breakdown for ${tournamentTitle}`,
    body,
    ctaLabel: 'View Full Standings',
    ctaUrl: tournamentUrl,
  })

  await sendEmail(to, subject, html)
}