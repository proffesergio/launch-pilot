/**
 * FlexJobs Platform Track v0 (slice E). Curated from the site's public pages;
 * heuristics labeled. Never scraped; never guessed.
 */
export const flexjobsTrack = {
  id: "flexjobs" as const,
  version: "0.1.0",
  title: {
    bn: "ফ্লেক্সজবস ট্র্যাক",
    en: "FlexJobs track",
  },
  items: [
    {
      id: "paid_membership",
      kind: "rule" as const,
      text: {
        bn: "ফ্লেক্সজবস একটি পেইড মেম্বারশিপ সাইট — পূর্ণ তালিকা দেখতে ও আবেদন করতে সাবস্ক্রিপশন লাগে। বিনিময়ে প্রতিটি পোস্ট হাতে যাচাই করা, ভুয়া পোস্ট নেই।",
        en: "FlexJobs is a paid membership site — full access to listings and applying requires a subscription. In return, every post is hand-screened, with no scam listings.",
      },
      source: "https://www.flexjobs.com/",
      capturedAt: "2026-07-11",
    },
    {
      id: "flexible_categories",
      kind: "rule" as const,
      text: {
        bn: "শুধু ফুল-টাইম নয়: রিমোট, হাইব্রিড, পার্ট-টাইম ও ফ্লেক্সিবল কাজও এখানে তালিকাভুক্ত — অ্যাডমিন, ভার্চুয়াল অ্যাসিস্ট্যান্ট, ডেটা এন্ট্রি, সাপোর্টের মতো শুরু-বান্ধব ক্যাটাগরিসহ।",
        en: "Not just full-time: remote, hybrid, part-time, and flexible roles are listed — including starter-friendly categories like admin, virtual assistance, data entry, and support.",
      },
      source: "https://www.flexjobs.com/",
      capturedAt: "2026-07-11",
    },
    {
      id: "cost_math",
      kind: "heuristic" as const,
      text: {
        bn: "সাবস্ক্রিপশনের খরচ ডলারে — টাকায় হিসাব করে দেখুন এবং তখনই নিন যখন সপ্তাহে কয়েক ঘণ্টা আবেদন করার সময় সত্যিই আছে। এক-দুই মাস মন দিয়ে ব্যবহার করে ফল না পেলে বন্ধ করে দিন।",
        en: "The subscription costs dollars — do the math in taka, and join only when you truly have a few hours a week to apply. Use it seriously for a month or two; if nothing lands, cancel.",
      },
      capturedAt: "2026-07-11",
    },
    {
      id: "screened_advantage",
      kind: "heuristic" as const,
      text: {
        bn: "যাচাই করা বোর্ডের সুবিধা: প্রতারণা চেনার দুশ্চিন্তা কম, তাই পুরো মনোযোগ দিন আবেদনের মানে — পদ অনুযায়ী সাজানো সিভি আর নির্দিষ্ট কভার লেটার।",
        en: "The screened board's advantage: less worry about spotting scams, so put all your attention on application quality — a tailored CV and a specific cover letter per role.",
      },
      capturedAt: "2026-07-11",
    },
    {
      id: "worldwide_filter",
      kind: "heuristic" as const,
      text: {
        bn: "সার্চে লোকেশন ফিল্টার ব্যবহার করে 'work from anywhere' পদ আলাদা করুন — মার্কিন-কেন্দ্রিক সাইট বলে অনেক পদ শুধু যুক্তরাষ্ট্রের জন্য।",
        en: "Use the location filters to isolate 'work from anywhere' roles — the site skews US-centric, and many roles are US-only.",
      },
      capturedAt: "2026-07-11",
    },
  ],
};
