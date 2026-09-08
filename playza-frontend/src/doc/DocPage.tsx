import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Menu, X, ChevronRight, ChevronLeft, BookOpen } from "lucide-react";
import SEO from "@/components/SEO";
import { DOCS_NAV, DOCS_FLAT } from "@/doc/nav";
import { getDocContent, getWelcomeContent } from "@/doc/loadContent";

// No logo / "back to Playza" header here — the app's global Header and
// NavFooter (see App.tsx) already wrap every page including this one, so
// repeating that chrome just doubled up navigation and made the page feel
// like a separate app bolted on rather than a normal part of this site.
// This is just the doc-specific sidebar (sections/pages) plus content,
// sitting in the same content area every other page uses.
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
    <div className="max-w-5xl mx-auto px-2 md:px-0 py-4">
      <SEO title={`${pageTitle} — Playza Docs`} description="Official Playza documentation" url={`/doc${section ? `/${section}/${slug}` : ""}`} />

      {/* Mobile: doc-section toggle only (page-level nav already has its own menu) */}
      <div className="lg:hidden flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary" />
          <span className="text-xs font-black uppercase tracking-widest text-foreground">Documentation</span>
        </div>
        <button onClick={() => setSidebarOpen((v) => !v)} className="p-1.5 text-foreground">
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <div className="lg:flex lg:gap-8">
        {/* Doc sidebar */}
        <aside
          className={`lg:w-56 lg:shrink-0 lg:block lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto ${
            sidebarOpen ? "block" : "hidden"
          } mb-4 lg:mb-0 pb-4 lg:pb-0 border-b lg:border-b-0 border-border`}
        >
          <nav className="space-y-5">
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
        <main className="flex-1 min-w-0">
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
