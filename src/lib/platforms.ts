/**
 * Platform registry (slice E): the single source of truth for every remote
 * work site LaunchPilot has a curated track for. Two categories with very
 * different first-dollar mechanics:
 *  - marketplace: you publish a service/profile and win orders on-site
 *    (gigs, proposals) — usually the fastest first earning for a beginner.
 *  - job_board: you apply to posted roles with a profile/CV; slower, often
 *    location-restricted, but real salaried remote work.
 * Names are proper nouns and stay untranslated; all descriptive copy lives
 * in messages/{en,bn}.json. Track content lives in content/platform-tracks/.
 */

export const MARKETPLACE_PLATFORMS = ["fiverr", "upwork"] as const;

export const JOB_BOARD_PLATFORMS = [
  "wellfound",
  "working_nomads",
  "web3_career",
  "remoteok",
  "weworkremotely",
  "jobspresso",
  "flexjobs",
  "justremote",
  "jobgether",
  "underdog",
  "builtin",
  "remote_co",
  "skipthedrive",
  "remotive",
  "virtualvocations",
] as const;

export const PLATFORMS = [
  ...MARKETPLACE_PLATFORMS,
  ...JOB_BOARD_PLATFORMS,
] as const;

export type PlatformId = (typeof PLATFORMS)[number];
export type PlatformCategory = "marketplace" | "job_board";

export type PlatformMeta = {
  name: string;
  url: string;
  category: PlatformCategory;
};

export const PLATFORM_META: Record<PlatformId, PlatformMeta> = {
  fiverr: { name: "Fiverr", url: "https://www.fiverr.com/", category: "marketplace" },
  upwork: { name: "Upwork", url: "https://www.upwork.com/", category: "marketplace" },
  wellfound: { name: "Wellfound", url: "https://wellfound.com/jobs", category: "job_board" },
  working_nomads: { name: "Working Nomads", url: "https://www.workingnomads.com/jobs", category: "job_board" },
  web3_career: { name: "Web3.career", url: "https://web3.career/", category: "job_board" },
  remoteok: { name: "RemoteOK", url: "https://remoteok.com/", category: "job_board" },
  weworkremotely: { name: "We Work Remotely", url: "https://weworkremotely.com/", category: "job_board" },
  jobspresso: { name: "Jobspresso", url: "https://jobspresso.co/", category: "job_board" },
  flexjobs: { name: "FlexJobs", url: "https://www.flexjobs.com/", category: "job_board" },
  justremote: { name: "JustRemote", url: "https://justremote.co/", category: "job_board" },
  jobgether: { name: "Jobgether", url: "https://jobgether.com/", category: "job_board" },
  underdog: { name: "Underdog.io", url: "https://underdog.io/", category: "job_board" },
  builtin: { name: "Built In", url: "https://builtin.com/jobs", category: "job_board" },
  remote_co: { name: "Remote.co", url: "https://remote.co/", category: "job_board" },
  skipthedrive: { name: "Skip The Drive", url: "https://www.skipthedrive.com/", category: "job_board" },
  remotive: { name: "Remotive", url: "https://remotive.com/", category: "job_board" },
  virtualvocations: { name: "Virtual Vocations", url: "https://www.virtualvocations.com/", category: "job_board" },
};

export function platformCategory(id: PlatformId): PlatformCategory {
  return PLATFORM_META[id].category;
}

/**
 * localStorage key the landing explorer writes and the onboarding wizard
 * reads: a picked platform survives the sign-in redirect as a pre-fill hint.
 */
export const PLATFORM_HINT_STORAGE_KEY = "lp.platformHint";

export function isPlatformId(value: unknown): value is PlatformId {
  return (
    typeof value === "string" && (PLATFORMS as readonly string[]).includes(value)
  );
}
