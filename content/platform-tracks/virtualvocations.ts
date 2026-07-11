/**
 * Virtual Vocations Platform Track v0 (slice E). Curated from the site's
 * public pages; heuristics labeled. Never scraped; never guessed.
 */
export const virtualvocationsTrack = {
  id: "virtualvocations" as const,
  version: "0.1.0",
  title: {
    bn: "ভার্চুয়াল ভোকেশনস ট্র্যাক",
    en: "Virtual Vocations track",
  },
  items: [
    {
      id: "hand_screened",
      kind: "rule" as const,
      text: {
        bn: "ভার্চুয়াল ভোকেশনস হাতে-যাচাই করা রিমোট চাকরির সার্ভিস — প্রতিটি লিড পরীক্ষা করে তবেই তালিকায় তোলা হয়।",
        en: "Virtual Vocations is a job service built on hand-screened remote leads — every listing is checked before it goes up.",
      },
      source: "https://www.virtualvocations.com/",
      capturedAt: "2026-07-11",
    },
    {
      id: "subscription_model",
      kind: "heuristic" as const,
      text: {
        bn: "পূর্ণ ডেটাবেস দেখতে সাবস্ক্রিপশন লাগে; কিছু তালিকা ফ্রি-ও দেখা যায়। আগে ফ্রি অংশে ধরন বুঝুন, সপ্তাহে কয়েক ঘণ্টা আবেদন করার প্রস্তুতি থাকলে তবেই খরচের কথা ভাবুন।",
        en: "Full database access needs a subscription; some listings are viewable free. Feel out the free portion first, and consider paying only once you're ready to apply several hours a week.",
      },
      capturedAt: "2026-07-11",
    },
    {
      id: "admin_va_strength",
      kind: "heuristic" as const,
      text: {
        bn: "বোর্ডটি অ্যাডমিন, ভার্চুয়াল অ্যাসিস্ট্যান্ট, ডেটা এন্ট্রি ও সাপোর্ট ঘরানার পদে শক্তিশালী — লেখালেখি ও গোছানো কাজে যাদের হাত ভালো, তাদের জন্য মানানসই।",
        en: "The board is strong in admin, virtual assistant, data entry, and support roles — a good fit if organized, writing-centered work is your lane.",
      },
      capturedAt: "2026-07-11",
    },
    {
      id: "us_telecommute_bias",
      kind: "heuristic" as const,
      text: {
        bn: "সাইটটি মার্কিন টেলিকমিউট-ঘেঁষা — বহু পদ যুক্তরাষ্ট্রের বাসিন্দাদের জন্য। আন্তর্জাতিক প্রার্থী নেওয়া পদ আলাদা করে খুঁজুন ও নিশ্চিত হয়ে আবেদন করুন।",
        en: "The site skews toward US telecommute roles — many require US residency. Specifically hunt for internationally open roles and confirm before applying.",
      },
      capturedAt: "2026-07-11",
    },
  ],
};
