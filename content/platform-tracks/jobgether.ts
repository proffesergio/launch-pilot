/**
 * Jobgether Platform Track v0 (slice E). Curated from the site's public
 * pages; heuristics labeled. Never scraped; never guessed.
 */
export const jobgetherTrack = {
  id: "jobgether" as const,
  version: "0.1.0",
  title: {
    bn: "জবগেদার ট্র্যাক",
    en: "Jobgether track",
  },
  items: [
    {
      id: "matching_model",
      kind: "rule" as const,
      text: {
        bn: "জবগেদার প্রোফাইল-ভিত্তিক ম্যাচিং ব্যবহার করে: আপনার প্রোফাইলের সাথে প্রতিটি পদের মিল কতটা তা স্কোর করে দেখায়, আর এক লাখের বেশি রিমোট পদের তালিকা রাখে।",
        en: "Jobgether works on profile-based matching: it scores how well each of its 100k+ remote roles fits your profile.",
      },
      source: "https://jobgether.com/",
      capturedAt: "2026-07-11",
    },
    {
      id: "profile_completeness",
      kind: "heuristic" as const,
      text: {
        bn: "ম্যাচিং সাইটে প্রোফাইলই ইঞ্জিন — দক্ষতা, ভাষা, টাইমজোন, প্রত্যাশা যত সম্পূর্ণ, ম্যাচ তত ভালো। অর্ধেক-পূরণ প্রোফাইলে ভালো ম্যাচ আশা করা যায় না।",
        en: "On a matching site the profile is the engine — the more complete your skills, languages, time zone, and expectations, the better the matches. A half-filled profile earns poor matches.",
      },
      capturedAt: "2026-07-11",
    },
    {
      id: "match_score_honesty",
      kind: "heuristic" as const,
      text: {
        bn: "কম ম্যাচ-স্কোরের পদে গণহারে আবেদন করবেন না — স্কোর যেখানে বেশি সেখানে সময় দিন; বাকিটা দক্ষতা বাড়ানোর ইঙ্গিত হিসেবে নিন।",
        en: "Don't mass-apply to low-match roles — invest where your score is high, and treat the gaps as a signal for which skills to build next.",
      },
      capturedAt: "2026-07-11",
    },
    {
      id: "flex_details",
      kind: "heuristic" as const,
      text: {
        bn: "পোস্টে কাজের ধরন (সম্পূর্ণ রিমোট, হাইব্রিড, টাইমজোন শর্ত) স্পষ্ট করে দেখানো থাকে — বাংলাদেশের টাইমজোনের (UTC+6) সাথে মেলে কি না দেখে তবেই আবেদন করুন।",
        en: "Postings spell out the work setup (fully remote, hybrid, time zone requirements) — check it fits Bangladesh time (UTC+6) before applying.",
      },
      capturedAt: "2026-07-11",
    },
  ],
};
