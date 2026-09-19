// Shared auth/session helper for KeenPlaza's gateway (CLAUDE.md §9) — token storage and refresh
// follow docs/00_Global/frontend-auth.md exactly:
//   - access_token: in-memory only, never localStorage/sessionStorage
//   - refresh_token: sessionStorage (accepted tradeoff, see frontend-auth.md)
//   - one in-flight refresh shared across concurrent 401s
//   - X-Tenant-ID is caller-supplied per request, never cached as "the" tenant

const REFRESH_KEY = 'keenplaza.refresh_token'

let accessToken: string | null = null
let refreshPromise: Promise<boolean> | null = null

export function setTokens(access: string, refresh: string) {
  accessToken = access
  sessionStorage.setItem(REFRESH_KEY, refresh)
}

export function clearTokens() {
  accessToken = null
  sessionStorage.removeItem(REFRESH_KEY)
}

export function isLoggedIn(): boolean {
  return accessToken !== null || sessionStorage.getItem(REFRESH_KEY) !== null
}

function getRefreshToken(): string | null {
  return sessionStorage.getItem(REFRESH_KEY)
}

// Exposed only for the logout call, which must send the refresh token in its
// body so identity can revoke that specific session server-side.
export const getRefreshTokenForLogout = getRefreshToken

import { ApiError } from './client'

const makeApiError = (status: number, message: string, code?: string) => new ApiError(status, message, code)

export interface RequestOptions {
  method?: string
  body?: unknown
  tenantId?: string
  auth?: boolean // defaults true; set false for public endpoints (login, browse)
}

export function createHttpClient(baseUrl: string) {
  async function doFetch(path: string, opts: RequestOptions): Promise<Response> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (opts.tenantId) headers['X-Tenant-ID'] = opts.tenantId
    if (opts.auth !== false && accessToken) headers['Authorization'] = `Bearer ${accessToken}`

    return fetch(baseUrl + path, {
      method: opts.method || 'GET',
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined
    })
  }

  // Single-flight refresh: concurrent 401s share one refresh call instead of
  // each firing their own (frontend-auth.md's refresh-flow rule).
  async function refreshAccessToken(): Promise<boolean> {
    if (refreshPromise) return refreshPromise
    refreshPromise = (async () => {
      const refresh = getRefreshToken()
      if (!refresh) return false
      try {
        const res = await fetch(baseUrl + '/v1/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refresh })
        })
        if (!res.ok) {
          clearTokens()
          return false
        }
        const data = await res.json()
        setTokens(data.access_token, data.refresh_token)
        return true
      } catch {
        return false
      }
    })()
    try {
      return await refreshPromise
    } finally {
      refreshPromise = null
    }
  }

  async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
    let res = await doFetch(path, opts)

    if (res.status === 401 && opts.auth !== false) {
      const refreshed = await refreshAccessToken()
      if (refreshed) {
        res = await doFetch(path, opts)
      } else {
        clearTokens()
        throw makeApiError(401, 'session expired, please log in again', 'session_expired')
      }
    }

    if (!res.ok) {
      let body: any = {}
      try { body = await res.json() } catch { /* non-JSON error body */ }
      throw makeApiError(res.status, body.message || res.statusText, body.code)
    }
    if (res.status === 204) return undefined as T
    return res.json()
  }

  return { request }
}

export type HttpClient = ReturnType<typeof createHttpClient>
