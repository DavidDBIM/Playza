import { useEffect, useMemo, useRef } from "react";
import { Link } from "react-router";
import { Newspaper, ArrowRight, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useBlogPosts } from "@/hooks/useBlog";
import { linkifyText } from "@/utils/linkify";

// Below this count there isn't enough content to loop seamlessly — showing
// the same 1-2 posts twice back-to-back just looks like a duplicate post
// bug, so the list only gets doubled (for the infinite auto-scroll) once
// there are enough real posts to make the loop invisible.
const MIN_POSTS_TO_LOOP = 4;

const BlogMarquee = () => {
  const { data: posts = [], isLoading } = useBlogPosts(12);
  const scrollRef = useRef<HTMLDivElement>(null);
  const shouldLoop = posts.length >= MIN_POSTS_TO_LOOP;
  const displayPosts = useMemo(
    () => (shouldLoop ? [...posts, ...posts] : posts),
    [posts, shouldLoop],
  );

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
  // Only runs at all when there are enough posts to loop seamlessly.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !shouldLoop) return;

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
  }, [shouldLoop, posts.length]);

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
    <section className="relative py-3 md:py-4 px-2 md:px-0">
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header — sized to match the HowItWorks section header above it */}
        <div className="flex flex-col items-center text-center mb-4 md:mb-5 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2 md:px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest">
            <Newspaper className="w-3 h-3" />
            Blog
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tighter">
            From the <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-accent">Blog</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm max-w-xl">
            Tips, updates, and stories from Playza.
          </p>
        </div>

        {isLoading ? (
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-72 md:w-80 h-28 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse shrink-0" />
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
            className={`relative w-full overflow-x-auto scrollbar-hide flex items-stretch rounded-2xl select-none cursor-grab active:cursor-grabbing ${
              shouldLoop ? "mask-horizontal-fade" : ""
            }`}
          >
            <div className="flex w-max items-stretch gap-4 py-1 px-1">
              {displayPosts.map((post, i) => (
                <Link
                  key={`${post.id}-${i}`}
                  to={`/blog/${post.slug}`}
                  draggable={false}
                  className="group flex items-center gap-4 w-72 md:w-80 shrink-0 p-3.5 rounded-2xl glass-card border border-black/5 dark:border-white/10 hover:border-primary/30 transition-colors"
                >
                  {/* Thumbnail — bigger than before so the card carries real
                      visual weight next to the How It Works section above it */}
                  <div className="w-16 h-16 md:w-18 md:h-18 rounded-xl overflow-hidden shrink-0 bg-primary/10 border border-primary/20 flex items-center justify-center">
                    {post.cover_image_url ? (
                      <img
                        src={post.cover_image_url}
                        alt={post.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        draggable={false}
                      />
                    ) : (
                      <Newspaper className="w-6 h-6 text-primary" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <h3 className="text-sm md:text-base font-bold leading-tight line-clamp-1">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-snug line-clamp-2">
                        {linkifyText(post.excerpt)}
                      </p>
                    )}
                    {post.published_at && (
                      <p className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 font-medium pt-0.5">
                        <Calendar className="w-3 h-3" />
                        {formatDistanceToNow(new Date(post.published_at), { addSuffix: true })}
                      </p>
                    )}
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
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