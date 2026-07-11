/**
 * Curated tools catalog v0 (M3.5). The Playbook surfaces these per platform;
 * the assistant presents them but never invents a tool or URL — same grounding
 * discipline as platform tracks. Bilingual `whatFor`; `pricing` is honest
 * (free/freemium/paid); `platforms` uses "all" or a category so we don't hand
 * a designer a CV builder. Bump the version on any edit.
 */
export const TOOLS_VERSION = "0.1.0";

export const toolCatalog = [
  // ── Design ────────────────────────────────────────────────────────────
  {
    id: "canva",
    name: "Canva",
    url: "https://www.canva.com/",
    pricing: "freemium" as const,
    skills: ["graphic_design", "social_media"] as const,
    platforms: "all" as const,
    whatFor: {
      bn: "গিগ থাম্বনেইল, লোগো ও সোশ্যাল পোস্ট বানান — ভারী সফটওয়্যার ছাড়াই।",
      en: "Design gig thumbnails, logos, and social posts without heavy software.",
    },
  },
  {
    id: "figma",
    name: "Figma",
    url: "https://www.figma.com/",
    pricing: "freemium" as const,
    skills: ["graphic_design", "web_development"] as const,
    platforms: "all" as const,
    whatFor: {
      bn: "পেশাদার UI ও ভেক্টর ডিজাইন — লোগো আর ওয়েব মকআপের জন্য দারুণ।",
      en: "Professional UI and vector design; great for logo and web mockups.",
    },
  },
  {
    id: "photopea",
    name: "Photopea",
    url: "https://www.photopea.com/",
    pricing: "free" as const,
    skills: ["graphic_design"] as const,
    platforms: "all" as const,
    whatFor: {
      bn: "ব্রাউজারেই ফ্রি ফটোশপ — ছবি আর গ্যালারি শট এডিট করুন।",
      en: "A free in-browser Photoshop for editing images and gallery shots.",
    },
  },
  // ── Writing / translation ─────────────────────────────────────────────
  {
    id: "grammarly",
    name: "Grammarly",
    url: "https://www.grammarly.com/",
    pricing: "freemium" as const,
    skills: ["writing", "translation", "virtual_assistance"] as const,
    platforms: "all" as const,
    whatFor: {
      bn: "গিগ কপি, প্রস্তাব ও ক্লায়েন্ট বার্তার ইংরেজি ব্যাকরণ ঠিক করুন।",
      en: "Fix English grammar in your gig copy, proposals, and client messages.",
    },
  },
  {
    id: "quillbot",
    name: "QuillBot",
    url: "https://quillbot.com/",
    pricing: "freemium" as const,
    skills: ["writing", "translation"] as const,
    platforms: "all" as const,
    whatFor: {
      bn: "ইংরেজি লেখা প্যারাফ্রেজ করে আরও পরিষ্কার ও ছোট করুন।",
      en: "Paraphrase and tighten your English writing.",
    },
  },
  {
    id: "languagetool",
    name: "LanguageTool",
    url: "https://languagetool.org/",
    pricing: "freemium" as const,
    skills: ["writing", "translation"] as const,
    platforms: "all" as const,
    whatFor: {
      bn: "ব্যাকরণ ও স্টাইল চেকার — একাধিক ভাষায় শক্তিশালী।",
      en: "A grammar and style checker with strong multilingual support.",
    },
  },
  // ── Video / audio ─────────────────────────────────────────────────────
  {
    id: "capcut",
    name: "CapCut",
    url: "https://www.capcut.com/",
    pricing: "freemium" as const,
    skills: ["video_editing"] as const,
    platforms: "all" as const,
    whatFor: {
      bn: "ফোন বা ডেস্কটপে রিল ও ভিডিও এডিট করুন — সহজ ইন্টারফেস।",
      en: "Edit reels and videos on phone or desktop with a simple interface.",
    },
  },
  {
    id: "davinci_resolve",
    name: "DaVinci Resolve",
    url: "https://www.blackmagicdesign.com/products/davinciresolve",
    pricing: "freemium" as const,
    skills: ["video_editing"] as const,
    platforms: "all" as const,
    whatFor: {
      bn: "পেশাদার ভিডিও এডিটিং — শক্তিশালী ফ্রি সংস্করণসহ।",
      en: "Professional video editing with a powerful free tier.",
    },
  },
  {
    id: "audacity",
    name: "Audacity",
    url: "https://www.audacityteam.org/",
    pricing: "free" as const,
    skills: ["voice_over"] as const,
    platforms: "all" as const,
    whatFor: {
      bn: "ভয়েস-ওভার রেকর্ড ও পরিষ্কার করুন — সম্পূর্ণ ফ্রি।",
      en: "Record and clean up voice-over audio, completely free.",
    },
  },
  // ── Productivity / support (skill-agnostic → "all") ───────────────────
  {
    id: "google_sheets",
    name: "Google Sheets",
    url: "https://www.google.com/sheets/about/",
    pricing: "free" as const,
    skills: "all" as const,
    platforms: "all" as const,
    whatFor: {
      bn: "ডেটা-এন্ট্রি ও ক্লায়েন্ট ট্র্যাকিংয়ের জন্য ফ্রি স্প্রেডশিট।",
      en: "Free spreadsheets for data-entry work and tracking clients.",
    },
  },
  {
    id: "trello",
    name: "Trello",
    url: "https://trello.com/",
    pricing: "freemium" as const,
    skills: "all" as const,
    platforms: "all" as const,
    whatFor: {
      bn: "আবেদন ও অর্ডার একটি সহজ বোর্ডে সাজিয়ে রাখুন।",
      en: "Track your applications and orders on a simple board.",
    },
  },
  {
    id: "loom",
    name: "Loom",
    url: "https://www.loom.com/",
    pricing: "freemium" as const,
    skills: "all" as const,
    platforms: "all" as const,
    whatFor: {
      bn: "ক্লায়েন্টের জন্য দ্রুত ভিডিও পরিচিতি বা ডেলিভারি রেকর্ড করুন।",
      en: "Record a quick video intro or deliverable walkthrough for clients.",
    },
  },
  {
    id: "payoneer",
    name: "Payoneer",
    url: "https://www.payoneer.com/",
    pricing: "free" as const,
    skills: "all" as const,
    platforms: "all" as const,
    whatFor: {
      bn: "মার্কেটপ্লেসের আয় গ্রহণ করে ব্যাংক/বিকাশে তুলুন।",
      en: "Receive marketplace earnings and withdraw to your bank or bKash.",
    },
  },
  // ── Job-board only: CV builders ───────────────────────────────────────
  {
    id: "novoresume",
    name: "Novoresume",
    url: "https://novoresume.com/",
    pricing: "freemium" as const,
    skills: "all" as const,
    platforms: "job_board" as const,
    whatFor: {
      bn: "রিমোট চাকরির আবেদনের জন্য পরিষ্কার এক-পাতার সিভি বানান।",
      en: "Build a clean one-page CV for remote job applications.",
    },
  },
  {
    id: "rxresume",
    name: "Reactive Resume",
    url: "https://rxresu.me/",
    pricing: "free" as const,
    skills: "all" as const,
    platforms: "job_board" as const,
    whatFor: {
      bn: "সম্পূর্ণ ফ্রি, ওপেন-সোর্স সিভি বিল্ডার — কোনো পেওয়াল নেই।",
      en: "A fully free, open-source CV builder with no paywall.",
    },
  },
] as const;
