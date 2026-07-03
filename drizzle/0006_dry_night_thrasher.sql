CREATE TABLE "project_briefs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"concept_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"starter_code" text DEFAULT '' NOT NULL,
	"test_cases" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_premium" boolean DEFAULT false NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "project_briefs_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "project_briefs" ADD CONSTRAINT "project_briefs_concept_id_concepts_id_fk" FOREIGN KEY ("concept_id") REFERENCES "public"."concepts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "project_briefs_concept_id_idx" ON "project_briefs" USING btree ("concept_id");