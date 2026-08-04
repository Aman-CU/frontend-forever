ALTER TABLE "challenges" ADD COLUMN "parent_challenge_id" uuid;--> statement-breakpoint
ALTER TABLE "ui_battle_challenges" ADD COLUMN "is_solution_free" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_parent_challenge_id_challenges_id_fk" FOREIGN KEY ("parent_challenge_id") REFERENCES "public"."challenges"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "challenges_parent_challenge_id_idx" ON "challenges" USING btree ("parent_challenge_id");