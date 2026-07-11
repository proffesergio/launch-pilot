1. Run corepack pnpm dev and open http://localhost:3000/en/sign-in.
2. Enter any valid BD-format number (e.g. 01712345678) and tap "Send me a code". Nothing to configure â this always works in dev.
3. Get the code either way:
  - Browser/curl: open http://localhost:3000/api/dev/otp?phone=%2B8801712345678 (that's your number as +880..., URL-encoded + = %2B). It returns {"phone": "...", "code": "123456"}.
  - Terminal logs: the dev server prints auth.otp.dev_mailbox when the code is captured.
4. Type that code into the sign-in form. Magic links work the same via /api/dev/otp's sibling /api/dev/magic-link?email=....

The mailbox is files under your system temp dir (launchpilot-dev-mailbox/), and both dev routes hard-404 in production â codes can never leak that way. In production today, OTP requests log auth.otp.undeliverable â real delivery starts when Slice C's provider interface gets an API key (Twilio Verify is the recommended free-trial path when you're ready).