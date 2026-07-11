/**
 * Working Nomads Platform Track v0 (slice E). Curated from the site's public
 * pages; heuristics labeled. Never scraped; never guessed.
 */
export const workingNomadsTrack = {
  id: "working_nomads" as const,
  version: "0.1.0",
  title: {
    bn: "ওয়ার্কিং নোম্যাডস ট্র্যাক",
    en: "Working Nomads track",
  },
  items: [
    {
      id: "curated_list",
      kind: "rule" as const,
      text: {
        bn: "ওয়ার্কিং নোম্যাডস একটি বাছাই করা রিমোট চাকরির তালিকা — ডেভেলপমেন্ট, মার্কেটিং, ম্যানেজমেন্টসহ নানা ক্যাটাগরিতে সাজানো।",
        en: "Working Nomads is a curated list of remote jobs, organized into categories like development, marketing, and management.",
      },
      source: "https://www.workingnomads.com/jobs",
      capturedAt: "2026-07-11",
    },
    {
      id: "aggregator_apply_elsewhere",
      kind: "heuristic" as const,
      text: {
        bn: "এটি একটি অ্যাগ্রিগেটর: আবেদন হয় কোম্পানির নিজের সাইটে। তাই আপনার সিভি ও লিংকডইন/পোর্টফোলিও আগে থেকে তৈরি রাখুন — প্রতিটি আবেদনই বাইরে গিয়ে করতে হবে।",
        en: "It's an aggregator: applications happen on the company's own site. Keep your CV and LinkedIn/portfolio ready — every application takes you off-site.",
      },
      capturedAt: "2026-07-11",
    },
    {
      id: "email_digest",
      kind: "heuristic" as const,
      text: {
        bn: "ইমেইল ডাইজেস্ট চালু করুন — নতুন পোস্ট আপনার ইনবক্সে আসবে, রোজ সাইট চেক করার দরকার নেই। নতুন পোস্টে আগেভাগে আবেদন করলে সুযোগ বেশি।",
        en: "Turn on the email digest — new postings land in your inbox so you don't have to check daily. Applying early to fresh posts improves your odds.",
      },
      capturedAt: "2026-07-11",
    },
    {
      id: "location_tags",
      kind: "heuristic" as const,
      text: {
        bn: "পোস্টের লোকেশন ট্যাগ দেখে তবেই সময় দিন: 'Anywhere' বা 'Worldwide' পদই বাংলাদেশ থেকে আবেদনযোগ্য; 'USA only' জাতীয় পদে আবেদন করা সময় নষ্ট।",
        en: "Check each post's location tag before investing time: only 'Anywhere'/'Worldwide' roles are open from Bangladesh; applying to 'USA only' posts wastes your effort.",
      },
      capturedAt: "2026-07-11",
    },
    {
      id: "patience_pipeline",
      kind: "heuristic" as const,
      text: {
        bn: "জব বোর্ডে গতি ধীর: সপ্তাহে অল্প কিছু মানানসই পদ পাবেন। প্রতিদিন ১৫ মিনিট দেখুন, মানানসইগুলো জমা রাখুন, আর প্রতিটির জন্য সিভি একটু করে সাজিয়ে পাঠান — গণহারে নয়।",
        en: "Job boards move slowly: expect only a few well-matched roles per week. Scan 15 minutes daily, shortlist matches, and tailor your CV for each — never mass-apply.",
      },
      capturedAt: "2026-07-11",
    },
  ],
};
