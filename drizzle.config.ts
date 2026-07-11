import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// drizzle-kit runs outside Next, so it doesn't auto-load .env.local — do it here.
config({ path: ".env.local" });

// Migrations use the DIRECT (non-pooled) connection; fall back to the pooled
// URL. Blank means "not set" — a copied .env.example leaves empty values.
const nonBlank = (v: string | undefined) => (v?.trim() ? v : undefined);
const url = nonBlank(process.env.DATABASE_URL_UNPOOLED) ?? nonBlank(process.env.DATABASE_URL);
if (!url) {
  throw new Error("DATABASE_URL_UNPOOLED (or DATABASE_URL) is required for migrations");
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url },
  // Keep generated SQL readable in review; migrations are forward-only.
  strict: true,
  verbose: true,
});
