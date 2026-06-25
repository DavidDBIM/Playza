const BOT_AGENTS = [
  'googlebot','bingbot','yandex','duckduckbot','facebookexternalhit',
  'twitterbot','linkedinbot','whatsapp','telegrambot','slackbot',
  'pinterest','applebot','baiduspider','slurp','rogerbot','w3c_validator',
]

const BASE_HEAD = (title, desc, url) =>
  `<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<meta name="description" content="${desc}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:url" content="https://playza.games${url}">
<meta property="og:image" content="https://playza.games/logo.png">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${desc}">
<link rel="canonical" href="https://playza.games${url}">
<link rel="icon" type="image/png" href="/logo.png">
<style>body{font-family:sans-serif;max-width:900px;margin:0 auto;padding:20px;background:#0a0712;color:#fff}h1{color:#a855f7}h2{color:#c084fc}a{color:#a855f7}nav a{margin-right:16px}.c{background:rgba(255,255,255,.05);border-radius:12px;padding:16px;margin:12px 0}</style>`

const NAV = `<nav><a href="/">Home</a> <a href="/games">Games</a> <a href="/tournaments">Tournaments</a> <a href="/leaderboard">Leaderboard</a> <a href="/h2h">H2H</a> <a href="/loyalty">Loyalty</a> <a href="/referral">Referral</a> <a href="/faq">FAQ</a></nav><hr style="border-color:rgba(255,255,255,.1);margin:16px 0">`

const PAGES = {
  '/': `<!DOCTYPE html><html lang="en"><head>${BASE_HEAD('Playza – Play Games, Win Real Money','The #1 competitive skill gaming platform. Play skill-based games, join tournaments, and win real money.','/')}</head><body>${NAV}<h1>Playza – Play Games, Win Real Money</h1><p>The #1 competitive skill gaming platform. Compete in skill-based games and win real ZA rewards.</p><div class="c"><h2>Game Modes</h2><p><strong>Head-to-Head (H2H)</strong> — 1v1 battles. Winner takes the pot.</p><p><strong>Tournaments</strong> — Multi-player competitions with prize pools.</p><p><strong>SoloEarn</strong> — Beat a target score and earn ZA.</p><p><strong>Leaderboard</strong> — Compete for top rank and win weekly prizes.</p></div><div class="c"><h2>Games Available</h2><p>Chess, Speed Battle, Word Scramble, Pool, Ludo, Soccer, Emoji Pop — all skill-based.</p></div><p><a href="/registration">Create your free account</a> and start competing today.</p></body></html>`,
  '/games': `<!DOCTYPE html><html lang="en"><head>${BASE_HEAD('Games – Play & Win on Playza','Browse all skill-based games on Playza. Chess, Speed Battle, Word Scramble, Pool, Ludo and more.','/games')}</head><body>${NAV}<h1>Games on Playza</h1><p>All games are 100% skill-based. Your score determines the winner — not luck.</p><div class="c"><h2>Chess</h2><p>Classic chess with real stakes. H2H battles or tournaments.</p></div><div class="c"><h2>Speed Battle</h2><p>Race to answer questions faster than your opponent.</p></div><div class="c"><h2>Word Scramble</h2><p>Unscramble words faster than your opponent to claim the ZA prize.</p></div><div class="c"><h2>Pool</h2><p>Pot the most balls to win your H2H match.</p></div><div class="c"><h2>Ludo</h2><p>Strategic ludo with real ZA prizes.</p></div><p><a href="/registration">Sign up free</a> to start playing.</p></body></html>`,
  '/tournaments': `<!DOCTYPE html><html lang="en"><head>${BASE_HEAD('Tournaments – Compete for Big Prizes on Playza','Join live and upcoming tournaments. Quiz and chess tournaments with big prize pools. Top players share the pot.','/tournaments')}</head><body>${NAV}<h1>Tournaments on Playza</h1><p>Multi-player skill competitions. Players pay an entry fee and top finishers share the prize pool.</p><div class="c"><h2>How Tournaments Work</h2><ol><li>Register before the tournament starts</li><li>All entry fees go into the prize pool</li><li>Compete — best players rise to the top</li><li>Top finishers share the prize pool instantly</li></ol></div><div class="c"><h2>Types</h2><p><strong>Quiz Tournaments</strong> — 5 elimination rounds. Wrong answer = eliminated.</p><p><strong>Chess Tournaments</strong> — Bracket-based with ZA prize pools.</p></div><p><a href="/registration">Create account</a> to register.</p></body></html>`,
  '/leaderboard': `<!DOCTYPE html><html lang="en"><head>${BASE_HEAD('Leaderboard – Top Players on Playza','See the top-ranked Playza players. Compete to climb the leaderboard and win weekly ZA prizes.','/leaderboard')}</head><body>${NAV}<h1>Playza Leaderboard</h1><p>Ranks all active players by performance across games, tournaments, and challenges.</p><div class="c"><h2>Leaderboard Types</h2><p><strong>Loyalty</strong> — Ranked by PZA points earned.</p><p><strong>Game</strong> — Ranked by wins in chess, speed battle, word scramble.</p><p><strong>Referral</strong> — Ranked by active players referred.</p></div><p><a href="/registration">Join Playza</a> and start climbing.</p></body></html>`,
  '/h2h': `<!DOCTYPE html><html lang="en"><head>${BASE_HEAD('H2H Zone – 1v1 Challenges on Playza','Challenge any player 1v1. Both pay an entry fee and the winner takes all ZA.','/h2h')}</head><body>${NAV}<h1>H2H Zone – Head-to-Head Battles</h1><p>1v1 challenge mode. Pick a game, set a stake — winner takes all.</p><div class="c"><h2>How H2H Works</h2><ol><li>Choose your game</li><li>Set your entry fee in ZA</li><li>Get matched with an opponent</li><li>Play — best score wins</li><li>Winner receives both entry fees instantly</li></ol></div><p><a href="/registration">Sign up</a> and challenge your first opponent.</p></body></html>`,
  '/loyalty': `<!DOCTYPE html><html lang="en"><head>${BASE_HEAD('Loyalty Program – Earn PZA Points on Playza','Earn PZA loyalty points every time you play. Reach higher tiers and unlock bigger rewards.','/loyalty')}</head><body>${NAV}<h1>Playza Loyalty Program</h1><p>Every game earns PZA points. Accumulate points to reach higher tiers.</p><div class="c"><h2>Tiers</h2><p><strong>Bronze</strong> — Starting tier. <strong>Silver</strong> — 5,000+ PZA. <strong>Gold</strong> — 25,000+ PZA. <strong>Platinum</strong> — 100,000+ PZA.</p></div><p><a href="/registration">Join Playza</a> and start earning.</p></body></html>`,
  '/referral': `<!DOCTYPE html><html lang="en"><head>${BASE_HEAD('Referral Program – Earn ZA by Inviting Friends','Invite friends and earn ZA 500 per verified referral.','/referral')}</head><body>${NAV}<h1>Playza Referral Program</h1><p>Invite friends and earn real ZA rewards for every player you bring in.</p><div class="c"><h2>How It Works</h2><ol><li>Get your referral code from your profile</li><li>Share it with friends</li><li>Earn ZA 500 per verified referral</li></ol></div><p><a href="/registration">Create your account</a> and start earning.</p></body></html>`,
  '/solo-earn': `<!DOCTYPE html><html lang="en"><head>${BASE_HEAD('SoloEarn – Play Solo and Win ZA on Playza','Compete alone against a target score. Beat the challenge and earn ZA — no opponents needed.','/solo-earn')}</head><body>${NAV}<h1>SoloEarn – Solo Challenges</h1><p>Compete against a target score — no opponents needed.</p><div class="c"><h2>How It Works</h2><ol><li>Pick a game</li><li>Pay a small entry fee in ZA</li><li>Beat the target score to win ZA rewards</li></ol></div><p><a href="/registration">Sign up</a> and play your first challenge.</p></body></html>`,
  '/faq': `<!DOCTYPE html><html lang="en"><head>${BASE_HEAD('FAQ – Frequently Asked Questions about Playza','Answers to common questions about Playza — how it works, ZA currency, withdrawals, game rules.','/faq')}</head><body>${NAV}<h1>Frequently Asked Questions</h1><div class="c"><h2>What is Playza?</h2><p>A skill-based gaming platform where you compete in games and earn real ZA rewards.</p></div><div class="c"><h2>Is Playza free to join?</h2><p>Yes, completely free. You only spend ZA when entering a paid game.</p></div><div class="c"><h2>Is Playza available worldwide?</h2><p>Yes, Playza is available globally.</p></div><div class="c"><h2>What devices can I use?</h2><p>Any smartphone, tablet, or desktop browser — no app download required.</p></div><div class="c"><h2>What is ZA?</h2><p>Playza's in-platform reward currency for entering competitions and withdrawing as real value.</p></div><div class="c"><h2>What is Head-to-Head?</h2><p>A 1v1 competition where both players pay an entry fee and the winner takes all.</p></div><div class="c"><h2>Are games skill-based?</h2><p>Yes — your performance, not chance, determines every outcome.</p></div><div class="c"><h2>How do I withdraw?</h2><p>Go to Wallet, click Withdraw, enter bank details, and your ZA is sent to your account.</p></div></body></html>`,
  '/support': `<!DOCTYPE html><html lang="en"><head>${BASE_HEAD('Support – Get Help on Playza','Contact Playza support for help with your account, games, or payments.','/support')}</head><body>${NAV}<h1>Playza Support</h1><div class="c"><h2>Common Issues</h2><p><strong>Account</strong> — Login, verification, password reset</p><p><strong>Payments</strong> — Deposits not reflecting, withdrawal delays</p><p><strong>Games</strong> — Technical problems, score disputes</p></div><div class="c"><h2>Contact Us</h2><p>Email: support@playza.games — Response within 24 hours.</p></div></body></html>`,
  '/registration': `<!DOCTYPE html><html lang="en"><head>${BASE_HEAD('Sign Up – Create Your Free Playza Account','Create a free Playza account in under 2 minutes. Start competing in skill-based games immediately.','/registration')}</head><body>${NAV}<h1>Create Your Playza Account</h1><p>Join thousands of players competing on Playza. Free, takes less than 2 minutes.</p><div class="c"><h2>What You Get</h2><p>Free account. Welcome PZA bonus. Access to H2H, Tournaments, SoloEarn, Leaderboard. Referral code to earn from inviting friends.</p></div><p>Already have an account? <a href="/registration?view=login">Log in here</a>.</p></body></html>`,
  '/terms': `<!DOCTYPE html><html lang="en"><head>${BASE_HEAD('Terms and Conditions – Playza','Read the Playza terms and conditions. Platform rules, policies, and user guidelines.','/terms')}</head><body>${NAV}<h1>Terms and Conditions</h1><div class="c"><h2>Eligibility</h2><p>You must be 18 years or older to use Playza.</p></div><div class="c"><h2>Fair Play</h2><p>Cheating or using automated tools results in permanent account suspension.</p></div><div class="c"><h2>Payments</h2><p>ZA deposits are processed securely. Withdrawals require identity verification.</p></div></body></html>`,
  '/privacy': `<!DOCTYPE html><html lang="en"><head>${BASE_HEAD('Privacy Policy – Playza','Read the Playza privacy policy. How we collect, use, and protect your personal data.','/privacy')}</head><body>${NAV}<h1>Privacy Policy</h1><div class="c"><h2>Data We Collect</h2><p>Name, email, phone, and gameplay data to operate the platform.</p></div><div class="c"><h2>How We Use It</h2><p>To operate your account, process transactions, and prevent fraud. We never sell your data.</p></div><div class="c"><h2>Your Rights</h2><p>Request access, correction, or deletion at support@playza.games anytime.</p></div></body></html>`,
}

function isBot(ua) {
  const lower = (ua || '').toLowerCase()
  return BOT_AGENTS.some(b => lower.includes(b))
}

export default function middleware(request) {
  const ua = request.headers.get('user-agent') || ''
  if (!isBot(ua)) return

  const url = new URL(request.url)
  const path = url.pathname.replace(/\/$/, '') || '/'
  const html = PAGES[path]

  if (!html) return

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      'X-Prerendered': 'static',
    },
  })
}

export const config = {
  matcher: ['/', '/games', '/tournaments', '/leaderboard', '/h2h', '/loyalty', '/referral', '/solo-earn', '/faq', '/support', '/registration', '/terms', '/privacy'],
}