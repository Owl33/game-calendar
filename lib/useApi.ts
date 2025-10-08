interface ApiResponse<T = unknown> {
  status: number;
  success: boolean;
  data?: T;
  error?: {
    errorCode: string;
    errorMessage: string;
  };
}

// Response 변환 함수
async function convertResponse<T>(response: Response): Promise<ApiResponse<T>> {
  try {
    const data = await response.json();

    // 일반 API 응답
    return {
      status: response.status,
      success: response.ok,
      data: response.ok ? (data as T) : undefined,
      error: response.ok
        ? undefined
        : {
            errorCode: data?.errorCode,
            errorMessage: data?.errorMessage,
          },
    };
  } catch {
    return {
      status: 500,
      success: false,
      error: { errorCode: "ERROR", errorMessage: "실패" },
    };
  }
}

class ApiClient {
  private static instance: ApiClient;
  private headers: Record<string, string>;

  private constructor() {
    this.headers = { "Content-Type": "application/json" };
  }

  public static getInstance() {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  private async request<T>(
    method: "GET" | "POST" | "PUT" | "DELETE",
    url: string,
    options?: {
      params?: Record<string, string | number | boolean>;
      body?: Record<string, unknown>;
      headers?: Record<string, string>;
    }
  ): Promise<ApiResponse<T>> {
    const fetchOptions: RequestInit = {
      method,
      headers: { ...this.headers, ...options?.headers },
    };

    if (options?.params && method === "GET") {
      const queryString = new URLSearchParams(
        Object.fromEntries(Object.entries(options.params).map(([k, v]) => [k, String(v)]))
      ).toString();
      url += url.includes("?") ? "&" + queryString : "?" + queryString;
    }

    if (options?.body && method !== "GET") {
      fetchOptions.body = JSON.stringify(options.body);
    }

    const res = await fetch(process.env.NEXT_PUBLIC_BASE_URL + url, fetchOptions);
    return convertResponse<T>(res);
  }

  // GET
  public get<T>(
    url: string,
    options?: {
      params?: Record<string, string | number | boolean>;
      headers?: Record<string, string>;
    }
  ) {
    return this.request<T>("GET", url, options);
  }

  // POST
  public post<T>(
    url: string,
    options?: { body?: Record<string, unknown>; headers?: Record<string, string> }
  ) {
    return this.request<T>("POST", url, options);
  }

  // PUT
  public put<T>(
    url: string,
    options?: { body?: Record<string, unknown>; headers?: Record<string, string> }
  ) {
    return this.request<T>("PUT", url, options);
  }

  // DELETE
  public delete<T>(
    url: string,
    options?: { body?: Record<string, unknown>; headers?: Record<string, string> }
  ) {
    return this.request<T>("DELETE", url, options);
  }
}

export const useApi = ApiClient.getInstance();
