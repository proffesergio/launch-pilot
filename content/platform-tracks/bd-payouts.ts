/**
 * Bangladesh payout module v0 (M2). The honest-money layer: how earnings
 * actually reach a Bangladeshi freelancer, with fees and caveats stated
 * plainly. Applies to both platform tracks.
 */
export const bdPayoutsTrack = {
  id: "bd_payouts" as const,
  version: "0.1.0",
  title: {
    bn: "বাংলাদেশে টাকা তোলা",
    en: "Getting paid in Bangladesh",
  },
  items: [
    {
      id: "payoneer_default",
      kind: "rule" as const,
      text: {
        bn: "বাংলাদেশি ফ্রিল্যান্সারদের জন্য Payoneer-ই সবচেয়ে প্রচলিত উত্তোলন মাধ্যম — ফাইভার ও আপওয়ার্ক দুটোই সমর্থন করে।",
        en: "Payoneer is the most widely used withdrawal method for Bangladeshi freelancers — supported by both Fiverr and Upwork.",
      },
      source: "https://www.nsave.com/bangladesh/fiverr",
      capturedAt: "2026-07-10",
    },
    {
      id: "payoneer_bkash",
      kind: "rule" as const,
      text: {
        bn: "Payoneer থেকে সরাসরি বিকাশে টাকা আনা যায় (অ্যাকাউন্ট লিংক করতে হয়); ন্যূনতম ১,০০০ টাকা জমা হলে তোলা যায়।",
        en: "Payoneer can transfer directly to bKash (accounts must be linked); withdrawals unlock once at least ৳1,000 is deposited.",
      },
      source: "https://www.bkash.com/en/products-services/payoneer",
      capturedAt: "2026-07-10",
    },
    {
      id: "payoneer_bank_fee",
      kind: "rule" as const,
      text: {
        bn: "Payoneer থেকে বাংলাদেশি ব্যাংকে তুলতে আনুমানিক ২% ফি লাগে।",
        en: "Withdrawing from Payoneer to a Bangladeshi bank costs roughly a 2% fee.",
      },
      source: "https://www.nsave.com/bangladesh/fiverr",
      capturedAt: "2026-07-10",
    },
    {
      id: "upwork_direct_bank",
      kind: "rule" as const,
      text: {
        bn: "আপওয়ার্ক থেকে সরাসরি লোকাল ব্যাংকে: প্রতি ট্রান্সফারে $০.৯৯, ২–৪ কর্মদিবস — তবে ব্যাংকের কমপ্লায়েন্স যাচাইয়ে দেরি হতে পারে, বাড়তি কাগজপত্রও লাগতে পারে।",
        en: "Upwork direct-to-local-bank: $0.99 per transfer, 2–4 business days — but bank compliance checks can add delays and extra documentation.",
      },
      source: "https://www.nsave.com/bangladesh/upwork",
      capturedAt: "2026-07-10",
    },
    {
      id: "remittance_incentive_exclusion",
      kind: "rule" as const,
      text: {
        bn: "সতর্কতা: Payoneer হয়ে আসা ফাইভার আয় সরকারের ২.৫% রেমিট্যান্স প্রণোদনার আওতায় পড়ে না — হিসাবের সময় এটা ধরে নেবেন না।",
        en: "Caveat: Fiverr payouts routed through Payoneer are excluded from the government's 2.5% wage-earner remittance incentive — don't count it in your math.",
      },
      source: "https://www.bkash.com/en/products-services/payoneer",
      capturedAt: "2026-07-10",
    },
    {
      id: "setup_before_first_order",
      kind: "heuristic" as const,
      text: {
        bn: "প্রথম অর্ডারের আগেই Payoneer অ্যাকাউন্ট খুলে যাচাই সেরে রাখুন — যাচাইয়ে কয়েকদিন লাগতে পারে, আর প্রথম আয়ের আনন্দ আটকে থাকা টাকায় মাটি হয়।",
        en: "Open and verify your Payoneer account before your first order — verification can take days, and nothing sours a first earning like stuck money.",
      },
      capturedAt: "2026-07-10",
    },
  ],
};
