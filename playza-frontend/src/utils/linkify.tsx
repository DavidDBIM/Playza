import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";

// Turns any URL or bare domain (facebook.com, https://x.com/foo, www.site.io)
// found inside admin-entered free text into a real, solid button, leaving
// everything else exactly as written. Used anywhere admin-authored text
// (tournament descriptions, blog post bodies, etc.) is rendered so admins
// can safely drop plain links in without needing to hand-write markup.
const LINK_PATTERN = /((?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,62}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,62}[a-zA-Z0-9])?)+(?:\/[^\s]*)?)/g;

export function linkifyText(text: string): ReactNode {
  // split() with a single capturing group interleaves the matches into the
  // result: [text, match, text, match, ..., text] — so odd indices are
  // always the matched links, no regex.lastIndex statefulness to worry about.
  const parts = text.split(LINK_PATTERN);
  return parts.map((part, i) => {
    if (!part) return null;
    if (i % 2 === 0) return <span key={i}>{part}</span>;
    // Strip trailing punctuation that's clearly sentence punctuation, not
    // part of the URL (e.g. "...visit facebook.com." shouldn't link the dot)
    const trailingMatch = part.match(/[),.!?;:'"]+$/);
    const trailing = trailingMatch ? trailingMatch[0] : "";
    const core = trailing ? part.slice(0, -trailing.length) : part;
    if (!core || !/[a-zA-Z]{2,}$/.test(core.replace(/\/[^\s]*$/, ""))) return <span key={i}>{part}</span>;
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
    return (
      // Kept inline (not block) so it stays valid inside a <p> wherever
      // this renders — a block element inside a <p> is invalid HTML that
      // browsers silently "fix" by splitting the paragraph, which broke
      // things exactly like the earlier nested-anchor bug did.
      <span key={i}>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer nofollow"
          onClick={e => e.stopPropagation()}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 mx-0.5 rounded-lg text-xs font-black uppercase tracking-wide align-middle bg-primary text-primary-foreground shadow-md hover:brightness-110 hover:shadow-lg active:scale-95 transition-all"
        >
          {label}
          <ArrowUpRight size={13} strokeWidth={2.75} />
        </a>
        {trailing}
      </span>
    );
  });
}
