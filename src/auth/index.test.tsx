import { StrictMode } from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider, ProtectedRoute, useAuth } from './index';

function LoginProbe() {
  const { login, user } = useAuth();
  return (
    <div>
      <button onClick={() => login('a@b.com', 'pw').catch(() => {})}>go</button>
      <span>{user ? user.role : 'signed-out'}</span>
    </div>
  );
}

describe('AuthProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('fetch', vi.fn());
  });
  afterEach(() => vi.unstubAllGlobals());

  it('login stores the session and exposes the user', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        access_token: 'a1',
        refresh_token: 'r1',
        user: { id: 'u1', email: 'a@b.com', role: 'business_admin', tenant_id: 't1' },
      }),
    });

    render(
      <AuthProvider apiBaseUrl="http://api.test">
        <LoginProbe />
      </AuthProvider>,
    );
    await userEvent.click(screen.getByText('go'));
    await waitFor(() => expect(screen.getByText('business_admin')).toBeInTheDocument());
    expect(localStorage.getItem('kv_refresh_token')).toBe('r1');
  });

  it('login failure leaves the session signed out', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: 'invalid email or password' }),
    });

    render(
      <AuthProvider apiBaseUrl="http://api.test">
        <LoginProbe />
      </AuthProvider>,
    );
    await userEvent.click(screen.getByText('go'));
    await waitFor(() => expect(screen.getByText('signed-out')).toBeInTheDocument());
  });

  it('login while offline rejects with the readable network message', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new TypeError('Failed to fetch'));
    let seen: unknown;
    function OfflineProbe() {
      const { login } = useAuth();
      return <button onClick={() => login('a@b.com', 'pw').catch((e) => (seen = e))}>go</button>;
    }
    render(
      <AuthProvider apiBaseUrl="http://api.test">
        <OfflineProbe />
      </AuthProvider>,
    );
    await userEvent.click(screen.getByText('go'));
    await waitFor(() => expect(seen).toMatchObject({ status: 0, message: "Can't reach KeenVector right now. Check your connection and try again." }));
  });
});

// A JWT whose only meaningful claim is exp, `secs` from now.
const jwt = (secs: number) => `h.${btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + secs }))}.s`;
const me = { ok: true, status: 200, json: async () => ({ id: 'u1', email: 'a@b.com', role: 'business_admin', tenant_id: 't1' }) };

describe('AuthProvider session renewal', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('fetch', vi.fn());
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('StrictMode double mount refreshes once and keeps the rotated token', async () => {
    localStorage.setItem('kv_refresh_token', 'r1');
    const f = fetch as ReturnType<typeof vi.fn>;
    f.mockImplementation(async (url: string) =>
      url.endsWith('/refresh') ? { ok: true, status: 200, json: async () => ({ access_token: jwt(900), refresh_token: 'r2' }) } : me,
    );
    render(
      <StrictMode>
        <AuthProvider apiBaseUrl="http://api.test">
          <LoginProbe />
        </AuthProvider>
      </StrictMode>,
    );
    await waitFor(() => expect(screen.getByText('business_admin')).toBeInTheDocument());
    expect(f.mock.calls.filter(([u]) => String(u).endsWith('/refresh'))).toHaveLength(1);
    expect(localStorage.getItem('kv_refresh_token')).toBe('r2');
  });

  it('renews the access token before it expires', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    localStorage.setItem('kv_refresh_token', 'r1');
    let n = 0;
    const f = fetch as ReturnType<typeof vi.fn>;
    f.mockImplementation(async (url: string) =>
      url.endsWith('/refresh')
        ? { ok: true, status: 200, json: async () => ({ access_token: jwt(120), refresh_token: `r${(n += 1) + 1}` }) }
        : me,
    );
    render(
      <AuthProvider apiBaseUrl="http://api.test">
        <LoginProbe />
      </AuthProvider>,
    );
    await waitFor(() => expect(screen.getByText('business_admin')).toBeInTheDocument());
    await act(async () => {
      await vi.advanceTimersByTimeAsync(61_000);
    });
    expect(n).toBe(2);
    expect(localStorage.getItem('kv_refresh_token')).toBe('r3');
    expect(screen.getByText('business_admin')).toBeInTheDocument();
  });

  it('flags sessionExpired when the refresh token is rejected', async () => {
    localStorage.setItem('kv_refresh_token', 'dead');
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: false, status: 401, json: async () => ({}) });
    function Probe() {
      const { sessionExpired, loading } = useAuth();
      return <span>{loading ? 'loading' : String(sessionExpired)}</span>;
    }
    render(
      <AuthProvider apiBaseUrl="http://api.test">
        <Probe />
      </AuthProvider>,
    );
    await waitFor(() => expect(screen.getByText('true')).toBeInTheDocument());
    expect(localStorage.getItem('kv_refresh_token')).toBeNull();
  });
});

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('fetch', vi.fn());
  });
  afterEach(() => vi.unstubAllGlobals());

  it('redirects to /login when signed out', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AuthProvider apiBaseUrl="http://api.test">
          <ProtectedRoute>
            <span>secret</span>
          </ProtectedRoute>
        </AuthProvider>
      </MemoryRouter>,
    );
    await waitFor(() => expect(screen.queryByText('secret')).not.toBeInTheDocument());
  });

  it('denies access inline when role does not match, without redirecting', async () => {
    localStorage.setItem('kv_refresh_token', 'r1');
    (fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 'a1', refresh_token: 'r2' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'u1', email: 'a@b.com', role: 'business_admin', tenant_id: 't1' }),
      });

    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/tenants']}>
          <AuthProvider apiBaseUrl="http://api.test">
            <ProtectedRoute allow={['super_admin']}>
              <span>secret</span>
            </ProtectedRoute>
          </AuthProvider>
        </MemoryRouter>,
      );
    });
    await waitFor(() => expect(screen.getByText(/does not have access/)).toBeInTheDocument());
    expect(screen.queryByText('secret')).not.toBeInTheDocument();

    // A wrong-role user is not stuck: signing out from the denial returns to /login.
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true, json: async () => ({}) });
    await userEvent.click(screen.getByRole('button', { name: 'Sign out' }));
    await waitFor(() => expect(screen.queryByText(/does not have access/)).not.toBeInTheDocument());
    expect(localStorage.getItem('kv_refresh_token')).toBeNull();
  });
});

describe('AuthProvider across tabs', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('fetch', vi.fn());
  });
  afterEach(() => vi.unstubAllGlobals());

  function Who() {
    const { user } = useAuth();
    return <span>{user ? `${user.email}@${user.tenant_id}` : 'signed-out'}</span>;
  }

  it('reloads the user when another tab signs in as someone else', async () => {
    localStorage.setItem('kv_refresh_token', 'r1');
    let who = { id: 'u1', email: 'a@b.com', role: 'business_admin', tenant_id: 't1' };
    const f = fetch as ReturnType<typeof vi.fn>;
    f.mockImplementation(async (url: string) =>
      url.endsWith('/refresh')
        ? { ok: true, status: 200, json: async () => ({ access_token: jwt(900), refresh_token: 'rx' }) }
        : { ok: true, status: 200, json: async () => who },
    );
    render(
      <AuthProvider apiBaseUrl="http://api.test">
        <Who />
      </AuthProvider>,
    );
    await waitFor(() => expect(screen.getByText('a@b.com@t1')).toBeInTheDocument());
    expect(localStorage.getItem('kv_session_identity')).toBe('u1:t1');

    // Another tab signs in as u2 of tenant t2.
    who = { id: 'u2', email: 'c@d.com', role: 'business_admin', tenant_id: 't2' };
    localStorage.setItem('kv_refresh_token', 'other');
    localStorage.setItem('kv_session_identity', 'u2:t2');
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: 'kv_session_identity', newValue: 'u2:t2' }));
    });
    await waitFor(() => expect(screen.getByText('c@d.com@t2')).toBeInTheDocument());
  });

  it('signs out when another tab signs out', async () => {
    localStorage.setItem('kv_refresh_token', 'r1');
    (fetch as ReturnType<typeof vi.fn>).mockImplementation(async (url: string) =>
      url.endsWith('/refresh') ? { ok: true, status: 200, json: async () => ({ access_token: jwt(900), refresh_token: 'r2' }) } : me,
    );
    render(
      <AuthProvider apiBaseUrl="http://api.test">
        <Who />
      </AuthProvider>,
    );
    await waitFor(() => expect(screen.getByText('a@b.com@t1')).toBeInTheDocument());
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: 'kv_refresh_token', newValue: null }));
    });
    await waitFor(() => expect(screen.getByText('signed-out')).toBeInTheDocument());
  });

  it("lets apiClient retry a 401 once with the provider's renewed token", async () => {
    const { apiClient } = await import('../api/client');
    localStorage.setItem('kv_refresh_token', 'r1');
    const fresh = jwt(900);
    let refreshes = 0;
    const f = fetch as ReturnType<typeof vi.fn>;
    f.mockImplementation(async (url: string, init?: RequestInit) => {
      if (url.endsWith('/refresh')) {
        refreshes += 1;
        return { ok: true, status: 200, json: async () => ({ access_token: fresh, refresh_token: `r${refreshes + 1}` }) };
      }
      if (url.endsWith('/me')) return me;
      const auth = (init?.headers as Record<string, string>).Authorization;
      return auth === `Bearer ${fresh}`
        ? new Response(JSON.stringify({ ok: 1 }), { status: 200 })
        : new Response('{}', { status: 401 });
    });
    render(
      <AuthProvider apiBaseUrl="http://api.test">
        <Who />
      </AuthProvider>,
    );
    await waitFor(() => expect(screen.getByText('a@b.com@t1')).toBeInTheDocument());
    await expect(apiClient('http://api.test', '/api/x').get('stale')).resolves.toEqual({ ok: 1 });
    expect(refreshes).toBe(2);
  });
});

describe('AuthProvider races', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('fetch', vi.fn());
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  function LogoutProbe() {
    const { logout, user, loading } = useAuth();
    return (
      <div>
        <button onClick={() => void logout()}>out</button>
        <span>{loading ? 'loading' : user ? user.role : 'signed-out'}</span>
      </div>
    );
  }

  it('signing out while a refresh is in flight stays signed out and revokes the rotated token', async () => {
    localStorage.setItem('kv_refresh_token', 'r1');
    let finishRefresh!: () => void;
    const f = fetch as ReturnType<typeof vi.fn>;
    f.mockImplementation((url: string) => {
      if (url.endsWith('/refresh'))
        return new Promise((resolve) => {
          finishRefresh = () => resolve({ ok: true, status: 200, json: async () => ({ access_token: jwt(900), refresh_token: 'r2' }) });
        });
      if (url.endsWith('/logout')) return Promise.resolve({ ok: true, status: 204 });
      return Promise.resolve(me);
    });
    render(
      <AuthProvider apiBaseUrl="http://api.test">
        <LogoutProbe />
      </AuthProvider>,
    );
    await waitFor(() => expect(finishRefresh).toBeTypeOf('function'));
    await userEvent.click(screen.getByText('out'));
    await act(async () => finishRefresh());

    await waitFor(() => expect(screen.getByText('signed-out')).toBeInTheDocument());
    expect(localStorage.getItem('kv_refresh_token')).toBeNull();
    const revoked = f.mock.calls.filter(([u]) => String(u).endsWith('/logout')).map(([, init]) => JSON.parse(init.body).refresh_token);
    expect(revoked).toContain('r2');
  });

  it('a token that lives under a minute does not refresh in a loop', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    localStorage.setItem('kv_refresh_token', 'r1');
    let n = 0;
    const f = fetch as ReturnType<typeof vi.fn>;
    f.mockImplementation(async (url: string) =>
      url.endsWith('/refresh') ? { ok: true, status: 200, json: async () => ({ access_token: jwt(30), refresh_token: `r${(n += 1) + 1}` }) } : me,
    );
    render(
      <AuthProvider apiBaseUrl="http://api.test">
        <LogoutProbe />
      </AuthProvider>,
    );
    await waitFor(() => expect(screen.getByText('business_admin')).toBeInTheDocument());
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5_000);
    });
    expect(n).toBe(1); // the initial restore only; a 0 ms timer would have spun here
    await act(async () => {
      await vi.advanceTimersByTimeAsync(30_000);
    });
    expect(n).toBeGreaterThanOrEqual(2);
    expect(n).toBeLessThanOrEqual(4);
  });
});
