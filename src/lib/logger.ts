import pino from "pino";

/**
 * Structured JSON logs (Principle 1: the system explains itself). Every
 * server-side module logs through here; route handlers attach a correlation
 * id via `logger.child({ correlationId })` so one user action is traceable
 * end to end. Console transport is the M0 sink; a hosted sink (Better Stack /
 * Axiom) is added when volume earns it (architecture §9).
 */
export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  base: { app: "launchpilot" },
  redact: {
    // Never let a token-bearing URL or secret slip into a log line.
    paths: ["url", "*.url", "token", "*.token", "authorization"],
    censor: "[redacted]",
  },
});
