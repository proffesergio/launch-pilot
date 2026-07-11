/**
 * Skip The Drive Platform Track v0 (slice E). Curated from the site's public
 * pages; heuristics labeled. Never scraped; never guessed.
 */
export const skipthedriveTrack = {
  id: "skipthedrive" as const,
  version: "0.1.0",
  title: {
    bn: "স্কিপ দ্য ড্রাইভ ট্র্যাক",
    en: "Skip The Drive track",
  },
  items: [
    {
      id: "aggregator_simple",
      kind: "rule" as const,
      text: {
        bn: "স্কিপ দ্য ড্রাইভ হাজারো রিমোট ও হাইব্রিড চাকরি এক জায়গায় জড়ো করে — সহজ সার্চ আর ক্যাটাগরি ফিল্টারে।",
        en: "Skip The Drive aggregates thousands of remote and hybrid jobs in one place, with simple search and category filters.",
      },
      source: "https://www.skipthedrive.com/",
      capturedAt: "2026-07-11",
    },
    {
      id: "no_account_needed",
      kind: "heuristic" as const,
      text: {
        bn: "অ্যাকাউন্ট ছাড়াই ব্রাউজ করা যায়, আবেদন হয় নিয়োগদাতার সাইটে — এটাকে দ্রুত স্ক্যানের বোর্ড হিসেবে ব্যবহার করুন, দিনে-দুদিনে একবার চোখ বুলিয়ে মানানসই পদ শর্টলিস্ট করুন।",
        en: "You can browse without an account, and applications happen on the employer's site — treat it as a quick-scan board: skim every day or two and shortlist matches.",
      },
      capturedAt: "2026-07-11",
    },
    {
      id: "us_leaning",
      kind: "heuristic" as const,
      text: {
        bn: "তালিকা মার্কিন-ঝোঁকা — 'রিমোট' লেখা থাকলেও দেশ-শর্ত থাকতে পারে। মূল পোস্ট খুলে eligibility নিশ্চিত করে তবেই সময় দিন।",
        en: "Listings lean US — 'remote' can still carry a country requirement. Open the original post and confirm eligibility before investing time.",
      },
      capturedAt: "2026-07-11",
    },
    {
      id: "one_of_many",
      kind: "heuristic" as const,
      text: {
        bn: "ছোট অ্যাগ্রিগেটর একা যথেষ্ট নয় — এটিকে সাপ্তাহিক রুটিনের সহায়ক উৎস রাখুন, মূল ভরসা নয়।",
        en: "A small aggregator isn't enough alone — keep it as a supporting source in your weekly routine, not your main bet.",
      },
      capturedAt: "2026-07-11",
    },
  ],
};
