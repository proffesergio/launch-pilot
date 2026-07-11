/**
 * We Work Remotely Platform Track v0 (slice E). Curated from the site's
 * public pages; heuristics labeled. Never scraped; never guessed.
 */
export const weworkremotelyTrack = {
  id: "weworkremotely" as const,
  version: "0.1.0",
  title: {
    bn: "উই ওয়ার্ক রিমোটলি ট্র্যাক",
    en: "We Work Remotely track",
  },
  items: [
    {
      id: "large_community",
      kind: "rule" as const,
      text: {
        bn: "উই ওয়ার্ক রিমোটলি বিশ্বের বৃহত্তম রিমোট-কাজ কমিউনিটিগুলোর একটি — প্রোগ্রামিং, ডিজাইন, মার্কেটিং, কাস্টমার সাপোর্টসহ নানা ক্যাটাগরির চাকরি।",
        en: "We Work Remotely is one of the largest remote work communities in the world, with jobs across programming, design, marketing, customer support and more.",
      },
      source: "https://weworkremotely.com/",
      capturedAt: "2026-07-11",
    },
    {
      id: "paid_listings_serious",
      kind: "heuristic" as const,
      text: {
        bn: "এখানে চাকরি পোস্ট করতে কোম্পানিকে টাকা দিতে হয় — ফলে ভুয়া পোস্ট কম, নিয়োগদাতারা সিরিয়াস। বিনিময়ে প্রতিটি পোস্টে আবেদনকারীও বেশি, তাই আবেদন আলাদা হওয়া চাই।",
        en: "Companies pay to post here — so fake listings are rare and employers are serious. The flip side: each post draws many applicants, so yours must stand out.",
      },
      capturedAt: "2026-07-11",
    },
    {
      id: "support_entry_path",
      kind: "heuristic" as const,
      text: {
        bn: "কাস্টমার সাপোর্ট ক্যাটাগরিটি নতুনদের জন্য সবচেয়ে বাস্তব প্রবেশপথ — লেখার হাত ভালো আর ইংরেজি সহনীয় হলে অভিজ্ঞতা ছাড়াও ডাক পাওয়া সম্ভব।",
        en: "The customer support category is the most realistic entry path for beginners — decent writing and workable English can get you interviews without deep experience.",
      },
      capturedAt: "2026-07-11",
    },
    {
      id: "region_restrictions",
      kind: "heuristic" as const,
      text: {
        bn: "প্রতিটি পোস্টের 'region' অংশ পড়ুন — অনেক পদ নির্দিষ্ট অঞ্চলের জন্য। 'Anywhere in the World' চিহ্নিত পদগুলোই আপনার তালিকায় রাখুন।",
        en: "Read each post's region line — many roles are region-locked. Keep only roles marked 'Anywhere in the World' on your shortlist.",
      },
      capturedAt: "2026-07-11",
    },
    {
      id: "follow_instructions",
      kind: "heuristic" as const,
      text: {
        bn: "আবেদনের নির্দেশনা অক্ষরে অক্ষরে মানুন — অনেক নিয়োগদাতা ইচ্ছা করে ছোট নির্দেশ দেন (যেমন সাবজেক্টে নির্দিষ্ট শব্দ) মনোযোগ যাচাই করতে। না মানলে আবেদন পড়াও হয় না।",
        en: "Follow application instructions to the letter — many employers add small tests on purpose (like a specific word in the subject line) to check attention. Miss them and your application is never read.",
      },
      capturedAt: "2026-07-11",
    },
  ],
};
