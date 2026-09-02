import { FaWallet } from "react-icons/fa";
import { FaTrophy, FaGamepad } from "react-icons/fa6";
import { MdStadium } from "react-icons/md";

const STEPS = [
  {
    num: "01",
    icon: FaWallet,
    tone: "primary" as const,
    title: "Fund Your Wallet",
    desc: "Top up instantly via Bank Transfer, Card, or USSD — your balance is ready to play in seconds.",
  },
  {
    num: "02",
    icon: MdStadium,
    tone: "secondary" as const,
    title: "Pick Your Mode",
    desc: "Go H2H and duel another player head-to-head, play Solo Earn to chase a high score, or join a live Tournament.",
  },
  {
    num: "03",
    icon: FaGamepad,
    tone: "primary" as const,
    title: "Compete & Climb",
    desc: "Play skill-based games in real time. Your score, speed, and survival decide your spot on the leaderboard.",
  },
  {
    num: "04",
    icon: FaTrophy,
    tone: "secondary" as const,
    title: "Win & Cash Out",
    desc: "Winnings land in your wallet the moment the game ends. Withdraw instantly, anytime.",
  },
];

const TONE_STYLES = {
  primary: {
    iconBox: "bg-primary/10 border-primary/20",
    icon: "text-primary",
  },
  secondary: {
    iconBox: "bg-secondary/10 border-secondary/20",
    icon: "text-secondary",
  },
};

const HowItWorks = () => {
  return (
    <section className="relative py-4 md:py-6 px-2 md:px-0">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-full bg-primary/5 blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="flex flex-col items-center text-center mb-4 md:mb-5 space-y-2">
          <div className="inline-flex items-center px-2 md:px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest">
            Process
          </div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tighter">
            How It <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-accent">Works</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm max-w-xl">
            Playza is a skill gaming platform — fund your wallet, compete in H2H duels, Solo Earn challenges, or live
            Tournaments, and cash out your winnings instantly.
          </p>
        </div>

        {/* Auto-sliding marquee — a single row that loops on its own instead
            of a grid that stacks to 4 full-height cards on mobile. */}
        <div className="relative w-full overflow-hidden flex items-center rounded-2xl mask-horizontal-fade">
          <div className="flex w-max items-stretch gap-4 py-1 howitworks-marquee">
            {[...STEPS, ...STEPS].map((step, i) => {
              const Icon = step.icon;
              const tone = TONE_STYLES[step.tone];
              return (
                <div
                  key={`${step.num}-${i}`}
                  className="referral-card w-64 md:w-72 shrink-0 p-5 md:p-6 flex flex-col items-center text-center gap-4 border border-black/5 dark:border-white/5 rounded-2xl bg-white/50 dark:bg-slate-900/50"
                >
                  <div className="relative shrink-0">
                    <div
                      className={`relative w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center border ${tone.iconBox}`}
                    >
                      <Icon className={`text-2xl md:text-3xl ${tone.icon}`} />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 step-badge backdrop-blur-md text-[10px]">
                      {step.num}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-sm md:text-base font-bold tracking-tight uppercase">{step.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;