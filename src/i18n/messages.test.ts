import { describe, it, expect } from "vitest";

import bn from "../../messages/bn.json";
import en from "../../messages/en.json";

/** Flattens nested message objects into dot-joined key paths. */
function keyPaths(obj: Record<string, unknown>, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "object" && value !== null) {
      return keyPaths(value as Record<string, unknown>, path);
    }
    return [path];
  });
}

function leafValues(obj: Record<string, unknown>): string[] {
  return Object.values(obj).flatMap((value) =>
    typeof value === "object" && value !== null
      ? leafValues(value as Record<string, unknown>)
      : [String(value)],
  );
}

describe("message catalogs", () => {
  it("bn and en expose the identical set of keys", () => {
    expect(keyPaths(bn).sort()).toEqual(keyPaths(en).sort());
  });

  it("no message value is empty", () => {
    for (const catalog of [bn, en]) {
      for (const value of leafValues(catalog)) {
        expect(value.trim()).not.toBe("");
      }
    }
  });

  it("bn catalog is actually Bangla, not copied English", () => {
    // A bn leaf may be byte-identical to its en counterpart (technical strings:
    // brand name, email placeholder, a locale's own name). Anything translated
    // must contain at least one Bengali-script character.
    const bengali = /[ঀ-৿]/;
    const enByPath = new Map(
      keyPaths(en).map((path, i) => [path, leafValues(en)[i]]),
    );
    const bnPaths = keyPaths(bn);
    const bnValues = leafValues(bn);
    const translated = bnPaths.filter((p, i) => bnValues[i] !== enByPath.get(p));
    expect(translated.length).toBeGreaterThan(0);
    for (const [i, path] of bnPaths.entries()) {
      if (bnValues[i] === enByPath.get(path)) continue;
      expect(bengali.test(bnValues[i]), `not Bangla: ${path} = "${bnValues[i]}"`).toBe(true);
    }
  });
});
