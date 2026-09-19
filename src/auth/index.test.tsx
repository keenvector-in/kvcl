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
