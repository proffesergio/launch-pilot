import createIntlProxy from "next-intl/middleware";

import { routing } from "@/i18n/routing";

// Next 16 renamed middleware → proxy; next-intl's handler is signature-
// compatible. Redirects / → /bn (default) and negotiates Accept-Language.
export default createIntlProxy(routing);

export const config = {
  // Localize everything except API routes, Next internals, PostHog ingest,
  // the Sentry tunnel, and static files (anything with an extension).
  matcher: ["/((?!api|_next|_vercel|ingest|monitoring|.*\\..*).*)"],
};
