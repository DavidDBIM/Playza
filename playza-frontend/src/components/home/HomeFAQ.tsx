import React from "react";
import { Link } from "react-router";
import { ChevronDown, HelpCircle, ChevronRight } from "lucide-react";

const homeFaqs = [
  {
    question: "What is Playza and how does it work?",
    answer: <>Playza is a skill-based gaming platform where you compete in games and earn real ZA rewards. <Link to="/registration" className="text-primary hover:underline font-black">Sign up</Link>, pick a game mode, and start winning.</>
  },
  {
    question: "Is Playza free to join?",
    answer: "Yes, joining Playza is completely free. You only spend ZA when you enter a paid game or challenge."
  },
  {
    question: "Can I really earn money playing games on Playza?",
    answer: "Yes — Playza pays out real ZA rewards based on your gaming skill, not chance."
  },
  {
    question: "How do I deposit ZA into my Playza wallet?",
    answer: "Fund your Playza wallet using local payment methods including bank transfer, mobile money, and card payments."
  },
  {
    question: "How do I withdraw my ZA earnings from Playza?",
    answer: <>Withdraw your ZA earnings to your local bank account or mobile wallet from the <Link to="/wallet" className="text-primary hover:underline font-black">Playza Wallet page</Link>.</>
  }
];

interface HomeFAQItem {
  question: string;
  answer: React.ReactNode;
}

const HomeAccordionItem = ({ faq, isOpen, onClick }: { faq: HomeFAQItem, isOpen: boolean, onClick: () => void }) => {
  return (
    <div className={`glass-card overflow-hidden transition-all duration-300 border ${isOpen ? 'border-primary/40 bg-primary/5' : 'border-border bg-card/50 hover:bg-card dark:border-white/5 dark:bg-white/5 dark:hover:bg-white/10'}`}>
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between px-4 py-3 text-left focus:outline-none"
      >
        <h3 className={`text-xs md:text-sm font-black uppercase tracking-tight ${isOpen ? 'text-primary' : 'text-foreground/90'}`}>
          {faq.question}
        </h3>
        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : 'text-muted-foreground dark:text-slate-500'}`} />
      </button>
      <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
        <div className="px-5 py-3 pt-2 border-t border-border dark:border-white/5">
          <div className="text-xs md:text-sm text-muted-foreground font-medium leading-relaxed dark:text-slate-400">
            {faq.answer}
          </div>
        </div>
      </div>
    </div>
  );
};

const HomeFAQ = () => {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  return (
    <section className="px-2 space-y-3">
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

      <div className="grid grid-cols-1 gap-2">
        {homeFaqs.map((faq, index) => (
          <HomeAccordionItem 
            key={index} 
            faq={faq} 
            isOpen={openIndex === index}
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
          />
        ))}
      </div>
    </section>
  );
};

export default HomeFAQ;
