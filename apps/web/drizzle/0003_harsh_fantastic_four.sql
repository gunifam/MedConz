ALTER TABLE "consultations" ADD COLUMN "priority_override" integer;--> statement-breakpoint
ALTER TABLE "consultations" ADD COLUMN "ready_at" timestamp;--> statement-breakpoint
ALTER TABLE "consultations" ADD COLUMN "snoozed_until" timestamp;--> statement-breakpoint
ALTER TABLE "consultations" ADD COLUMN "missed_count" integer DEFAULT 0 NOT NULL;