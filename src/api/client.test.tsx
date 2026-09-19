import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, apiClient } from './client';

const json = (status: number, body: unknown) => new Response(status === 204 ? null : JSON.stringify(body), { status });

describe('apiClient', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('sends bearer + JSON body and parses the response', async () => {
    const fetchMock = vi.fn().mockResolvedValue(json(200, { ok: 1 }));
    vi.stubGlobal('fetch', fetchMock);
    const api = apiClient('http://gw', '/api/x');
    await expect(api.post('tok', '/y', { a: 1 })).resolves.toEqual({ ok: 1 });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('http://gw/api/x/y');
    expect(init.headers).toEqual({ Authorization: 'Bearer tok', 'Content-Type': 'application/json' });
    expect(init.body).toBe('{"a":1}');
  });

  it('returns undefined on 204 and omits Content-Type without a body', async () => {
    const fetchMock = vi.fn().mockResolvedValue(json(204, null));
    vi.stubGlobal('fetch', fetchMock);
    await expect(apiClient('', '/api/x').del(null, '/1')).resolves.toBeUndefined();
    expect(fetchMock.mock.calls[0][1].headers).toEqual({ Authorization: 'Bearer ' });
  });

  it('throws ApiError with the gateway message, status and code', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json(409, { message: 'slug taken', error_code: 'conflict' })));
    const err = await apiClient('', '/api/x').get('t').catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err).toMatchObject({ status: 409, code: 'conflict', message: 'slug taken' });
  });

  it('falls back to a status message on a non-JSON error body', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('boom', { status: 502 })));
    await expect(apiClient('', '/api/x').get('t')).rejects.toThrow('request failed (502)');
  });
});
