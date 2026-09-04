import { useParams, Link } from "react-router";
import { ArrowLeft, Calendar, Eye, User, Newspaper } from "lucide-react";
import { useBlogPost } from "@/hooks/useBlog";
import SEO from "@/components/SEO";
import { Skeleton } from "@/components/ui/skeleton";
import { linkifyText } from "@/utils/linkify";

const formatDate = (iso: string | null) => {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading, isError } = useBlogPost(slug);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-2 md:px-0 py-4 space-y-4">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="max-w-3xl mx-auto px-2 md:px-0 py-16 flex flex-col items-center text-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Newspaper className="text-3xl text-primary/40" />
        </div>
        <h1 className="text-lg font-black uppercase tracking-tight">Post not found</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
          This article may have been unpublished or the link is incorrect.
        </p>
        <Link
          to="/"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary font-black text-xs border border-primary/20 hover:bg-primary/20 transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-2 md:px-0 py-4 space-y-5">
      <SEO
        title={post.title}
        description={post.excerpt}
        image={post.cover_image_url || undefined}
        url={`/blog/${post.slug}`}
        type="article"
      />

      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
      </Link>

      {post.cover_image_url && (
        <div className="w-full h-48 md:h-72 rounded-2xl overflow-hidden border border-black/5 dark:border-white/10">
          <img src={post.cover_image_url} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="space-y-2">
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <h1 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <span className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" /> {post.author_name}
          </span>
          {post.published_at && (
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> {formatDate(post.published_at)}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" /> {post.view_count.toLocaleString()} views
          </span>
        </div>
      </div>

      {/* Article body — paragraphs separated by blank lines in the admin editor */}
      <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none space-y-4 text-sm md:text-base leading-relaxed text-slate-700 dark:text-slate-300">
        {post.content.split(/\n\s*\n/).map((paragraph, i) => (
          <p key={i}>{linkifyText(paragraph)}</p>
        ))}
      </div>
    </div>
  );
};

export default BlogPost;
