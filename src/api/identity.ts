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

export interface ForgotPasswordResponse {
  message: string
  dev_reset_link?: string // local dev only — absent when identity has SMTP_HOST set
  dev_note?: string
}

export interface Session {
  id: string
  device_info?: string
  created_at: string
  last_used_at: string
  expires_at: string
  /** the session making this request */
  current: boolean
}

/**
 * A short, human label for the session list ("Chrome on Windows"). Coarse on purpose: it is
 * shown back to the person so they can recognise their own devices, not used for fingerprinting.
 */
export function deviceInfo(): string {
  if (typeof navigator === 'undefined') return ''
  const ua = navigator.userAgent
  const browser =
    /Edg\//.test(ua) ? 'Edge'
    : /OPR\//.test(ua) ? 'Opera'
    : /Chrome\//.test(ua) ? 'Chrome'
    : /Safari\//.test(ua) ? 'Safari'
    : /Firefox\//.test(ua) ? 'Firefox'
    : 'Browser'
  const os =
    /Android/.test(ua) ? 'Android'
    : /iPhone|iPad|iPod/.test(ua) ? 'iOS'
    : /Windows/.test(ua) ? 'Windows'
    : /Mac OS X/.test(ua) ? 'macOS'
    : /Linux/.test(ua) ? 'Linux'
    : ''
  return os ? `${browser} on ${os}` : browser
}

export interface Me {
  /** a platform_grants row exists for this user (ADR 0015) */
  platform_admin?: boolean
  id: string
  phone: string
  email?: string
  /** an email + password login works for this account */
  has_password?: boolean
  status: string
  created_at: string
}

export function identityApi(http: HttpClient) {
  return {
    requestOtp: (phone: string) =>
      http.request<OtpRequestResponse>('/v1/auth/otp/request', { method: 'POST', body: { phone }, auth: false }),

    verifyOtp: (phone: string, code: string) =>
      http.request<TokenPair>('/v1/auth/otp/verify', {
        method: 'POST',
        body: { phone, code, device_info: deviceInfo() },
        auth: false
      }),

    // Email + password: the second login method. Identity answers one `invalid_credentials`
    // for an unknown email and a wrong password alike — don't try to tell them apart.
    login: (email: string, password: string) =>
      http.request<TokenPair>('/v1/auth/login', {
        method: 'POST',
        body: { email, password, device_info: deviceInfo() },
        auth: false
      }),

    // Email sign-up: creates an account with no phone and returns its tokens (logged in). 409
    // `email_taken` when the address already has an account.
    register: (email: string, password: string) =>
      http.request<TokenPair>('/v1/auth/register', {
        method: 'POST',
        body: { email, password, device_info: deviceInfo() },
        auth: false
      }),

    // Always resolves when the address is well-formed, whether or not an account exists.
    forgotPassword: (email: string) =>
      http.request<ForgotPasswordResponse>('/v1/auth/password/forgot', { method: 'POST', body: { email }, auth: false }),

    // The token comes from the emailed link (?token=). A successful reset revokes every
    // existing session, so the user logs in again afterwards.
    resetPassword: (token: string, password: string) =>
      http.request<{ message: string }>('/v1/auth/password/reset', { method: 'POST', body: { token, password }, auth: false }),

    // Logged-in change. An account that has never had a password may send an empty current one.
    changePassword: (currentPassword: string, newPassword: string) =>
      http.request<{ message: string }>('/v1/me/password', {
        method: 'POST',
        body: { current_password: currentPassword, new_password: newPassword }
      }),

    // Accounts are created from a phone number alone; without an email on file a reset
    // link can never be delivered.
    setEmail: (email: string) => http.request<Me>('/v1/me/email', { method: 'PUT', body: { email } }),

    // "Your devices": the caller's own live sessions, the current one flagged.
    sessions: () => http.request<{ sessions: Session[] }>('/v1/me/sessions').then((r) => r.sessions),

    // Ends one other device's session. Ending the current one is a logout — use `logout`.
    revokeSession: (id: string) => http.request<void>(`/v1/me/sessions/${id}`, { method: 'DELETE' }),

    // Keeps this device signed in and ends every other session.
    revokeOtherSessions: () => http.request<void>('/v1/me/sessions/revoke-others', { method: 'POST' }),

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
