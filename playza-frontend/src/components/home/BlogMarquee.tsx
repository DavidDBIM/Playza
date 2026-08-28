import { Link } from "react-router";
import { Newspaper, ArrowRight } from "lucide-react";
import { useBlogPosts } from "@/hooks/useBlog";

const BlogMarquee = () => {
  const { data: posts = [], isLoading } = useBlogPosts(12);

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
          <div className="relative w-full overflow-hidden flex items-center rounded-2xl mask-horizontal-fade">
            <div className="flex w-max items-stretch gap-3 py-1 blog-marquee">
              {[...posts, ...posts].map((post, i) => (
                <Link
                  key={`${post.id}-${i}`}
                  to={`/blog/${post.slug}`}
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