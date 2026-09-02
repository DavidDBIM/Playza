import { useEffect, useRef } from "react";
import { Link } from "react-router";
import { Newspaper, ArrowRight } from "lucide-react";
import { useBlogPosts } from "@/hooks/useBlog";

const BlogMarquee = () => {
  const { data: posts = [], isLoading } = useBlogPosts(12);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Drag/interaction state — refs so the animation loop (below) always
  // reads the latest value without needing to restart on every change.
  const isDraggingRef = useRef(false);
  const isPausedRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const suppressClickRef = useRef(false);
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-scroll loop — advances scrollLeft continuously and seamlessly
  // wraps back once it passes the first copy of the (duplicated) list.
  // Pauses whenever the user is hovering, dragging, or touch-scrolling.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || posts.length === 0) return;

    let rafId: number;
    const speed = 0.45; // px/frame — roughly matches the old 45s CSS loop

    const tick = () => {
      if (!isDraggingRef.current && !isPausedRef.current) {
        el.scrollLeft += speed;
        const half = el.scrollWidth / 2;
        if (half > 0 && el.scrollLeft >= half) {
          el.scrollLeft -= half;
        }
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [posts.length]);

  const scheduleResume = () => {
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => {
      isPausedRef.current = false;
    }, 1200);
  };

  // Mouse-drag support for desktop — touch devices already get free
  // left/right dragging from native overflow-x scrolling, so this only
  // kicks in for mouse pointers.
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const el = scrollRef.current;
    if (!el) return;
    isDraggingRef.current = true;
    isPausedRef.current = true;
    startXRef.current = e.clientX;
    startScrollLeftRef.current = el.scrollLeft;
    el.setPointerCapture(e.pointerId);
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || e.pointerType !== "mouse") return;
    const el = scrollRef.current;
    if (!el) return;
    el.scrollLeft = startScrollLeftRef.current - (e.clientX - startXRef.current);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || !isDraggingRef.current) return;
    const el = scrollRef.current;
    if (el) {
      const moved = Math.abs(el.scrollLeft - startScrollLeftRef.current);
      // Dragged far enough that this wasn't just a click — suppress the
      // click that follows so it doesn't also navigate into the post.
      suppressClickRef.current = moved > 5;
    }
    isDraggingRef.current = false;
    scheduleResume();
  };

  const handleClickCapture = (e: React.MouseEvent) => {
    if (suppressClickRef.current) {
      e.preventDefault();
      e.stopPropagation();
      suppressClickRef.current = false;
    }
  };

  // Nothing published yet — don't show an empty/broken section on the homepage.
  if (!isLoading && posts.length === 0) return null;

  return (
    <section className="relative py-1 md:py-2 px-2 md:px-0">
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header — matches the HowItWorks section header style */}
        <div className="flex items-center gap-2 md:gap-3 px-1 mb-3">
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <Newspaper className="w-4 h-4 md:w-4.5 md:h-4.5 text-primary" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm md:text-base font-black uppercase tracking-tight">
              From the <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-accent">Blog</span>
            </h2>
            <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 font-medium">
              Tips, updates, and stories from Playza
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex gap-3 overflow-hidden">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-64 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse shrink-0" />
            ))}
          </div>
        ) : (
          <div
            ref={scrollRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onMouseEnter={() => { isPausedRef.current = true; }}
            onMouseLeave={() => { if (!isDraggingRef.current) scheduleResume(); }}
            onTouchStart={() => { isPausedRef.current = true; }}
            onTouchEnd={scheduleResume}
            onClickCapture={handleClickCapture}
            className="relative w-full overflow-x-auto scrollbar-hide flex items-center rounded-2xl mask-horizontal-fade cursor-grab active:cursor-grabbing select-none"
          >
            <div className="flex w-max items-stretch gap-3 py-1">
              {[...posts, ...posts].map((post, i) => (
                <Link
                  key={`${post.id}-${i}`}
                  to={`/blog/${post.slug}`}
                  draggable={false}
                  className="group flex items-center gap-3 w-64 md:w-72 shrink-0 p-2.5 rounded-2xl glass-card border border-black/5 dark:border-white/10 hover:border-primary/30 transition-colors"
                >
                  {/* Small thumbnail — deliberately compact, not a big hero image */}
                  <div className="w-11 h-11 md:w-12 md:h-12 rounded-xl overflow-hidden shrink-0 bg-primary/10 border border-primary/20 flex items-center justify-center">
                    {post.cover_image_url ? (
                      <img
                        src={post.cover_image_url}
                        alt={post.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        draggable={false}
                      />
                    ) : (
                      <Newspaper className="w-4.5 h-4.5 text-primary" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs md:text-sm font-bold leading-tight truncate">
                      {post.title}
                    </h3>
                    <p className="text-[10px] md:text-[11px] text-slate-500 dark:text-slate-400 leading-tight line-clamp-1 mt-0.5">
                      {post.excerpt}
                    </p>
                  </div>

                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default BlogMarquee;