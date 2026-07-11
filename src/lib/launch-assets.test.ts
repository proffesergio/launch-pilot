import { describe, it, expect } from "vitest";

import {
  ASSET_KINDS,
  FiverrGigSchema,
  UpworkProfileSchema,
  assetKindPlatform,
  containsBengali,
  emptyDraft,
  platformToAssetKind,
  schemaForKind,
} from "./launch-assets";

const validGig = {
  title: "I will design a modern minimalist logo for your brand",
  packages: [
    { name: "Basic", priceUsd: 10, deliveryDays: 3, description: "One concept, one revision." },
    { name: "Standard", priceUsd: 25, deliveryDays: 3, description: "Three concepts, source files." },
    { name: "Premium", priceUsd: 50, deliveryDays: 2, description: "Unlimited revisions, full brand kit." },
  ],
  description: "A clear, buyer-focused description of the logo service.",
  faq: [{ q: "Do you provide source files?", a: "Yes, in the Standard and Premium packages." }],
  galleryShotList: ["Three finished logo mockups on a neutral background"],
};

const validProfile = {
  headline: "Brand & Logo Designer for Early-Stage Startups",
  overview: "A specialized overview that states who I help and the outcomes I deliver.",
  portfolioBriefs: Array.from({ length: 6 }, (_, i) => ({
    title: `Sample project ${i + 1}`,
    brief: "A short brief describing the spec project and its result.",
  })),
};

describe("asset kinds ↔ platforms", () => {
  it("covers exactly the two marketplace kinds", () => {
    expect([...ASSET_KINDS].sort()).toEqual(["fiverr_gig", "upwork_profile"]);
  });

  it("maps marketplace platforms to a kind and job boards to null", () => {
    expect(platformToAssetKind("fiverr")).toBe("fiverr_gig");
    expect(platformToAssetKind("upwork")).toBe("upwork_profile");
    expect(platformToAssetKind("remoteok")).toBeNull();
    expect(platformToAssetKind("wellfound")).toBeNull();
  });

  it("round-trips kind back to its platform", () => {
    expect(assetKindPlatform("fiverr_gig")).toBe("fiverr");
    expect(assetKindPlatform("upwork_profile")).toBe("upwork");
  });

  it("schemaForKind returns the matching schema", () => {
    expect(schemaForKind("fiverr_gig")).toBe(FiverrGigSchema);
    expect(schemaForKind("upwork_profile")).toBe(UpworkProfileSchema);
  });
});

describe("FiverrGigSchema", () => {
  it("accepts a complete valid gig", () => {
    expect(() => FiverrGigSchema.parse(validGig)).not.toThrow();
  });

  it("requires exactly three packages", () => {
    expect(() =>
      FiverrGigSchema.parse({ ...validGig, packages: validGig.packages.slice(0, 2) }),
    ).toThrow();
  });

  it("rejects a price below Fiverr's $5 floor", () => {
    const packages = [
      { ...validGig.packages[0], priceUsd: 3 },
      validGig.packages[1],
      validGig.packages[2],
    ];
    expect(() => FiverrGigSchema.parse({ ...validGig, packages })).toThrow();
  });

  it("rejects Bangla copy — marketplaces reject non-English listings", () => {
    expect(() =>
      FiverrGigSchema.parse({ ...validGig, title: "আমি আপনার জন্য লোগো ডিজাইন করব" }),
    ).toThrow();
  });
});

describe("UpworkProfileSchema", () => {
  it("accepts a complete valid profile", () => {
    expect(() => UpworkProfileSchema.parse(validProfile)).not.toThrow();
  });

  it("requires 6–12 portfolio briefs", () => {
    expect(() =>
      UpworkProfileSchema.parse({ ...validProfile, portfolioBriefs: validProfile.portfolioBriefs.slice(0, 3) }),
    ).toThrow();
    expect(() =>
      UpworkProfileSchema.parse({
        ...validProfile,
        portfolioBriefs: Array.from({ length: 13 }, () => ({ title: "t", brief: "b" })),
      }),
    ).toThrow();
  });

  it("rejects Bangla copy in the overview", () => {
    expect(() =>
      UpworkProfileSchema.parse({ ...validProfile, overview: "আমি একজন ডিজাইনার" }),
    ).toThrow();
  });
});

describe("helpers", () => {
  it("containsBengali detects Bengali codepoints only", () => {
    expect(containsBengali("hello world")).toBe(false);
    expect(containsBengali("আমি")).toBe(true);
    expect(containsBengali("mixed আধা")).toBe(true);
  });

  it("emptyDraft returns a shape the editor can render for each kind", () => {
    const gig = emptyDraft("fiverr_gig");
    expect(gig).toHaveProperty("packages");
    expect(Array.isArray((gig as { packages: unknown[] }).packages)).toBe(true);
    const profile = emptyDraft("upwork_profile");
    expect(profile).toHaveProperty("portfolioBriefs");
  });
});
