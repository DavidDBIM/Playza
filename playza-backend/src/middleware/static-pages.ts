// This file generates static HTML strings for each public page.
// These are served to bots instead of the empty React shell.
// Update this when you add new pages or change page content.

export const BASE_HEAD = (title: string, description: string, url: string) => `
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="https://playza.games${url}">
  <meta property="og:image" content="https://playza.games/logo.png">
  <meta property="og:type" content="website">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <link rel="canonical" href="https://playza.games${url}">
  <link rel="icon" type="image/png" href="/logo.png">
  <style>
    body { font-family: sans-serif; max-width: 900px; margin: 0 auto; padding: 20px; background: #0a0712; color: #fff; }
    h1 { color: #a855f7; } h2 { color: #c084fc; }
    a { color: #a855f7; } nav a { margin-right: 16px; }
    .card { background: rgba(255,255,255,0.05); border-radius: 12px; padding: 16px; margin: 12px 0; }
  </style>
`

export const NAV = `
  <nav>
    <a href="/">Home</a>
    <a href="/games">Games</a>
    <a href="/tournaments">Tournaments</a>
    <a href="/leaderboard">Leaderboard</a>
    <a href="/h2h">H2H Zone</a>
    <a href="/loyalty">Loyalty</a>
    <a href="/referral">Referral</a>
    <a href="/faq">FAQ</a>
  </nav>
  <hr style="border-color:rgba(255,255,255,0.1); margin: 16px 0;">
`

export const STATIC_PAGES: Record<string, string> = {
  '/': `<!DOCTYPE html><html lang="en"><head>${BASE_HEAD('Playza – Play Games, Win Real Money', 'The #1 competitive skill gaming platform. Play skill-based games, join tournaments, challenge friends in H2H matches, and win real money.', '/')}</head><body>
${NAV}
<h1>Playza – Play Games, Win Real Money</h1>
<p>The #1 competitive skill gaming platform. Compete in skill-based games and win real ZA rewards. No luck involved — just pure skill.</p>
<div class="card"><h2>🎮 Game Modes</h2>
<p><strong>Head-to-Head (H2H)</strong> — Challenge any player 1v1. Winner takes the pot.</p>
<p><strong>Tournaments</strong> — Join multi-player competitions with prize pools.</p>
<p><strong>SoloEarn</strong> — Beat a target score solo and earn ZA rewards.</p>
<p><strong>Leaderboard</strong> — Compete for top rank and win weekly prizes.</p>
</div>
<div class="card"><h2>🏆 Games Available</h2>
<p>Chess, Speed Battle, Word Scramble, Pool, Ludo, Soccer, Emoji Pop and more — all skill-based, all competitive.</p>
</div>
<div class="card"><h2>💰 How Earning Works</h2>
<p>Deposit ZA, enter competitions, win more ZA. Top players earn consistently through skill. Withdraw your winnings anytime.</p>
</div>
<p><a href="/registration">Create your free account</a> and start competing today.</p>
</body></html>`,

  '/games': `<!DOCTYPE html><html lang="en"><head>${BASE_HEAD('Games – Play & Win on Playza', 'Browse all skill-based games on Playza. Play Chess, Speed Battle, Word Scramble, Pool, Ludo and more. Compete and win real ZA rewards.', '/games')}</head><body>
${NAV}
<h1>Games on Playza</h1>
<p>All games on Playza are 100% skill-based. Your score and performance determine the winner — not luck or chance.</p>
<div class="card"><h2>♟️ Chess</h2><p>Classic chess with real stakes. Challenge opponents in Head-to-Head battles or enter chess tournaments. The better player wins.</p></div>
<div class="card"><h2>⚡ Speed Battle</h2><p>Race to answer questions faster than your opponent. Tests speed and knowledge simultaneously.</p></div>
<div class="card"><h2>📝 Word Scramble</h2><p>Unscramble words faster than your opponent to claim the ZA prize. Vocabulary and speed matter.</p></div>
<div class="card"><h2>🎱 Pool</h2><p>Competitive pool/billiards — pot the most balls to win your H2H match.</p></div>
<div class="card"><h2>🎲 Ludo</h2><p>Strategic ludo with competitive entry fees and real ZA prizes for winners.</p></div>
<div class="card"><h2>⚽ Soccer</h2><p>Score more goals than your opponent in this fast-paced soccer game.</p></div>
<p><a href="/registration">Sign up free</a> to start playing and earning.</p>
</body></html>`,

  '/tournaments': `<!DOCTYPE html><html lang="en"><head>${BASE_HEAD('Tournaments – Compete for Big Prizes on Playza', 'Join live and upcoming tournaments on Playza. Compete in quiz, chess and skill tournaments with prize pools. Top players share the pot.', '/tournaments')}</head><body>
${NAV}
<h1>Tournaments on Playza</h1>
<p>Playza tournaments are multi-player skill competitions where many players pay an entry fee and the top finishers share the prize pool.</p>
<div class="card"><h2>How Tournaments Work</h2>
<ol>
<li>Register before the tournament starts</li>
<li>All entry fees go into the prize pool</li>
<li>Compete — the best players rise to the top</li>
<li>Top finishers share the prize pool instantly</li>
</ol>
</div>
<div class="card"><h2>Tournament Types</h2>
<p><strong>Quiz Tournaments</strong> — Answer fast across 5 elimination rounds. Wrong answer or timeout means you're out. Last players standing share the prize.</p>
<p><strong>Chess Tournaments</strong> — Bracket-based chess competitions with ZA prize pools.</p>
<p><strong>Sponsored Tournaments</strong> — Special events with boosted prize pools from sponsors.</p>
</div>
<div class="card"><h2>5 Rounds of Elimination</h2>
<p>Warm Up (45s) → Rising (35s) → Heat Up (30s) → Danger Zone (25s) → Final Showdown (20s). Each round gets harder and faster.</p>
</div>
<p><a href="/registration">Create account</a> to register for upcoming tournaments.</p>
</body></html>`,

  '/leaderboard': `<!DOCTYPE html><html lang="en"><head>${BASE_HEAD('Leaderboard – Top Players on Playza', 'See the top-ranked players on Playza. Compete across games and tournaments to climb the leaderboard and win weekly ZA prizes.', '/leaderboard')}</head><body>
${NAV}
<h1>Playza Leaderboard</h1>
<p>The Playza leaderboard ranks all active players by their performance across games, tournaments, and challenges.</p>
<div class="card"><h2>Leaderboard Types</h2>
<p><strong>Loyalty Leaderboard</strong> — Ranked by total PZA points earned. Top players win monthly ZA prizes.</p>
<p><strong>Game Leaderboard</strong> — Ranked by wins and scores in specific games like chess, speed battle, and word scramble.</p>
<p><strong>Referral Leaderboard</strong> — Ranked by how many active players you've referred to Playza.</p>
</div>
<div class="card"><h2>How to Climb the Leaderboard</h2>
<p>Play more games, win more matches, and enter tournaments. Every win earns you PZA points that push you up the rankings.</p>
</div>
<p><a href="/registration">Join Playza</a> and start climbing the leaderboard today.</p>
</body></html>`,

  '/h2h': `<!DOCTYPE html><html lang="en"><head>${BASE_HEAD('H2H Zone – 1v1 Challenges on Playza', 'Challenge any player to a Head-to-Head 1v1 battle on Playza. Both players pay an entry fee and the winner takes all the ZA.', '/h2h')}</head><body>
${NAV}
<h1>H2H Zone – Head-to-Head Battles</h1>
<p>Head-to-Head (H2H) is Playza's 1v1 challenge mode. You pick a game, set a stake, challenge an opponent — winner takes all.</p>
<div class="card"><h2>How H2H Works</h2>
<ol>
<li>Choose your game (Chess, Pool, Speed Battle, Word Scramble, etc.)</li>
<li>Set your entry fee amount in ZA</li>
<li>Get matched with an opponent of similar skill</li>
<li>Play the match — best score wins</li>
<li>Winner receives both entry fees instantly</li>
</ol>
</div>
<div class="card"><h2>Available H2H Games</h2>
<p>Chess, Speed Battle, Word Scramble, Pool, Ludo, Soccer, Emoji Pop — all available as 1v1 battles.</p>
</div>
<p><a href="/registration">Sign up</a> and challenge your first opponent.</p>
</body></html>`,

  '/loyalty': `<!DOCTYPE html><html lang="en"><head>${BASE_HEAD('Loyalty Program – Earn PZA Points on Playza', 'Earn PZA loyalty points every time you play on Playza. Reach higher tiers, unlock rewards, and win bonus ZA prizes.', '/loyalty')}</head><body>
${NAV}
<h1>Playza Loyalty Program</h1>
<p>Every game you play on Playza earns you PZA loyalty points. Accumulate points to reach higher tiers and unlock bigger rewards.</p>
<div class="card"><h2>Loyalty Tiers</h2>
<p><strong>Bronze</strong> — Starting tier. Earn PZA on every game played.</p>
<p><strong>Silver</strong> — 5,000+ PZA. Bonus rewards on wins.</p>
<p><strong>Gold</strong> — 25,000+ PZA. Priority matchmaking and exclusive tournaments.</p>
<p><strong>Platinum</strong> — 100,000+ PZA. Maximum rewards and VIP benefits.</p>
</div>
<div class="card"><h2>How to Earn PZA Points</h2>
<p>Sign up (5 PZA), verify email (10 PZA), win H2H battles, complete tournaments, refer friends, and complete daily challenges.</p>
</div>
<p><a href="/registration">Join Playza</a> and start earning PZA points.</p>
</body></html>`,

  '/referral': `<!DOCTYPE html><html lang="en"><head>${BASE_HEAD('Referral Program – Earn ZA by Inviting Friends to Playza', 'Invite friends to Playza and earn ZA rewards for every active player you refer. The more you refer, the more you earn.', '/referral')}</head><body>
${NAV}
<h1>Playza Referral Program</h1>
<p>Invite friends to Playza and earn real ZA rewards for every player you bring in who starts competing.</p>
<div class="card"><h2>How Referrals Work</h2>
<ol>
<li>Get your unique referral code from your profile</li>
<li>Share it with friends</li>
<li>When they sign up using your code, you both get rewarded</li>
<li>You earn bonus ZA every time your referral plays and competes</li>
</ol>
</div>
<div class="card"><h2>Referral Rewards</h2>
<p>Earn ZA 500 per verified referral. Top referrers appear on the Referral Leaderboard and win monthly bonus prizes.</p>
</div>
<p><a href="/registration">Create your account</a> and start earning through referrals.</p>
</body></html>`,

  '/solo-earn': `<!DOCTYPE html><html lang="en"><head>${BASE_HEAD('SoloEarn – Play Solo and Win ZA on Playza', 'SoloEarn lets you compete alone against a target score. No opponents needed — just beat the challenge and earn ZA rewards.', '/solo-earn')}</head><body>
${NAV}
<h1>SoloEarn – Solo Challenges</h1>
<p>SoloEarn is Playza's solo challenge mode. Compete against a target score — no opponents, no waiting. Just you and the challenge.</p>
<div class="card"><h2>How SoloEarn Works</h2>
<ol>
<li>Pick a game (Speed Battle, Word Scramble, Chess Puzzles, etc.)</li>
<li>Pay a small entry fee in ZA</li>
<li>Beat the target score to win ZA rewards</li>
<li>Miss the target — the entry fee goes to the prize pool</li>
</ol>
</div>
<div class="card"><h2>Why Play SoloEarn</h2>
<p>Perfect for practicing your skills, earning ZA at your own pace, and competing without needing a live opponent. Available 24/7.</p>
</div>
<p><a href="/registration">Sign up</a> and play your first SoloEarn challenge.</p>
</body></html>`,

  '/faq': `<!DOCTYPE html><html lang="en"><head>${BASE_HEAD('FAQ – Frequently Asked Questions about Playza', 'Answers to the most common questions about Playza — how it works, how to earn ZA, withdrawals, game rules, and more.', '/faq')}</head><body>
${NAV}
<h1>Frequently Asked Questions</h1>
<div class="card"><h2>What is Playza and how does it work?</h2><p>Playza is a skill-based gaming platform where you compete in games and earn real ZA rewards. Sign up, pick a game mode, and start winning.</p></div>
<div class="card"><h2>Is Playza free to join?</h2><p>Yes, joining Playza is completely free. You only spend ZA when you enter a paid game or challenge.</p></div>
<div class="card"><h2>Is Playza available worldwide?</h2><p>Yes, Playza is available globally. We support players from many countries around the world, with more regions being added regularly.</p></div>
<div class="card"><h2>What devices can I use?</h2><p>Playza works on any smartphone, tablet, or desktop browser — no app download required.</p></div>
<div class="card"><h2>How do I earn ZA on Playza?</h2><p>You earn ZA by winning Head-to-Head battles, Solo Challenges, Tournaments, and Leaderboard competitions on Playza.</p></div>
<div class="card"><h2>What is ZA?</h2><p>ZA is Playza's in-platform reward currency used to enter competitions and withdraw as real value.</p></div>
<div class="card"><h2>What is a Head-to-Head (H2H) battle?</h2><p>A Head-to-Head battle is a 1v1 competition where you and one opponent both pay an entry fee and the winner takes all.</p></div>
<div class="card"><h2>What is SoloEarn?</h2><p>SoloEarn is a solo challenge mode where you compete against a target score to earn ZA — no opponents needed.</p></div>
<div class="card"><h2>How do Playza Tournaments work?</h2><p>Tournaments are multi-player competitions where many players pay to enter and the top finishers share the prize pool.</p></div>
<div class="card"><h2>Are the games skill-based or luck-based?</h2><p>All Playza games are skill-based — your score and performance, not chance or randomness, determine the outcome.</p></div>
<div class="card"><h2>How do I withdraw my earnings?</h2><p>Go to your Wallet, click Withdraw, enter your bank details, and your ZA is converted and sent to your account.</p></div>
<div class="card"><h2>Is my money safe on Playza?</h2><p>Yes. Playza uses bank-grade encryption and secure payment processing. Your ZA balance is always protected.</p></div>
</body></html>`,

  '/support': `<!DOCTYPE html><html lang="en"><head>${BASE_HEAD('Support – Get Help on Playza', 'Contact Playza support for help with your account, games, payments, or any other issues. We respond quickly.', '/support')}</head><body>
${NAV}
<h1>Playza Support</h1>
<p>Need help? Our support team is here for you. Reach out through any of the channels below.</p>
<div class="card"><h2>Common Issues</h2>
<p><strong>Account issues</strong> — Login problems, verification, password reset</p>
<p><strong>Payment issues</strong> — Deposits not reflecting, withdrawal delays</p>
<p><strong>Game issues</strong> — Technical problems during a game, score disputes</p>
<p><strong>Referral issues</strong> — Referral code not working, rewards not received</p>
</div>
<div class="card"><h2>Contact Us</h2>
<p>Email: support@playza.games</p>
<p>Response time: within 24 hours on business days.</p>
</div>
</body></html>`,

  '/registration': `<!DOCTYPE html><html lang="en"><head>${BASE_HEAD('Sign Up – Create Your Playza Account', 'Create a free Playza account and start competing in skill-based games. Sign up takes less than 2 minutes.', '/registration')}</head><body>
${NAV}
<h1>Create Your Playza Account</h1>
<p>Join thousands of players competing on Playza. Sign up is free and takes less than 2 minutes.</p>
<div class="card"><h2>What You Get</h2>
<p>✅ Free account — no credit card required</p>
<p>✅ Welcome PZA bonus on signup</p>
<p>✅ Access to all game modes — H2H, Tournaments, SoloEarn, Leaderboard</p>
<p>✅ Referral code to earn from inviting friends</p>
</div>
<div class="card"><h2>How to Sign Up</h2>
<ol>
<li>Enter your username, email, and phone number</li>
<li>Create a password</li>
<li>Verify your email with the OTP sent to you</li>
<li>Start playing and earning</li>
</ol>
</div>
<p>Already have an account? <a href="/registration?view=login">Log in here</a>.</p>
</body></html>`,

  '/terms': `<!DOCTYPE html><html lang="en"><head>${BASE_HEAD('Terms and Conditions – Playza', 'Read the Playza terms and conditions. Learn about our rules, policies, user responsibilities, and platform guidelines.', '/terms')}</head><body>
${NAV}
<h1>Terms and Conditions</h1>
<p>By using Playza, you agree to these terms. Please read them carefully.</p>
<div class="card"><h2>Eligibility</h2><p>You must be 18 years or older to use Playza. By creating an account you confirm you meet the eligibility requirements in your jurisdiction.</p></div>
<div class="card"><h2>Fair Play</h2><p>All games on Playza are skill-based. Cheating, exploiting bugs, or using automated tools is strictly prohibited and will result in permanent account suspension.</p></div>
<div class="card"><h2>Payments and Withdrawals</h2><p>ZA deposits are processed securely. Withdrawals are subject to identity verification. Playza reserves the right to verify all transactions.</p></div>
<div class="card"><h2>Account Responsibility</h2><p>You are responsible for maintaining the security of your account. Do not share your login credentials with anyone.</p></div>
</body></html>`,

  '/privacy': `<!DOCTYPE html><html lang="en"><head>${BASE_HEAD('Privacy Policy – Playza', 'Read the Playza privacy policy. Learn how we collect, use, and protect your personal data.', '/privacy')}</head><body>
${NAV}
<h1>Privacy Policy</h1>
<p>Playza is committed to protecting your privacy. This policy explains how we handle your data.</p>
<div class="card"><h2>Data We Collect</h2><p>We collect your name, email, phone number, and gameplay data necessary to operate the platform and process payments.</p></div>
<div class="card"><h2>How We Use Your Data</h2><p>Your data is used to operate your account, process transactions, prevent fraud, and improve the platform. We do not sell your data to third parties.</p></div>
<div class="card"><h2>Data Security</h2><p>We use industry-standard encryption and security practices to protect your personal information and financial data.</p></div>
<div class="card"><h2>Your Rights</h2><p>You can request access to, correction of, or deletion of your personal data at any time by contacting support@playza.games.</p></div>
</body></html>`,
}