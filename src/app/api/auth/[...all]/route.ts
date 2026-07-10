import { toNextJsHandler } from "better-auth/next-js";

import { getAuth } from "@/lib/auth";

// better-auth owns every /api/auth/* endpoint (sign-in, callback, session…).
// Lazy so importing the module never forces env validation at build time.
export const { GET, POST } = toNextJsHandler((request) =>
  getAuth().handler(request),
);
