import { Fragment, createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { Spinner } from '../components/Spinner/index';
import { Button } from '../components/Button/index';
import { fetchOrOffline, setAuthRefresher } from '../api/client';

export type Role = 'super_admin' | 'business_admin' | 'business_user';

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  tenant_id: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  accessToken: string | null;
  loading: boolean;
  /** True once a live session could not be renewed — the login page says so
   * instead of the user landing there with no explanation. */
  sessionExpired: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const REFRESH_KEY = 'kv_refresh_token';
// Who the shared refresh token belongs to ("user:tenant"). Tabs share one
// refresh token, so a sign-in as someone else in another tab changes this key
// and every other tab resets instead of acting on the new tenant as the old user.
const IDENTITY_KEY = 'kv_session_identity';
const identity = (u: AuthUser) => `${u.id}:${u.tenant_id ?? ''}`;

async function parseErrorMessage(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { message?: string };
    return body.message ?? `request failed (${res.status})`;
  } catch {
    return `request failed (${res.status})`;
  }
}

function jwtTimes(jwt: string): { exp?: number; iat?: number } {
  try {
    return JSON.parse(atob(jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))) as { exp?: number; iat?: number };
  } catch {
    return {};
  }
}

/** Seconds until a JWT's `exp`, or 0 when it cannot be read. */
function secondsLeft(jwt: string): number {
  const { exp } = jwtTimes(jwt);
  return exp ? exp - Date.now() / 1000 : 0;
}

// Renew this long before the access token expires.
const REFRESH_EARLY_S = 60;
// Never schedule a renewal sooner than this: an unreadable, very short-lived or
// clock-skewed token must not turn the timer into a refresh loop.
const MIN_REFRESH_DELAY_S = 10;

/** When to renew a token that was just issued. Measured on the token's own
 * clock (exp - iat), so a client clock running ahead can't shrink it to 0. */
function refreshDelayS(jwt: string): number {
  const { exp, iat } = jwtTimes(jwt);
  const lifetime = exp && iat ? exp - iat : secondsLeft(jwt);
  return Math.max(MIN_REFRESH_DELAY_S, lifetime - Math.min(REFRESH_EARLY_S, lifetime / 2));
}

class SessionExpiredError extends Error {}

// Best-effort — the session is gone client-side whether or not this succeeds.
function revoke(apiBaseUrl: string, refreshToken: string): Promise<void> {
  return fetch(`${apiBaseUrl}/api/auth/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  }).then(
    () => {},
    () => {},
  );
}
/** The session this refresh belonged to was signed out or replaced meanwhile. */
class SessionEndedError extends Error {}

/** Wrap a portal's routes once. Every KeenVector frontend (business-admin,
 * super-admin) uses this same session logic against edge-gateway's
 * /api/auth/* endpoints — see kb/00_Global/identity-and-auth.md. */
export function AuthProvider({ apiBaseUrl, children }: { apiBaseUrl: string; children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  const inFlight = useRef<Promise<string> | null>(null);
  // Bumped by login and logout. A refresh that started under an older epoch
  // must not write its result back — that would resurrect a signed-out session.
  const epoch = useRef(0);
  const userRef = useRef<AuthUser | null>(null);
  // Bumped when the signed-in identity changes under this tab: children are
  // remounted so no state from the previous user/tenant survives.
  const [generation, setGeneration] = useState(0);

  const adoptUser = useCallback((next: AuthUser | null) => {
    const prev = userRef.current;
    if (prev && next && identity(prev) !== identity(next)) setGeneration((g) => g + 1);
    userRef.current = next;
    setUser(next);
    if (next) localStorage.setItem(IDENTITY_KEY, identity(next));
  }, []);

  const fetchMe = useCallback(
    async (token: string) => {
      const res = await fetchOrOffline(`${apiBaseUrl}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await parseErrorMessage(res));
      return (await res.json()) as AuthUser;
    },
    [apiBaseUrl],
  );

  // The server rotates the refresh token on every use, so two concurrent
  // refreshes with the same token make one of them fail. Calls in this tab
  // share one promise; the Web Lock serialises tabs, and each call re-reads
  // localStorage inside it so it uses whatever the previous holder stored.
  const refresh = useCallback((): Promise<string> => {
    if (inFlight.current) return inFlight.current;
    const started = epoch.current;
    const ended = () => epoch.current !== started;
    const run = async () => {
      if (ended()) throw new SessionEndedError();
      const refreshToken = localStorage.getItem(REFRESH_KEY);
      if (!refreshToken) throw new SessionExpiredError();
      const res = await fetchOrOffline(`${apiBaseUrl}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      if (res.status === 401) {
        // Only drop the token we tried; another tab may have stored a newer one.
        if (localStorage.getItem(REFRESH_KEY) === refreshToken) localStorage.removeItem(REFRESH_KEY);
        throw new SessionExpiredError();
      }
      if (!res.ok) throw new Error(await parseErrorMessage(res));
      const data = (await res.json()) as { access_token: string; refresh_token: string };
      if (ended()) {
        // The server already rotated the token for a session that's gone: revoke it.
        revoke(apiBaseUrl, data.refresh_token);
        throw new SessionEndedError();
      }
      localStorage.setItem(REFRESH_KEY, data.refresh_token);
      // The stored token may have been written by another tab for another
      // user, so always re-read who this session now is.
      const me = await fetchMe(data.access_token);
      if (ended()) throw new SessionEndedError();
      setAccessToken(data.access_token);
      adoptUser(me);
      return data.access_token;
    };
    const locks = typeof navigator !== 'undefined' ? navigator.locks : undefined;
    const p = (locks ? locks.request('kv-auth-refresh', run) : run()).finally(() => {
      if (inFlight.current === p) inFlight.current = null;
    });
    inFlight.current = p;
    return p;
  }, [apiBaseUrl, fetchMe, adoptUser]);

  const expire = useCallback(() => {
    setAccessToken(null);
    userRef.current = null;
    setUser(null);
    setSessionExpired(true);
  }, []);

  // kvcl's apiClient retries a 401 once with a token from here.
  useEffect(() => {
    setAuthRefresher(() =>
      refresh().catch((err) => {
        if (err instanceof SessionExpiredError) expire();
        throw err;
      }),
    );
    return () => setAuthRefresher(null);
  }, [refresh, expire]);

  // Another tab signed out, or signed in as someone else.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === REFRESH_KEY && e.newValue === null && userRef.current) {
        setAccessToken(null);
        userRef.current = null;
        setUser(null);
      } else if (e.key === IDENTITY_KEY && e.newValue && userRef.current && e.newValue !== identity(userRef.current)) {
        refresh().catch((err) => {
          if (err instanceof SessionExpiredError) expire();
        });
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [refresh, expire]);

  // On load, a stored refresh token (survives a page reload; the access
  // token deliberately does not) is exchanged for a fresh session.
  useEffect(() => {
    if (!localStorage.getItem(REFRESH_KEY)) {
      setLoading(false);
      return;
    }
    refresh()
      .catch((err) => {
        if (err instanceof SessionExpiredError) setSessionExpired(true);
      })
      .finally(() => setLoading(false));
  }, [refresh]);

  // Keep the session alive: renew shortly before the access token expires,
  // and again when the tab comes back (background timers are throttled, and
  // a laptop that slept past expiry never fired its timer). A network error
  // keeps the session and retries on the next tick instead of signing out.
  useEffect(() => {
    if (!accessToken) return;
    let cancelled = false;
    const renew = () =>
      refresh().catch((err) => {
        if (cancelled || err instanceof SessionEndedError) return;
        if (err instanceof SessionExpiredError) expire();
        else timer = setTimeout(renew, 30_000);
      });
    let timer = setTimeout(renew, refreshDelayS(accessToken) * 1000);
    const onVisible = () => {
      if (document.visibilityState === 'visible' && secondsLeft(accessToken) < REFRESH_EARLY_S) renew();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [accessToken, refresh, expire]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await fetchOrOffline(`${apiBaseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error(await parseErrorMessage(res));
      const data = (await res.json()) as { access_token: string; refresh_token: string; user: AuthUser };
      epoch.current += 1;
      inFlight.current = null;
      localStorage.setItem(REFRESH_KEY, data.refresh_token);
      setAccessToken(data.access_token);
      adoptUser(data.user);
      setSessionExpired(false);
    },
    [apiBaseUrl, adoptUser],
  );

  const logout = useCallback(async () => {
    epoch.current += 1;
    inFlight.current = null;
    const refreshToken = localStorage.getItem(REFRESH_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(IDENTITY_KEY);
    setAccessToken(null);
    userRef.current = null;
    setUser(null);
    if (refreshToken) await revoke(apiBaseUrl, refreshToken);
  }, [apiBaseUrl]);

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, sessionExpired, login, logout }}>
      <Fragment key={generation}>{children}</Fragment>
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

/** Redirects to /login when signed out; shows an inline denial when signed
 * in as the wrong role — never a redirect loop for an authenticated user
 * who simply lacks access. */
export function ProtectedRoute({ allow, children }: { allow?: Role[]; children: ReactNode }) {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page">
        <Spinner />
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (allow && !allow.includes(user.role)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-page text-fg">
        <p className="text-sm text-fg-muted">Your account does not have access to this page.</p>
        <Button variant="secondary" size="sm" onClick={() => void logout()}>
          Sign out
        </Button>
      </div>
    );
  }
  return <>{children}</>;
}
