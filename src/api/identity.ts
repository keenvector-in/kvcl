import type { HttpClient } from './httpClient'
import { clearTokens, getRefreshTokenForLogout } from './httpClient'

export interface TokenPair {
  access_token: string
  refresh_token: string
}

export interface OtpRequestResponse {
  message: string
  dev_otp_code?: string // local dev only — absent when identity has KEENVECTOR_API_KEY set
  dev_note?: string
}

export interface Me {
  /** a platform_grants row exists for this user (ADR 0015) */
  platform_admin?: boolean
  id: string
  phone: string
  email?: string
  status: string
  created_at: string
}

export function identityApi(http: HttpClient) {
  return {
    requestOtp: (phone: string) =>
      http.request<OtpRequestResponse>('/v1/auth/otp/request', { method: 'POST', body: { phone }, auth: false }),

    verifyOtp: (phone: string, code: string) =>
      http.request<TokenPair>('/v1/auth/otp/verify', { method: 'POST', body: { phone, code }, auth: false }),

    // Revoke server-side first, then clear local storage — logout order
    // matters (frontend-auth.md#logout): a logout that only clears local
    // storage leaves a still-valid refresh token usable by anyone who
    // captured it earlier.
    logout: async () => {
      const refreshToken = getRefreshTokenForLogout()
      if (refreshToken) {
        await http.request<void>('/v1/auth/logout', { method: 'POST', body: { refresh_token: refreshToken } })
      }
      clearTokens()
    },

    me: () => http.request<Me>('/v1/me')
  }
}
