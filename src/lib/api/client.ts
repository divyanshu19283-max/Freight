// Single shared HTTP client. Every domain module (forecast.ts, market.ts,
// charter.ts, ports.ts, ...) calls `request()` from here — components never
// call fetch() directly and no URL is ever hardcoded outside this file.
//
// Base URL is configurable via VITE_API_BASE_URL (existing convention in
// this project) with VITE_API_URL accepted as an alias, so either name
// works: VITE_API_URL=http://localhost:8000

const RAW_BASE =
  import.meta.env.VITE_API_BASE_URL ?? import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8001';

export const BASE = String(RAW_BASE).replace(/\/$/, '');

export class ApiClientError extends Error {
  kind: 'offline' | 'error' | 'no-data' | 'validation' | 'server' | 'unknown';
  constructor(kind: ApiClientError['kind'], message: string) {
    super(message);
    this.kind = kind;
    this.name = 'ApiClientError';
  }
}

/** True when the error means "backend unreachable / broken", i.e. safe to
 * fall back to clearly-labeled demo data rather than showing a hard error. */
export const isOffline = (e: unknown): boolean =>
  e instanceof ApiClientError && (e.kind === 'offline' || e.kind === 'server' || e.kind === 'unknown');

function extractMessage(body: unknown): string | null {
  if (!body) return null;
  if (typeof body === 'string') return body;
  if (typeof body === 'object' && body) {
    const b = body as Record<string, unknown>;
    for (const k of ['detail', 'message', 'error', 'error_description']) {
      const v = b[k];
      if (typeof v === 'string') return v;
      if (Array.isArray(v) && v.length && typeof v[0] === 'object' && v[0] && 'msg' in v[0]) {
        return String((v[0] as Record<string, unknown>).msg);
      }
    }
  }
  return null;
}

export async function request<T>(path: string, init?: RequestInit, timeoutMs = 9000): Promise<T> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${BASE}${path}`, {
      ...init,
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    });
    if (!res.ok) {
      if (res.status >= 500) throw new ApiClientError('server', 'The freight backend could not complete this request.');
      let body: unknown;
      try {
        body = await res.json();
      } catch {
        /* ignore */
      }
      const msg = extractMessage(body) ?? `Request failed (${res.status}).`;
      if (res.status === 404 || /no (historical )?data/i.test(msg) || /not found/i.test(msg) || /route.*(not|unavailable)/i.test(msg)) {
        throw new ApiClientError('no-data', "That route and vessel combination isn't available. Please choose another route.");
      }
      if (res.status === 400 || res.status === 422) {
        throw new ApiClientError('validation', msg || 'The selected route or request values are not valid. Please choose a valid route and try again.');
      }
      throw new ApiClientError('error', msg);
    }
    return (await res.json()) as T;
  } catch (e) {
    if (e instanceof ApiClientError) throw e;
    if (e instanceof DOMException && e.name === 'AbortError') {
      throw new ApiClientError('offline', 'Backend temporarily unavailable. Your interface is still available.');
    }
    if (e instanceof TypeError) {
      throw new ApiClientError('offline', 'Backend temporarily unavailable. Your interface is still available.');
    }
    throw new ApiClientError('unknown', 'Something went wrong while processing this request.');
  } finally {
    clearTimeout(t);
  }
}

/** Quick reachability probe used by the status strip. */
export async function probeBackend(): Promise<'online' | 'offline'> {
  try {
    await request('/health', undefined, 4000);
    return 'online';
  } catch {
    return 'offline';
  }
}
