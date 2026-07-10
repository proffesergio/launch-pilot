CREATE TABLE "freelancer_profiles" (
	"user_id" text PRIMARY KEY NOT NULL,
	"skill_id" text NOT NULL,
	"skill_track" text NOT NULL,
	"skill_confidence" text NOT NULL,
	"skill_source" text NOT NULL,
	"target_platform" text NOT NULL,
	"weekly_hours" integer NOT NULL,
	"country" text DEFAULT 'BD' NOT NULL,
	"english_confidence" text NOT NULL,
	"experience" text NOT NULL,
	"raw_inputs" jsonb NOT NULL,
	"journey_state" text DEFAULT 'onboarding' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "freelancer_profiles" ADD CONSTRAINT "freelancer_profiles_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;