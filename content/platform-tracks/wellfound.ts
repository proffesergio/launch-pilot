/**
 * Wellfound Platform Track v0 (slice E). Curated from Wellfound's public
 * pages; heuristics labeled. Never scraped; never guessed.
 * Bump the version on any edit — live roadmaps pin the version they used.
 */
export const wellfoundTrack = {
  id: "wellfound" as const,
  version: "0.1.0",
  title: {
    bn: "ওয়েলফাউন্ড ট্র্যাক",
    en: "Wellfound track",
  },
  items: [
    {
      id: "startup_jobs_focus",
      kind: "rule" as const,
      text: {
        bn: "ওয়েলফাউন্ড মূলত স্টার্টআপ চাকরির সাইট — এক লাখের বেশি রিমোট ও অন-সাইট পদ, নতুন কোম্পানি থেকে দ্রুত বাড়তে থাকা স্টার্টআপ পর্যন্ত।",
        en: "Wellfound is a startup jobs site — 100k+ remote and on-site roles, from new companies to fast-growing startups.",
      },
      source: "https://wellfound.com/jobs",
      capturedAt: "2026-07-11",
    },
    {
      id: "salary_upfront",
      kind: "rule" as const,
      text: {
        bn: "বেশিরভাগ পোস্টে বেতন ও ইকুইটির পরিসর আগে থেকেই দেখানো থাকে — আবেদন করার আগেই জানতে পারবেন কত দিতে চায়।",
        en: "Most postings show salary and equity ranges upfront — you know the pay before you apply.",
      },
      source: "https://wellfound.com/jobs",
      capturedAt: "2026-07-11",
    },
    {
      id: "one_profile_many_applies",
      kind: "heuristic" as const,
      text: {
        bn: "একটি প্রোফাইলেই সব আবেদন হয়, তাই প্রোফাইলটিই আপনার সিভি — শিরোনাম, প্রজেক্ট আর 'কী খুঁজছেন' অংশ যত্ন নিয়ে পূরণ করুন।",
        en: "One profile powers every application, so the profile is your CV — fill the headline, projects, and 'what you're looking for' sections with care.",
      },
      capturedAt: "2026-07-11",
    },
    {
      id: "founder_chat",
      kind: "heuristic" as const,
      text: {
        bn: "এখানে প্রায়ই সরাসরি প্রতিষ্ঠাতার সাথে কথা হয় — ছোট, নির্দিষ্ট, কোম্পানি পড়ে লেখা প্রথম বার্তা সাধারণ 'আমাকে নিন' বার্তার চেয়ে বহুগুণ ভালো কাজ করে।",
        en: "You often talk directly with founders here — a short, specific first note that shows you read about the company beats a generic 'hire me' many times over.",
      },
      capturedAt: "2026-07-11",
    },
    {
      id: "remote_filter_eligibility",
      kind: "heuristic" as const,
      text: {
        bn: "রিমোট ফিল্টার দিলেও প্রতিটি পোস্টে লোকেশন শর্ত দেখুন — অনেক স্টার্টআপ নির্দিষ্ট টাইমজোন বা দেশ চায়। 'Anywhere' লেখা পদে সময় দিন, ধৈর্য ধরুন: উত্তর আসতে সপ্তাহও লাগতে পারে।",
        en: "Even with the remote filter on, check each post's location terms — many startups want specific time zones or countries. Spend your time on 'Anywhere' roles, and be patient: replies can take weeks.",
      },
      capturedAt: "2026-07-11",
    },
  ],
};
