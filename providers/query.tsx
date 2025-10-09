"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// (선택) Devtools
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // v5 옵션 이름
            staleTime: 3 * 60 * 1000, // 3분 동안 fresh
            gcTime: 15 * 60 * 1000, // 15분 후 GC (v4의 cacheTime 대체)
            retry: 1, // 실패 재시도 1회 (원하면 조정)
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
