// lib/api.ts
export interface ApiResponse<T = unknown> {
  status: number;
  success: boolean;
  data?: T;
  error?: {
    errorCode?: string;
    errorMessage?: string;
  };
}

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export type RequestOptions = {
  params?: Record<string, unknown>;
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal; // ✅ React Query 취소 신호
  cache?: RequestCache; // next fetch 옵션
  next?: { revalidate?: number } & Record<string, any>;
};

function toQueryString(params?: Record<string, unknown>) {
  if (!params) return "";
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    if (Array.isArray(v)) {
      if (!v.length) continue;
      usp.set(k, v.map(String).join(",")); // CSV 직렬화
      continue;
    }
    if (typeof v === "boolean") {
      usp.set(k, v ? "true" : "false");
      continue;
    }
    usp.set(k, String(v));
  }
  const qs = usp.toString();
  return qs ? `?${qs}` : "";
}

async function decodeResponse<T>(res: Response): Promise<ApiResponse<T>> {
  try {
    const data = await res.json();
    return {
      status: res.status,
      success: res.ok,
      data: res.ok ? (data as T) : undefined,
      error: res.ok
        ? undefined
        : {
            errorCode: (data && (data.errorCode ?? data.code)) || undefined,
            errorMessage: (data && (data.errorMessage ?? data.message)) || "요청 실패",
          },
    };
  } catch {
    return {
      status: 500,
      success: false,
      error: { errorCode: "PARSE_ERROR", errorMessage: "응답 파싱 실패" },
    };
  }
}

/** 성공이면 data만 반환, 실패면 throw → useQuery에서 쓰기 좋음 */
export function unwrap<T>(resp: ApiResponse<T>): T {
  if (resp.success && resp.data !== undefined) return resp.data;
  const err = new Error(resp.error?.errorMessage ?? `HTTP ${resp.status}`) as Error & {
    status?: number;
    code?: string;
  };
  err.status = resp.status;
  err.code = resp.error?.errorCode;
  throw err;
}

export class ApiClient {
  private static instance: ApiClient;
  private baseUrl: string;
  private headers: Record<string, string> = { "Content-Type": "application/json" };

  private constructor(baseUrl?: string) {
    this.baseUrl = baseUrl ?? process.env.NEXT_PUBLIC_BASE_URL ?? "";
  }

  static getInstance(baseUrl?: string) {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient(baseUrl);
    }
    return ApiClient.instance;
  }

  setHeader(key: string, val: string) {
    this.headers[key] = val;
  }
  removeHeader(key: string) {
    delete this.headers[key];
  }
  setBaseUrl(url: string) {
    this.baseUrl = url;
  }

  async request<T>(
    method: HttpMethod,
    url: string,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    const qs = method === "GET" ? toQueryString(options?.params) : "";
    const fullUrl = `${this.baseUrl}${url}${qs}`;

    const init: RequestInit & { next?: RequestOptions["next"] } = {
      method,
      headers: { ...this.headers, ...options?.headers },
      signal: options?.signal, // ✅ 취소 가능
      cache: options?.cache ?? "no-store", // 최신성 우선 (필요 시 조정)
      next: options?.next,
    };

    if (method !== "GET" && options?.body !== undefined) {
      init.body = typeof options.body === "string" ? options.body : JSON.stringify(options.body);
    }

    const res = await fetch(fullUrl, init);
    return decodeResponse<T>(res);
  }

  get<T>(url: string, options?: RequestOptions) {
    return this.request<T>("GET", url, options);
  }
  post<T>(url: string, options?: RequestOptions) {
    return this.request<T>("POST", url, options);
  }
  put<T>(url: string, options?: RequestOptions) {
    return this.request<T>("PUT", url, options);
  }
  delete<T>(url: string, options?: RequestOptions) {
    return this.request<T>("DELETE", url, options);
  }
}

export const api = ApiClient.getInstance();
