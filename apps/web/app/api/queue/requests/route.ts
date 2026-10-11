import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { getUser, unauthorized } from "@/lib/session";
import { consultations, infoRequests } from "@medconz/db";

// GET — my open info requests (doctor asked for more details).
export async function GET() {
  const u = await getUser();
  if (!u) return unauthorized();
  const mine = await db
    .select({ id: consultations.id })
    .from(consultations)
    .where(eq(consultations.patientId, u.id));
  const ids = mine.map((m) => m.id);
  if (ids.length === 0) return NextResponse.json({ requests: [] });
  const out: { id: string; message: string; expiresAt: unknown }[] = [];
  for (const cid of ids) {
    const rs = await db
      .select()
      .from(infoRequests)
      .where(and(eq(infoRequests.consultationId, cid), eq(infoRequests.status, "open")));
    for (const r of rs) {
      if (new Date(r.expiresAt).getTime() < Date.now()) {
        await db.update(infoRequests).set({ status: "expired" }).where(eq(infoRequests.id, r.id));
        continue;
      }
      out.push({ id: r.id, message: r.message, expiresAt: r.expiresAt });
    }
  }
  return NextResponse.json({ requests: out });
}
