import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";

// Turns any URL or bare domain (facebook.com, https://x.com/foo, www.site.io)
// found inside admin-entered free text into a real, solid button, leaving
// everything else exactly as written. Used anywhere admin-authored text
// (tournament descriptions, blog post bodies, etc.) is rendered so admins
// can safely drop plain links in without needing to hand-write markup.
const LINK_PATTERN = /((?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,62}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,62}[a-zA-Z0-9])?)+(?:\/[^\s]*)?)/g;

// Shared by both render modes below — finds the link, strips trailing
// sentence punctuation, and resolves a safe href + short display label.
// Returns null when a part isn't actually a usable link (falls back to
// plain text at the call site).
function resolvePart(part: string): { href: string; label: string; trailing: string } | null {
  const trailingMatch = part.match(/[),.!?;:'"]+$/);
  const trailing = trailingMatch ? trailingMatch[0] : "";
  const core = trailing ? part.slice(0, -trailing.length) : part;
  // Isolate just the domain to sanity-check it ends in real letters (not
  // digits/punctuation). Strip the protocol and "www." first, THEN cut
  // at the first remaining slash — stripping trailing "/path" directly
  // on the full string (as this used to) also eats the "//" in
  // "https://", leaving "https:" behind, which always fails the check
  // and silently fell back to plain text for every https:// link.
  const withoutScheme = core.replace(/^https?:\/\//i, "").replace(/^www\./i, "");
  const domainOnly = withoutScheme.split("/")[0];
  if (!core || !/[a-zA-Z]{2,}$/.test(domainOnly)) return null;
  const href = /^https?:\/\//i.test(core) ? core : `https://${core}`;
  // Show where the link actually goes rather than a generic "Click me" —
  // on a platform that moves real money, a link that doesn't disclose
  // its destination reads as suspicious rather than convenient. Falls
  // back to the raw text if the URL is somehow unparseable.
  let label = core;
  try {
    const hostname = new URL(href).hostname.replace(/^www\./, "");
    label = hostname.length > 28 ? `${hostname.slice(0, 26)}…` : hostname;
  } catch {
    // keep raw core as label
  }
  return { href, label, trailing };
}

export function linkifyText(text: string): ReactNode {
  // split() with a single capturing group interleaves the matches into the
  // result: [text, match, text, match, ..., text] — so odd indices are
  // always the matched links, no regex.lastIndex statefulness to worry about.
  const parts = text.split(LINK_PATTERN);
  return parts.map((part, i) => {
    if (!part) return null;
    if (i % 2 === 0) return <span key={i}>{part}</span>;
    const resolved = resolvePart(part);
    if (!resolved) return <span key={i}>{part}</span>;
    const { href, label, trailing } = resolved;
    return (
      // Kept inline (not block) so it stays valid inside a <p> wherever
      // this renders — a block element inside a <p> is invalid HTML that
      // browsers silently "fix" by splitting the paragraph, which broke
      // things exactly like the earlier nested-anchor bug did.
      //
      // Sized in em units (not fixed px/rem Tailwind classes) so the
      // button scales with whatever font-size it's dropped into — a
      // fixed-size button rendered inside a small, line-clamped preview
      // card (e.g. a compact tournament card at 10-11px) would overflow
      // its container regardless of how the surrounding text truncates,
      // since a flex button doesn't respect -webkit-line-clamp the way
      // plain text does. Scaling with the parent keeps it proportional
      // everywhere without needing a special case per call site.
      <span key={i}>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer nofollow"
          onClick={e => e.stopPropagation()}
          className="inline-flex items-center gap-[0.3em] mx-[0.1em] rounded-[0.5em] font-black uppercase tracking-wide align-middle bg-primary text-primary-foreground shadow-md hover:brightness-110 hover:shadow-lg active:scale-95 transition-all"
          style={{ fontSize: "0.85em", padding: "0.4em 0.7em" }}
        >
          {label}
          <ArrowUpRight className="w-[1em] h-[1em]" strokeWidth={2.75} />
        </a>
        {trailing}
      </span>
    );
  });
}

// For tight, space-constrained spots — compact card previews, line-clamped
// snippets — where a padded button would overflow or look disproportionate
// no matter how it's sized (a button doesn't truncate; a -webkit-line-clamp
// container around one just clips it mid-shape). Renders the same detected
// link as plain underlined text instead, so it's still real and clickable,
// it just behaves like ordinary text for truncation/wrapping purposes.
export function linkifyTextCompact(text: string): ReactNode {
  const parts = text.split(LINK_PATTERN);
  return parts.map((part, i) => {
    if (!part) return null;
    if (i % 2 === 0) return <span key={i}>{part}</span>;
    const resolved = resolvePart(part);
    if (!resolved) return <span key={i}>{part}</span>;
    const { href, label, trailing } = resolved;
    return (
      <span key={i}>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer nofollow"
          onClick={e => e.stopPropagation()}
          className="font-bold underline underline-offset-2 text-primary"
        >
          {label}
        </a>
        {trailing}
      </span>
    );
  });
}