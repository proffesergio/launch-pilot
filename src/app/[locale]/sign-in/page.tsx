import { availableAuthMethods } from "@/lib/auth-methods";
import { getEnv } from "@/lib/env";

import { SignInForm } from "./sign-in-form";

export default function SignInPage() {
  // Server-computed: only offer methods that can actually reach a real user in
  // this environment, so production never leads with a dead-end (see
  // auth-methods.ts). Phone stays primary when it's deliverable (the BD path).
  const methods = availableAuthMethods(getEnv(), process.env.NODE_ENV);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-6 py-16">
      <span className="inline-block h-1.5 w-16 rounded-full bg-[#F5A524]" />
      <SignInForm methods={methods} />
    </main>
  );
}
