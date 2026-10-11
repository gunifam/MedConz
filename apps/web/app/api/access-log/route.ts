import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { getUser, unauthorized } from "@/lib/session";
import { accessLogs, accessReports } from "@medconz/db";

// GET: my own access record (patients see who opened their record).
export async function GET() {
  const u = await getUser();
  if (!u) return unauthorized();
  const rows = await db
    .select({
      id: accessLogs.id,
      actorId: accessLogs.actorId,
      whatOpened: accessLogs.whatOpened,
      reason: accessLogs.reason,
      createdAt: accessLogs.createdAt,
    })
    .from(accessLogs)
    .where(eq(accessLogs.patientId, u.id))
    .orderBy(desc(accessLogs.createdAt))
    .limit(100);
  return NextResponse.json({ logs: rows });
}

// POST {logId}: report an entry. Only my own entries, one open report each.
export async function POST(req: Request) {
  const u = await getUser();
  if (!u) return unauthorized();
  const body = (await req.json().catch(() => ({}))) as { logId?: string };
  if (!body.logId) return NextResponse.json({ error: "logId required" }, { status: 400 });
  const found = await db
    .select({ id: accessLogs.id })
    .from(accessLogs)
    .where(and(eq(accessLogs.id, body.logId), eq(accessLogs.patientId, u.id)))
    .limit(1);
  if (found.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const existing = await db
    .select({ id: accessReports.id })
    .from(accessReports)
    .where(and(eq(accessReports.logId, body.logId), eq(accessReports.status, "open")))
    .limit(1);
  if (existing.length > 0) return NextResponse.json({ reported: true, duplicate: true });
  await db.insert(accessReports).values({ logId: body.logId, patientId: u.id });
  return NextResponse.json({ reported: true });
}
