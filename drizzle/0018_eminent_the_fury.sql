CREATE TABLE "user_collection_question_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"question_id" uuid NOT NULL,
	"completed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_collection_question_progress_user_question_unique" UNIQUE("user_id","question_id")
);
--> statement-breakpoint
ALTER TABLE "user_collection_question_progress" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user_collection_question_progress" ADD CONSTRAINT "user_collection_question_progress_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_collection_question_progress" ADD CONSTRAINT "user_collection_question_progress_question_id_collection_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."collection_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_collection_question_progress_user_id_idx" ON "user_collection_question_progress" USING btree ("user_id");