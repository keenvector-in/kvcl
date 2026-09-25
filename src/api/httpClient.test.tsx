import { afterEach, describe, expect, it, vi } from 'vitest';
import { clearTokens, createHttpClient } from './httpClient';

const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status });

describe('createHttpClient', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    clearTokens();
  });

  it('refreshes before the first authenticated call after a page load (no bare 401)', async () => {
    sessionStorage.setItem('keenplaza.refresh_token', 'r1');
    const fetchMock = vi.fn(async (url: string) =>
      url.endsWith('/v1/auth/refresh') ? json(200, { access_token: 'a2', refresh_token: 'r2' }) : json(200, { ok: 1 }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(createHttpClient('http://gw').request('/v1/carts')).resolves.toEqual({ ok: 1 });
    expect(fetchMock.mock.calls.map((c) => c[0])).toEqual(['http://gw/v1/auth/refresh', 'http://gw/v1/carts']);
    expect(fetchMock.mock.calls[1][1].headers.Authorization).toBe('Bearer a2');
  });

  it('does not refresh for public calls', async () => {
    sessionStorage.setItem('keenplaza.refresh_token', 'r1');
    const fetchMock = vi.fn(async () => json(200, { ok: 1 }));
    vi.stubGlobal('fetch', fetchMock);
    await createHttpClient('http://gw').request('/v1/products', { auth: false });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe('file uploads', () => {
  it('sends FormData untouched so the browser sets the multipart boundary', async () => {
    const calls: RequestInit[] = []
    vi.stubGlobal('fetch', (_url: string, init: RequestInit) => {
      calls.push(init)
      return Promise.resolve(new Response(JSON.stringify({ id: 'a1' }), { status: 201, headers: { 'Content-Type': 'application/json' } }))
    })
    const http = createHttpClient('http://api.test')
    const body = new FormData()
    body.set('file', new File(['x'], 'p.png', { type: 'image/png' }))

    await http.request('/v1/media', { method: 'POST', body, tenantId: 't1', auth: false })

    expect(calls[0].body).toBeInstanceOf(FormData)
    expect((calls[0].headers as Record<string, string>)['Content-Type']).toBeUndefined()
    expect((calls[0].headers as Record<string, string>)['X-Tenant-ID']).toBe('t1')
  })
})
