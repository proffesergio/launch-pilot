import { z } from "zod";

import { toolCatalog } from "@content/tools/catalog";
import {
  PLATFORMS,
  platformCategory,
  type PlatformId,
} from "./platforms";
import { SKILLS, type SkillId } from "./skills";

/**
 * Tools catalog (M3.5 Playbook). Curated, versioned, in-repo — Zod-validated at
 * the boundary so a bad edit fails tests, not production. `toolsForPlatform`
 * is a pure, free (no-AI) filter: it never invents a tool, it selects from the
 * catalog. Platform scoping uses "all"/category/explicit-list; skill scoping,
 * when a skill is given, hides tools meant for other skills and floats
 * skill-specific ones above the general ("all") ones.
 */

const BilingualText = z.object({ bn: z.string().min(1), en: z.string().min(1) });

export const ToolSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  url: z.string().url().startsWith("https://"),
  pricing: z.enum(["free", "freemium", "paid"]),
  skills: z.union([z.literal("all"), z.array(z.enum(SKILLS)).min(1)]),
  platforms: z.union([
    z.literal("all"),
    z.literal("marketplace"),
    z.literal("job_board"),
    z.array(z.enum(PLATFORMS)).min(1),
  ]),
  whatFor: BilingualText,
});

export type Tool = z.infer<typeof ToolSchema>;

export function loadTools(): Tool[] {
  return toolCatalog.map((t) => ToolSchema.parse(t));
}

function matchesPlatform(tool: Tool, platform: PlatformId): boolean {
  const { platforms } = tool;
  if (platforms === "all") return true;
  if (platforms === "marketplace" || platforms === "job_board") {
    return platformCategory(platform) === platforms;
  }
  return platforms.includes(platform);
}

/** 2 = skill-specific match, 1 = general ("all"), 0 = other-skill (excluded). */
function skillScore(tool: Tool, skill: SkillId | undefined): number {
  if (!skill) return 1;
  if (tool.skills === "all") return 1;
  return tool.skills.includes(skill) ? 2 : 0;
}

export function toolsForPlatform(
  platform: PlatformId,
  skill?: SkillId,
): Tool[] {
  return loadTools()
    .map((tool) => ({ tool, score: skillScore(tool, skill) }))
    .filter(({ tool, score }) => score > 0 && matchesPlatform(tool, platform))
    .sort((a, b) => b.score - a.score) // stable: skill-specific first
    .map(({ tool }) => tool);
}
