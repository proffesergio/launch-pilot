import type { Metadata } from "next";
import { Anek_Bangla, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";

import { routing } from "@/i18n/routing";
import { PostHogProvider } from "../providers";
import "../globals.css";

// One variable font covering Bangla + Latin: characterful, and a single
// download on 4G. Geist Mono stays for numbers and technical labels.
const anekBangla = Anek_Bangla({
  variable: "--font-anek",
  subsets: ["bengali", "latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LaunchPilot",
  description:
    "Your coach to a freelance career — from any skill to your first paid order.",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  return (
    <html
      lang={locale}
      className={`${anekBangla.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider>
          <PostHogProvider>{children}</PostHogProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
