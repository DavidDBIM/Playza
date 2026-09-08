import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Menu, X, ChevronRight, ChevronLeft, BookOpen } from "lucide-react";
import SEO from "@/components/SEO";
import { DOCS_NAV, DOCS_FLAT } from "@/doc/nav";
import { getDocContent, getWelcomeContent } from "@/doc/loadContent";

const DocPage = () => {
  const { section, slug } = useParams<{ section?: string; slug?: string }>();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isWelcome = !section && !slug;
  const activeSection = DOCS_NAV.find((s) => s.slug === section);
  const activePage = activeSection?.pages.find((p) => p.slug === slug);

  const content = isWelcome
    ? getWelcomeContent()
    : section && slug
      ? getDocContent(section, slug)
      : null;

  const pageTitle = isWelcome ? "Welcome to Playza" : activePage?.title || "Documentation";

  const flatIndex = DOCS_FLAT.findIndex((d) => d.section.slug === section && d.page.slug === slug);
  const prevEntry = flatIndex > 0 ? DOCS_FLAT[flatIndex - 1] : null;
  const nextEntry = flatIndex >= 0 && flatIndex < DOCS_FLAT.length - 1 ? DOCS_FLAT[flatIndex + 1] : null;

  const goTo = (path: string) => {
    navigate(path);
    setSidebarOpen(false);
  };

  if (content === null && !isWelcome) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="text-2xl font-black uppercase">Page not found</h1>
        <p className="text-sm text-muted-foreground">This documentation page doesn't exist.</p>
        <Link to="/doc" className="inline-block text-primary font-bold text-sm hover:underline">
          ← Back to docs home
        </Link>
      </div>
    );
  }

  const SidebarNav = () => (
    <nav className="space-y-6">
      <button
        onClick={() => goTo("/doc")}
        className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-black uppercase tracking-wide transition-colors ${
          isWelcome ? "bg-primary/15 text-primary" : "text-foreground/80 hover:bg-muted dark:hover:bg-white/5"
        }`}
      >
        <BookOpen className="w-3.5 h-3.5 shrink-0" /> Welcome
      </button>

      {DOCS_NAV.map((sec) => (
        <div key={sec.slug}>
          <p className="px-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5">{sec.title}</p>
          <ul className="space-y-0.5">
            {sec.pages.map((page) => {
              const isActive = section === sec.slug && slug === page.slug;
              return (
                <li key={page.slug}>
                  <button
                    onClick={() => goTo(`/doc/${sec.slug}/${page.slug}`)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                      isActive
                        ? "bg-primary/15 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-white/5"
                    }`}
                  >
                    {page.title}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <div className="max-w-5xl mx-auto px-2 md:px-0 pb-16 space-y-4">
      <SEO title={`${pageTitle} — Playza Docs`} description="Official Playza documentation" url={`/doc${section ? `/${section}/${slug}` : ""}`} />

      {/* Hero header — same glass-card + glow treatment as the FAQ page */}
      <div className="relative overflow-hidden glass-card p-5 md:p-6 rounded-2xl border border-primary/20 flex items-center gap-4">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-64 h-64 bg-primary/25 blur-[100px] rounded-full pointer-events-none" />
        <div className="relative shrink-0 size-12 md:size-14 rounded-2xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
          <BookOpen className="w-6 h-6 md:w-7 md:h-7" />
        </div>
        <div className="relative min-w-0">
          <p className="text-[9px] md:text-[10px] text-primary font-black uppercase tracking-[0.25em] mb-0.5">Documentation</p>
          <h1 className="text-lg md:text-2xl font-black uppercase tracking-tight text-foreground italic truncate">
            {pageTitle}
          </h1>
        </div>
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          className="lg:hidden ml-auto shrink-0 p-2 rounded-xl bg-muted dark:bg-white/5 text-foreground"
        >
          {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile sidebar (collapsible) */}
      {sidebarOpen && (
        <div className="lg:hidden glass-card rounded-2xl border border-border dark:border-white/5 p-4">
          <SidebarNav />
        </div>
      )}

      <div className="lg:flex lg:gap-4 lg:items-start">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block lg:w-64 lg:shrink-0 lg:sticky lg:top-4">
          <div className="glass-card rounded-2xl border border-border dark:border-white/5 p-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
            <SidebarNav />
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">
          <div className="glass-card rounded-2xl border border-border dark:border-white/5 p-5 md:p-8">
            {!isWelcome && activeSection && (
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">
                {activeSection.title} <ChevronRight className="inline w-3 h-3 mx-0.5" /> {activePage?.title}
              </p>
            )}

            <article className="prose prose-sm md:prose-base dark:prose-invert max-w-none prose-headings:font-black prose-headings:tracking-tight prose-a:text-primary prose-a:font-semibold prose-a:no-underline hover:prose-a:underline prose-table:text-sm prose-img:rounded-xl prose-blockquote:border-primary/40 prose-blockquote:not-italic prose-code:text-primary prose-code:before:content-none prose-code:after:content-none prose-strong:text-foreground">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  a: ({ href, children, ...props }) => {
                    if (!href) return <a {...props}>{children}</a>;
                    const isInternalDoc = href.startsWith("/doc/") || href === "/doc";
                    if (isInternalDoc) {
                      return <Link to={href}>{children}</Link>;
                    }
                    const isExternal = /^https?:\/\//.test(href) || href.startsWith("mailto:");
                    return (
                      <a href={href} target={isExternal ? "_blank" : undefined} rel={isExternal ? "noopener noreferrer" : undefined}>
                        {children}
                      </a>
                    );
                  },
                }}
              >
                {content}
              </ReactMarkdown>
            </article>

            {!isWelcome && (prevEntry || nextEntry) && (
              <div className="flex items-center justify-between gap-3 mt-10 pt-6 border-t border-border dark:border-white/5">
                {prevEntry ? (
                  <button
                    onClick={() => navigate(`/doc/${prevEntry.section.slug}/${prevEntry.page.slug}`)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors text-left"
                  >
                    <ChevronLeft className="w-4 h-4 shrink-0" />
                    <span className="truncate max-w-40">{prevEntry.page.title}</span>
                  </button>
                ) : (
                  <span />
                )}
                {nextEntry && (
                  <button
                    onClick={() => navigate(`/doc/${nextEntry.section.slug}/${nextEntry.page.slug}`)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors text-right ml-auto"
                  >
                    <span className="truncate max-w-40">{nextEntry.page.title}</span>
                    <ChevronRight className="w-4 h-4 shrink-0" />
                  </button>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DocPage;