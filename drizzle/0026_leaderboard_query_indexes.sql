CREATE INDEX "profiles_xp_idx" ON "profiles" USING btree ("xp");--> statement-breakpoint
CREATE INDEX "xp_events_user_id_created_at_idx" ON "xp_events" USING btree ("user_id","created_at");