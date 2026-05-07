import React from "react";
import { Link } from "react-router";
import { ChevronDown, HelpCircle, Shield, Zap, Wallet, Users, Layout } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
  snippet?: string;
  keywords?: string;
  cta?: string;
  trustSignal?: string;
  link?: { text: string; to: string };
  icon?: React.ReactNode;
}

const faqs: FAQItem[] = [
  // Getting Started
  {
    question: "What is Playza and how does it work?",
    snippet: "Playza is a skill-based gaming platform where you compete in games and earn real ZA rewards. Sign up, pick a game mode, and start winning.",
    answer: "Playza is a competitive skill gaming platform where your ability — not luck — determines your rewards. You sign up for free, choose a game mode (Head-to-Head, Solo Challenge, Tournament, or Leaderboard), pay a small entry fee in ZA, compete against real players, and the winner takes the pot. Playza is built for players in Nigeria, Ghana, and across West Africa who want to turn their gaming skills into real earnings. No bots, no rigged outcomes — just fair, skill-based competition. Join Playza today and see how good you really are.",
    keywords: "skill-based gaming platform • how Playza works • earn rewards gaming Nigeria",
    cta: "Create your free Playza account and start competing today.",
    trustSignal: "Fair play guaranteed — every result is based on pure skill.",
    link: { text: "Signup page", to: "/registration" },
    icon: <Zap className="w-5 h-5" />,
  },
  {
    question: "Is Playza free to join?",
    snippet: "Yes, joining Playza is completely free. You only spend ZA when you enter a paid game or challenge.",
    answer: "Signing up on Playza costs nothing. Creating your account is 100% free and takes less than two minutes. Once you're in, you can explore game modes, watch how competitions work, and use any free ZA bonuses from our referral or welcome programmes. When you're ready to compete for earnings, you'll use ZA — Playza's reward currency — to enter challenges. There are no hidden charges or subscription fees. Start free, play smart, earn real rewards.",
    keywords: "free to join gaming platform • Playza free signup • play games and earn Nigeria free",
    cta: "Sign up for free on Playza — no credit card needed.",
    trustSignal: "No hidden fees. No surprise charges.",
    link: { text: "Signup page", to: "/registration" },
    icon: <Shield className="w-5 h-5" />,
  },
  {
    question: "How do I create a Playza account?",
    snippet: "Go to playza.games, click Sign Up, enter your details, verify your number, and you're ready to play.",
    answer: "Creating your Playza account is quick and simple. Visit playza.games and click 'Sign Up'. Enter your name, email address, and phone number, then create a password. You'll receive a verification code on your phone — enter it to activate your account. Once verified, you can set up your profile, claim any welcome bonus, and choose your first game. The whole process takes under 2 minutes. Mobile-first design means it works smoothly on any Android or iOS device, even on lower-end phones common across West Africa.",
    keywords: "how to create Playza account • Playza sign up Nigeria • register on Playza",
    cta: "Join thousands of players already earning on Playza.",
    trustSignal: "Your data is secure and your account is protected.",
    link: { text: "Signup page", to: "/registration" },
    icon: <Users className="w-5 h-5" />,
  },
  {
    question: "Is Playza available in Nigeria and Ghana?",
    snippet: "Yes, Playza is fully available in Nigeria and Ghana, with more West African countries being added.",
    answer: "Playza is built specifically with West African players in mind. The platform is fully live in Nigeria and Ghana, with Benin and other West African markets joining soon. The interface is optimised for mobile data conditions common in the region, and the ZA reward system is designed to work with local payment methods. Whether you're in Lagos, Accra, or Cotonou, Playza gives you a fair shot at earning from your gaming skills. More countries are being added regularly — your region could be next.",
    keywords: "Playza Nigeria • Playza Ghana • gaming platform West Africa • earn money gaming Africa",
    cta: "Players in Lagos, Accra and beyond are already earning. Join them.",
    trustSignal: "Designed for African gamers, by people who understand the market.",
    link: { text: "Signup page", to: "/registration" },
    icon: <Layout className="w-5 h-5" />,
  },
  {
    question: "What devices can I use to play on Playza?",
    snippet: "Playza works on any smartphone, tablet, or desktop browser — no app download required.",
    answer: "Playza is a web-based platform that runs directly in your browser — no app download needed. It works on Android and iOS smartphones, tablets, and desktop or laptop computers. The platform is mobile-first, meaning it's optimised for the way most Nigerian and Ghanaian players game — on their phones, often on mobile data. Pages are lightweight and load fast even on 3G connections. Simply open playza.games in Chrome, Firefox, or Safari and you're good to go.",
    keywords: "play Playza on phone • Playza mobile browser • no download gaming Nigeria",
    cta: "Open playza.games on your phone right now and start playing.",
    trustSignal: "Fast loading — even on mobile data.",
    link: { text: "Games page", to: "/games" },
    icon: <Zap className="w-5 h-5" />,
  },
  // Earning & Rewards
  {
    question: "How do I earn ZA on Playza?",
    snippet: "You earn ZA by winning Head-to-Head battles, Solo Challenges, Tournaments, and Leaderboard competitions on Playza.",
    answer: "ZA is Playza's reward currency — you earn it by winning. There are four main ways to earn: beat opponents in Head-to-Head (H2H) battles, complete Solo Challenges within target scores, finish at the top of Tournament brackets, or climb Leaderboard rankings. You can also earn ZA by referring friends — up to ZA 500 per verified user you bring in. Your skill, consistency, and strategy determine how much you earn. The better you play, the more you make.",
    keywords: "how to earn ZA Playza • earn money playing games online Nigeria • Playza rewards",
    cta: "Log in, pick a game mode, and start earning ZA today.",
    trustSignal: "ZA rewards are based purely on skill — no luck, no bots.",
    link: { text: "Games page", to: "/games" },
    icon: <Wallet className="w-5 h-5" />,
  },
  {
    question: "How much can I earn on Playza?",
    snippet: "Your earnings on Playza depend on your skill level, how often you play, and how many players you refer.",
    answer: "Playza doesn't promise fixed earnings because, like any skill-based competition, results depend on your performance. Active, consistent players who win regularly can accumulate meaningful ZA rewards. Tournament and Leaderboard winners typically earn the most in a single session. On top of gameplay, the referral programme adds up to ZA 500 per verified friend you bring in. The more you play, improve, and refer, the more your ZA balance grows. Think of it like sport — the better you get, the more you earn.",
    keywords: "how much can I earn Playza • Playza earnings Nigeria • gaming rewards real money Africa",
    cta: "Build your skills and your earnings — join Playza now.",
    trustSignal: "No unrealistic promises — real rewards for real skill.",
    link: { text: "Referral page", to: "/referral" },
    icon: <Wallet className="w-5 h-5" />,
  },
  {
    question: "What is ZA and what can I use it for?",
    snippet: "ZA is Playza's in-platform reward currency used to enter competitions and withdraw as real value.",
    answer: "ZA is the currency that powers Playza. You use ZA to enter paid game modes — Head-to-Head, Solo Challenges, Tournaments — and you win more ZA when you beat opponents. You can accumulate ZA and withdraw it to your wallet once you hit the minimum threshold. ZA is not a cryptocurrency or token — it's Playza's internal rewards system designed to be simple, fast, and accessible for players across Nigeria, Ghana, and West Africa. No blockchain knowledge needed.",
    keywords: "what is ZA Playza • Playza currency • ZA rewards gaming",
    cta: "Earn your first ZA today — sign up and compete.",
    trustSignal: "Simple currency, real value — no crypto complexity.",
    link: { text: "Wallet page", to: "/wallet" },
    icon: <Wallet className="w-5 h-5" />,
  },
  {
    question: "Can I really earn money playing games on Playza?",
    snippet: "Yes — Playza pays out real ZA rewards based on your gaming skill, not chance.",
    answer: "Yes, Playza is a legitimate skill-gaming platform where skilled players earn real ZA rewards. It's not gambling — your performance determines your outcome. Players who invest time in improving their skills, choosing the right game modes, and competing consistently build up their ZA balance and withdraw it. Playza operates transparently with real players and fair matchmaking. Think of it like chess tournaments or e-sports leagues — the best players earn. If you're genuinely skilled and strategic, Playza rewards that.",
    keywords: "can you really earn money gaming Nigeria • is Playza legit • earn money online games Ghana • skill gaming earn real rewards",
    cta: "Prove your skills — join Playza and compete for real ZA rewards.",
    trustSignal: "Real players, fair results, verified payouts.",
    link: { text: "Signup page", to: "/registration" },
    icon: <Shield className="w-5 h-5" />,
  },
  // Gameplay
  {
    question: "What is a Head-to-Head (H2H) battle on Playza?",
    snippet: "A Head-to-Head battle is a 1v1 competition where you and one opponent both pay an entry fee and the winner takes all.",
    answer: "Head-to-Head (H2H) is Playza's most direct mode — you vs. one other real player. Both of you put in the same ZA entry fee. You each play the same game or challenge independently. The player with the better score wins both entry fees, minus Playza's small service fee. H2H is fast, focused, and great for players who are confident in their skill. Pick your stake level, get matched with a player of similar ability, and compete. Winner takes the pot. Simple, fair, thrilling.",
    keywords: "Playza H2H • head to head gaming Nigeria • 1v1 skill game earn money",
    cta: "Challenge a player now — enter a Head-to-Head battle on Playza.",
    trustSignal: "Matched with players of similar skill for fair competition.",
    link: { text: "Games page", to: "/games" },
    icon: <Zap className="w-5 h-5" />,
  },
  {
    question: "What is SoloEarn on Playza?",
    snippet: "SoloEarn is a solo challenge mode where you compete against a target score to earn ZA — no opponents needed.",
    answer: "SoloEarn lets you compete on your own terms. Instead of playing against another person directly, you're given a challenge — hit a target score, complete a level, or beat a benchmark — and earn ZA for succeeding. It's perfect for players who want to sharpen their skills, play at their own pace, or aren't ready for H2H yet. SoloEarn still has an entry fee and a reward — you're betting on yourself to meet the challenge. Great for beginners building confidence or veterans warming up.",
    keywords: "SoloEarn Playza • solo gaming challenge earn ZA • play alone earn money Nigeria",
    cta: "Try SoloEarn today — challenge yourself and earn ZA.",
    trustSignal: "No opponents — just you vs. the challenge. Pure skill.",
    link: { text: "Games page", to: "/games" },
    icon: <Zap className="w-5 h-5" />,
  },
  {
    question: "How do Playza Tournaments work?",
    snippet: "Tournaments are multi-player competitions where many players pay to enter and the top finishers share the prize pool.",
    answer: "Playza Tournaments bring multiple players together into one competition. All entrants pay the same ZA entry fee, which goes into a prize pool. Players compete simultaneously or in brackets, and the top performers share the winnings — with the #1 spot earning the largest share. Tournaments are where the biggest ZA prizes are won. They run on scheduled times, so check the games page for upcoming tournaments. If you're consistently good, tournaments offer the highest rewards on the platform.",
    keywords: "Playza tournament • gaming tournament Nigeria prizes • win big gaming tournament Africa",
    cta: "Enter an upcoming Playza Tournament and compete for the top prize.",
    trustSignal: "Prize pool is funded by entries — transparent and fair.",
    link: { text: "Games page", to: "/games" },
    icon: <Zap className="w-5 h-5" />,
  },
  {
    question: "What are Playza Leaderboards?",
    snippet: "Leaderboards rank all competing players by score. Top-ranked players at the end of the period win ZA prizes.",
    answer: "Leaderboard competitions run over a set time period — daily, weekly, or monthly. Every game you play contributes to your leaderboard score. At the end of the period, the highest-ranked players win ZA rewards. Leaderboards reward consistency — not just one great game, but sustained strong performance. They're great for competitive players who want a long-term target to chase. Keep playing, keep improving, and climb the rankings to earn your share of the reward pool.",
    keywords: "Playza leaderboard • gaming leaderboard earn money Nigeria • competitive gaming rankings Africa",
    cta: "Start climbing the Playza Leaderboard — every game counts.",
    trustSignal: "Rankings are real-time and fully transparent.",
    link: { text: "Games page", to: "/games" },
    icon: <Zap className="w-5 h-5" />,
  },
  {
    question: "Are the games on Playza skill-based or luck-based?",
    snippet: "All Playza games are skill-based — your score and performance, not chance or randomness, determine the outcome.",
    answer: "Every game mode on Playza is designed around skill, not luck. There are no slot machines, no random draws, no unpredictable outcomes that ignore your performance. Whether it's a reaction-based game, a strategy challenge, or a puzzle, your score reflects how well you actually played. Playza takes fair play seriously — the same game is presented to all players under the same conditions. Better skills, better strategy, better score. It's the same principle behind every competitive sport: practice and ability win.",
    keywords: "is Playza skill or luck • skill based gaming Nigeria • fair gaming platform Africa",
    cta: "Trust your skills — play on Playza where ability counts.",
    trustSignal: "100% skill-based. No randomness, no bots, no rigged outcomes.",
    link: { text: "Signup page", to: "/registration" },
    icon: <Shield className="w-5 h-5" />,
  },
  // Payments & Wallet
  {
    question: "How do I deposit ZA into my Playza wallet?",
    snippet: "Fund your Playza wallet using local payment methods including bank transfer, mobile money, and card payments.",
    answer: "Funding your Playza wallet is simple. Go to the Wallet section in your account and choose your preferred payment method. Playza supports local payment options popular in Nigeria and Ghana including bank transfer, debit card, and mobile money. Enter the amount you want to deposit, follow the payment prompts, and your ZA balance will update once the payment is confirmed — usually within a few minutes. Minimum deposit amounts apply and are shown clearly during checkout. No surprises.",
    keywords: "how to deposit on Playza • fund Playza wallet Nigeria • Playza payment method Ghana",
    cta: "Fund your wallet and start competing — it takes under 3 minutes.",
    trustSignal: "Secure, encrypted payments — your money is safe.",
    link: { text: "Wallet page", to: "/wallet" },
    icon: <Wallet className="w-5 h-5" />,
  },
  {
    question: "How do I withdraw my ZA earnings from Playza?",
    snippet: "Withdraw your ZA earnings to your local bank account or mobile wallet from the Playza Wallet page.",
    answer: "Withdrawing your ZA is straightforward. Head to your Wallet page, click 'Withdraw', enter the amount you want to withdraw, and select your destination — bank account or mobile money wallet. Withdrawals are processed within a set timeframe displayed in your account. You must meet the minimum withdrawal threshold and your account must be fully verified before your first withdrawal. Playza processes withdrawals as quickly as possible to make sure you get your earnings without delay.",
    keywords: "how to withdraw Playza earnings • Playza withdrawal Nigeria • cash out gaming rewards Africa",
    cta: "Win today, withdraw your earnings fast — Playza pays out.",
    trustSignal: "Verified accounts get the fastest withdrawals.",
    link: { text: "Wallet page", to: "/wallet" },
    icon: <Wallet className="w-5 h-5" />,
  },
  {
    question: "How long do Playza withdrawals take?",
    snippet: "Playza processes withdrawal requests within 24–48 hours for verified accounts.",
    answer: "Withdrawal processing times depend on your account verification status and your bank or mobile money provider. For fully verified accounts, withdrawals are typically processed within 24 to 48 hours. Bank transfers may take slightly longer depending on your bank's processing times. Mobile money withdrawals are often faster. Playza aims to process all withdrawal requests as promptly as possible. If your withdrawal is delayed beyond the stated period, contact Playza support through your account dashboard.",
    keywords: "Playza withdrawal time • how long Playza payout Nigeria • Playza payout speed",
    cta: "Verify your account today for the fastest withdrawals.",
    trustSignal: "Transparent timelines — no unexpected delays.",
    link: { text: "Wallet page", to: "/wallet" },
    icon: <Wallet className="w-5 h-5" />,
  },
  {
    question: "What is the minimum amount I can withdraw from Playza?",
    snippet: "Playza has a minimum withdrawal threshold — check your Wallet page for the current minimum in ZA.",
    answer: "Playza sets a minimum withdrawal amount to ensure efficient payment processing. The exact minimum is shown in your Wallet section and may vary based on your region or payment method. It's designed to be accessible — not a high barrier. Accumulate your ZA through wins and referrals, then withdraw once you've hit the threshold. The minimum is always clearly displayed before you start — no hidden limits.",
    keywords: "Playza minimum withdrawal • minimum payout Playza Nigeria • how much to withdraw Playza",
    cta: "Check your wallet and start working toward your first withdrawal.",
    trustSignal: "Clear minimums — no confusing small print.",
    link: { text: "Wallet page", to: "/wallet" },
    icon: <Wallet className="w-5 h-5" />,
  },
  // Referral System
  {
    question: "How does the Playza referral programme work?",
    snippet: "Share your unique referral link with friends. When they sign up and verify, you earn up to ZA 500 per referral.",
    answer: "Playza's referral programme lets you earn ZA just by spreading the word. Every Playza account has a unique referral link you can find on your Referral page. Share your link with friends, family, or your social media followers. When someone signs up using your link and completes account verification, you earn ZA — up to ZA 500 per verified user you bring in. There's no cap on how many people you can refer. The more people you bring in who verify and play, the more you earn. Referrals stack.",
    keywords: "Playza referral programme • earn ZA referring friends Playza • Playza invite friends earn Nigeria",
    cta: "Share your referral link today — earn up to ZA 500 per friend.",
    trustSignal: "Referral earnings credited automatically once your friend verifies.",
    link: { text: "Referral page", to: "/referral" },
    icon: <Users className="w-5 h-5" />,
  },
  {
    question: "How much can I earn from Playza referrals?",
    snippet: "You can earn up to ZA 500 for every verified user who signs up through your referral link — with no limit on referrals.",
    answer: "Playza pays up to ZA 500 per verified referral — and there's no limit on how many friends you can refer. If you refer 10 verified users, that's potentially ZA 5,000 in referral earnings on top of your gameplay winnings. It's one of the fastest ways to grow your ZA balance without playing extra games. The key is referring people who actually complete verification — unverified sign-ups don't count. Focus on getting real players involved and you'll earn consistently from referrals.",
    keywords: "Playza referral earnings • how much earn Playza referral • ZA 500 referral Nigeria",
    cta: "Start referring now — every verified friend earns you ZA 500.",
    trustSignal: "Referral rewards are automatic and transparent.",
    link: { text: "Referral page", to: "/referral" },
    icon: <Users className="w-5 h-5" />,
  },
  {
    question: "How do I find and share my Playza referral link?",
    snippet: "Log in to Playza, go to the Referral page, copy your unique link, and share it via WhatsApp, social media, or SMS.",
    answer: "Getting your referral link is easy. Log into your Playza account and navigate to the Referral section from your dashboard. You'll find your unique referral link and a QR code you can share. Copy the link and send it through WhatsApp (most popular in Nigeria and Ghana), share it on Instagram, Twitter, Telegram, or just SMS it to your contacts. The more people you share with, the higher your chances of earning. Your link tracks every signup automatically — no manual tracking needed.",
    keywords: "find Playza referral link • share Playza link WhatsApp Nigeria • Playza referral code",
    cta: "Copy your referral link right now and share it on WhatsApp.",
    trustSignal: "Every click and signup on your link is automatically tracked.",
    link: { text: "Referral page", to: "/referral" },
    icon: <Users className="w-5 h-5" />,
  },
  {
    question: "When do I get paid my Playza referral bonus?",
    snippet: "Your referral bonus is credited to your ZA wallet as soon as your referred friend completes account verification.",
    answer: "You receive your referral bonus automatically as soon as the person you referred completes account verification on Playza. You don't need to do anything after sharing your link — the system handles it. You'll see the ZA credited in your wallet, and you can track all your referral activity on the Referral page. Note that the referral reward is triggered by verified sign-ups, not just registrations. Encourage your friends to complete verification quickly so you get credited faster.",
    keywords: "Playza referral bonus payment • when get paid referral Playza • ZA referral credit Nigeria",
    cta: "Check your referral page — see your earnings grow in real time.",
    trustSignal: "Instant credit upon verification — no waiting, no chasing.",
    link: { text: "Referral page", to: "/referral" },
    icon: <Users className="w-5 h-5" />,
  },
  // Trust & Security
  {
    question: "Is Playza legit or a scam?",
    snippet: "Playza is a legitimate skill-based gaming platform — real users, real competitions, real ZA payouts.",
    answer: "Playza is a legitimate, skill-based gaming platform — not a scam. It operates on a transparent model: players enter competitions with ZA, compete fairly, and winners receive payouts. The platform serves real users across Nigeria, Ghana, and West Africa. Your account, data, and wallet are protected with industry-standard security. Unlike get-rich-quick schemes, Playza doesn't promise guaranteed earnings — it gives skilled players a fair platform to compete and earn. If you see something that doesn't feel right, contact support directly through your account.",
    keywords: "is Playza legit • is Playza a scam • Playza trustworthy Nigeria • legit gaming platform Ghana",
    cta: "See for yourself — sign up and test the platform free.",
    trustSignal: "Real users, fair play, transparent payouts.",
    link: { text: "Signup page", to: "/registration" },
    icon: <Shield className="w-5 h-5" />,
  },
  {
    question: "How does Playza ensure fair play?",
    snippet: "Playza uses skill-based matching, anti-cheat systems, and identical game conditions for all players to ensure fair competition.",
    answer: "Fair play is central to Playza. Every competition is structured so all players face the same game under the same conditions. Playza uses matchmaking systems to pair players of similar skill levels in H2H battles, reducing unfair advantages. Anti-cheat measures are in place to detect and remove players who try to manipulate results. Scores are calculated consistently and transparently. If you suspect foul play in a competition, you can report it through the in-app support system. Playza protects its fair play standards to maintain trust across the community.",
    keywords: "Playza fair play • how Playza prevents cheating • anti-cheat gaming platform Nigeria",
    cta: "Compete with confidence — Playza's fair play systems have you covered.",
    trustSignal: "Anti-cheat systems active on all game modes.",
    link: { text: "Games page", to: "/games" },
    icon: <Shield className="w-5 h-5" />,
  },
  {
    question: "Is my money and personal data safe on Playza?",
    snippet: "Yes — Playza uses encrypted payment processing and secure data storage to protect your account and funds.",
    answer: "Playza takes your security seriously. All payment transactions are processed through encrypted, secure payment gateways. Your personal data is stored securely and is never shared with third parties without your consent. Your account is protected with password authentication, and Playza recommends enabling any additional verification features available. Your ZA wallet balance is tracked in real time so you can always see exactly what you have. If you ever notice suspicious activity on your account, contact Playza support immediately.",
    keywords: "is Playza secure • Playza data privacy • safe gaming platform Nigeria • Playza account security",
    cta: "Your security is our priority — play with peace of mind.",
    trustSignal: "Encrypted payments. Secure data. No third-party sharing.",
    link: { text: "Signup page", to: "/registration" },
    icon: <Shield className="w-5 h-5" />,
  },
  {
    question: "What age do I need to be to play on Playza?",
    snippet: "You must be 18 years or older to create a Playza account and participate in paid competitions.",
    answer: "Playza is a platform for adults. You must be at least 18 years old to register and participate in any paid game mode. Age verification may be required during account setup or at withdrawal stage. This policy exists to ensure responsible gaming and compliance with regulations across the markets where Playza operates. If you are under 18, you are not permitted to create an account. Playza encourages all players to game responsibly and within their means.",
    keywords: "Playza age requirement • minimum age gaming platform Nigeria • Playza 18+",
    cta: "18 and ready? Create your Playza account now.",
    trustSignal: "Responsible gaming policies enforced platform-wide.",
    link: { text: "Signup page", to: "/registration" },
    icon: <Shield className="w-5 h-5" />,
  },
  {
    question: "How do I contact Playza support?",
    snippet: "You can reach Playza support through the in-app help section, live chat, or email from your account dashboard.",
    answer: "If you have a problem, question, or complaint, Playza support is available through multiple channels. Log into your account and navigate to the Help or Support section in your dashboard — you'll find a live chat option and a form to submit a detailed request. For faster help, use the live chat during active hours. You can also reach out through Playza's official social media channels. When contacting support, include your account username and a clear description of the issue to get the fastest resolution.",
    keywords: "Playza customer support • how to contact Playza • Playza help Nigeria",
    cta: "Have a question? Our support team is ready to help.",
    trustSignal: "Real support team — not automated bots ignoring your issue.",
    link: { text: "Signup page", to: "/registration" },
    icon: <HelpCircle className="w-5 h-5" />,
  },
  {
    question: "Does Playza use bots or fake players?",
    snippet: "No — all players on Playza are real, verified humans. No bots, no fake accounts in competitions.",
    answer: "Playza does not use bots or fake accounts in its competitions. Every player you face in H2H, Tournaments, or Leaderboards is a real, registered, verified user. Using bots or fake accounts violates Playza's Terms of Service and will result in immediate account suspension. The platform actively monitors competition patterns to detect non-human or suspicious behaviour. This commitment to real-player competition is what makes Playza a trustworthy place to spend your ZA. Your wins are against real people — which makes them actually meaningful.",
    keywords: "Playza bots • does Playza use fake players • real players gaming platform Nigeria",
    cta: "Compete against real players — sign up and see for yourself.",
    trustSignal: "Zero bots, zero fake accounts. Verified real players only.",
    link: { text: "Signup page", to: "/registration" },
    icon: <Shield className="w-5 h-5" />,
  }
];

const AccordionItem = ({ item, isOpen, onClick }: { item: FAQItem; isOpen: boolean; onClick: () => void }) => {
  return (
    <div className={`glass-card overflow-hidden transition-all duration-300 border ${isOpen ? 'border-primary/50 bg-primary/5 shadow-lg shadow-primary/5' : 'border-border bg-card/50 hover:bg-card dark:border-white/5 dark:bg-white/5 dark:hover:bg-white/10'}`}>
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between p-4 md:p-6 text-left focus:outline-none"
      >
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-xl transition-colors ${isOpen ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground dark:bg-white/5 dark:text-slate-400'}`}>
            {item.icon}
          </div>
          <h3 className={`text-sm md:text-base font-black uppercase tracking-tight ${isOpen ? 'text-primary' : 'text-foreground/90'}`}>
            {item.question}
          </h3>
        </div>
        <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : 'text-muted-foreground dark:text-slate-500'}`} />
      </button>
      
      <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
        <div className="p-4 md:p-6 pt-0 space-y-5 border-t border-border dark:border-white/5">
          {item.snippet && (
            <div className="bg-primary/10 border-l-4 border-primary p-4 rounded-r-xl">
              <p className="text-xs md:text-sm font-bold text-primary italic leading-relaxed">
                {item.snippet}
              </p>
            </div>
          )}
          
          <p className="text-sm text-foreground/80 dark:text-slate-300 leading-relaxed font-medium">
            {item.answer}
          </p>
          
          {item.keywords && (
            <div className="flex flex-wrap gap-2 pt-2 items-center">
              <span className="text-[10px] font-black uppercase text-muted-foreground dark:text-slate-500 shrink-0">Keywords:</span>
              <p className="text-[10px] font-bold text-muted-foreground/80 dark:text-slate-400">{item.keywords}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-border dark:border-white/5">
            {item.trustSignal && (
              <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider bg-emerald-500/5 px-3 py-1 rounded-full border border-emerald-500/20">
                <Shield className="w-3 h-3" />
                {item.trustSignal}
              </div>
            )}
            
            {item.link && (
              <Link
                to={item.link.to}
                className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline underline-offset-4 flex items-center gap-2"
              >
                Go to {item.link.text}
                <Zap className="w-3 h-3" />
              </Link>
            )}
          </div>
          
          {item.cta && (
            <div className="pt-4">
              <Link 
                to="/registration"
                className="block text-center p-4 rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg shadow-primary/20"
              >
                {item.cta}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const FAQ = () => {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  const categories = [
    { name: "Getting Started", range: [0, 5] },
    { name: "Earning & Rewards", range: [5, 9] },
    { name: "Gameplay", range: [9, 14] },
    { name: "Payments & Wallet", range: [14, 18] },
    { name: "Referral System", range: [18, 22] },
    { name: "Trust & Security", range: [22, 28] },
  ];

  React.useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.innerHTML = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map(f => ({
        "@type": "Question",
        "name": f.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": f.snippet ? `${f.snippet} ${f.answer}` : f.answer
        }
      }))
    });
    document.head.appendChild(script);
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20 px-2 md:px-0">
      {/* Hero Section */}
      <div className="relative overflow-hidden glass-card p-2 md:p-4 rounded-xl border border-primary/20 flex flex-col items-center text-center space-y-6">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-80 h-80 bg-primary/30 blur-[120px] rounded-full pointer-events-none animate-pulse dark:opacity-100 opacity-50" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-80 h-80 bg-primary/20 blur-[120px] rounded-full pointer-events-none animate-pulse dark:opacity-100 opacity-50" style={{ animationDelay: '1s' }} />
        
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-150" />
          <div className="relative size-20 rounded-[2rem] bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-primary-foreground shadow-xl shadow-primary/20">
            <HelpCircle className="w-10 h-10" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-xl md:text-4xl font-black uppercase tracking-tighter text-foreground italic leading-none">
            Help Center <span className="text-primary">&</span> FAQ
          </h1>
          <p className="text-xs md:text-sm text-primary font-black uppercase tracking-[0.3em] opacity-90">
            Playza Games • West Africa & Global
          </p>
        </div>

        <p className="text-sm md:text-base text-muted-foreground font-bold max-w-lg leading-relaxed">
          Everything you need to know about West Africa's leading skill-based gaming platform. 
          <span className="text-foreground"> Real rewards, zero luck, pure skill.</span>
        </p>
      </div>

      {/* FAQ Sections */}
      <div className="space-y-16">
        {categories.map((cat, catIdx) => (
          <div key={catIdx} className="space-y-6">
            <div className="flex items-center gap-4">
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-foreground/90">
                {cat.name}
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
            </div>
            
            <div className="grid gap-4">
              {faqs.slice(cat.range[0], cat.range[1]).map((faq, index) => {
                const globalIndex = cat.range[0] + index;
                return (
                  <AccordionItem
                    key={globalIndex}
                    item={faq}
                    isOpen={openIndex === globalIndex}
                    onClick={() => setOpenIndex(openIndex === globalIndex ? null : globalIndex)}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Still need help? */}
      <div className="glass-card p-10 rounded-[2.5rem] border border-border dark:border-white/5 text-center space-y-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        <h3 className="text-2xl font-black uppercase tracking-tight text-foreground">Still have questions?</h3>
        <p className="text-sm text-muted-foreground font-medium max-w-md mx-auto">
          Can't find the answer you're looking for? Reach out to our support team and we'll get you sorted.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/feedback"
            className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-muted hover:bg-muted/80 border border-border text-foreground font-black text-xs uppercase tracking-widest transition-colors dark:bg-white/5 dark:border-white/10 dark:text-slate-200"
          >
            Contact Support
          </Link>
          <Link
            to="/registration"
            className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-transform shadow-xl shadow-primary/30"
          >
            Join Playza Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
