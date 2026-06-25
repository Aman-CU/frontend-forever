CREATE TABLE "challenges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"concept_id" uuid,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"difficulty" text NOT NULL,
	"starter_code" text DEFAULT '' NOT NULL,
	"solution_code" text DEFAULT '' NOT NULL,
	"test_cases" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"hints" text[] DEFAULT '{}' NOT NULL,
	"is_premium" boolean DEFAULT false NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "challenges_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "concepts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"difficulty" text NOT NULL,
	"is_premium" boolean DEFAULT false NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "concepts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "interview_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"concept_id" uuid,
	"collection" text NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"difficulty" text NOT NULL,
	"companies" text[] DEFAULT '{}' NOT NULL,
	"is_premium" boolean DEFAULT false NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roadmap_steps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"roadmap_id" uuid NOT NULL,
	"concept_id" uuid NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"is_optional" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roadmaps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"is_premium" boolean DEFAULT false NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "roadmaps_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "bookmarks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"concept_id" uuid,
	"question_id" uuid,
	"challenge_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_challenge_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"challenge_id" uuid NOT NULL,
	"status" text NOT NULL,
	"code" text NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_concept_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"concept_id" uuid NOT NULL,
	"understand_completed" boolean DEFAULT false NOT NULL,
	"simulate_completed" boolean DEFAULT false NOT NULL,
	"challenge_completed" boolean DEFAULT false NOT NULL,
	"interview_completed" boolean DEFAULT false NOT NULL,
	"build_completed" boolean DEFAULT false NOT NULL,
	"fully_completed" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ucp_user_concept_unique" UNIQUE("user_id","concept_id")
);
--> statement-breakpoint
CREATE TABLE "user_interview_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"question_id" uuid NOT NULL,
	"ease_factor" real DEFAULT 2.5 NOT NULL,
	"interval_days" integer DEFAULT 1 NOT NULL,
	"repetitions" integer DEFAULT 0 NOT NULL,
	"quality" integer DEFAULT 0 NOT NULL,
	"next_review_at" timestamp with time zone,
	"last_reviewed_at" timestamp with time zone,
	CONSTRAINT "uir_user_question_unique" UNIQUE("user_id","question_id")
);
--> statement-breakpoint
CREATE TABLE "xp_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"concept_id" uuid,
	"challenge_id" uuid,
	"question_id" uuid,
	"event_type" text NOT NULL,
	"xp_amount" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "premium_expires_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_concept_id_concepts_id_fk" FOREIGN KEY ("concept_id") REFERENCES "public"."concepts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview_questions" ADD CONSTRAINT "interview_questions_concept_id_concepts_id_fk" FOREIGN KEY ("concept_id") REFERENCES "public"."concepts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roadmap_steps" ADD CONSTRAINT "roadmap_steps_roadmap_id_roadmaps_id_fk" FOREIGN KEY ("roadmap_id") REFERENCES "public"."roadmaps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roadmap_steps" ADD CONSTRAINT "roadmap_steps_concept_id_concepts_id_fk" FOREIGN KEY ("concept_id") REFERENCES "public"."concepts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_concept_id_concepts_id_fk" FOREIGN KEY ("concept_id") REFERENCES "public"."concepts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_question_id_interview_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."interview_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_challenge_id_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_challenge_submissions" ADD CONSTRAINT "user_challenge_submissions_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_challenge_submissions" ADD CONSTRAINT "user_challenge_submissions_challenge_id_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_concept_progress" ADD CONSTRAINT "user_concept_progress_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_concept_progress" ADD CONSTRAINT "user_concept_progress_concept_id_concepts_id_fk" FOREIGN KEY ("concept_id") REFERENCES "public"."concepts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_interview_reviews" ADD CONSTRAINT "user_interview_reviews_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_interview_reviews" ADD CONSTRAINT "user_interview_reviews_question_id_interview_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."interview_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xp_events" ADD CONSTRAINT "xp_events_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xp_events" ADD CONSTRAINT "xp_events_concept_id_concepts_id_fk" FOREIGN KEY ("concept_id") REFERENCES "public"."concepts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xp_events" ADD CONSTRAINT "xp_events_challenge_id_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenges"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xp_events" ADD CONSTRAINT "xp_events_question_id_interview_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."interview_questions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "challenges_concept_id_idx" ON "challenges" USING btree ("concept_id");--> statement-breakpoint
CREATE INDEX "challenges_difficulty_idx" ON "challenges" USING btree ("difficulty");--> statement-breakpoint
CREATE INDEX "concepts_category_idx" ON "concepts" USING btree ("category");--> statement-breakpoint
CREATE INDEX "interview_questions_collection_idx" ON "interview_questions" USING btree ("collection");--> statement-breakpoint
CREATE INDEX "interview_questions_concept_id_idx" ON "interview_questions" USING btree ("concept_id");--> statement-breakpoint
CREATE INDEX "roadmap_steps_roadmap_id_idx" ON "roadmap_steps" USING btree ("roadmap_id");--> statement-breakpoint
CREATE INDEX "bookmarks_user_id_idx" ON "bookmarks" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "bookmarks_user_concept_unique" ON "bookmarks" USING btree ("user_id","concept_id") WHERE "bookmarks"."concept_id" IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "bookmarks_user_question_unique" ON "bookmarks" USING btree ("user_id","question_id") WHERE "bookmarks"."question_id" IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "bookmarks_user_challenge_unique" ON "bookmarks" USING btree ("user_id","challenge_id") WHERE "bookmarks"."challenge_id" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "ucs_user_id_idx" ON "user_challenge_submissions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ucs_challenge_id_idx" ON "user_challenge_submissions" USING btree ("challenge_id");--> statement-breakpoint
CREATE INDEX "ucp_user_id_idx" ON "user_concept_progress" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "uir_user_id_idx" ON "user_interview_reviews" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "uir_next_review_idx" ON "user_interview_reviews" USING btree ("next_review_at");--> statement-breakpoint
CREATE INDEX "xp_events_user_id_idx" ON "xp_events" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "xp_events_created_at_idx" ON "xp_events" USING btree ("created_at");