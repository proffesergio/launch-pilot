/**
 * Remotive Platform Track v0 (slice E). Curated from the site's public pages;
 * heuristics labeled. Never scraped; never guessed.
 */
export const remotiveTrack = {
  id: "remotive" as const,
  version: "0.1.0",
  title: {
    bn: "রিমোটিভ ট্র্যাক",
    en: "Remotive track",
  },
  items: [
    {
      id: "tech_remote_focus",
      kind: "rule" as const,
      text: {
        bn: "রিমোটিভ প্রযুক্তি-কেন্দ্রিক রিমোট চাকরির বোর্ড — সফটওয়্যার, সাপোর্ট, মার্কেটিং, ডিজাইনসহ ক্যাটাগরিতে সাজানো, সাথে নিউজলেটার ও কমিউনিটি।",
        en: "Remotive is a tech-focused remote jobs board — organized by category (software, support, marketing, design) with a newsletter and community.",
      },
      source: "https://remotive.com/",
      capturedAt: "2026-07-11",
    },
    {
      id: "region_tags_explicit",
      kind: "heuristic" as const,
      text: {
        bn: "রিমোটিভের বড় সুবিধা: পোস্টে কোন অঞ্চলের প্রার্থী নেওয়া হবে তা স্পষ্ট ট্যাগ করা থাকে — 'Worldwide' ট্যাগ দিয়েই সার্চ শুরু করুন, অযোগ্য পদে এক মিনিটও নয়।",
        en: "Remotive's big advantage: posts carry explicit region-eligibility tags — start every search from the 'Worldwide' tag and spend zero minutes on roles you can't get.",
      },
      capturedAt: "2026-07-11",
    },
    {
      id: "newsletter_rhythm",
      kind: "heuristic" as const,
      text: {
        bn: "নিউজলেটারে সাবস্ক্রাইব করুন — বাছাই করা নতুন পদ নিয়মিত ইনবক্সে আসে; ভালো পদে দ্রুত আবেদন করার এটি সহজ উপায়।",
        en: "Subscribe to the newsletter — a regular batch of fresh roles lands in your inbox; it's the easy way to apply early to good ones.",
      },
      capturedAt: "2026-07-11",
    },
    {
      id: "support_and_qa_entry",
      kind: "heuristic" as const,
      text: {
        bn: "টেক বোর্ড হলেও নন-কোডিং প্রবেশপথ আছে: কাস্টমার সাপোর্ট আর কিউএ ক্যাটাগরি দুটোই লেখালেখি-নির্ভর — নতুনদের জন্য বাস্তবসম্মত শুরু।",
        en: "Though it's a tech board, non-coding entries exist: customer support and QA are both writing-heavy categories — realistic starts for beginners.",
      },
      capturedAt: "2026-07-11",
    },
  ],
};
