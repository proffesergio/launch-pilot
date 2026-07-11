/**
 * Web3.career Platform Track v0 (slice E). Curated from the site's public
 * pages; heuristics labeled. Never scraped; never guessed.
 */
export const web3CareerTrack = {
  id: "web3_career" as const,
  version: "0.1.0",
  title: {
    bn: "ওয়েব৩.ক্যারিয়ার ট্র্যাক",
    en: "Web3.career track",
  },
  items: [
    {
      id: "niche_web3",
      kind: "rule" as const,
      text: {
        bn: "ওয়েব৩.ক্যারিয়ার ব্লকচেইন ও ওয়েব৩ কোম্পানির চাকরির বিশেষায়িত বোর্ড — ডেভেলপার ছাড়াও মার্কেটিং, ডিজাইন, কমিউনিটি ম্যানেজমেন্টের পদ থাকে।",
        en: "Web3.career is a specialized board for blockchain and Web3 company jobs — beyond developers, it lists marketing, design, and community management roles.",
      },
      source: "https://web3.career/",
      capturedAt: "2026-07-11",
    },
    {
      id: "niche_advantage",
      kind: "heuristic" as const,
      text: {
        bn: "নিস (niche) মানেই সুবিধা: ওয়েব৩ শব্দভাণ্ডার শিখে প্রোফাইলে দেখাতে পারলে প্রতিযোগিতা সাধারণ বোর্ডের চেয়ে কম। ডিসকর্ড কমিউনিটি মডারেশন নতুনদের একটি বাস্তব প্রবেশপথ।",
        en: "Niche means leverage: learn the Web3 vocabulary and show it on your profile, and you face less competition than on general boards. Discord community moderation is a realistic entry path for beginners.",
      },
      capturedAt: "2026-07-11",
    },
    {
      id: "salary_transparency",
      kind: "heuristic" as const,
      text: {
        bn: "অনেক পোস্টে বেতনের পরিসর দেখানো থাকে — আবেদনের আগে তুলনা করুন, আর রেঞ্জ দেখে বাস্তব প্রত্যাশা ঠিক করুন।",
        en: "Many listings show salary ranges — compare before applying and calibrate your expectations from the ranges you see.",
      },
      capturedAt: "2026-07-11",
    },
    {
      id: "scam_guard",
      kind: "heuristic" as const,
      text: {
        bn: "ওয়েব৩ জগতে প্রতারণাও বেশি: কেউ আবেদন করতে টাকা চাইলে, ওয়ালেট কানেক্ট করতে বললে, বা 'আগে টোকেন কিনুন' বললে সেটি চাকরি নয় — সরে আসুন। বৈধ নিয়োগদাতা কখনো টাকা চায় না।",
        en: "Scams are more common in Web3: if anyone asks you to pay to apply, connect a wallet, or 'buy tokens first', that is not a job — walk away. Legitimate employers never ask for money.",
      },
      capturedAt: "2026-07-11",
    },
    {
      id: "crypto_payment_reality",
      kind: "heuristic" as const,
      text: {
        bn: "কিছু ওয়েব৩ কোম্পানি ক্রিপ্টোতে বেতন দিতে চায়। বাংলাদেশে ক্রিপ্টো লেনদেনের নিয়মকানুন জটিল — চুক্তির আগে পেমেন্ট কীভাবে ব্যাংক/বিকাশে আসবে তা পরিষ্কার করে নিন।",
        en: "Some Web3 companies prefer paying in crypto. Crypto's regulatory status in Bangladesh is complicated — before signing, get clear on how payment will actually reach your bank/bKash.",
      },
      capturedAt: "2026-07-11",
    },
  ],
};
