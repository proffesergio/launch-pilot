/**
 * Underdog.io Platform Track v0 (slice E). Curated from the site's public
 * pages; heuristics labeled. Never scraped; never guessed.
 */
export const underdogTrack = {
  id: "underdog" as const,
  version: "0.1.0",
  title: {
    bn: "আন্ডারডগ.আইও ট্র্যাক",
    en: "Underdog.io track",
  },
  items: [
    {
      id: "one_application_model",
      kind: "rule" as const,
      text: {
        bn: "আন্ডারডগ.আইও-তে একটি আবেদনেই কাজ শেষ: এক ফর্ম পূরণ করলে আপনার প্রোফাইল একসাথে অনেক স্টার্টআপের সামনে যায় — নিউইয়র্ক, সান ফ্রান্সিসকো ও রিমোট পদের জন্য।",
        en: "Underdog.io runs on a single application: fill one form and your profile goes in front of many startups at once — for NYC, SF, and remote roles.",
      },
      source: "https://underdog.io/",
      capturedAt: "2026-07-11",
    },
    {
      id: "reverse_marketplace",
      kind: "heuristic" as const,
      text: {
        bn: "এখানে ধরন উল্টো: আপনি আবেদন করে অপেক্ষা করেন, আগ্রহী কোম্পানিই যোগাযোগ করে। তাই ফর্মের প্রতিটি ঘর — বিশেষ করে প্রজেক্ট ও লিংক — যত্ন নিয়ে ভরুন; এটিই আপনার একমাত্র পিচ।",
        en: "The flow is reversed: you apply once and wait — interested companies reach out to you. So fill every field of the form with care, especially projects and links; it's your only pitch.",
      },
      capturedAt: "2026-07-11",
    },
    {
      id: "tech_startup_bar",
      kind: "heuristic" as const,
      text: {
        bn: "এখানকার স্টার্টআপগুলো মূলত মার্কিন, প্রত্যাশাও উঁচু — একদম নতুনদের জন্য এটি কঠিন পথ। একটি-দুটি বাস্তব প্রজেক্ট বা মার্কেটপ্লেস অভিজ্ঞতা জমার পর এখানে ফিরুন।",
        en: "The startups here are mostly US-based with a high bar — a hard path for absolute beginners. Come back after you've banked a real project or two, or some marketplace experience.",
      },
      capturedAt: "2026-07-11",
    },
    {
      id: "remote_subset",
      kind: "heuristic" as const,
      text: {
        bn: "সব পদ রিমোট নয় — অনেকগুলো নিউইয়র্ক/সান ফ্রান্সিসকো অফিসের জন্য। ফর্মে ও প্রত্যাশায় স্পষ্ট করে দিন আপনি শুধু রিমোট খুঁজছেন।",
        en: "Not every role is remote — many are for NYC/SF offices. Make it explicit in the form and your expectations that you're remote-only.",
      },
      capturedAt: "2026-07-11",
    },
  ],
};
