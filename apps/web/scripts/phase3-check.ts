import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as s from "@medconz/db";

const here = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(here, "..", "..", "..", ".env") });
const client = postgres(process.env.DATABASE_URL!, { max: 1 });
const db = drizzle(client, { schema: s });

const pid = `phase3-patient-${Date.now()}`;
const did = `phase3-doctor-${Date.now()}`;
const fail = (m: string): never => {
  console.error("FAIL: " + m);
  process.exit(1);
};

try {
  // 1. users + consent accept/withdraw
  await db.insert(s.user).values({ id: pid, name: "Phase3 Patient", email: `p3-${Date.now()}@t.st` });
  await db.insert(s.user).values({ id: did, name: "Dr Phase3", role: "doctor", email: `d3-${Date.now()}@t.st` });
  await db.update(s.user).set({ consentAcceptedAt: new Date() }).where(eq(s.user.id, pid));
  let rows = await db.select().from(s.user).where(eq(s.user.id, pid)).limit(1);
  if (!rows[0]?.consentAcceptedAt) fail("consent accept not stored");
  await db.update(s.user).set({ consentAcceptedAt: null }).where(eq(s.user.id, pid));
  rows = await db.select().from(s.user).where(eq(s.user.id, pid)).limit(1);
  if (rows[0]?.consentAcceptedAt) fail("consent withdraw not stored");
  console.log("PASS consent accept/withdraw");

  // 2. timeline soft-delete + 6-month hold
  const [check] = await db
    .insert(s.symptomChecks)
    .values({ patientId: pid, status: "submitted", chiefComplaint: "test" })
    .returning({ id: s.symptomChecks.id });
  const [entry] = await db
    .insert(s.timelineEntries)
    .values({ patientId: pid, checkId: check.id, kind: "check" })
    .returning({ id: s.timelineEntries.id });
  const heldUntil = new Date();
  heldUntil.setMonth(heldUntil.getMonth() + 6);
  await db
    .update(s.timelineEntries)
    .set({ visible: false, deletedAt: new Date(), heldUntil })
    .where(and(eq(s.timelineEntries.id, entry.id), eq(s.timelineEntries.patientId, pid)));
  const visible = await db
    .select()
    .from(s.timelineEntries)
    .where(and(eq(s.timelineEntries.patientId, pid), eq(s.timelineEntries.visible, true)));
  if (visible.length !== 0) fail("deleted entry still visible");
  const held = await db.select().from(s.timelineEntries).where(eq(s.timelineEntries.id, entry.id));
  const months =
    (held[0].heldUntil!.getTime() - Date.now()) / (30.44 * 24 * 3600 * 1000);
  if (!(months > 5 && months < 7)) fail("hold window not ~6 months: " + months);
  console.log("PASS delete hides immediately, held ~6 months");

  // 3. access log (what, not contents) + report
  await db.insert(s.accessLogs).values({ actorId: did, patientId: pid, whatOpened: "symptom check", reason: "consultation" });
  const logs = await db.select().from(s.accessLogs).where(eq(s.accessLogs.patientId, pid));
  if (logs.length !== 1 || logs[0].whatOpened !== "symptom check") fail("access log wrong");
  await db.insert(s.accessReports).values({ logId: logs[0].id, patientId: pid });
  const reps = await db.select().from(s.accessReports).where(eq(s.accessReports.patientId, pid));
  if (reps.length !== 1 || reps[0].status !== "open") fail("report wrong");
  console.log("PASS access log + report");

  // cleanup (fixtures only; real deletes go through the hold path)
  await db.delete(s.accessReports).where(eq(s.accessReports.patientId, pid));
  await db.delete(s.accessLogs).where(eq(s.accessLogs.patientId, pid));
  await db.delete(s.timelineEntries).where(eq(s.timelineEntries.patientId, pid));
  await db.delete(s.symptomChecks).where(eq(s.symptomChecks.patientId, pid));
  await db.delete(s.session).where(eq(s.session.userId, pid));
  await db.delete(s.account).where(eq(s.account.userId, pid));
  await db.delete(s.user).where(eq(s.user.id, pid));
  await db.delete(s.session).where(eq(s.session.userId, did));
  await db.delete(s.account).where(eq(s.account.userId, did));
  await db.delete(s.user).where(eq(s.user.id, did));
  console.log("PASS cleanup, ALL PHASE-3 CHECKS GREEN");
} finally {
  await client.end();
}
