CREATE TABLE "audit_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"room_id" uuid,
	"action" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "auth_tokens_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "game_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"room_id" uuid NOT NULL,
	"title" text NOT NULL,
	"activity" text NOT NULL,
	"story_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" text DEFAULT 'aberta' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"closed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "participant_identities" (
	"participant_id" uuid PRIMARY KEY NOT NULL,
	"room_id" uuid NOT NULL,
	"display_name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "participants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"room_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"consent_version" text NOT NULL,
	"consented_at" timestamp with time zone NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "participants_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"participant_id" uuid NOT NULL,
	"story_id" text NOT NULL,
	"node_id" text NOT NULL,
	"choice_index" integer NOT NULL,
	"effects" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "responses_one_per_node" UNIQUE("session_id","participant_id","story_id","node_id")
);
--> statement-breakpoint
CREATE TABLE "results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"participant_id" uuid NOT NULL,
	"scores" jsonb NOT NULL,
	"dominant" text NOT NULL,
	"completed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "results_one_per_session" UNIQUE("session_id","participant_id")
);
--> statement-breakpoint
CREATE TABLE "rooms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"join_code" text NOT NULL,
	"share_token" text,
	"min_group_size" integer DEFAULT 5 NOT NULL,
	"retention_days" integer DEFAULT 365 NOT NULL,
	"legal_basis_ack_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "rooms_join_code_unique" UNIQUE("join_code"),
	CONSTRAINT "rooms_share_token_unique" UNIQUE("share_token")
);
--> statement-breakpoint
CREATE TABLE "session_aggregates" (
	"session_id" uuid PRIMARY KEY NOT NULL,
	"n" integer NOT NULL,
	"share_sums" jsonb NOT NULL,
	"dominant_counts" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"name" text NOT NULL,
	"terms_accepted_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_tokens" ADD CONSTRAINT "auth_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_sessions" ADD CONSTRAINT "game_sessions_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participant_identities" ADD CONSTRAINT "participant_identities_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."participants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participant_identities" ADD CONSTRAINT "participant_identities_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participants" ADD CONSTRAINT "participants_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "responses" ADD CONSTRAINT "responses_session_id_game_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."game_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "responses" ADD CONSTRAINT "responses_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."participants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "results" ADD CONSTRAINT "results_session_id_game_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."game_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "results" ADD CONSTRAINT "results_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."participants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_aggregates" ADD CONSTRAINT "session_aggregates_session_id_game_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."game_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_room_idx" ON "audit_events" USING btree ("room_id");--> statement-breakpoint
CREATE INDEX "auth_tokens_user_idx" ON "auth_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_room_idx" ON "game_sessions" USING btree ("room_id");--> statement-breakpoint
CREATE INDEX "participants_room_idx" ON "participants" USING btree ("room_id");--> statement-breakpoint
CREATE INDEX "responses_session_participant_idx" ON "responses" USING btree ("session_id","participant_id");--> statement-breakpoint
CREATE INDEX "rooms_owner_idx" ON "rooms" USING btree ("owner_id");