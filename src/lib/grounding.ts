import type { PlatformTrack } from "./content";

/**
 * Grounding retrieval (architecture §6, mitigates R3): platform-specific
 * answers come only from the curated tracks. Deterministic keyword scoring —
 * no embeddings, no AI call, no cost — over the user's platform track plus
 * the shared BD payout module. If nothing scores, the coach must say it
 * doesn't know rather than invent.
 */

export type GroundingHit = {
  trackId: string;
  itemId: string;
  kind: "rule" | "heuristic";
  text: { bn: string; en: string };
  source?: string;
};

/** Tokens of 2+ chars, Latin or Bengali, lowercased. */
function tokenize(text: string): string[] {
  return (text.toLowerCase().match(/[a-z0-9]{2,}|[ঀ-৿]{2,}/g) ?? []);
}

export function retrieveGrounding(
  query: string,
  platform: "fiverr" | "upwork",
  tracks: Record<"fiverr" | "upwork" | "bd_payouts", PlatformTrack>,
  limit = 4,
): GroundingHit[] {
  const queryTokens = new Set(tokenize(query));
  if (queryTokens.size === 0) return [];

  const candidates = [tracks[platform], tracks.bd_payouts].flatMap((track) =>
    track.items.map((item) => {
      const haystack = new Set(
        tokenize(`${item.id.replaceAll("_", " ")} ${item.text.en} ${item.text.bn}`),
      );
      let score = 0;
      for (const token of queryTokens) {
        if (haystack.has(token)) score += 1;
      }
      return { track, item, score };
    }),
  );

  return candidates
    .filter((c) => c.score >= 1)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ track, item }) => ({
      trackId: track.id,
      itemId: item.id,
      kind: item.kind,
      text: item.text,
      source: item.source,
    }));
}
