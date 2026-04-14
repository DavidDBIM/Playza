import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router";
import ScrollToTop from "./components/ScrollToTop";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RegistrationProvider } from "./context/RegistrationContext";

// NOTE: AuthProvider and ToastProvider live inside App.tsx — do NOT duplicate here.
// Duplicate providers cause double auth fetches and cascading re-renders on each navigation.

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false, // prevents background refetch from slowing tab switches
    },
  },
});

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
