DROP TABLE "roadmap_steps" CASCADE;--> statement-breakpoint
ALTER TABLE "roadmaps" ADD COLUMN "roadmap_type" text DEFAULT 'role' NOT NULL;--> statement-breakpoint
ALTER TABLE "roadmaps" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
CREATE INDEX "roadmaps_roadmap_type_idx" ON "roadmaps" USING btree ("roadmap_type");--> statement-breakpoint
ALTER TABLE "roadmaps" ADD CONSTRAINT "roadmaps_roadmap_type_check" CHECK ("roadmaps"."roadmap_type" IN ('role', 'skill'));