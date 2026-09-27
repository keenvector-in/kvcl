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
  });
});
