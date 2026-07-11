CREATE TABLE "roadmap_missions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"roadmap_id" uuid NOT NULL,
	"mission_key" text NOT NULL,
	"phase" integer NOT NULL,
	"quest" text NOT NULL,
	"position" integer NOT NULL,
	"status" text DEFAULT 'locked' NOT NULL,
	"unlocked_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "user_roadmaps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"track_version_pins" jsonb NOT NULL,
	"generated_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "roadmap_missions" ADD CONSTRAINT "roadmap_missions_roadmap_id_user_roadmaps_id_fk" FOREIGN KEY ("roadmap_id") REFERENCES "public"."user_roadmaps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roadmaps" ADD CONSTRAINT "user_roadmaps_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;