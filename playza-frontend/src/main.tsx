import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router";
import ScrollToTop from "./components/ScrollToTop";
import { QueryClientProvider } from "@tanstack/react-query";
import { RegistrationProvider } from "./context/RegistrationContext";

// NOTE: AuthProvider and ToastProvider live inside App.tsx — do NOT duplicate here.
// Duplicate providers cause double auth fetches and cascading re-renders on each navigation.

import { queryClient } from "./lib/queryClient";

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <RegistrationProvider>
      <BrowserRouter>
        <ScrollToTop />
        <App />
      </BrowserRouter>
    </RegistrationProvider>
  </QueryClientProvider>
);
