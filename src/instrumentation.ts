import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Covers fetches from the main server process (e.g. Sentry tunnel);
    // worker processes get it via the db module import (see net-tuning.ts).
    await import("./lib/net-tuning");
    await import("../sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

export const onRequestError = Sentry.captureRequestError;
