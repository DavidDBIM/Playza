// ── Stale chunk auto-recovery ────────────────────────────────────────────────
//
// What's happening: every route in App.tsx is `React.lazy(() => import(...))`,
// which Vite compiles into a separate JS file with a content hash in its
// name (e.g. Registration-Bz5RUvuS.js). Each new deploy generates fresh
// hashes and deletes the old chunk files from the server.
//
// If someone has a tab open from BEFORE a new deploy went out, their copy
// of index.html still references the OLD hashed filenames. When they
// navigate to a lazy-loaded route, the browser tries to fetch that old
// chunk — which no longer exists on the server. Most SPA hosting setups
// respond to that missing-file request with the app's own index.html
// (so client-side routing keeps working for real page loads), which the
// browser correctly refuses to execute as a JS module — hence "Expected a
// JavaScript-or-Wasm module script but the server responded with a MIME
// type of text/html".
//
// This isn't a bug in any one page's code — it can happen to any lazy
// route after any deploy, for anyone who had the site open across that
// deploy. The fix is standard for Vite + React Router apps: catch the
// specific error, and reload once to fetch the current index.html (which
// points at the current chunk hashes). A sessionStorage flag stops it
// from looping forever if the reload doesn't actually fix things (e.g. a
// genuine network outage).
const STALE_CHUNK_PATTERNS = [
  /Failed to fetch dynamically imported module/i,
  /Importing a module script failed/i,
  /error loading dynamically imported module/i,
];

function looksLikeStaleChunkError(message: unknown): boolean {
  if (typeof message !== "string") return false;
  return STALE_CHUNK_PATTERNS.some((p) => p.test(message));
}

function reloadOnce() {
  const key = "playza_stale_chunk_reload_at";
  const lastReload = Number(sessionStorage.getItem(key) ?? 0);
  const now = Date.now();
  // Don't reload more than once every 10 seconds — if it's still failing
  // after a fresh reload, it's a real outage, not a stale-cache problem,
  // and reloading on a loop would just hammer the server.
  if (now - lastReload < 10_000) return;
  sessionStorage.setItem(key, String(now));
  window.location.reload();
}

export function installStaleChunkReload() {
  window.addEventListener("error", (event) => {
    if (looksLikeStaleChunkError(event.message)) reloadOnce();
  });
  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason;
    const message = typeof reason === "string" ? reason : reason?.message;
    if (looksLikeStaleChunkError(message)) reloadOnce();
  });
}