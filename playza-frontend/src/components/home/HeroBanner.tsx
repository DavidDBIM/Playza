import { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Trophy,
  ArrowRight,
  Users,
  Zap,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router";
import { games } from "@/data/games";
import { useBannerSlides } from "@/hooks/useBannerSlides";
import type { BannerSlide } from "@/api/banner.api";

const tournamentGame = games.find((g) => g.mode === "Tournament") || games[1];
const newReleaseGame =
  games.find((g) => g.badge === "NEW" || g.category === "Arcade") || games[1];

const FALLBACK_SLIDES = [
  {
    id: "fallback-1",
    tag: "WELCOME",
    title: "WELCOME TO PLAYZA",
    subtitle: "THE ULTIMATE GAMING HUB",
    description: "Join thousands of players in the most rewarding arcade experience.",
    button_text: "Join Now",
    button_link: "/registration",
    image_url: "/hero.webp",
    color: "from-amber-500 to-yellow-900",
    accent: "bg-amber-500",
    is_active: true,
    sort_order: 0,
  },
  {
    id: "fallback-2",
    tag: "PLATFORM",
    title: "MASTER YOUR SKILLS",
    subtitle: "EARN REAL PZA REWARDS",
    description: "Compete in high-stakes arcade challenges and win.",
    button_text: "Start Playing",
    button_link: "/games",
    image_url: "/hero.webp",
    color: "from-blue-600 to-indigo-900",
    accent: "bg-blue-500",
    is_active: true,
    sort_order: 1,
  },
  {
    id: "fallback-3",
    tag: "CHAMPIONSHIP",
    title: tournamentGame.title.toUpperCase(),
    subtitle: "ZA50,000 PRIZE POOL",
    description: `Join the arena. Entry fee only ZA${tournamentGame.entryFee}.`,
    button_text: "Enter Arena",
    button_link: `/tournaments/${tournamentGame.slug}`,
    image_url: tournamentGame.thumbnail,
    color: "from-emerald-600 to-teal-900",
    accent: "bg-emerald-500",
    is_active: true,
    sort_order: 2,
  },
  {
    id: "fallback-4",
    tag: "NEW DROP",
    title: newReleaseGame.title.toUpperCase(),
    subtitle: "THE FUTURE OF ARCADE",
    description: "Experience next-gen gameplay mechanics today.",
    button_text: "Launch Game",
    button_link: `/games/${newReleaseGame.slug}`,
    image_url: newReleaseGame.thumbnail,
    color: "from-violet-600 to-purple-900",
    accent: "bg-violet-500",
    is_active: true,
    sort_order: 3,
  },
  {
    id: "fallback-5",
    tag: "NETWORK",
    title: "EXPAND YOUR SQUAD",
    subtitle: "EARN ZA5,000 PER FRIEND",
    description: "Refer teammates and grow your legacy together.",
    button_text: "Refer Friends",
    button_link: "/referral",
    image_url: null,
    color: "from-orange-600 to-red-900",
    accent: "bg-orange-500",
    is_active: true,
    sort_order: 4,
  },
];

const tagIcon = (tag: string) => {
  const t = tag.toLowerCase();
  if (t.includes("welcome") || t.includes("new")) return <Sparkles size={14} />;
  if (t.includes("champion") || t.includes("tournament") || t.includes("trophy"))
    return <Trophy size={14} />;
  if (t.includes("drop") || t.includes("zap") || t.includes("speed"))
    return <Zap size={14} />;
  if (t.includes("network") || t.includes("refer") || t.includes("friend"))
    return <Users size={14} />;
  return <Play size={14} />;
};

const HeroBanner = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const { data: apiSlides, isLoading } = useBannerSlides();

  const slides: BannerSlide[] =
    apiSlides && apiSlides.length > 0
      ? apiSlides.filter((s) => s.is_active).sort((a, b) => a.sort_order - b.sort_order)
      : (FALLBACK_SLIDES as BannerSlide[]);

  const scrollToIndex = (index: number) => {
    if (!scrollRef.current) return;
    const width = scrollRef.current.clientWidth;
    scrollRef.current.scrollTo({ left: index * width, behavior: "smooth" });
    setActiveIndex(index);
  };

  useEffect(() => {
    setActiveIndex(0);
    scrollRef.current?.scrollTo({ left: 0, behavior: "instant" });
  }, [slides.length]);

  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const interval = setInterval(() => {
      scrollToIndex((activeIndex + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeIndex, isPaused, slides.length]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const width = scrollRef.current.clientWidth;
    const newIndex = Math.round(scrollRef.current.scrollLeft / width);
    if (newIndex !== activeIndex) setActiveIndex(newIndex);
  };

  const next = () => scrollToIndex((activeIndex + 1) % slides.length);
  const prev = () => scrollToIndex((activeIndex - 1 + slides.length) % slides.length);

  if (isLoading) {
    return (
      <section className="relative w-full">
        <div className="h-52 md:h-64 rounded-2xl bg-slate-900 animate-pulse border border-white/5" />
      </section>
    );
  }

  return (
    <section
      className="relative w-full group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory h-52 md:h-64 rounded-2xl border border-white/5 bg-slate-950"
      >
        {slides.map((slide) => (
          <div
            key={slide.id}
            className="shrink-0 w-full h-full snap-start relative overflow-hidden flex items-center"
          >
            {/* Full background image OR gradient fallback */}
            {slide.image_url ? (
              <>
                <img
                  src={slide.image_url}
                  alt={slide.title}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover z-0"
                />
                {/* Dark overlay so text stays readable over any image */}
                <div className="absolute inset-0 bg-linear-to-r from-slate-950/95 via-slate-950/60 to-slate-950/20 z-10" />
              </>
            ) : (
              <>
                <div className={`absolute inset-0 bg-linear-to-br ${slide.color} opacity-30`} />
                <div className="absolute inset-0 bg-linear-to-r from-slate-950 via-slate-950/80 to-transparent z-10" />
                <div className={`absolute top-0 right-0 w-1/2 h-full ${slide.accent} opacity-5 blur-[100px] rounded-full translate-x-1/4 -translate-y-1/4`} />
              </>
            )}

            {/* Content */}
            <div className="relative z-20 px-6 md:px-12 flex flex-col items-start gap-1 md:gap-2">
              <div className="flex items-center gap-2 mb-1">
                <div
                  className={`px-2 py-0.5 ${slide.accent} rounded-md text-[9px] font-black text-white uppercase tracking-widest`}
                >
                  {slide.tag}
                </div>
                <div className="h-px w-8 bg-white/20" />
              </div>

              <div className="space-y-0.5 md:space-y-1">
                <h2 className="text-[10px] md:text-sm lg:text-lg font-black text-white uppercase tracking-tighter leading-tight italic">
                  {slide.title}
                </h2>
                <p className="text-[10px] md:text-xs lg:text-sm font-bold text-slate-300 uppercase tracking-wide leading-none">
                  {slide.subtitle}
                </p>
                <p className="text-[9px] md:text-[10px] lg:text-xs text-slate-400 font-bold max-w-xs md:max-w-sm leading-tight">
                  {slide.description}
                </p>
              </div>

              <div className="mt-2 flex items-center gap-4">
                <Link
                  to={slide.button_link}
                  className={`flex items-center gap-2 px-4 md:px-6 py-2 ${slide.accent} text-white font-black text-[10px] md:text-xs uppercase tracking-widest rounded-lg`}
                >
                  {tagIcon(slide.tag)}
                  {slide.button_text}
                  <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Nav arrows */}
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

      {/* Dots */}
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
