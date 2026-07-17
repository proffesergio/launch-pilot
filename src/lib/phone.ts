/**
 * International phone normalization to E.164 (ADR-0013: global-first). The
 * sign-in form pairs a country dial-code picker with a national number;
 * `toE164` combines them, tolerating the separators and a leading trunk-prefix
 * "0" that people actually type. E.164 permits at most 15 digits total.
 *
 * This is deliberately lightweight — no per-country subscriber-length rules
 * (that's a future libphonenumber upgrade). Genuinely invalid numbers simply
 * fail when the OTP can't be delivered.
 */

export type DialCode = { code: string; dial: string; name: string; flag: string };

// Curated, not exhaustive — the largest freelance markets, Bangladesh (the
// flagship region) first so it stays the default. Extend as the community
// needs it (see CONTRIBUTING). Keyed by ISO country `code` because some dial
// codes are shared (e.g. +1 for US and Canada).
export const DIAL_CODES: DialCode[] = [
  { code: "BD", dial: "+880", name: "Bangladesh", flag: "🇧🇩" },
  { code: "IN", dial: "+91", name: "India", flag: "🇮🇳" },
  { code: "PK", dial: "+92", name: "Pakistan", flag: "🇵🇰" },
  { code: "US", dial: "+1", name: "United States", flag: "🇺🇸" },
  { code: "GB", dial: "+44", name: "United Kingdom", flag: "🇬🇧" },
  { code: "CA", dial: "+1", name: "Canada", flag: "🇨🇦" },
  { code: "PH", dial: "+63", name: "Philippines", flag: "🇵🇭" },
  { code: "NG", dial: "+234", name: "Nigeria", flag: "🇳🇬" },
  { code: "KE", dial: "+254", name: "Kenya", flag: "🇰🇪" },
  { code: "EG", dial: "+20", name: "Egypt", flag: "🇪🇬" },
  { code: "ID", dial: "+62", name: "Indonesia", flag: "🇮🇩" },
  { code: "VN", dial: "+84", name: "Vietnam", flag: "🇻🇳" },
  { code: "LK", dial: "+94", name: "Sri Lanka", flag: "🇱🇰" },
  { code: "NP", dial: "+977", name: "Nepal", flag: "🇳🇵" },
  { code: "BR", dial: "+55", name: "Brazil", flag: "🇧🇷" },
  { code: "MX", dial: "+52", name: "Mexico", flag: "🇲🇽" },
  { code: "AR", dial: "+54", name: "Argentina", flag: "🇦🇷" },
  { code: "ZA", dial: "+27", name: "South Africa", flag: "🇿🇦" },
  { code: "GH", dial: "+233", name: "Ghana", flag: "🇬🇭" },
  { code: "DE", dial: "+49", name: "Germany", flag: "🇩🇪" },
  { code: "FR", dial: "+33", name: "France", flag: "🇫🇷" },
  { code: "ES", dial: "+34", name: "Spain", flag: "🇪🇸" },
  { code: "TR", dial: "+90", name: "Turkey", flag: "🇹🇷" },
  { code: "AE", dial: "+971", name: "United Arab Emirates", flag: "🇦🇪" },
  { code: "AU", dial: "+61", name: "Australia", flag: "🇦🇺" },
];

export const DEFAULT_DIAL_CODE = DIAL_CODES[0]; // Bangladesh — flagship region.

/**
 * Combine a country dial code (e.g. "+880") and a national number into E.164,
 * or null when the result can't be a valid E.164 number.
 */
export function toE164(dial: string, national: string): string | null {
  const dialDigits = dial.replace(/\D/g, "");
  const national_digits = national.replace(/\D/g, "").replace(/^0+/, "");
  if (national_digits.length < 4) return null;
  const total = dialDigits.length + national_digits.length;
  if (total < 8 || total > 15) return null;
  return `+${dialDigits}${national_digits}`;
}
