import { SignInForm } from "./sign-in-form";

export default function SignInPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-6 py-16">
      <span className="inline-block h-1.5 w-16 rounded-full bg-[#F5A524]" />
      <SignInForm />
    </main>
  );
}
