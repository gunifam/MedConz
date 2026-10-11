CREATE TYPE "public"."request_status" AS ENUM('open', 'answered', 'expired');--> statement-breakpoint
CREATE TABLE "info_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"consultation_id" uuid NOT NULL,
	"message" text NOT NULL,
	"status" "request_status" DEFAULT 'open' NOT NULL,
	"response" text,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "consultations" ADD COLUMN "claimed_at" timestamp;--> statement-breakpoint
ALTER TABLE "consultations" ADD COLUMN "notes_private" text;--> statement-breakpoint
ALTER TABLE "symptom_checks" ADD COLUMN "accuracy_flag" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "specialty" text;--> statement-breakpoint
ALTER TABLE "info_requests" ADD CONSTRAINT "info_requests_consultation_id_consultations_id_fk" FOREIGN KEY ("consultation_id") REFERENCES "public"."consultations"("id") ON DELETE cascade ON UPDATE no action;