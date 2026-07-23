CREATE TABLE "ui_battle_challenges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"difficulty" text NOT NULL,
	"target_image_url" text NOT NULL,
	"target_width" integer NOT NULL,
	"target_height" integer NOT NULL,
	"starter_html" text DEFAULT '' NOT NULL,
	"starter_css" text DEFAULT '' NOT NULL,
	"starter_js" text DEFAULT '' NOT NULL,
	"is_premium" boolean DEFAULT false NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ui_battle_challenges_slug_unique" UNIQUE("slug"),
	CONSTRAINT "ui_battle_challenges_difficulty_check" CHECK ("ui_battle_challenges"."difficulty" IN ('easy', 'medium', 'hard'))
);
--> statement-breakpoint
ALTER TABLE "ui_battle_challenges" ENABLE ROW LEVEL SECURITY;