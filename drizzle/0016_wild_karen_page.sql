CREATE TABLE "study_plan_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"study_plan_id" uuid NOT NULL,
	"group_label" text NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"item_type" text NOT NULL,
	"ref_id" text,
	"href" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	CONSTRAINT "study_plan_items_plan_order_unique" UNIQUE("study_plan_id","order_index"),
	CONSTRAINT "study_plan_items_item_type_check" CHECK ("study_plan_items"."item_type" IN ('concept', 'practice-category', 'collection', 'playbook-chapter', 'system-design-guide', 'review-session', 'company-guide'))
);
--> statement-breakpoint
ALTER TABLE "study_plan_items" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "study_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"duration_label" text NOT NULL,
	"hours_commitment" text NOT NULL,
	"description" text NOT NULL,
	"is_premium" boolean DEFAULT false NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "study_plans_slug_unique" UNIQUE("slug"),
	CONSTRAINT "study_plans_slug_check" CHECK ("study_plans"."slug" IN ('1-week', '1-month', '3-months'))
);
--> statement-breakpoint
ALTER TABLE "study_plans" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "study_plan_items" ADD CONSTRAINT "study_plan_items_study_plan_id_study_plans_id_fk" FOREIGN KEY ("study_plan_id") REFERENCES "public"."study_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "study_plan_items_study_plan_id_idx" ON "study_plan_items" USING btree ("study_plan_id");