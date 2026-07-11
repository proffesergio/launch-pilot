/**
 * Connect-phase retry for the Neon HTTP driver. A `TypeError: fetch failed`
 * with a connect-class cause (ETIMEDOUT & co.) means the request never
 * reached the server — retrying cannot double-apply a write. Anything after
 * bytes were exchanged (an HTTP response, a mid-response socket error) is
 * NEVER retried here; idempotency of application queries is not assumed.
 * Motivated by flaky dual-stack (IPv6/IPv4) first connections on dev
 * machines; harmless elsewhere.
 */

const CONNECT_ERROR_CODES = new Set([
  "ETIMEDOUT",
  "ECONNREFUSED",
  "ENETUNREACH",
  "EHOSTUNREACH",
  "ENOTFOUND",
  "UND_ERR_CONNECT_TIMEOUT",
]);

type Fetcher = (url: string, init: Record<string, unknown>) => Promise<Response>;

function isConnectFailure(err: unknown): boolean {
  if (!(err instanceof TypeError)) return false;
  const cause = (err as { cause?: { code?: string } }).cause;
  return !!cause?.code && CONNECT_ERROR_CODES.has(cause.code);
}

export function withConnectRetry(
  fetcher: Fetcher,
  { attempts = 3, delayMs = 300 }: { attempts?: number; delayMs?: number } = {},
): Fetcher {
  return async (url, init) => {
    let lastError: unknown;
    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        return await fetcher(url, init);
      } catch (err) {
        if (!isConnectFailure(err)) throw err;
        lastError = err;
        if (attempt < attempts && delayMs > 0) {
          await new Promise((r) => setTimeout(r, delayMs * attempt));
        }
      }
    }
    throw lastError;
  };
}
