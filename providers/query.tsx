// /providers/query.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";

// 모듈 스코프 싱글톤(핵심)
let singletonClient: QueryClient | null = null;

function getQueryClient() {
  if (!singletonClient) {
    singletonClient = new QueryClient({
      defaultOptions: {
        queries: {
          // 뒤로가기/하이드레이션 직후 재요청 방지
          refetchOnMount: false,
          refetchOnWindowFocus: false,
          refetchOnReconnect: false,
          retry: false,
          staleTime: 10 * 60 * 1000,
          gcTime: 60 * 60 * 1000,
        },
      },
      // (선택) 디버깅 원하면 주석 해제
      // logger: {
      //   log: (...a) => console.log("[RQ]", ...a),
      //   warn: (...a) => console.warn("[RQ]", ...a),
      //   error: (...a) => console.error("[RQ]", ...a),
      // },
    });
  }
  return singletonClient;
}

export function QueryProvider({ children }: { children: ReactNode }) {
  // useState로 “한 번만” 주입 → 라우팅/HMR에도 동일 인스턴스 유지
  const [client] = useState(getQueryClient);
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
