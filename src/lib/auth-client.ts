"use client";

import { createAuthClient } from "better-auth/react";
import {
  inferAdditionalFields,
  magicLinkClient,
  phoneNumberClient,
} from "better-auth/client/plugins";

import type { createAuth } from "./auth";

/** Browser-side auth API. Server counterpart lives in ./auth. */
export const authClient = createAuthClient({
  plugins: [
    phoneNumberClient(),
    magicLinkClient(),
    inferAdditionalFields<ReturnType<typeof createAuth>>(),
  ],
});
