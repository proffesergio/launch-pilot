/**
 * Correlation id: generated at the edge of every request and threaded through
 * logs, AI calls, and DB writes so one user action is reconstructable end to
 * end (architecture §9). Incoming ids are propagated so a client/browser can
 * stitch its own traces to ours — but only if they look like an id.
 */

const SAFE_ID = /^[A-Za-z0-9._-]{1,64}$/;

export function getOrCreateCorrelationId(headers: Headers): string {
  const incoming = headers.get("x-correlation-id");
  if (incoming && SAFE_ID.test(incoming)) return incoming;
  return crypto.randomUUID();
}
