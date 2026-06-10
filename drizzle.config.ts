import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// drizzle-kit runs outside Next, so it doesn't auto-load .env.local — do it here.
config({ path: ".env.local" });

// Migrations use the DIRECT (non-pooled) connection; fall back to the pooled URL.
const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
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
