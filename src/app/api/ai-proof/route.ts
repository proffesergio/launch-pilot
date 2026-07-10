import { createAnthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";

import { getOrCreateCorrelationId } from "@/lib/correlation";
import { getEnv } from "@/lib/env";
import { logger } from "@/lib/logger";

/**
 * M0 proof that a real Sonnet call streams through every layer. The real
 * coach (/api/coach, M3) replaces this route; the shape it proves — env-driven
 * model id, correlation-id logging, token accounting on finish — carries over.
 */
export async function POST(request: Request) {
  const correlationId = getOrCreateCorrelationId(request.headers);
  const log = logger.child({ correlationId, route: "/api/ai-proof" });
  const env = getEnv();

  const anthropic = createAnthropic({ apiKey: env.ANTHROPIC_API_KEY });

  log.info({ event: "ai_proof.start", model: env.ANTHROPIC_MODEL_CRAFT });

  const result = streamText({
    model: anthropic(env.ANTHROPIC_MODEL_CRAFT),
    prompt:
      "In one short sentence each, greet LaunchPilot's walking skeleton first in Bangla, then in English. No preamble.",
    maxOutputTokens: 120,
    onFinish: ({ usage }) => {
      log.info(
        {
          event: "ai_proof.finish",
          inputTokens: usage.inputTokens,
          outputTokens: usage.outputTokens,
        },
        "sonnet stream completed",
      );
    },
    onError: ({ error }) => {
      log.error({ event: "ai_proof.error", err: error }, "sonnet stream failed");
    },
  });

  return result.toTextStreamResponse({
    headers: { "x-correlation-id": correlationId },
  });
}
