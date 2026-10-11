// MedConz shared DB schema — Postgres (local) + Drizzle.
// Covers PRD: symptom checks, timeline, payments (NGN/Espees/crypto),
// queue, caregiver links, sharing, immutable access log, hold vault.

import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// ---------- BetterAuth core tables (minimal, managed by better-auth) ----------
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email"),
  emailVerified: boolean("email_verified").default(false),
  image: text("image"),
  phoneNumber: text("phone_number").unique(),
  phoneNumberVerified: boolean("phone_number_verified").default(false),
  role: text("role").default("patient"), // patient | doctor | dentist | medical_team | top_clearance
  specialty: text("specialty"), // doctor | dentist — for clinical accounts (auto-match)
  checkinsOff: boolean("checkins_off").default(false), // patient turned off check-ins
  banned: boolean("banned").default(false),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires", { withTimezone: true }),
  preferredLanguage: text("preferred_language").default("en"), // en | ha | yo | ig
  consentAcceptedAt: timestamp("consent_accepted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  token: text("token").notNull().unique(),
  impersonatedBy: text("impersonated_by"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  password: text("password"),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
  scope: text("scope"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ---------- MedConz domain ----------

export const caregiverStatus = pgEnum("caregiver_status", [
  "pending",
  "active",
  "blocked",
]);

export const caregiverLinks = pgTable("caregiver_links", {
  id: uuid("id").defaultRandom().primaryKey(),
  patientId: text("patient_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  caregiverId: text("caregiver_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  relationship: text("relationship").notNull(),
  status: caregiverStatus("status").default("pending").notNull(),
  minorTick: boolean("minor_tick").default(false), // parent tick-box for young child
  incapacityFlag: boolean("incapacity_flag").default(false), // adult cannot consent
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const checkStatus = pgEnum("check_status", ["draft", "submitted"]);

export const symptomChecks = pgTable("symptom_checks", {
  id: uuid("id").defaultRandom().primaryKey(),
  patientId: text("patient_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  filledById: text("filled_by_id").references(() => user.id), // caregiver if applicable
  caregiverLinkId: uuid("caregiver_link_id").references(() => caregiverLinks.id),
  status: checkStatus("status").default("draft").notNull(),
  language: text("language").default("en").notNull(),
  chiefComplaint: text("chief_complaint"),
  answers: jsonb("answers").default({}).notNull(),
  flags: jsonb("flags").default([]).notNull(), // emergency / warning-s sign codes
  specialtySuggestion: text("specialty_suggestion"), // gp | dentist | ...
  accuracyFlag: boolean("accuracy_flag").default(false), // doctor marked "seems inaccurate"
  contentVersion: text("content_version"),
  submittedAt: timestamp("submitted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const currencyEnum = pgEnum("currency", ["NGN", "ESPEES", "CRYPTO"]);

export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  patientId: text("patient_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  paidById: text("paid_by_id").references(() => user.id), // caregiver may pay
  checkId: uuid("check_id").references(() => symptomChecks.id),
  amountNgn: integer("amount_ngn").notNull(),
  currency: currencyEnum("currency").notNull(),
  quotedAmount: text("quoted_amount").notNull(), // exact string to avoid float errors
  quoteExpiresAt: timestamp("quote_expires_at", { withTimezone: true }),
  espeesRate: integer("espees_rate").default(2050), // 1 Espees = 2050 NGN snapshot
  provider: text("provider"), // paystack | flutterwave | internal-espees | crypto
  providerRef: text("provider_ref"),
  status: text("status").default("pending").notNull(), // pending | paid | refunded | failed
  receiptUrl: text("receipt_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const consultations = pgTable("consultations", {
  id: uuid("id").defaultRandom().primaryKey(),
  checkId: uuid("check_id")
    .notNull()
    .references(() => symptomChecks.id, { onDelete: "cascade" }),
  patientId: text("patient_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  doctorId: text("doctor_id").references(() => user.id),
  paymentId: uuid("payment_id").references(() => payments.id),
  queuePosition: integer("queue_position"),
  urgent: boolean("urgent").default(false),
  feelingWorse: boolean("feeling_worse").default(false),
  priorityOverride: integer("priority_override"), // doctor up/down; front-of-queue handoff
  claimedAt: timestamp("claimed_at", { withTimezone: true }),
  readyAt: timestamp("ready_at", { withTimezone: true }),
  snoozedUntil: timestamp("snoozed_until", { withTimezone: true }),
  missedCount: integer("missed_count").default(0).notNull(),
  status: text("status").default("waiting").notNull(), // waiting | left | ready | in_consult | done | missed | moved
  notesDraft: text("notes_draft"),
  notesFinal: text("notes_final"),
  notesPrivate: text("notes_private"), // "for me only" — never shown to patients
  nextSteps: text("next_steps"), // plain-words plan, stays on the timeline
  warningSigns: text("warning_signs"), // red flags that mean going to hospital
  inpersonFlag: boolean("inperson_flag").default(false), // needs an in-person visit
  handoffFromId: uuid("handoff_from_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const timelineEntries = pgTable("timeline_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  patientId: text("patient_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  checkId: uuid("check_id").references(() => symptomChecks.id),
  consultationId: uuid("consultation_id").references(() => consultations.id),
  kind: text("kind").notNull(), // check | consultation | note
  visible: boolean("visible").default(true).notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  heldUntil: timestamp("held_until", { withTimezone: true }), // 6-month hold vault
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const sharedLinks = pgTable("shared_links", {
  id: uuid("id").defaultRandom().primaryKey(),
  patientId: text("patient_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  scope: jsonb("scope").default({}).notNull(), // e.g. { lastMonths: 6 }
  codeHash: text("code_hash").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  openCount: integer("open_count").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Doctor quick requests for more details: short TTL, patient answers in a
// few taps, expiry is surfaced to the doctor (PRD 9.2).
export const requestStatus = pgEnum("request_status", ["open", "answered", "expired"]);

export const infoRequests = pgTable("info_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  consultationId: uuid("consultation_id")
    .notNull()
    .references(() => consultations.id, { onDelete: "cascade" }),
  message: text("message").notNull(),
  status: requestStatus("status").default("open").notNull(),
  response: text("response"),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Post-visit check-ins ("how are you feeling?") + gentle next-step reminders.
// Feeling check-ins become due CHECKIN_AFTER_HOURS after a DONE visit.
export const checkinKind = pgEnum("checkin_kind", ["feeling", "reminder"]);
export const checkinStatus = pgEnum("checkin_status", ["pending", "better", "same", "worse", "done", "off"]);

export const checkins = pgTable("checkins", {
  id: uuid("id").defaultRandom().primaryKey(),
  consultationId: uuid("consultation_id").references(() => consultations.id, { onDelete: "cascade" }),
  patientId: text("patient_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  kind: checkinKind("kind").default("feeling").notNull(),
  status: checkinStatus("status").default("pending").notNull(),
  label: text("label"), // reminder text, e.g. "Time to book your follow-up"
  dueAt: timestamp("due_at", { withTimezone: true }).notNull(),
  answeredAt: timestamp("answered_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Feedback is optional and never blocks (PRD 12). wrong_flag jumps the
// review queue (safety-related first).
export const feedback = pgTable("feedback", {
  id: uuid("id").defaultRandom().primaryKey(),
  consultationId: uuid("consultation_id")
    .notNull()
    .references(() => consultations.id, { onDelete: "cascade" }),
  patientId: text("patient_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  rating: integer("rating"), // 1-5, optional
  comment: text("comment"),
  wrongFlag: boolean("wrong_flag").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const doctorFeedback = pgTable("doctor_feedback", {
  id: uuid("id").defaultRandom().primaryKey(),
  consultationId: uuid("consultation_id")
    .notNull()
    .references(() => consultations.id, { onDelete: "cascade" }),
  doctorId: text("doctor_id").references(() => user.id),
  useful: boolean("useful"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Secure sharing (§6.3): code-protected, expiring, revocable links.
// Access requests + blocks.
export const shareRequestStatus = pgEnum("share_request_status", ["open", "approved", "ignored"]);

export const shareRequests = pgTable("share_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  linkId: uuid("link_id")
    .notNull()
    .references(() => sharedLinks.id, { onDelete: "cascade" }),
  patientId: text("patient_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  fromName: text("from_name").notNull(),
  status: shareRequestStatus("status").default("open").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const shareBlocks = pgTable("share_blocks", {
  id: uuid("id").defaultRandom().primaryKey(),
  patientId: text("patient_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Doctor one-tap translation flags (§5.6): reviewed with the medical team.
export const translationFlags = pgTable("translation_flags", {
  id: uuid("id").defaultRandom().primaryKey(),
  reporterId: text("reporter_id").references(() => user.id),
  lang: text("lang").notNull(),
  key: text("key").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Append-only: never update/delete from app code.
export const accessLogs = pgTable("access_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  actorId: text("actor_id").references(() => user.id),
  patientId: text("patient_id").notNull(),
  whatOpened: text("what_opened").notNull(), // what, not contents
  reason: text("reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Patient reports of unusual access. Reviewed by senior staff (Phase 8 ops).
// Status moves forward only: open -> reviewing -> resolved.
export const reportStatus = pgEnum("report_status", [
  "open",
  "reviewing",
  "resolved",
]);

export const accessReports = pgTable("access_reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  logId: uuid("log_id")
    .notNull()
    .references(() => accessLogs.id, { onDelete: "cascade" }),
  patientId: text("patient_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  status: reportStatus("status").default("open").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
