/**
 * Journey state machine (architecture §8). A pure function so it is
 * unit-testable in isolation; the DB write that applies a transition lives
 * with the caller, inside a transaction.
 *
 * Reversible edges exist only where reality is reversible (a gig can come
 * down, a profile can be reset). Nothing past first_order reverses — you
 * don't un-earn money.
 */

export const JOURNEY_STATES = [
  "onboarding",
  "skill_assessment",
  "foundation",
  "profile_built",
  "gig_live",
  "first_order",
  "level_up",
  "scaling",
] as const;

export type JourneyState = (typeof JOURNEY_STATES)[number];

export type JourneyEvent =
  | "profile_saved"
  | "roadmap_generated"
  | "boss_profile_live"
  | "boss_gig_published"
  | "earnings_reported"
  | "post_order_missions"
  | "sustained_activity"
  | "profile_reset"
  | "gig_taken_down";

const TRANSITIONS: Record<`${JourneyState}:${JourneyEvent}` | string, JourneyState> = {
  "onboarding:profile_saved": "skill_assessment",
  "skill_assessment:roadmap_generated": "foundation",
  "foundation:boss_profile_live": "profile_built",
  "profile_built:boss_gig_published": "gig_live",
  "gig_live:earnings_reported": "first_order",
  "first_order:post_order_missions": "level_up",
  "level_up:sustained_activity": "scaling",
  // Reversible, pre-first-order only:
  "profile_built:profile_reset": "foundation",
  "gig_live:gig_taken_down": "profile_built",
};

/** Returns the next state, or null when the event does not apply. */
export function transition(
  state: JourneyState,
  event: JourneyEvent,
): JourneyState | null {
  return TRANSITIONS[`${state}:${event}`] ?? null;
}
