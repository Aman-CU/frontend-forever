CREATE TABLE "collection_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"collection" text NOT NULL,
	"slug" text NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"difficulty" text NOT NULL,
	"companies" text[] DEFAULT '{}' NOT NULL,
	"is_ff75" boolean DEFAULT false NOT NULL,
	"is_premium" boolean DEFAULT false NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "collection_questions_slug_unique" UNIQUE("slug"),
	CONSTRAINT "collection_questions_collection_order_unique" UNIQUE("collection","order_index"),
	CONSTRAINT "collection_questions_collection_check" CHECK ("collection_questions"."collection" IN ('ff-javascript', 'ff-react', 'ff-nextjs')),
	CONSTRAINT "collection_questions_difficulty_check" CHECK ("collection_questions"."difficulty" IN ('easy', 'medium', 'hard'))
);
--> statement-breakpoint
ALTER TABLE "collection_questions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE INDEX "collection_questions_collection_idx" ON "collection_questions" USING btree ("collection");--> statement-breakpoint
CREATE INDEX "collection_questions_is_ff75_idx" ON "collection_questions" USING btree ("is_ff75");