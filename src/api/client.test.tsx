import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, NETWORK_ERROR_MESSAGE, apiClient, errorMessage } from './client';

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

  it('maps a network failure to ApiError(0) with a readable message', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    const err = await apiClient('', '/api/x').get('t').catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err).toMatchObject({ status: 0, code: 'network', message: NETWORK_ERROR_MESSAGE });
    expect(NETWORK_ERROR_MESSAGE).toBe("Can't reach KeenVector right now. Check your connection and try again.");
  });

  it('lets an abort through unchanged', async () => {
    const abort = new DOMException('aborted', 'AbortError');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(abort));
    await expect(apiClient('', '/api/x').get('t')).rejects.toBe(abort);
  });
});

describe('errorMessage', () => {
  it('replaces raw browser network errors, keeps everything else', () => {
    for (const raw of ['Failed to fetch', 'NetworkError when attempting to fetch resource.', 'Load failed']) {
      expect(errorMessage(new TypeError(raw))).toBe(NETWORK_ERROR_MESSAGE);
    }
    expect(errorMessage(new TypeError('x is not a function'))).toBe('x is not a function');
    expect(errorMessage(new ApiError(409, 'slug taken'))).toBe('slug taken');
    expect(errorMessage('plain')).toBe('plain');
  });
});
