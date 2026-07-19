CREATE TABLE "playbook_reads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"playbook_slug" text NOT NULL,
	"chapter_slug" text NOT NULL,
	"read_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "playbook_reads_user_chapter_unique" UNIQUE("user_id","playbook_slug","chapter_slug"),
	CONSTRAINT "playbook_reads_playbook_slug_check" CHECK ("playbook_reads"."playbook_slug" IN ('frontend-interview-playbook', 'react-interview-playbook', 'behavioural-interview-playbook', 'frontend-system-design-playbook', 'frontend-resume-playbook'))
);
--> statement-breakpoint
ALTER TABLE "playbook_reads" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "playbook_reads" ADD CONSTRAINT "playbook_reads_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "playbook_reads_user_id_idx" ON "playbook_reads" USING btree ("user_id");