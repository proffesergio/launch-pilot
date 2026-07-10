import { PostHog } from "posthog-node";

import { logger } from "./logger";

/**
 * Server-side product events. Without a PostHog key this degrades to a log
 * line — analytics must never break a user action (errors here are logged,
 * swallowed, and visible in Sentry via the logger pipeline, not thrown).
 */
let client: PostHog | null | undefined;

function getClient(): PostHog | null {
  if (client !== undefined) return client;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  client = key
    ? new PostHog(key, {
        host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
        flushAt: 1, // serverless: flush immediately, don't buffer
      })
    : null;
  return client;
}

export async function captureServer(
  distinctId: string,
  event: string,
  properties: Record<string, unknown> = {},
): Promise<void> {
  const ph = getClient();
  if (!ph) {
    logger.debug({ event: "analytics.skipped", name: event }, "no PostHog key");
    return;
  }
  try {
    ph.capture({ distinctId, event, properties });
    await ph.flush();
  } catch (err) {
    logger.warn({ event: "analytics.failed", name: event, err });
  }
}
