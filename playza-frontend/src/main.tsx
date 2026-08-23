import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router";
import ScrollToTop from "./components/ScrollToTop";
import { QueryClientProvider } from "@tanstack/react-query";
import { RegistrationProvider } from "./context/RegistrationContext";
import { HelmetProvider } from "react-helmet-async";

import { queryClient } from "./lib/queryClient";
import { installStaleChunkReload } from "./lib/staleChunkReload";

// See lib/staleChunkReload.ts for why this exists — in short, it recovers
// automatically from "Failed to fetch dynamically imported module" errors
// that show up when someone has a tab open from before the latest deploy
// and then navigates to a lazy-loaded route whose JS chunk no longer
// exists on the server.
installStaleChunkReload();

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <RegistrationProvider>
        <BrowserRouter>
          <ScrollToTop />
          <App />
        </BrowserRouter>
      </RegistrationProvider>
    </QueryClientProvider>
  </HelmetProvider>
);