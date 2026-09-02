import { useEffect, useRef, useState } from "react";
import { FaWallet } from "react-icons/fa";
import { FaTrophy, FaGamepad } from "react-icons/fa6";
import { ArrowRight, Hand, Sparkle, Swords, Target, Trophy as TrophyLucide } from "lucide-react";

const MODES = [
  { icon: Swords, label: "H2H", desc: "Duel head-to-head", tone: "green" as const },
  { icon: Target, label: "Solo Earn", desc: "Chase high scores", tone: "blue" as const },
  { icon: TrophyLucide, label: "Tournament", desc: "Join live competitions", tone: "amber" as const },
];

const STEPS = [
  {
    num: "01",
    icon: FaWallet,
    tone: "blue" as const,
    title: "Fund Your Wallet",
    desc: "Top up instantly via Bank Transfer, Card, or USSD — your balance is ready to play in seconds.",
  },
  {
    num: "02",
    icon: null,
    tone: "green" as const,
    title: "Pick Your Mode",
    desc: "Choose how you want to play",
    modes: MODES,
  },
  {
    num: "03",
    icon: FaGamepad,
    tone: "purple" as const,
    title: "Compete & Climb",
    desc: "Play skill-based games in real time. Your score, speed, and survival decide your spot on the leaderboard.",
  },
  {
    num: "04",
    icon: FaTrophy,
    tone: "amber" as const,
    title: "Win & Cash Out",
    desc: "Winnings land in your wallet the moment the game ends. Withdraw instantly, anytime.",
  },
];

const TONE_STYLES = {
  blue: {
    border: "border-blue-500/20",
    badge: "bg-blue-600",
    iconBox: "bg-blue-100 dark:bg-blue-500/15",
    icon: "text-blue-600 dark:text-blue-400",
    sparkle: "text-blue-300",
    arrowBg: "bg-blue-100 dark:bg-blue-500/20",
    arrowIcon: "text-blue-600 dark:text-blue-400",
    dot: "bg-blue-600",
    modeBg: "bg-blue-50 dark:bg-blue-500/10",
  },
  green: {
    border: "border-green-500/20",
    badge: "bg-green-600",
    iconBox: "bg-green-100 dark:bg-green-500/15",
    icon: "text-green-600 dark:text-green-400",
    sparkle: "text-green-300",
    arrowBg: "bg-green-100 dark:bg-green-500/20",
    arrowIcon: "text-green-600 dark:text-green-400",
    dot: "bg-green-600",
    modeBg: "bg-green-50 dark:bg-green-500/10",
  },
  purple: {
    border: "border-purple-500/20",
    badge: "bg-purple-600",
    iconBox: "bg-purple-100 dark:bg-purple-500/15",
    icon: "text-purple-600 dark:text-purple-400",
    sparkle: "text-purple-300",
    arrowBg: "bg-purple-100 dark:bg-purple-500/20",
    arrowIcon: "text-purple-600 dark:text-purple-400",
    dot: "bg-purple-600",
    modeBg: "bg-purple-50 dark:bg-purple-500/10",
  },
  amber: {
    border: "border-amber-500/20",
    badge: "bg-amber-500",
    iconBox: "bg-amber-100 dark:bg-amber-500/15",
    icon: "text-amber-600 dark:text-amber-400",
    sparkle: "text-amber-300",
    arrowBg: "bg-amber-100 dark:bg-amber-500/20",
    arrowIcon: "text-amber-600 dark:text-amber-400",
    dot: "bg-amber-500",
    modeBg: "bg-amber-50 dark:bg-amber-500/10",
  },
};

const HowItWorks = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Track which card is centered so the dot pagination stays in sync with
  // whatever the user has swiped to.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      const cardWidth = el.scrollWidth / STEPS.length;
      const index = Math.round(el.scrollLeft / cardWidth);
      setActiveIndex(Math.min(Math.max(index, 0), STEPS.length - 1));
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToIndex = (index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const clamped = Math.min(Math.max(index, 0), STEPS.length - 1);
    const cardWidth = el.scrollWidth / STEPS.length;
    el.scrollTo({ left: cardWidth * clamped, behavior: "smooth" });
  };

  return (
    <section className="relative py-4 md:py-6 px-2 md:px-0">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-full bg-primary/5 blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="flex flex-col items-center text-center mb-5 md:mb-6 space-y-2">
          <div className="inline-flex items-center px-2 md:px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest">
            Process
          </div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tighter">
            How It <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-accent">Works</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm max-w-xl">
            Learn how to fund your wallet, play, compete, and win amazing rewards on Playza.
          </p>
        </div>

        {/* Swipeable step cards — one mostly-full-width card at a time, with
            a peek of the next, instead of a 4-up grid. */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory gap-4 px-1 pb-1"
        >
          {STEPS.map((step) => {
            const Icon = step.icon;
            const tone = TONE_STYLES[step.tone];
            return (
              <div
                key={step.num}
                className={`relative shrink-0 snap-center w-[86%] sm:w-72 rounded-3xl border-2 ${tone.border} bg-white dark:bg-slate-900 p-6 flex flex-col items-center text-center gap-4 overflow-hidden`}
              >
                {/* Number badge */}
                <div className={`absolute top-3 left-3 w-9 h-9 rounded-xl ${tone.badge} text-white flex items-center justify-center font-black text-sm shadow-md`}>
                  {step.num}
                </div>

                {/* Decorative sparkles */}
                <Sparkle className={`absolute top-16 right-8 w-3.5 h-3.5 ${tone.sparkle} opacity-70`} />
                <Sparkle className={`absolute bottom-24 left-8 w-2.5 h-2.5 ${tone.sparkle} opacity-50`} />

                <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full ${tone.iconBox} flex items-center justify-center mt-4`}>
                  {Icon && <Icon className={`text-3xl md:text-4xl ${tone.icon}`} />}
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-base md:text-lg font-black tracking-tight uppercase">{step.title}</h4>
                  <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{step.desc}</p>
                </div>

                {/* Sub-mode list — only "Pick Your Mode" has this */}
                {step.modes && (
                  <div className="w-full space-y-2">
                    {step.modes.map((mode) => {
                      const ModeIcon = mode.icon;
                      const modeTone = TONE_STYLES[mode.tone];
                      return (
                        <div
                          key={mode.label}
                          className={`flex items-center gap-2 ${modeTone.modeBg} rounded-xl px-3 py-2 text-left`}
                        >
                          <ModeIcon className={`w-4 h-4 shrink-0 ${modeTone.icon}`} />
                          <span className="text-xs md:text-sm font-bold shrink-0">{mode.label}</span>
                          <span className="text-[11px] md:text-xs text-slate-500 dark:text-slate-400 truncate">
                            {mode.desc}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Next-step arrow */}
                <button
                  onClick={() => scrollToIndex(STEPS.indexOf(step) + 1)}
                  disabled={STEPS.indexOf(step) === STEPS.length - 1}
                  className={`w-10 h-10 rounded-full ${tone.arrowBg} flex items-center justify-center mt-1 disabled:opacity-30 disabled:cursor-default transition-opacity`}
                  aria-label="Next step"
                >
                  <ArrowRight className={`w-4 h-4 ${tone.arrowIcon}`} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Dot pagination */}
        <div className="flex items-center justify-center gap-1.5 mt-4">
          {STEPS.map((step, i) => (
            <button
              key={step.num}
              onClick={() => scrollToIndex(i)}
              aria-label={`Go to step ${i + 1}`}
              className={`rounded-full transition-all ${
                i === activeIndex
                  ? `w-4 h-2 ${TONE_STYLES[STEPS[activeIndex].tone].dot}`
                  : "w-2 h-2 bg-slate-300 dark:bg-white/20"
              }`}
            />
          ))}
        </div>

        {/* Swipe hint */}
        <div className="flex items-center justify-center gap-1.5 mt-2 text-slate-400 dark:text-slate-500">
          <Hand className="w-3.5 h-3.5" />
          <span className="text-[11px] md:text-xs font-medium">Swipe to explore all steps</span>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;