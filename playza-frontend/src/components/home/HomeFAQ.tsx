import React from "react";
import { Link } from "react-router";
import { ChevronDown, HelpCircle, ChevronRight } from "lucide-react";

const homeFaqs = [
  {
    question: "What is Playza and how does it work?",
    answer: "Playza is a competitive skill gaming platform where your ability — not luck — determines your rewards. You sign up for free, choose a game mode (Head-to-Head, Solo Challenge, Tournament, or Leaderboard), pay a small entry fee in ZA, compete against real players, and the winner takes the pot. Playza is built for players in Nigeria, Ghana, and across West Africa who want to turn their gaming skills into real earnings. No bots, no rigged outcomes — just fair, skill-based competition. Join Playza today and see how good you really are."
  },
  {
    question: "Is Playza free to join?",
    answer: "Signing up on Playza costs nothing. Creating your account is 100% free and takes less than two minutes. Once you're in, you can explore game modes, watch how competitions work, and use any free ZA bonuses from our referral or welcome programmes. When you're ready to compete for earnings, you'll use ZA — Playza's reward currency — to enter challenges. There are no hidden charges or subscription fees. Start free, play smart, earn real rewards."
  },
  {
    question: "Can I really earn money playing games on Playza?",
    answer: "Yes, Playza is a legitimate skill-gaming platform where skilled players earn real ZA rewards. It's not gambling — your performance determines your outcome. Players who invest time in improving their skills, choosing the right game modes, and competing consistently build up their ZA balance and withdraw it. Playza operates transparently with real players and fair matchmaking. Think of it like chess tournaments or e-sports leagues — the best players earn. If you're genuinely skilled and strategic, Playza rewards that."
  },
  {
    question: "Is Playza available in Nigeria and Ghana?",
    answer: "Playza is built specifically with West African players in mind. The platform is fully live in Nigeria and Ghana, with Benin and other West African markets joining soon. The interface is optimised for mobile data conditions common in the region, and the ZA reward system is designed to work with local payment methods. Whether you're in Lagos, Accra, or Cotonou, Playza gives you a fair shot at earning from your gaming skills. More countries are being added regularly — your region could be next."
  },
  {
    question: "What devices can I use to play on Playza?",
    answer: "Playza is a web-based platform that runs directly in your browser — no app download needed. It works on Android and iOS smartphones, tablets, and desktop or laptop computers. The platform is mobile-first, meaning it's optimised for the way most Nigerian and Ghanaian players game — on their phones, often on mobile data. Pages are lightweight and load fast even on 3G connections. Simply open playza.games in Chrome, Firefox, or Safari and you're good to go."
  },
  {
    question: "How do I withdraw my ZA earnings from Playza?",
    answer: "Withdrawing your ZA is straightforward. Head to your Wallet page, click 'Withdraw', enter the amount you want to withdraw, and select your destination — bank account or mobile money wallet. Withdrawals are processed within a set timeframe displayed in your account. You must meet the minimum withdrawal threshold and your account must be fully verified before your first withdrawal. Playza processes withdrawals as quickly as possible to make sure you get your earnings without delay."
  },
  {
    question: "How does the Playza referral programme work?",
    answer: "Playza's referral programme lets you earn ZA just by spreading the word. Every Playza account has a unique referral link you can find on your Referral page. Share your link with friends, family, or your social media followers. When someone signs up using your link and completes account verification, you earn ZA — up to ZA 500 per verified user you bring in. There's no cap on how many people you can refer. The more people you bring in who verify and play, the more you earn. Referrals stack."
  },
  {
    question: "Is my money and personal data safe on Playza?",
    answer: "Playza takes your security seriously. All payment transactions are processed through encrypted, secure payment gateways. Your personal data is stored securely and is never shared with third parties without your consent. Your account is protected with password authentication, and Playza recommends enabling any additional verification features available. Your ZA wallet balance is tracked in real time so you can always see exactly what you have. If you ever notice suspicious activity on your account, contact Playza support immediately."
  }
];

interface HomeFAQItem {
  question: string;
  answer: string;
}

const HomeAccordionItem = ({ faq, isOpen, onClick }: { faq: HomeFAQItem, isOpen: boolean, onClick: () => void }) => {
  return (
    <div className={`glass-card overflow-hidden transition-all duration-300 border ${isOpen ? 'border-primary/40 bg-primary/5' : 'border-border bg-card/50 hover:bg-card dark:border-white/5 dark:bg-white/5 dark:hover:bg-white/10'}`}>
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between p-5 text-left focus:outline-none"
      >
        <h3 className={`text-xs md:text-sm font-black uppercase tracking-tight ${isOpen ? 'text-primary' : 'text-foreground/90'}`}>
          {faq.question}
        </h3>
        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : 'text-muted-foreground dark:text-slate-500'}`} />
      </button>
      <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
        <div className="p-5 pt-0 border-t border-border dark:border-white/5">
          <p className="text-xs md:text-sm text-muted-foreground font-medium leading-relaxed dark:text-slate-400">
            {faq.answer}
          </p>
        </div>
      </div>
    </div>
  );
};

const HomeFAQ = () => {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  return (
    <section className="px-2 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/10">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight italic text-foreground">
              Frequently <span className="text-primary">Asked</span>
            </h2>
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground dark:text-slate-500">Quick answers to common questions</p>
          </div>
        </div>
        <Link 
          to="/faq" 
          className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1 hover:underline underline-offset-4 bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20"
        >
          View All <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {homeFaqs.map((faq, index) => (
          <HomeAccordionItem 
            key={index} 
            faq={faq} 
            isOpen={openIndex === index}
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
          />
        ))}
      </div>

      <div className="text-center pt-4">
        <Link
          to="/faq"
          className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-muted border border-border text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary hover:border-primary/30 transition-all hover:scale-105 dark:bg-white/5 dark:border-white/10 dark:text-slate-400"
        >
          Visit our full Help Center for 30+ more answers
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  );
};

export default HomeFAQ;
