/**
 * Fiverr Platform Track v0 (M2). Curated from Fiverr's published Help Center
 * docs (rules) plus labeled heuristics. Never scraped; never guessed.
 * Bump the version on any edit — live roadmaps pin the version they used.
 */
export const fiverrTrack = {
  id: "fiverr" as const,
  version: "0.1.0",
  title: {
    bn: "ফাইভার ট্র্যাক",
    en: "Fiverr track",
  },
  items: [
    {
      id: "gig_sections_required",
      kind: "rule" as const,
      text: {
        bn: "প্রতিটি গিগে পাঁচটি অংশ সম্পূর্ণ করতে হয়: ওভারভিউ, প্রাইসিং, বিবরণ ও FAQ, রিকোয়ারমেন্টস, এবং গ্যালারি।",
        en: "Every gig must complete five sections: Overview, Pricing, Description & FAQ, Requirements, and Gallery.",
      },
      source: "https://help.fiverr.com/hc/en-us/articles/360010451397-Creating-a-Gig",
      capturedAt: "2026-07-10",
    },
    {
      id: "gig_desktop_only",
      kind: "rule" as const,
      text: {
        bn: "গিগ তৈরি ও সম্পাদনা শুধু ডেস্কটপ থেকে করা যায় — ফোন থেকে নয়। প্রয়োজনে কম্পিউটার আছে এমন কারো সাহায্য নিন।",
        en: "Gigs can be created and edited only from a desktop device, not a phone. Plan access to a computer for this step.",
      },
      source: "https://help.fiverr.com/hc/en-us/articles/360010451397-Creating-a-Gig",
      capturedAt: "2026-07-10",
    },
    {
      id: "commission_20",
      kind: "rule" as const,
      text: {
        bn: "ফাইভার প্রতিটি আয়ের উপর ২০% কমিশন রাখে — টিপস সহ। ১০ ডলারের অর্ডারে আপনি পাবেন ৮ ডলার। দাম ঠিক করার সময় এটা হিসাবে রাখুন।",
        en: "Fiverr keeps a flat 20% commission on all earnings, including tips. A $10 order pays you $8 — price with this in mind.",
      },
      source: "https://help.fiverr.com/hc/en-us/articles/360010530058-Withdrawing-your-earnings-managing-payout-methods",
      capturedAt: "2026-07-10",
    },
    {
      id: "video_75s",
      kind: "rule" as const,
      text: {
        bn: "গিগ ভিডিও ৭৫ সেকেন্ডের বেশি হতে পারবে না।",
        en: "A gig video must not be longer than 75 seconds.",
      },
      source: "https://help.fiverr.com/hc/en-us/articles/360010452317-Gigs-best-practices",
      capturedAt: "2026-07-10",
    },
    {
      id: "onboarding_forms",
      kind: "rule" as const,
      text: {
        bn: "সেলার প্রোফাইল চালু করতে সব অনবোর্ডিং ধাপ শেষ করতে হয়, যার মধ্যে ডিসপ্লে নাম ঠিক করা আছে।",
        en: "Activating a seller profile requires completing every onboarding step, including setting a display name.",
      },
      source: "https://help.fiverr.com/hc/en-us/articles/360010451397-Creating-a-Gig",
      capturedAt: "2026-07-10",
    },
    {
      id: "packages_three",
      kind: "rule" as const,
      text: {
        bn: "একটি গিগে সর্বোচ্চ তিনটি প্যাকেজ (বেসিক, স্ট্যান্ডার্ড, প্রিমিয়াম) দেওয়া যায় — ভিন্ন ভিন্ন দামে বেশি ক্রেতার কাছে পৌঁছাতে।",
        en: "A gig can offer up to three packages at different price points to appeal to a wider range of buyers.",
      },
      source: "https://help.fiverr.com/hc/en-us/articles/360010452317-Gigs-best-practices",
      capturedAt: "2026-07-10",
    },
    {
      id: "title_keyword",
      kind: "heuristic" as const,
      text: {
        bn: "গিগ শিরোনাম 'I will…' দিয়ে শুরু করে একটি শক্তিশালী ক্রিয়া ও আপনার মূল কীওয়ার্ড ব্যবহার করুন। আপনার সাবক্যাটাগরির জনপ্রিয় গিগগুলো দেখে সাধারণ কীওয়ার্ড খুঁজুন।",
        en: "Start your gig title's 'I will…' with a strong verb and your main keyword. Browse your subcategory's popular gigs to find the common keywords.",
      },
      source: "https://help.fiverr.com/hc/en-us/articles/360010452317-Gigs-best-practices",
      capturedAt: "2026-07-10",
    },
    {
      id: "gallery_quality",
      kind: "heuristic" as const,
      text: {
        bn: "গ্যালারিই প্রথম নজর কাড়ে: উঁচু মানের ছবি ও সম্ভব হলে ভিডিও দিন — ভিডিওসহ গিগ সাধারণত ভালো করে।",
        en: "The gallery is what buyers notice first: use high-quality images and a video if you can — gigs with videos tend to perform better.",
      },
      source: "https://help.fiverr.com/hc/en-us/articles/360010452317-Gigs-best-practices",
      capturedAt: "2026-07-10",
    },
    {
      id: "faq_preempt",
      kind: "heuristic" as const,
      text: {
        bn: "ক্রেতারা যা বারবার জিজ্ঞেস করে, তা FAQ-তে আগেই লিখে দিন — অর্ডারের আগে প্রত্যাশা পরিষ্কার থাকলে রিভিউ ভালো হয়।",
        en: "Answer your most common buyer questions in the FAQ before they're asked — clear expectations before the order lead to better reviews.",
      },
      source: "https://help.fiverr.com/hc/en-us/articles/360010452317-Gigs-best-practices",
      capturedAt: "2026-07-10",
    },
    {
      id: "scope_exclusions",
      kind: "heuristic" as const,
      text: {
        bn: "বিবরণে শুধু কী করবেন তা নয়, কী করবেন না সেটাও লিখুন — ভুল বোঝাবুঝি আর ক্যানসেলেশন কমে।",
        en: "In the description, say what you don't offer as well as what you do — it prevents misunderstandings and cancellations.",
      },
      source: "https://help.fiverr.com/hc/en-us/articles/360010452317-Gigs-best-practices",
      capturedAt: "2026-07-10",
    },
  ],
};
