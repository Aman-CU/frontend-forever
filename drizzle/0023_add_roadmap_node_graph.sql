CREATE TABLE "roadmap_node_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"node_id" uuid NOT NULL,
	"link_type" text NOT NULL,
	"concept_id" uuid,
	"challenge_id" uuid,
	"collection_question_id" uuid,
	"external_title" text,
	"external_url" text,
	"order_index" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "roadmap_node_links_link_type_check" CHECK ("roadmap_node_links"."link_type" IN ('learn-concept', 'practice-challenge', 'interview-question', 'external-video', 'external-article'))
);
--> statement-breakpoint
ALTER TABLE "roadmap_node_links" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "roadmap_nodes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"roadmap_id" uuid NOT NULL,
	"parent_id" uuid,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"node_type" text DEFAULT 'topic' NOT NULL,
	"is_optional" boolean DEFAULT false NOT NULL,
	"position_x" integer DEFAULT 0 NOT NULL,
	"position_y" integer DEFAULT 0 NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "roadmap_nodes_roadmap_slug_unique" UNIQUE("roadmap_id","slug"),
	CONSTRAINT "roadmap_nodes_node_type_check" CHECK ("roadmap_nodes"."node_type" IN ('section', 'topic'))
);
--> statement-breakpoint
ALTER TABLE "roadmap_nodes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user_roadmap_node_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"node_id" uuid NOT NULL,
	"completed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_roadmap_node_progress_user_node_unique" UNIQUE("user_id","node_id")
);
--> statement-breakpoint
ALTER TABLE "user_roadmap_node_progress" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "roadmap_node_links" ADD CONSTRAINT "roadmap_node_links_node_id_roadmap_nodes_id_fk" FOREIGN KEY ("node_id") REFERENCES "public"."roadmap_nodes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roadmap_node_links" ADD CONSTRAINT "roadmap_node_links_concept_id_concepts_id_fk" FOREIGN KEY ("concept_id") REFERENCES "public"."concepts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roadmap_node_links" ADD CONSTRAINT "roadmap_node_links_challenge_id_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roadmap_node_links" ADD CONSTRAINT "roadmap_node_links_collection_question_id_collection_questions_id_fk" FOREIGN KEY ("collection_question_id") REFERENCES "public"."collection_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roadmap_nodes" ADD CONSTRAINT "roadmap_nodes_roadmap_id_roadmaps_id_fk" FOREIGN KEY ("roadmap_id") REFERENCES "public"."roadmaps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roadmap_node_progress" ADD CONSTRAINT "user_roadmap_node_progress_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roadmap_node_progress" ADD CONSTRAINT "user_roadmap_node_progress_node_id_roadmap_nodes_id_fk" FOREIGN KEY ("node_id") REFERENCES "public"."roadmap_nodes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "roadmap_node_links_node_id_idx" ON "roadmap_node_links" USING btree ("node_id");--> statement-breakpoint
CREATE INDEX "roadmap_nodes_roadmap_id_idx" ON "roadmap_nodes" USING btree ("roadmap_id");--> statement-breakpoint
CREATE INDEX "roadmap_nodes_parent_id_idx" ON "roadmap_nodes" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "user_roadmap_node_progress_user_id_idx" ON "user_roadmap_node_progress" USING btree ("user_id");