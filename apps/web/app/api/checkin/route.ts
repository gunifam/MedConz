import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { getUser, unauthorized } from "@/lib/session";
import { consultations } from "@medconz/db";
import { dueCheckins } from "@/lib/visits/checkins";

// GET — my due check-ins + reminders (empty when turned off).
export async function GET() {
  const u = await getUser();
  if (!u) return unauthorized();
  const due = await dueCheckins(u.id);
  const out: { id: string; kind: string; label: string | null; consultationId: string | null }[] = [];
  for (const d of due) {
    let label = d.label;
    if (d.kind === "feeling" && d.consultationId) {
      const c = (
        await db
          .select({ id: consultations.id })
          .from(consultations)
          .where(eq(consultations.id, d.consultationId))
          .limit(1)
      )[0];
      if (!c) continue;
      label = "How are you feeling now?";
    }
    out.push({ id: d.id, kind: d.kind, label, consultationId: d.consultationId });
  }
  return NextResponse.json({ due: out });
}
