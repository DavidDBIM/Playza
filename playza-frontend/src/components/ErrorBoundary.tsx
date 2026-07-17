import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Optional label shown in the fallback UI, e.g. "Chess Match" */
  label?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

// Without this, an uncaught error anywhere in the render tree unmounts the
// ENTIRE app with no fallback — the user just sees a blank white screen and
// there's no way to tell what broke. This catches it, shows a readable error
// message + a way to recover, and logs it so it's visible in the console
// even on production builds.
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[ErrorBoundary${this.props.label ? ` — ${this.props.label}` : ""}]`, error, info.componentStack);

    // A lazy-loaded chunk (e.g. ChessArena, ChessTournamentPage) can fail to
    // load if the browser has an old cached index.html pointing at a chunk
    // filename that no longer exists after a new deploy. Suspense doesn't
    // catch this — it surfaces here as a thrown error. One reload fetches
    // the current chunk map and self-heals, so do that automatically
    // instead of leaving the user stuck on a blank/error screen. Guarded so
    // it can only fire once per session to avoid a reload loop if the error
    // is something else entirely.
    const isChunkLoadError = /dynamically imported module|Loading chunk|ChunkLoadError|Failed to fetch/i.test(error.message);
    if (isChunkLoadError && !sessionStorage.getItem("chunk-reload-attempted")) {
      sessionStorage.setItem("chunk-reload-attempted", "1");
      window.location.reload();
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-6 text-center">
          <span className="text-4xl">⚠️</span>
          <p className="font-black text-foreground text-lg">
            {this.props.label ? `${this.props.label} hit a snag` : "Something went wrong"}
          </p>
          <p className="text-sm text-foreground/50 max-w-sm">
            {this.state.error?.message || "An unexpected error occurred while loading this page."}
          </p>
          <div className="flex gap-3 mt-2">
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-4 py-2 rounded-xl text-sm font-black text-foreground"
              style={{ background: "color-mix(in srgb, var(--foreground) 8%, transparent)", border: "1px solid color-mix(in srgb, var(--foreground) 12%, transparent)" }}
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-xl text-sm font-black text-white"
              style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
