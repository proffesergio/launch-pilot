/**
 * AI spend accounting (cost is a feature). Money lives in integer USD micros
 * (1_000_000 micros = $1) — never floats in storage. Prices are per MTok from
 * platform.claude.com/docs/en/pricing (checked 2026-07-11); unknown models
 * price at the most expensive known rate so a model bump can only ever
 * overcount, never undercount, spend against the cap.
 */

type Price = { inPerMTok: number; outPerMTok: number };

const PRICES: Record<string, Price> = {
  "claude-sonnet-4-6": { inPerMTok: 3, outPerMTok: 15 },
  "claude-haiku-4-5": { inPerMTok: 1, outPerMTok: 5 },
};

const MOST_EXPENSIVE: Price = { inPerMTok: 3, outPerMTok: 15 };

export function costUsdMicros(
  model: string,
  inputTokens: number,
  outputTokens: number,
): number {
  const price = PRICES[model] ?? MOST_EXPENSIVE;
  const usd =
    (inputTokens / 1_000_000) * price.inPerMTok +
    (outputTokens / 1_000_000) * price.outPerMTok;
  return Math.ceil(usd * 1_000_000);
}

export function checkDailyCap(
  spentUsdMicros: number,
  capUsd: number,
): { allowed: boolean; remainingUsdMicros: number } {
  const capMicros = Math.round(capUsd * 1_000_000);
  const remaining = Math.max(0, capMicros - spentUsdMicros);
  return { allowed: spentUsdMicros < capMicros, remainingUsdMicros: remaining };
}
