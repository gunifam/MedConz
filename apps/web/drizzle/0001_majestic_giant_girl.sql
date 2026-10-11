CREATE TYPE "public"."report_status" AS ENUM('open', 'reviewing', 'resolved');--> statement-breakpoint
CREATE TABLE "access_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"log_id" uuid NOT NULL,
	"patient_id" text NOT NULL,
	"status" "report_status" DEFAULT 'open' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "access_reports" ADD CONSTRAINT "access_reports_log_id_access_logs_id_fk" FOREIGN KEY ("log_id") REFERENCES "public"."access_logs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "access_reports" ADD CONSTRAINT "access_reports_patient_id_user_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;