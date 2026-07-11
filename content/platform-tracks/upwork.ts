/**
 * Upwork Platform Track v0 (M2). Rules cite Upwork's published resources;
 * first-client tactics are labeled heuristics. Version-pinned by roadmaps.
 */
export const upworkTrack = {
  id: "upwork" as const,
  version: "0.1.0",
  title: {
    bn: "আপওয়ার্ক ট্র্যাক",
    en: "Upwork track",
  },
  items: [
    {
      id: "profile_review",
      kind: "rule" as const,
      text: {
        bn: "আপওয়ার্ক প্রোফাইল অনুমোদনে স্বয়ংক্রিয় ও মানব — দুই ধাপের যাচাই হয়। অসম্পূর্ণ বা অস্পষ্ট প্রোফাইল প্রত্যাখ্যাত হওয়ার প্রধান কারণ।",
        en: "Upwork reviews profiles with both automated and human checks. Incomplete or vague profiles are the main reason applications get rejected.",
      },
      source: "https://www.upwork.com/resources/upwork-for-beginners",
      capturedAt: "2026-07-10",
    },
    {
      id: "id_verification",
      kind: "rule" as const,
      text: {
        bn: "পরিচয় যাচাইয়ে সরকার-প্রদত্ত আইডির স্পষ্ট ছবি লাগে, আর সব তথ্য প্রোফাইলের সাথে হুবহু মিলতে হয়।",
        en: "Identity verification requires clear photos of a government-issued ID, with details matching your profile exactly.",
      },
      source: "https://support.upwork.com/hc/en-us/articles/360016144974-How-to-enhance-your-freelancer-profile",
      capturedAt: "2026-07-10",
    },
    {
      id: "service_fee",
      kind: "rule" as const,
      text: {
        bn: "আপওয়ার্ক প্রতি চুক্তিতে ০–১৫% সার্ভিস ফি কাটে, উত্তোলনের আগে আয় থেকে বাদ যায়।",
        en: "Upwork deducts a 0–15% service fee per contract, taken from earnings before withdrawal.",
      },
      source: "https://www.upwork.com/resources/upwork-for-beginners",
      capturedAt: "2026-07-10",
    },
    {
      id: "specific_headline",
      kind: "heuristic" as const,
      text: {
        bn: "সাধারণ শিরোনাম নয়, নির্দিষ্ট হোন: 'ফ্রিল্যান্স রাইটার' নয় — 'প্রযুক্তি ও ফাইন্যান্সে বিশেষজ্ঞ SEO কনটেন্ট রাইটার'। স্পষ্টতা + বিশেষায়ন + পেশাদারিত্ব — এটাই অনুমোদনের সূত্র।",
        en: "Be specific, not generic: not 'Freelance Writer' but 'SEO content writer specializing in technology and finance'. Clarity + specialization + professionalism is the approval formula.",
      },
      source: "https://support.upwork.com/hc/en-us/articles/360016144974-How-to-enhance-your-freelancer-profile",
      capturedAt: "2026-07-10",
    },
    {
      id: "portfolio_samples",
      kind: "heuristic" as const,
      text: {
        bn: "৬–১২টি কাজের নমুনা দিন। ক্লায়েন্ট না থাকলে 'স্পেক প্রজেক্ট' বানান — বাস্তব কাজের মতো নমুনা, প্রতিটিতে আপনার ভূমিকা ও ফলাফল লেখা।",
        en: "Include 6–12 work samples. No clients yet? Create 'spec projects' — samples that mirror real client work, each with your role and the result.",
      },
      source: "https://support.upwork.com/hc/en-us/articles/360016144974-How-to-enhance-your-freelancer-profile",
      capturedAt: "2026-07-10",
    },
    {
      id: "professional_photo",
      kind: "heuristic" as const,
      text: {
        bn: "স্পষ্ট, পেশাদার হেডশট দিন: ভালো আলো, সাদামাটা ব্যাকগ্রাউন্ড, ক্যামেরার দিকে সরাসরি তাকানো। গ্রুপ ছবি বা ক্যাজুয়াল সেলফি নয়।",
        en: "Use a clear, professional headshot: good lighting, neutral background, facing the camera. No group photos or casual selfies.",
      },
      source: "https://support.upwork.com/hc/en-us/articles/360016144974-How-to-enhance-your-freelancer-profile",
      capturedAt: "2026-07-10",
    },
    {
      id: "first_client_targeting",
      kind: "heuristic" as const,
      text: {
        bn: "প্রথম কাজের জন্য বেছে নিন: নতুন ক্লায়েন্ট (অল্প হায়ার করেছে), ছোট প্রজেক্ট ($৫০–৫০০), স্পষ্ট চাহিদা লেখা কাজ, আর ১০টির কম প্রস্তাব পড়েছে এমন পোস্ট।",
        en: "For your first job target: newer clients (few past hires), smaller projects ($50–500), jobs with clear requirements, and posts with fewer than 10 proposals.",
      },
      capturedAt: "2026-07-10",
    },
    {
      id: "thirty_day_window",
      kind: "heuristic" as const,
      text: {
        bn: "প্রথম ৩০ দিনে প্রথম ক্লায়েন্ট পাওয়া টিকে থাকার সবচেয়ে বড় পূর্বাভাস — তাই শুরুতে প্রতিদিন সময় দিন, ছাড়িয়ে দেবেন না।",
        en: "Landing your first client within 30 days is the strongest predictor of sticking with it — so invest daily effort early rather than spreading it thin.",
      },
      capturedAt: "2026-07-10",
    },
  ],
};
