CREATE TABLE "tts_cache" (
	"hash" text PRIMARY KEY NOT NULL,
	"locale" text NOT NULL,
	"audio_base64" text NOT NULL,
	"content_type" text DEFAULT 'audio/mpeg' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
