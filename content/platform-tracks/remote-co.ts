/**
 * Remote.co Platform Track v0 (slice E). Curated from the site's public
 * pages; heuristics labeled. Never scraped; never guessed.
 */
export const remoteCoTrack = {
  id: "remote_co" as const,
  version: "0.1.0",
  title: {
    bn: "রিমোট.কো ট্র্যাক",
    en: "Remote.co track",
  },
  items: [
    {
      id: "jobs_plus_learning",
      kind: "rule" as const,
      text: {
        bn: "রিমোট.কো চাকরির তালিকার সাথে রিমোট-কর্ম রিসোর্সও রাখে — রিমোট-ফার্স্ট কোম্পানিগুলো কীভাবে কাজ করে, নিয়োগ দেয় ও দল চালায় তার প্রশ্নোত্তরসহ।",
        en: "Remote.co pairs job listings with remote-work resources — including Q&A on how remote-first companies work, hire, and run teams.",
      },
      source: "https://remote.co/",
      capturedAt: "2026-07-11",
    },
    {
      id: "learn_the_culture",
      kind: "heuristic" as const,
      text: {
        bn: "রিসোর্স অংশটি নতুনদের জন্য সোনার খনি: ইন্টারভিউর আগে রিমোট-কাজের নিয়মকানুন (অ্যাসিনক্রোনাস যোগাযোগ, লিখিত আপডেট, টাইমজোন সৌজন্য) শিখে নিন — ইন্টারভিউতে এগুলো জানা থাকাই পার্থক্য গড়ে।",
        en: "The resources section is gold for beginners: learn remote-work norms (async communication, written updates, time zone etiquette) before interviews — knowing them is what sets you apart.",
      },
      capturedAt: "2026-07-11",
    },
    {
      id: "entry_categories",
      kind: "heuristic" as const,
      text: {
        bn: "কাস্টমার সার্ভিস, ভার্চুয়াল অ্যাসিস্ট্যান্ট ও ডেটা এন্ট্রি ক্যাটাগরিগুলো এখানে শুরু-বান্ধব — আগে সেগুলোতে দেখুন।",
        en: "The customer service, virtual assistant, and data entry categories are the starter-friendly ones here — look there first.",
      },
      capturedAt: "2026-07-11",
    },
    {
      id: "flexjobs_family",
      kind: "heuristic" as const,
      text: {
        bn: "সাইটটি ফ্লেক্সজবস পরিবারের — কিছু তালিকা সেখানকার সাবস্ক্রিপশনের দিকে নিয়ে যেতে পারে। ফ্রি অংশে যা মেলে তা আগে কাজে লাগান।",
        en: "The site is part of the FlexJobs family — some listings may route toward that subscription. Work the free portions first.",
      },
      capturedAt: "2026-07-11",
    },
  ],
};
