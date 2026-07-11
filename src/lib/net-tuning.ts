/**
 * Node's happy-eyeballs gives each connect attempt 250ms before aborting it;
 * slow dev-machine networks need ~550ms to reach Neon (and Anthropic), so
 * every attempt times out and outbound fetch fails wholesale — observed as
 * "TypeError: fetch failed" from the DB driver. 1.5s per attempt keeps
 * dual-stack fallback while tolerating slow paths; harmless in prod.
 *
 * Imported for its side effect by the modules that make outbound fetches
 * (not just instrumentation.ts): the Next dev server runs app code in worker
 * processes where instrumentation's register() never runs.
 */

import { setDefaultAutoSelectFamilyAttemptTimeout } from "node:net";

setDefaultAutoSelectFamilyAttemptTimeout(1_500);
