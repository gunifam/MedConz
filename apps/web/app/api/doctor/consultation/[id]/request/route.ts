import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { unauthorized } from "@/lib/session";
import { DOCTOR_ROLES, forbidden, getUserWithRole } from "@/lib/roles";
import { consultations, infoRequests } from "@medconz/db";

const ttlMinutes = () => {
  const n = Number(process.env.INFO_REQUEST_TTL_MINUTES ?? 10);
  return Number.isFinite(n) && n > 0 ? n : 10;
};

// POST {message} — quick request for more details (short TTL, PRD 9.2).
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const u = await getUserWithRole();
  if (!u) return unauthorized();
  if (!DOCTOR_ROLES.includes(u.role)) return forbidden();
  const rows = await db
    .select({ id: consultations.id })
    .from(consultations)
    .where(and(eq(consultations.id, params.id), eq(consultations.doctorId, u.id)))
    .limit(1);
  if (rows.length === 0) return NextResponse.json({ error: "Not yours." }, { status: 403 });
  const body = (await req.json().catch(() => ({}))) as { message?: string };
  const message = (body.message ?? "").trim().slice(0, 300);
  if (!message) return NextResponse.json({ error: "Write what you need." }, { status: 400 });
  const [r] = await db
    .insert(infoRequests)
    .values({
      consultationId: params.id,
      message,
      expiresAt: new Date(Date.now() + ttlMinutes() * 60_000),
    })
    .returning({ id: infoRequests.id });
  return NextResponse.json({ id: r.id, ttlMinutes: ttlMinutes() });
}
