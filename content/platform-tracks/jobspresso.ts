/**
 * Jobspresso Platform Track v0 (slice E). Curated from the site's public
 * pages; heuristics labeled. Never scraped; never guessed.
 */
export const jobspressoTrack = {
  id: "jobspresso" as const,
  version: "0.1.0",
  title: {
    bn: "জবসপ্রেসো ট্র্যাক",
    en: "Jobspresso track",
  },
  items: [
    {
      id: "curated_focus",
      kind: "rule" as const,
      text: {
        bn: "জবসপ্রেসো টেক, মার্কেটিং ও কাস্টমার সাপোর্টের বাছাই করা রিমোট চাকরির বোর্ড — প্রতিটি পোস্ট হাতে যাচাই করে তোলা হয়।",
        en: "Jobspresso is a curated remote jobs board for tech, marketing, and customer support — every post is hand-picked and reviewed.",
      },
      source: "https://jobspresso.co/",
      capturedAt: "2026-07-11",
    },
    {
      id: "resume_upload",
      kind: "heuristic" as const,
      text: {
        bn: "এখানে সিভি আপলোড করে রাখা যায়, নিয়োগদাতা নিজে খুঁজে নিতে পারে — আবেদন করার পাশাপাশি এই উল্টো পথটাও চালু রাখুন। সিভিতে স্পষ্ট শিরোনাম আর দক্ষতার কীওয়ার্ড দিন।",
        en: "You can upload your resume so employers find you — keep this reverse channel open alongside applying. Give the resume a clear headline and skill keywords.",
      },
      capturedAt: "2026-07-11",
    },
    {
      id: "low_noise",
      kind: "heuristic" as const,
      text: {
        bn: "বাছাই করা বোর্ড মানে পোস্ট কম কিন্তু মান ভালো — রোজ শত শত নতুন পদ আশা করবেন না। সপ্তাহে দুবার দেখা আর মানানসই পদে যত্নের আবেদনই এখানকার সঠিক ছন্দ।",
        en: "Curated means fewer posts but better quality — don't expect hundreds of new roles daily. Checking twice a week and applying carefully to matches is the right rhythm here.",
      },
      capturedAt: "2026-07-11",
    },
    {
      id: "check_eligibility",
      kind: "heuristic" as const,
      text: {
        bn: "প্রতিটি পোস্টে লোকেশন শর্ত পড়ে নিন — সব রিমোট পদ বিশ্বব্যাপী নয়। বাংলাদেশ থেকে আবেদনযোগ্য কি না নিশ্চিত না হলে ছোট করে জিজ্ঞেস করেও নিতে পারেন।",
        en: "Read each post's location terms — not every remote role is worldwide. If you're unsure it's open from Bangladesh, a short polite question is fine.",
      },
      capturedAt: "2026-07-11",
    },
  ],
};
