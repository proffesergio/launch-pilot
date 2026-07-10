import { createNavigation } from "next-intl/navigation";

import { routing } from "./routing";

// Locale-aware drop-ins for next/link and next/navigation. Always import
// these instead of the Next.js originals inside localized routes.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
