import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { Spinner } from '../components/Spinner/index';

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
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const REFRESH_KEY = 'kv_refresh_token';

async function parseErrorMessage(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { message?: string };
    return body.message ?? `request failed (${res.status})`;
  } catch {
    return `request failed (${res.status})`;
  }
}

/** Wrap a portal's routes once. Every KeenVector frontend (business-admin,
 * super-admin) uses this same session logic against edge-gateway's
 * /api/auth/* endpoints — see kb/00_Global/identity-and-auth.md. */
export function AuthProvider({ apiBaseUrl, children }: { apiBaseUrl: string; children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(
    async (token: string) => {
      const res = await fetch(`${apiBaseUrl}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await parseErrorMessage(res));
      return (await res.json()) as AuthUser;
    },
    [apiBaseUrl],
  );

  // On load, a stored refresh token (survives a page reload; the access
  // token deliberately does not) is exchanged for a fresh session.
  useEffect(() => {
    const refreshToken = localStorage.getItem(REFRESH_KEY);
    if (!refreshToken) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/api/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
        if (!res.ok) throw new Error('session expired');
        const data = (await res.json()) as { access_token: string; refresh_token: string };
        localStorage.setItem(REFRESH_KEY, data.refresh_token);
        setAccessToken(data.access_token);
        setUser(await fetchMe(data.access_token));
      } catch {
        localStorage.removeItem(REFRESH_KEY);
      } finally {
        setLoading(false);
      }
    })();
  }, [apiBaseUrl, fetchMe]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await fetch(`${apiBaseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error(await parseErrorMessage(res));
      const data = (await res.json()) as { access_token: string; refresh_token: string; user: AuthUser };
      localStorage.setItem(REFRESH_KEY, data.refresh_token);
      setAccessToken(data.access_token);
      setUser(data.user);
    },
    [apiBaseUrl],
  );

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem(REFRESH_KEY);
    localStorage.removeItem(REFRESH_KEY);
    setAccessToken(null);
    setUser(null);
    if (refreshToken) {
      // Best-effort — the session is gone client-side regardless of whether
      // the revoke call itself succeeds.
      await fetch(`${apiBaseUrl}/api/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      }).catch(() => {});
    }
  }, [apiBaseUrl]);

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, login, logout }}>{children}</AuthContext.Provider>
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
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-950">
        <Spinner />
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (allow && !allow.includes(user.role)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-950 text-ink-100">
        <p className="text-sm text-ink-300">Your account does not have access to this page.</p>
      </div>
    );
  }
  return <>{children}</>;
}
