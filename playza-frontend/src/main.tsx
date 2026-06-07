import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router";
import ScrollToTop from "./components/ScrollToTop";
import { QueryClientProvider } from "@tanstack/react-query";
import { RegistrationProvider } from "./context/RegistrationContext";
import { HelmetProvider } from "react-helmet-async";

import { queryClient } from "./lib/queryClient";

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
