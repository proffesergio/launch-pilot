/**
 * JustRemote Platform Track v0 (slice E). Curated from the site's public
 * pages; heuristics labeled. Never scraped; never guessed.
 */
export const justremoteTrack = {
  id: "justremote" as const,
  version: "0.1.0",
  title: {
    bn: "জাস্টরিমোট ট্র্যাক",
    en: "JustRemote track",
  },
  items: [
    {
      id: "fully_partially_remote",
      kind: "rule" as const,
      text: {
        bn: "জাস্টরিমোট সম্পূর্ণ ও আংশিক রিমোট — দুই ধরনের পদই তালিকাভুক্ত করে, ডেভেলপমেন্ট, মার্কেটিং, ডিজাইন, এইচআরসহ নানা বিভাগে।",
        en: "JustRemote lists both fully and partially remote roles, across development, marketing, design, HR and more.",
      },
      source: "https://justremote.co/",
      capturedAt: "2026-07-11",
    },
    {
      id: "country_filter",
      kind: "heuristic" as const,
      text: {
        bn: "চাকরিগুলো দেশ/অঞ্চল ধরে ফিল্টার করা যায় — শুরুতেই 'Anywhere' ফিল্টার দিন, তাতে অযোগ্য পদ ঘেঁটে সময় নষ্ট হবে না।",
        en: "Jobs can be filtered by country/region — set the 'Anywhere' filter first so you never waste time on roles you can't get.",
      },
      capturedAt: "2026-07-11",
    },
    {
      id: "power_search",
      kind: "heuristic" as const,
      text: {
        bn: "সাইটের পেইড 'PowerSearch' ফিচার প্রকাশ্যে বিজ্ঞাপন-না-করা পদও দেখায়। এটা ঐচ্ছিক — আগে ফ্রি তালিকায় কয়েক সপ্তাহ চেষ্টা করুন, তারপর দরকার মনে হলে ভাবুন।",
        en: "The paid 'PowerSearch' feature surfaces roles not advertised publicly. It's optional — work the free listings for a few weeks first, then consider it if needed.",
      },
      capturedAt: "2026-07-11",
    },
    {
      id: "small_board_rhythm",
      kind: "heuristic" as const,
      text: {
        bn: "এটি ছোট, গোছানো বোর্ড — নতুন পোস্ট সীমিত। এটাকে আপনার একমাত্র উৎস নয়, সাপ্তাহিক চেকলিস্টের একটি স্টপ হিসেবে রাখুন।",
        en: "It's a smaller, tidy board — new posts are limited. Treat it as one stop on your weekly checklist, not your only source.",
      },
      capturedAt: "2026-07-11",
    },
  ],
};
