/**
 * RemoteOK Platform Track v0 (slice E). Curated from the site's public pages;
 * heuristics labeled. Never scraped; never guessed.
 */
export const remoteokTrack = {
  id: "remoteok" as const,
  version: "0.1.0",
  title: {
    bn: "রিমোটওকে ট্র্যাক",
    en: "RemoteOK track",
  },
  items: [
    {
      id: "big_open_board",
      kind: "rule" as const,
      text: {
        bn: "রিমোটওকে-তে ডেভেলপার, ডিজাইনার, কপিরাইটার, কাস্টমার সাপোর্টসহ বহু ক্যাটাগরিতে লক্ষাধিক রিমোট চাকরি তালিকাভুক্ত — ব্রাউজ করতে অ্যাকাউন্টও লাগে না।",
        en: "RemoteOK lists 100k+ remote jobs across categories — developer, designer, copywriter, customer support and more — and you can browse without an account.",
      },
      source: "https://remoteok.com/",
      capturedAt: "2026-07-11",
    },
    {
      id: "newest_first_speed",
      kind: "heuristic" as const,
      text: {
        bn: "ফিডে নতুন পোস্ট উপরে থাকে আর প্রতিযোগিতা বিশ্বব্যাপী — তাই গতি গুরুত্বপূর্ণ। পোস্ট হওয়ার প্রথম এক-দুই দিনে গোছানো আবেদন পাঠাতে পারলে সুযোগ অনেক বেশি।",
        en: "The feed shows newest posts first and competition is global — so speed matters. A tidy application within the first day or two of a posting has far better odds.",
      },
      capturedAt: "2026-07-11",
    },
    {
      id: "external_apply",
      kind: "heuristic" as const,
      text: {
        bn: "'Apply' বোতাম সাধারণত কোম্পানির নিজের ফর্মে নিয়ে যায় — প্রতিটি আবেদন সেখানে আলাদা করে করতে হয়। সিভি, ছোট কভার নোট, আর পোর্টফোলিও লিংক আগে থেকেই প্রস্তুত রাখুন।",
        en: "The 'Apply' button usually leads to the company's own form — each application happens there separately. Keep your CV, a short cover note, and portfolio link ready in advance.",
      },
      capturedAt: "2026-07-11",
    },
    {
      id: "worldwide_tag",
      kind: "heuristic" as const,
      text: {
        bn: "পোস্টের লোকেশন ট্যাগ আগে দেখুন: 'Worldwide' ছাড়া অন্য ট্যাগের (যেমন 'North America') পদে বাংলাদেশ থেকে সাধারণত নেওয়া হয় না — বাছাইয়ের সময়ই বাদ দিন।",
        en: "Check the location tag first: unless it says 'Worldwide', roles tagged for a region (like 'North America') usually won't hire from Bangladesh — filter them out at the shortlist stage.",
      },
      capturedAt: "2026-07-11",
    },
    {
      id: "board_vs_marketplace",
      kind: "heuristic" as const,
      text: {
        bn: "মনে রাখুন: এটি মার্কেটপ্লেস নয়, চাকরির বোর্ড — এখানে ছোট গিগ নেই, পুরো চাকরি বা চুক্তি। প্রথম ডলার দ্রুত চাইলে মার্কেটপ্লেস দ্রুততর; এখানে লক্ষ্য কয়েক সপ্তাহে একটি ভালো পদ।",
        en: "Remember: this is a job board, not a marketplace — no small gigs, whole jobs or contracts. If you want your first dollar fast, marketplaces are quicker; here the goal is one good role over several weeks.",
      },
      capturedAt: "2026-07-11",
    },
  ],
};
