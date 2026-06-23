import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      // Do NOT retry by default — a failed request (e.g. 401) should not
      // automatically re-fire and trigger the refresh interceptor again.
      // Individual queries can override this with their own retry option.
      retry: false,
      refetchOnWindowFocus: false, // prevents background refetch from slowing tab switches
      refetchOnReconnect: false,   // prevents refetch storm when tab comes back online
    },
  },
});
