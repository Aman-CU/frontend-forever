CREATE TABLE "challenge_discussion_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"challenge_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"parent_id" uuid,
	"title" text,
	"body" text NOT NULL,
	"code" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "challenge_discussion_posts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "challenges" ADD COLUMN "video_url" text;--> statement-breakpoint
ALTER TABLE "challenge_discussion_posts" ADD CONSTRAINT "challenge_discussion_posts_challenge_id_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge_discussion_posts" ADD CONSTRAINT "challenge_discussion_posts_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cdp_challenge_id_idx" ON "challenge_discussion_posts" USING btree ("challenge_id");--> statement-breakpoint
CREATE INDEX "cdp_parent_id_idx" ON "challenge_discussion_posts" USING btree ("parent_id");