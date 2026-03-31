import { useState, useEffect, useRef } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Play,
  Trophy,
  ArrowRight,
  Users,
  Zap
} from "lucide-react";
import { Link } from "react-router";
import { games } from "@/data/games";

const tournamentGame = games.find((g) => g.mode === "Tournament") || games[1];
const newReleaseGame = games.find((g) => g.badge === "NEW" || g.category === "Arcade") || games[1];

const slides = [
  {
    id: 1,
    tag: "PLATFORM",
    title: "MASTER YOUR SKILLS",
    subtitle: "EARN REAL PZA REWARDS",
    desc: "Compete in high-stakes arcade challenges and win.",
    btn: "Start Playing",
    link: "/games",
    icon: <Play size={14} />,
    color: "from-blue-600 to-indigo-900",
    accent: "bg-blue-500",
    image: "/hero.png"
  },
  {
    id: 2,
    tag: "CHAMPIONSHIP",
    title: tournamentGame.title.toUpperCase(),
    subtitle: "ZA50,000 PRIZE POOL",
    desc: `Join the arena. Entry fee only ZA${tournamentGame.entryFee}.`,
    btn: "Enter Arena",
    link: `/tournaments/${tournamentGame.slug}`,
    icon: <Trophy size={14} />,
    color: "from-emerald-600 to-teal-900",
    accent: "bg-emerald-500",
    image: tournamentGame.thumbnail
  },
  {
    id: 3,
    tag: "NEW DROP",
    title: newReleaseGame.title.toUpperCase(),
    subtitle: "THE FUTURE OF ARCADE",
    desc: "Experience next-gen gameplay mechanics today.",
    btn: "Launch Game",
    link: `/games/${newReleaseGame.slug}`,
    icon: <Zap size={14} />,
    color: "from-violet-600 to-purple-900",
    accent: "bg-violet-500",
    image: newReleaseGame.thumbnail
  },
  {
    id: 4,
    tag: "NETWORK",
    title: "EXPAND YOUR SQUAD",
    subtitle: "EARN ZA5,000 PER FRIEND",
    desc: "Refer teammates and grow your legacy together.",
    btn: "Refer Friends",
    link: "/referral",
    icon: <Users size={14} />,
    color: "from-orange-600 to-red-900",
    accent: "bg-orange-500",
    image: null
  }
];

const HeroBanner = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const scrollToIndex = (index: number) => {
    if (!scrollRef.current) return;
    const width = scrollRef.current.clientWidth;
    scrollRef.current.scrollTo({
      left: index * width,
      behavior: "smooth"
    });
    setActiveIndex(index);
  };

  // Auto-scroll logic
  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      const nextIndex = (activeIndex + 1) % slides.length;
      scrollToIndex(nextIndex);
    }, 5000);

    return () => clearInterval(interval);
  }, [activeIndex, isPaused]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const width = scrollRef.current.clientWidth;
    const newIndex = Math.round(scrollRef.current.scrollLeft / width);
    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  };

  const next = () => scrollToIndex((activeIndex + 1) % slides.length);
  const prev = () => scrollToIndex((activeIndex - 1 + slides.length) % slides.length);

  return (
    <section 
      className="relative w-full group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slider Container */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory h-44 md:h-52 rounded-2xl border border-white/5 bg-slate-950 shadow-2xl"
      >
        {slides.map((slide) => (
          <div 
            key={slide.id}
            className="shrink-0 w-full h-full snap-start relative overflow-hidden flex items-center"
          >
            {/* Background Graphic */}
            <div className={`absolute inset-0 bg-linear-to-br ${slide.color} opacity-20`} />
            <div className="absolute inset-0 bg-linear-to-r from-slate-950 via-slate-950/80 to-transparent z-10" />
            
            {/* Decorative Shapes */}
            <div className={`absolute top-0 right-0 w-1/2 h-full ${slide.accent} opacity-5 blur-[100px] rounded-full translate-x-1/4 -translate-y-1/4`} />
            
            {/* Slide Image - Shaped */}
            {slide.image && (
              <div className="absolute right-4 md:right-12 top-1/2 -translate-y-1/2 w-32 md:w-48 h-28 md:h-36 z-0">
                <div 
                  className="w-full h-full bg-cover bg-center rounded-3xl rotate-6 border border-white/10 shadow-2xl skew-x-3 scale-110 opacity-40 md:opacity-100"
                  style={{ backgroundImage: `url(${slide.image})` }}
                />
              </div>
            )}

            {/* Content Layer */}
            <div className="relative z-20 px-6 md:px-12 flex flex-col items-start gap-1 md:gap-2">
              <div className="flex items-center gap-2 mb-1">
                <div className={`px-2 py-0.5 ${slide.accent} rounded-md text-[8px] md:text-[9px] font-black text-white uppercase tracking-widest`}>
                  {slide.tag}
                </div>
                <div className="h-px w-8 bg-white/20" />
              </div>
              
              <div className="space-y-0.5 md:space-y-1">
                <h2 className="text-sm md:text-lg font-black text-white uppercase tracking-tighter leading-tight italic">
                  {slide.title}
                </h2>
                <p className="text-xs md:text-sm font-bold text-slate-300 uppercase tracking-wide leading-none">
                  {slide.subtitle}
                </p>
                <p className="text-[9px] md:text-xs text-slate-500 font-bold max-w-xs md:max-w-sm leading-tight">
                  {slide.desc}
                </p>
              </div>

              <div className="mt-2 flex items-center gap-4">
                <Link
                  to={slide.link}
                  className={`flex items-center gap-2 px-4 md:px-6 py-2 ${slide.accent} text-white font-black text-[10px] md:text-xs uppercase tracking-widest rounded-lg transition-all hover:scale-105 active:scale-95 shadow-lg shadow-black/20`}
                >
                  {slide.icon}
                  {slide.btn}
                  <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Manual Navigation */}
      <div className="absolute inset-y-0 left-2 flex items-center z-30 pointer-events-none">
        <button
          onClick={prev}
          className="p-1.5 rounded-lg bg-black/40 hover:bg-black/80 text-white/40 hover:text-white backdrop-blur-md border border-white/5 transition-all opacity-0 group-hover:opacity-100 pointer-events-auto"
        >
          <ChevronLeft size={18} />
        </button>
      </div>
      <div className="absolute inset-y-0 right-2 flex items-center z-30 pointer-events-none">
        <button
          onClick={next}
          className="p-1.5 rounded-lg bg-black/40 hover:bg-black/80 text-white/40 hover:text-white backdrop-blur-md border border-white/5 transition-all opacity-0 group-hover:opacity-100 pointer-events-auto"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Pagination Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-30">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToIndex(index)}
            className={`h-1 rounded-full transition-all duration-300 ${
              index === activeIndex ? "w-6 bg-white" : "w-1.5 bg-white/20 hover:bg-white/40"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroBanner;

