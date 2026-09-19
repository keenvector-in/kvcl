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

export const errorMessage = (err: unknown) => (err instanceof Error ? err.message : String(err));

export function apiClient(baseUrl: string, basePath: string) {
  async function request<T>(token: string | null, method: string, path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${baseUrl}${basePath}${path}`, {
      method,
      headers: { Authorization: `Bearer ${token ?? ''}`, ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
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
