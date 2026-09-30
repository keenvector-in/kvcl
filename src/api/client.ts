// One JSON client for every portal service file: bearer token, JSON body only
// when given, 204 -> undefined, errors surfaced with the gateway's message.

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  constructor(status: number, message: string, code = '') {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

/** Shown instead of the browser's raw "Failed to fetch" when the request never got a response. */
export const NETWORK_ERROR_MESSAGE = "Can't reach KeenVector right now. Check your connection and try again.";

// fetch rejects with a TypeError only when there was no response (offline, DNS, CORS, server down);
// the wording differs per browser: "Failed to fetch", "NetworkError when…", "Load failed".
const isNetworkError = (err: unknown) => err instanceof TypeError && /fetch|network|load failed/i.test(err.message);

/** `fetch` that turns a network failure into `ApiError(0, NETWORK_ERROR_MESSAGE, 'network')`. */
export async function fetchOrOffline(input: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(input, init);
  } catch (err) {
    if (isNetworkError(err)) throw new ApiError(0, NETWORK_ERROR_MESSAGE, 'network');
    throw err;
  }
}

export const errorMessage = (err: unknown) =>
  isNetworkError(err) ? NETWORK_ERROR_MESSAGE : err instanceof Error ? err.message : String(err);

// Set by kvcl's AuthProvider: renews the session and resolves to a new access token.
let refresher: (() => Promise<string>) | null = null;

/** Lets `apiClient` retry a 401 once with a renewed token. AuthProvider registers itself; there is
 * normally no need to call this directly. */
export function setAuthRefresher(fn: (() => Promise<string>) | null) {
  refresher = fn;
}

export function apiClient(baseUrl: string, basePath: string) {
  async function request<T>(token: string | null, method: string, path: string, body?: unknown): Promise<T> {
    const send = (t: string | null) =>
      fetchOrOffline(`${baseUrl}${basePath}${path}`, {
        method,
        headers: { Authorization: `Bearer ${t ?? ''}`, ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    let res = await send(token);
    // An expired access token (a sleeping laptop, a throttled timer): renew once and retry. If the
    // renewal fails, the original 401 is surfaced below.
    if (res.status === 401 && token && refresher) {
      const fresh = await refresher().catch(() => null);
      if (fresh) res = await send(fresh);
    }
    if (!res.ok) {
      const err = (await res.json().catch(() => null)) as { message?: string; error_code?: string } | null;
      throw new ApiError(res.status, err?.message ?? `request failed (${res.status})`, err?.error_code ?? '');
    }
    return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
  }
  return {
    request,
    get: <T>(token: string | null, path = '') => request<T>(token, 'GET', path),
    post: <T>(token: string | null, path = '', body?: unknown) => request<T>(token, 'POST', path, body),
    put: <T>(token: string | null, path = '', body?: unknown) => request<T>(token, 'PUT', path, body),
    patch: <T>(token: string | null, path = '', body?: unknown) => request<T>(token, 'PATCH', path, body),
    del: <T = void>(token: string | null, path = '') => request<T>(token, 'DELETE', path),
  };
}
