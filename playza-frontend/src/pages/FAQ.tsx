import React from "react";
import { Link } from "react-router";
import { ChevronDown, HelpCircle, Shield, Zap, Wallet, Users, Layout } from "lucide-react";

interface FAQItem {
  question: string;
  answer: React.ReactNode;
}

const faqs: FAQItem[] = [
  // Getting Started
  {
    question: "What is Playza and how does it work?",
    answer: <>Playza is a skill-based gaming platform where you compete in games and earn real ZA rewards. <Link to="/registration" className="text-primary hover:underline font-black">Sign up</Link>, pick a game mode, and start winning.</>,
  },
  {
    question: "Is Playza free to join?",
    answer: "Yes, joining Playza is completely free. You only spend ZA when you enter a paid game or challenge.",
  },
  {
    question: "How do I create a Playza account?",
    answer: <>Go to playza.games, click <Link to="/registration" className="text-primary hover:underline font-black">Sign Up</Link>, enter your details, verify your number, and you're ready to play.</>,
  },
  {
    question: "Is Playza available in Nigeria and Ghana?",
    answer: "Yes, Playza is fully available in Nigeria and Ghana, with more West African countries being added.",
  },
  {
    question: "What devices can I use to play on Playza?",
    answer: "Playza works on any smartphone, tablet, or desktop browser — no app download required.",
  },
  {
    question: "How do I earn ZA on Playza?",
    answer: "You earn ZA by winning Head-to-Head battles, Solo Challenges, Tournaments, and Leaderboard competitions on Playza.",
  },
  {
    question: "How much can I earn on Playza?",
    answer: "Your earnings on Playza depend on your skill level, how often you play, and how many players you refer.",
  },
  {
    question: "What is ZA and what can I use it for?",
    answer: "ZA is Playza's in-platform reward currency used to enter competitions and withdraw as real value.",
  },
  {
    question: "Can I really earn money playing games on Playza?",
    answer: "Yes — Playza pays out real ZA rewards based on your gaming skill, not chance.",
  },

  // Gameplay
  {
    question: "What is a Head-to-Head (H2H) battle on Playza?",
    answer: "A Head-to-Head battle is a 1v1 competition where you and one opponent both pay an entry fee and the winner takes all.",
  },
  {
    question: "What is SoloEarn on Playza?",
    answer: "SoloEarn is a solo challenge mode where you compete against a target score to earn ZA — no opponents needed.",
  },
  {
    question: "How do Playza Tournaments work?",
    answer: "Tournaments are multi-player competitions where many players pay to enter and the top finishers share the prize pool.",
  },
  {
    question: "What are Playza Leaderboards?",
    answer: "Leaderboards rank all competing players by score. Top-ranked players at the end of the period win ZA prizes.",
  },
  {
    question: "Are the games on Playza skill-based or luck-based?",
    answer: "All Playza games are skill-based — your score and performance, not chance or randomness, determine the outcome.",
  },

  // Payments & Wallet
  {
    question: "How do I deposit ZA into my Playza wallet?",
    answer: "Fund your Playza wallet using local payment methods including bank transfer, mobile money, and card payments.",
  },
  {
    question: "How do I withdraw my ZA earnings from Playza?",
    answer: <>Withdraw your ZA earnings to your local bank account or mobile wallet from the <Link to="/wallet" className="text-primary hover:underline font-black">Playza Wallet page</Link>.</>,
  },
  {
    question: "How long do Playza withdrawals take?",
    answer: "Playza processes withdrawal requests within 24–48 hours for verified accounts.",
  },
  {
    question: "What is the minimum amount I can withdraw from Playza?",
    answer: <>Playza has a minimum withdrawal threshold — check your <Link to="/wallet" className="text-primary hover:underline font-black">Wallet page</Link> for the current minimum in ZA. Playza sets a minimum withdrawal amount to ensure efficient payment processing.</>,
  },

  // Referral System
  {
    question: "How does the Playza referral programme work?",
    answer: "Share your unique referral link with friends. When they sign up and verify, you earn up to ZA 500 per referral.",
  },
  {
    question: "How much can I earn from Playza referrals?",
    answer: "You can earn up to ZA 500 for every verified user who signs up through your referral link — with no limit on referrals.",
  },
  {
    question: "How do I find and share my Playza referral link?",
    answer: <>Log in to Playza, go to the <Link to="/referral" className="text-primary hover:underline font-black">Referral page</Link>, copy your unique link, and share it via WhatsApp, social media, or SMS.</>,
  },
  {
    question: "When do I get paid my Playza referral bonus?",
    answer: "Your referral bonus is credited to your ZA wallet as soon as your referred friend completes account verification.",
  },

  // Trust & Security
  {
    question: "Is Playza legit or a scam?",
    answer: "Playza is a legitimate skill-based gaming platform — real users, real competitions, real ZA payouts.",
  },
  {
    question: "How does Playza ensure fair play?",
    answer: "Playza uses skill-based matching, anti-cheat systems, and identical game conditions for all players to ensure fair competition.",
  },
  {
    question: "Is my money and personal data safe on Playza?",
    answer: "Yes — Playza uses encrypted payment processing and secure data storage to protect your account and funds.",
  },
  {
    question: "What age do I need to be to play on Playza?",
    answer: "You must be 18 years or older to create a Playza account and participate in paid competitions.",
  },
  {
    question: "How do I contact Playza support?",
    answer: <>You can reach Playza support through the in-app help section, live chat, or email from your <Link to="/profile" className="text-primary hover:underline font-black">account dashboard</Link>.</>,
  },
  {
    question: "Does Playza use bots or fake players?",
    answer: "No — all players on Playza are real, verified humans. No bots, no fake accounts in competitions.",
  }
];

const AccordionItem = ({ item, isOpen, onClick, icon }: { item: FAQItem; isOpen: boolean; onClick: () => void; icon: React.ReactNode }) => {
  return (
    <div className={`glass-card overflow-hidden transition-all duration-300 border ${isOpen ? 'border-primary/50 bg-primary/5 shadow-lg shadow-primary/5' : 'border-border bg-card/50 hover:bg-card dark:border-white/5 dark:bg-white/5 dark:hover:bg-white/10'}`}>
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between p-4 md:p-6 text-left focus:outline-none"
      >
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-xl transition-colors ${isOpen ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground dark:bg-white/5 dark:text-slate-400'}`}>
            {icon}
          </div>
          <h3 className={`text-sm md:text-base font-black uppercase tracking-tight ${isOpen ? 'text-primary' : 'text-foreground/90'}`}>
            {item.question}
          </h3>
        </div>
        <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : 'text-muted-foreground dark:text-slate-500'}`} />
      </button>
      
      <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
        <div className="p-4 md:p-6 pt-0 border-t border-border dark:border-white/5">
          <div className="text-sm text-foreground/80 dark:text-slate-300 leading-relaxed font-medium">
            {item.answer}
          </div>
        </div>
      </div>
    </div>
  );
};

const FAQ = () => {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  const categories = [
    { name: "Getting Started", range: [0, 9], icon: <Zap className="w-5 h-5" /> },
    { name: "Gameplay", range: [9, 14], icon: <Layout className="w-5 h-5" /> },
    { name: "Payments & Wallet", range: [14, 18], icon: <Wallet className="w-5 h-5" /> },
    { name: "Referral System", range: [18, 22], icon: <Users className="w-5 h-5" /> },
    { name: "Trust & Security", range: [22, 28], icon: <Shield className="w-5 h-5" /> },
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
          "text": typeof f.answer === 'string' ? f.answer : "Visit Playza for details."
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
          <p className="text-[10px] md:text-xs text-primary font-black uppercase tracking-[0.3em]">
            PLAYZA GAMES
          </p>
          <h1 className="text-xl md:text-4xl font-black uppercase tracking-tighter text-foreground italic leading-none">
            FAQs
          </h1>
          <p className="text-[8px] md:text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-80">
            Power by Ariyo Lab
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
                    icon={cat.icon}
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
