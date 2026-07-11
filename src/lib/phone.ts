/**
 * BD phone normalization (v1 is Bangladesh-first, like everything else).
 * Accepts the forms people actually type — 01712345678, +880..., 880...,
 * with stray spaces/dashes — and canonicalizes to E.164 (+8801XXXXXXXXX).
 * BD mobiles are 11 digits locally, operator prefixes 013–019.
 */
export function normalizeBdPhone(raw: string): string | null {
  const digits = raw.replace(/[\s-]/g, "");
  let local: string;
  if (/^\+?880\d+$/.test(digits)) {
    local = "0" + digits.replace(/^\+?880/, "");
  } else if (/^0\d+$/.test(digits)) {
    local = digits;
  } else {
    return null;
  }
  if (!/^01[3-9]\d{8}$/.test(local)) return null;
  return `+880${local.slice(1)}`;
}
