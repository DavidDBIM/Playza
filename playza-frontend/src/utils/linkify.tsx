import type { ReactNode } from "react";

// Turns any URL or bare domain (facebook.com, https://x.com/foo, www.site.io)
// found inside admin-entered free text into a clickable, underlined link,
// leaving everything else exactly as written. Used anywhere admin-authored
// text (tournament descriptions, blog post bodies, etc.) is rendered so
// admins can safely drop plain links in without needing to hand-write
// markup.
//
// This used to render as a solid button, but a button doesn't behave like
// text — it doesn't respect -webkit-line-clamp truncation, so it overflowed
// small preview cards no matter how it was sized. Plain underlined text
// behaves like ordinary text everywhere (truncates, wraps, clamps
// correctly), so one style now covers both the compact and full contexts.
const LINK_PATTERN = /((?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,62}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,62}[a-zA-Z0-9])?)+(?:\/[^\s]*)?)/g;

function resolvePart(part: string): { href: string; label: string; trailing: string } | null {
  const trailingMatch = part.match(/[),.!?;:'"]+$/);
  const trailing = trailingMatch ? trailingMatch[0] : "";
  const core = trailing ? part.slice(0, -trailing.length) : part;
  // Isolate just the domain to sanity-check it ends in real letters (not
  // digits/punctuation). Strip the protocol and "www." first, THEN cut
  // at the first remaining slash — stripping trailing "/path" directly
  // on the full string also eats the "//" in "https://", leaving "https:"
  // behind, which always fails the check and silently fell back to plain
  // text for every https:// link.
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

function renderLinkified(text: string): ReactNode {
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

export function linkifyText(text: string): ReactNode {
  return renderLinkified(text);
}

// Kept as a separate export since existing call sites (compact/line-clamped
// previews) import it by this name — both now render identically.
export function linkifyTextCompact(text: string): ReactNode {
  return renderLinkified(text);
}