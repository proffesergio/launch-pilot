/**
 * Built In Platform Track v0 (slice E). Curated from the site's public pages;
 * heuristics labeled. Never scraped; never guessed.
 */
export const builtinTrack = {
  id: "builtin" as const,
  version: "0.1.0",
  title: {
    bn: "বিল্ট ইন ট্র্যাক",
    en: "Built In track",
  },
  items: [
    {
      id: "tech_hub_site",
      kind: "rule" as const,
      text: {
        bn: "বিল্ট ইন প্রযুক্তি চাকরির পাশাপাশি কোম্পানি প্রোফাইল, খবর ও রিসোর্স রাখে — মূলত মার্কিন টেক হাবগুলো ঘিরে, রিমোট ক্যাটাগরিসহ।",
        en: "Built In pairs tech jobs with company profiles, news, and resources — organized around US tech hubs, with a remote category.",
      },
      source: "https://builtin.com/jobs",
      capturedAt: "2026-07-11",
    },
    {
      id: "research_tool",
      kind: "heuristic" as const,
      text: {
        bn: "সাইটটিকে গবেষণার হাতিয়ার হিসেবেও ব্যবহার করুন: আবেদনের আগে কোম্পানি প্রোফাইল, টিম আর সংস্কৃতি পড়ে নিন — কভার লেটারে সেই নির্দিষ্ট তথ্যই আপনাকে আলাদা করবে।",
        en: "Use the site as a research tool too: read the company profile, team, and culture before applying — those specific details in your cover letter are what set you apart.",
      },
      capturedAt: "2026-07-11",
    },
    {
      id: "seniority_skew",
      kind: "heuristic" as const,
      text: {
        bn: "পদগুলো মিড থেকে সিনিয়র লেভেলে ঝোঁকা — একদম শুরুর জন্য কঠিন। এন্ট্রি-লেভেল ফিল্টার আছে, তবে বাস্তব প্রত্যাশা রাখুন: এটি দীর্ঘমেয়াদি লক্ষ্যের বোর্ড।",
        en: "Roles skew mid-to-senior — tough for a fresh start. An entry-level filter exists, but keep expectations real: this is a longer-horizon board.",
      },
      capturedAt: "2026-07-11",
    },
    {
      id: "us_eligibility",
      kind: "heuristic" as const,
      text: {
        bn: "মার্কিন-কেন্দ্রিক সাইট বলে বহু 'রিমোট' পদও শুধু যুক্তরাষ্ট্রের বাসিন্দাদের জন্য — পোস্টের eligibility অংশ পড়ে তবেই তালিকায় নিন।",
        en: "Because the site is US-centric, many 'remote' roles are US-resident only — read the eligibility line before shortlisting.",
      },
      capturedAt: "2026-07-11",
    },
  ],
};
