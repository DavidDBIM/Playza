import { useState, useEffect, useRef, useCallback } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Play,
  Swords,
  Trophy,
  ArrowRight,
  Users
} from "lucide-react";
import { Link } from "react-router";
import { games } from "@/data/games";
import { motion, AnimatePresence } from "motion/react";

const tournamentGame = games.find((g) => g.mode === "Tournament") || games[1];
const newReleaseGame = games.find((g) => g.badge === "NEW" || g.category === "Arcade") || games[1];

const slides = [
  {
    id: 1,
    badge: "Welcome to Playza",
    title: "Master Your Skills",
    subtitle: "Earn Real Rewards",
    description: "Compete with global players in high-stakes arcade challenges.",
    primaryAction: { label: "Play Now", href: "/games" },
    secondaryAction: null,
    gradient: "from-blue-900/40 via-primary/20 to-transparent",
    image: "/hero.png",
    icon: <Play size={24} className="text-primary" />,
    accent: "var(--primary)"
  },
  {
    id: 2,
    badge: "Live Tournament",
    title: tournamentGame.title,
    subtitle: "ZA50k Prize Pool",
    description: `Face off in the championship. Entry: ZA${tournamentGame.entryFee}.`,
    primaryAction: { label: "Enter Arena", href: `/tournaments/${tournamentGame.slug}` },
    secondaryAction: null,
    gradient: "from-green-900/40 via-secondary/20 to-transparent",
    image: tournamentGame.thumbnail,
    icon: <Trophy size={24} className="text-secondary" />,
    accent: "var(--secondary)"
  },
  {
    id: 3,
    badge: "New Release",
    title: newReleaseGame.title,
    subtitle: "Play Today",
    description: `Experience the future of arcade gaming with ${newReleaseGame.title}.`,
    primaryAction: { label: "Launch Game", href: `/games/${newReleaseGame.slug}` },
    secondaryAction: null,
    gradient: "from-purple-900/40 via-accent/20 to-transparent",
    image: newReleaseGame.thumbnail,
    icon: <Swords size={24} className="text-accent" />,
    accent: "var(--accent)"
  },
  {
    id: 4,
    badge: "Squad Rewards",
    title: "Invite Friends",
    subtitle: "Earn ZA5,000 Bonus",
    description: "Share your unique link and earn rewards for every teammate who joins the arena.",
    primaryAction: { label: "Refer Now", href: "/referral" },
    secondaryAction: null,
    gradient: "bg-linear-to-r from-amber-600/20 via-amber-500/10 to-amber-900/20",
    image: null,
    icon: <Users size={24} className="text-amber-500" />,
    accent: "#f59e0b"
  }
];

const HeroBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const slideCount = slides.length;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const goToNext = useCallback(() => {
    setCurrentSlide((prevSlide) => (prevSlide === slideCount - 1 ? 0 : prevSlide + 1));
  }, [slideCount]);

  const goToPrevious = () => {
    setCurrentSlide((prevSlide) => (prevSlide === 0 ? slideCount - 1 : prevSlide - 1));
  };

  useEffect(() => {
    resetTimeout();
    if (!isHovered) {
      timeoutRef.current = setTimeout(goToNext, 8000);
    }
    return () => resetTimeout();
  }, [currentSlide, isHovered, goToNext, resetTimeout]);

  const activeSlide = slides[currentSlide];

  return (
    <section 
      className="relative w-full h-60 md:h-70 lg:h-75 rounded-xl overflow-hidden border border-white/5 bg-slate-950 group select-none shadow-2xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-linear-to-b from-transparent to-black/80 z-10" />
        <div className="stars-bg opacity-30" />
      </div>

      {/* Slides Container */}
      <div className="relative h-full w-full overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 w-full h-full"
          >
            {/* Full Background Image or Gradient Background */}
            {activeSlide.image ? (
              <motion.div 
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 10, ease: "linear" }}
                className="absolute inset-0 w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${activeSlide.image})` }}
              >
                <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]" />
                <div className={`absolute inset-0 bg-linear-to-r ${activeSlide.gradient}`} />
              </motion.div>
            ) : (
              <div className={`absolute inset-0 w-full h-full ${activeSlide.gradient} opacity-40 backdrop-blur-sm`} />
            )}

            {/* Content Layer */}
            <div className={`relative z-20 h-full w-full flex items-center px-8 md:px-16 ${activeSlide.id === 4 ? 'justify-center text-center' : ''}`}>
              <div className={`flex flex-col space-y-3 md:space-y-4 max-w-2xl ${activeSlide.id === 4 ? 'items-center' : ''}`}>
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 md:gap-3"
                >
                  <div className="p-2 md:p-2.5 rounded-xl bg-white/10 border border-white/10 backdrop-blur-xl">
                    {activeSlide.icon}
                  </div>
                  <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-white/80">
                    {activeSlide.badge}
                  </span>
                </motion.div>

                <div className="space-y-1">
                  <motion.h2 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-3xl md:text-5xl font-black font-display text-white leading-tight uppercase tracking-tight"
                  >
                    {activeSlide.title}
                    <span className="block text-2xl md:text-3xl font-medium tracking-tighter italic opacity-90 drop-shadow-lg" style={{ color: activeSlide.accent }}>
                      {activeSlide.subtitle}
                    </span>
                  </motion.h2>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs md:text-base text-slate-300 font-medium max-w-md drop-shadow-md"
                  >
                    {activeSlide.description}
                  </motion.p>
                </div>

                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="pt-2"
                >
                  <Link
                    to={activeSlide.primaryAction.href}
                    className="inline-flex items-center gap-2 px-2 md:px-8 py-2 md:py-3 text-white font-black text-xs md:text-sm uppercase tracking-widest rounded-xl transition-all duration-300 shadow-xl hover:-translate-y-1 active:scale-95"
                    style={{ backgroundColor: activeSlide.accent, boxShadow: `0 10px 20px -5px ${activeSlide.accent}60` }}
                  >
                    {activeSlide.primaryAction.label}
                    <ArrowRight size={18} />
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls */}
      <div className="absolute inset-y-0 left-0 flex items-center pl-2 md:pl-4 z-30">
        <button
          onClick={goToPrevious}
          className="p-2 md:p-3 rounded-2xl bg-black/40 hover:bg-black/60 text-white/50 hover:text-white backdrop-blur-xl border border-white/10 transition-all opacity-0 group-hover:opacity-100"
        >
          <ChevronLeft size={24} />
        </button>
      </div>
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 md:pr-4 z-30">
        <button
          onClick={goToNext}
          className="p-2 md:p-3 rounded-2xl bg-black/40 hover:bg-black/60 text-white/50 hover:text-white backdrop-blur-xl border border-white/10 transition-all opacity-0 group-hover:opacity-100"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Modern Slim Indicators */}
      <div className="absolute bottom-6 right-8 md:right-16 z-30 flex gap-2 md:gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className="group py-2"
          >
            <div className={`h-1 transition-all duration-500 rounded-full ${
              index === currentSlide ? "w-12 bg-white" : "w-4 bg-white/20 hover:bg-white/40"
            }`}>
              {index === currentSlide && (
                <motion.div 
                  initial={{ x: "-100%" }}
                  animate={{ x: "0%" }}
                  transition={{ duration: 5, ease: "linear" }}
                  className="h-full w-full rounded-full"
                  style={{ backgroundColor: activeSlide.accent }}
                />
              )}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};

export default HeroBanner;
