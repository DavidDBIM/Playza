import { useState, useMemo, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Menu, X, ChevronDown, ChevronRight, ChevronLeft, Search, ExternalLink } from "lucide-react";
import SEO from "@/components/SEO";
import { DOCS_NAV, DOCS_FLAT } from "@/doc/nav";
import { getDocContent, getWelcomeContent } from "@/doc/loadContent";

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

const DocPage = () => {
  const { section, slug } = useParams<{ section?: string; slug?: string }>();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSection, setExpandedSection] = useState<string | null>(section || null);

  useEffect(() => {
    if (section) setExpandedSection(section);
  }, [section]);

  const isWelcome = !section && !slug;
  const activeSection = DOCS_NAV.find((s) => s.slug === section);
  const activePage = activeSection?.pages.find((p) => p.slug === slug);

  const content = isWelcome
    ? getWelcomeContent()
    : section && slug
      ? getDocContent(section, slug)
      : null;

  // The page header already shows the title, so drop the markdown's own
  // leading "# <title>" — otherwise it appeared twice in a row.
  const displayContent = content ? content.replace(/^\s*#\s+.+\n+/, "") : content;

  const pageTitle = isWelcome ? "Welcome to Playza" : activePage?.title || "Documentation";

  // "On This Page" — every ## heading in the current page, scroll-linked
  // via the same slug used to id the rendered heading below.
  const tocItems = useMemo(() => {
    if (!displayContent) return [];
    const matches = [...displayContent.matchAll(/^##\s+(.+)$/gm)];
    return matches.map((m) => ({ text: m[1].trim(), id: slugify(m[1].trim()) }));
  }, [displayContent]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return DOCS_FLAT.filter((d) => d.page.title.toLowerCase().includes(q) || d.section.title.toLowerCase().includes(q)).slice(0, 8);
  }, [searchQuery]);

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
    <nav className="space-y-1">
      <button
        onClick={() => goTo("/doc")}
        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
          isWelcome ? "text-primary bg-primary/10" : "text-foreground/80 hover:bg-muted dark:hover:bg-white/5"
        }`}
      >
        Welcome
      </button>

      {DOCS_NAV.map((sec) => {
        const isOpen = expandedSection === sec.slug;
        return (
          <div key={sec.slug}>
            <button
              onClick={() => setExpandedSection(isOpen ? null : sec.slug)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-bold text-foreground/80 hover:bg-muted dark:hover:bg-white/5 transition-colors"
            >
              {sec.title}
              <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>
            {isOpen && (
              <ul className="ml-3 pl-3 border-l border-border dark:border-white/10 space-y-0.5 py-1">
                {sec.pages.map((page) => {
                  const isActive = section === sec.slug && slug === page.slug;
                  return (
                    <li key={page.slug}>
                      <button
                        onClick={() => goTo(`/doc/${sec.slug}/${page.slug}`)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-md text-sm transition-colors ${
                          isActive
                            ? "text-primary font-bold bg-primary/10"
                            : "text-muted-foreground hover:text-foreground font-medium"
                        }`}
                      >
                        {page.title}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </nav>
  );

  return (
    <div className="-mx-1.5 md:-mx-4 -mt-4 md:-mt-8">
      <SEO title={`${pageTitle} — Playza Docs`} description="Official Playza documentation" url={`/doc${section ? `/${section}/${slug}` : ""}`} />

      {/* Top bar */}
      <div className="sticky top-16 z-20 flex items-center gap-3 px-4 md:px-6 h-14 border-b border-border dark:border-white/10 bg-background/95 backdrop-blur">
        <button onClick={() => setSidebarOpen((v) => !v)} className="lg:hidden p-1.5 -ml-1.5 text-foreground">
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <span className="font-black text-sm uppercase tracking-tight shrink-0">Playza Docs</span>

        <div className="relative flex-1 max-w-sm ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documentation..."
            className="w-full h-9 pl-9 pr-3 rounded-lg bg-muted dark:bg-white/5 border border-border dark:border-white/10 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
          />
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-background border border-border dark:border-white/10 rounded-xl shadow-xl overflow-hidden z-30">
              {searchResults.map((r) => (
                <button
                  key={`${r.section.slug}-${r.page.slug}`}
                  onClick={() => {
                    goTo(`/doc/${r.section.slug}/${r.page.slug}`);
                    setSearchQuery("");
                  }}
                  className="w-full text-left px-3.5 py-2.5 hover:bg-muted dark:hover:bg-white/5 transition-colors border-b border-border dark:border-white/5 last:border-0"
                >
                  <p className="text-sm font-bold">{r.page.title}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{r.section.title}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        <Link
          to="/"
          className="hidden sm:flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-primary transition-colors shrink-0"
        >
          Website <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      <div className="flex">
        {/* Left sidebar */}
        <aside
          className={`${sidebarOpen ? "block" : "hidden"} lg:block fixed lg:sticky top-[7.5rem] lg:top-[7.5rem] left-0 z-20 w-full sm:w-72 lg:w-64 h-[calc(100vh-7.5rem)] shrink-0 overflow-y-auto border-r border-border dark:border-white/10 bg-background px-4 py-5`}
        >
          <SidebarNav />
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0 px-5 md:px-10 py-8 max-w-3xl">
          {!isWelcome && activeSection && (
            <p className="text-xs font-bold text-muted-foreground mb-2">{activeSection.title}</p>
          )}
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-6">{pageTitle}</h1>

          <article className="prose prose-sm md:prose-base dark:prose-invert max-w-none
              prose-headings:font-black prose-headings:tracking-tight prose-headings:scroll-mt-[7.5rem]
              prose-h2:mt-10 prose-h2:mb-3 prose-h2:pb-2 prose-h2:border-b prose-h2:border-border dark:prose-h2:border-white/10 prose-h2:text-xl md:prose-h2:text-2xl
              prose-h3:mt-6 prose-h3:mb-2 prose-h3:text-base md:prose-h3:text-lg
              prose-p:leading-relaxed prose-p:my-4 prose-p:text-foreground/85
              prose-a:text-primary prose-a:font-semibold prose-a:no-underline hover:prose-a:underline
              prose-ul:my-4 prose-ol:my-4 prose-li:my-1.5 prose-li:leading-relaxed marker:text-primary/60
              prose-table:text-sm prose-th:font-black prose-th:uppercase prose-th:tracking-wide prose-th:text-xs
              prose-img:rounded-xl
              prose-blockquote:border-l-4 prose-blockquote:border-primary/40 prose-blockquote:bg-primary/5 prose-blockquote:rounded-r-lg prose-blockquote:py-2 prose-blockquote:not-italic prose-blockquote:font-medium
              prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-semibold prose-code:before:content-none prose-code:after:content-none
              prose-pre:bg-black/40 dark:prose-pre:bg-black/40
              prose-strong:text-foreground prose-strong:font-black
              prose-hr:border-border dark:prose-hr:border-white/10">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h2: ({ children, ...props }) => {
                  const text = String(children);
                  return <h2 id={slugify(text)} {...props}>{children}</h2>;
                },
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
              {displayContent}
            </ReactMarkdown>
          </article>

          {!isWelcome && (prevEntry || nextEntry) && (
            <div className="flex items-center justify-between gap-3 mt-10 pt-6 border-t border-border dark:border-white/10">
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
        </main>

        {/* Right "On This Page" TOC */}
        {tocItems.length > 0 && (
          <aside className="hidden xl:block w-56 shrink-0 sticky top-[7.5rem] h-[calc(100vh-7.5rem)] overflow-y-auto px-4 py-8">
            <p className="text-xs font-black uppercase tracking-widest text-foreground mb-3">On This Page</p>
            <ul className="space-y-2 border-l border-border dark:border-white/10">
              {tocItems.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="block pl-3 -ml-px border-l-2 border-transparent hover:border-primary text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
                  >
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </div>
    </div>
  );
};

export default DocPage;