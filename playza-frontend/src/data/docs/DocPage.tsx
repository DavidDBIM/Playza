import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Menu, X, ArrowLeft, ChevronRight, ChevronLeft } from "lucide-react";
import SEO from "@/components/SEO";
import { DOCS_NAV, DOCS_FLAT } from "@/data/docs/nav";
import { getDocContent, getWelcomeContent } from "@/data/docs/loadContent";

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

  // Prev/next across the whole flattened doc list, for the footer nav.
  const flatIndex = DOCS_FLAT.findIndex((d) => d.section.slug === section && d.page.slug === slug);
  const prevEntry = flatIndex > 0 ? DOCS_FLAT[flatIndex - 1] : null;
  const nextEntry = flatIndex >= 0 && flatIndex < DOCS_FLAT.length - 1 ? DOCS_FLAT[flatIndex + 1] : null;

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

  return (
    <div className="min-h-screen bg-background">
      <SEO title={`${pageTitle} — Playza Docs`} description="Official Playza documentation" url={`/doc${section ? `/${section}/${slug}` : ""}`} />

      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-background/95 backdrop-blur border-b border-border">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.webp" alt="Playza" className="h-6 w-auto object-contain" />
          <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Docs</span>
        </Link>
        <button onClick={() => setSidebarOpen((v) => !v)} className="p-2 text-foreground">
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <div className="max-w-6xl mx-auto lg:flex lg:gap-8 lg:px-6 lg:py-8">
        {/* Sidebar */}
        <aside
          className={`lg:w-64 lg:shrink-0 lg:block lg:sticky lg:top-8 lg:h-[calc(100vh-4rem)] lg:overflow-y-auto ${
            sidebarOpen ? "block" : "hidden"
          } border-b lg:border-b-0 border-border bg-background`}
        >
          <div className="hidden lg:flex items-center gap-2 mb-6 px-1">
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo.webp" alt="Playza" className="h-7 w-auto object-contain" />
              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Docs</span>
            </Link>
          </div>

          <Link
            to="/"
            className="hidden lg:flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors mb-6 px-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Playza
          </Link>

          <nav className="px-4 lg:px-1 py-3 lg:py-0 space-y-5">
            <Link
              to="/doc"
              onClick={() => setSidebarOpen(false)}
              className={`block text-sm font-black uppercase tracking-wide ${
                isWelcome ? "text-primary" : "text-foreground hover:text-primary"
              } transition-colors`}
            >
              Welcome
            </Link>

            {DOCS_NAV.map((sec) => (
              <div key={sec.slug}>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">{sec.title}</p>
                <ul className="space-y-1.5 border-l border-border pl-3">
                  {sec.pages.map((page) => {
                    const isActive = section === sec.slug && slug === page.slug;
                    return (
                      <li key={page.slug}>
                        <Link
                          to={`/doc/${sec.slug}/${page.slug}`}
                          onClick={() => setSidebarOpen(false)}
                          className={`block text-sm font-semibold py-0.5 transition-colors ${
                            isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {page.title}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0 px-4 py-6 lg:px-0 lg:py-0">
          <article className="prose prose-sm md:prose-base dark:prose-invert max-w-none prose-headings:font-black prose-headings:tracking-tight prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-table:text-sm prose-img:rounded-xl">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ href, children, ...props }) => {
                  if (!href) return <a {...props}>{children}</a>;
                  const isInternalDoc = href.startsWith("/doc/") || href === "/doc";
                  if (isInternalDoc) {
                    return (
                      <Link to={href} className="text-primary no-underline hover:underline">
                        {children}
                      </Link>
                    );
                  }
                  const isExternal = /^https?:\/\//.test(href) || href.startsWith("mailto:");
                  return (
                    <a
                      href={href}
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noopener noreferrer" : undefined}
                      className="text-primary no-underline hover:underline"
                    >
                      {children}
                    </a>
                  );
                },
              }}
            >
              {content}
            </ReactMarkdown>
          </article>

          {/* Prev / Next */}
          {!isWelcome && (prevEntry || nextEntry) && (
            <div className="flex items-center justify-between gap-3 mt-10 pt-6 border-t border-border">
              {prevEntry ? (
                <button
                  onClick={() => navigate(`/doc/${prevEntry.section.slug}/${prevEntry.page.slug}`)}
                  className="flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-primary transition-colors text-left"
                >
                  <ChevronLeft className="w-4 h-4 shrink-0" />
                  <span className="truncate">{prevEntry.page.title}</span>
                </button>
              ) : (
                <span />
              )}
              {nextEntry && (
                <button
                  onClick={() => navigate(`/doc/${nextEntry.section.slug}/${nextEntry.page.slug}`)}
                  className="flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-primary transition-colors text-right ml-auto"
                >
                  <span className="truncate">{nextEntry.page.title}</span>
                  <ChevronRight className="w-4 h-4 shrink-0" />
                </button>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DocPage;