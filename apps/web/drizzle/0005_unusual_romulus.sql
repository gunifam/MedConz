CREATE TYPE "public"."checkin_kind" AS ENUM('feeling', 'reminder');--> statement-breakpoint
CREATE TYPE "public"."checkin_status" AS ENUM('pending', 'better', 'same', 'worse', 'done', 'off');--> statement-breakpoint
CREATE TABLE "checkins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"consultation_id" uuid,
	"patient_id" text NOT NULL,
	"kind" "checkin_kind" DEFAULT 'feeling' NOT NULL,
	"status" "checkin_status" DEFAULT 'pending' NOT NULL,
	"label" text,
	"due_at" timestamp NOT NULL,
	"answered_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "doctor_feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"consultation_id" uuid NOT NULL,
	"doctor_id" text,
	"useful" boolean,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"consultation_id" uuid NOT NULL,
	"patient_id" text NOT NULL,
	"rating" integer,
	"comment" text,
	"wrong_flag" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "consultations" ADD COLUMN "next_steps" text;--> statement-breakpoint
ALTER TABLE "consultations" ADD COLUMN "warning_signs" text;--> statement-breakpoint
ALTER TABLE "consultations" ADD COLUMN "inperson_flag" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "checkins_off" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "checkins" ADD CONSTRAINT "checkins_consultation_id_consultations_id_fk" FOREIGN KEY ("consultation_id") REFERENCES "public"."consultations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checkins" ADD CONSTRAINT "checkins_patient_id_user_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctor_feedback" ADD CONSTRAINT "doctor_feedback_consultation_id_consultations_id_fk" FOREIGN KEY ("consultation_id") REFERENCES "public"."consultations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctor_feedback" ADD CONSTRAINT "doctor_feedback_doctor_id_user_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_consultation_id_consultations_id_fk" FOREIGN KEY ("consultation_id") REFERENCES "public"."consultations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_patient_id_user_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;