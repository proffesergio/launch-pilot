import { z } from "zod";

import type { PlatformId } from "./platforms";

/**
 * Launch-asset shapes (M3.5). The structured drafts the Studio generates, edits,
 * and persists — one bundle per marketplace kind. Generated copy is ENGLISH ONLY:
 * Fiverr and Upwork reject non-English listings, so every text field is guarded
 * against Bengali codepoints at the schema boundary (a bad generation fails the
 * parse, never reaches the marketplace). Numbers/prices are exempt.
 */

export const ASSET_KINDS = ["fiverr_gig", "upwork_profile"] as const;
export type AssetKind = (typeof ASSET_KINDS)[number];

export type AssetStatus = "draft" | "published";

/** Bengali (Bangla) Unicode block. */
const BENGALI = /[ঀ-৿]/;

export function containsBengali(text: string): boolean {
  return BENGALI.test(text);
}

/** An English-only free-text field: non-empty and free of Bengali codepoints. */
function englishText(max = 5000) {
  return z
    .string()
    .trim()
    .min(1)
    .max(max)
    .refine((s) => !containsBengali(s), {
      message: "Marketplace copy must be English — Bangla is not accepted in listings.",
    });
}

const GigPackageSchema = z.object({
  name: englishText(40),
  // Fiverr's floor is $5; keep it a whole-dollar integer.
  priceUsd: z.number().int().min(5),
  deliveryDays: z.number().int().min(1).max(30),
  description: englishText(400),
});

export const FiverrGigSchema = z.object({
  title: englishText(80),
  packages: z.tuple([GigPackageSchema, GigPackageSchema, GigPackageSchema]),
  description: englishText(1200),
  faq: z.array(z.object({ q: englishText(200), a: englishText(600) })).min(1),
  galleryShotList: z.array(englishText(200)).min(1),
});

export const UpworkProfileSchema = z.object({
  headline: englishText(80),
  overview: englishText(2000),
  // Upwork's track rule: 6–12 portfolio samples (spec projects count).
  portfolioBriefs: z
    .array(z.object({ title: englishText(120), brief: englishText(600) }))
    .min(6)
    .max(12),
});

export type FiverrGig = z.infer<typeof FiverrGigSchema>;
export type UpworkProfile = z.infer<typeof UpworkProfileSchema>;
export type AssetContent = FiverrGig | UpworkProfile;

export function schemaForKind(kind: AssetKind) {
  return kind === "fiverr_gig" ? FiverrGigSchema : UpworkProfileSchema;
}

/** Marketplace platforms map to a kind; job boards have no gig/profile to draft. */
export function platformToAssetKind(platform: PlatformId): AssetKind | null {
  if (platform === "fiverr") return "fiverr_gig";
  if (platform === "upwork") return "upwork_profile";
  return null;
}

export function assetKindPlatform(kind: AssetKind): "fiverr" | "upwork" {
  return kind === "fiverr_gig" ? "fiverr" : "upwork";
}

/** Empty scaffold the editor renders before (or instead of) a generation. */
export function emptyDraft(kind: AssetKind): AssetContent {
  if (kind === "fiverr_gig") {
    const pkg = { name: "", priceUsd: 5, deliveryDays: 3, description: "" };
    return {
      title: "",
      packages: [{ ...pkg }, { ...pkg }, { ...pkg }],
      description: "",
      faq: [{ q: "", a: "" }],
      galleryShotList: [""],
    };
  }
  return {
    headline: "",
    overview: "",
    portfolioBriefs: Array.from({ length: 6 }, () => ({ title: "", brief: "" })),
  };
}
