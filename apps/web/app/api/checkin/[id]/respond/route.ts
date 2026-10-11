import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { getUser, unauthorized } from "@/lib/session";
import { checkins } from "@medconz/db";

// POST /api/checkin/:id/respond {feeling: better|same|worse, notifyDoctor?}
// Worse → emergency message FIRST, then the rebook path (PRD 10).
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const u = await getUser();
  if (!u) return unauthorized();
  const rows = await db
    .select()
    .from(checkins)
    .where(and(eq(checkins.id, params.id), eq(checkins.patientId, u.id)))
    .limit(1);
  const row = rows[0];
  if (!row || row.kind !== "feeling") return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (row.status !== "pending") return NextResponse.json({ error: "Already answered." }, { status: 409 });

  const body = (await req.json().catch(() => ({}))) as {
    feeling?: string;
    notifyDoctor?: boolean;
  };
  if (!["better", "same", "worse"].includes(body.feeling ?? "")) {
    return NextResponse.json({ error: "Use better|same|worse." }, { status: 400 });
  }
  await db
    .update(checkins)
    .set({ status: body.feeling as "better" | "same" | "worse", answeredAt: new Date() })
    .where(eq(checkins.id, row.id));

  if (body.feeling === "worse") {
    return NextResponse.json({
      worse: true,
      emergency: {
        title: "If this feels serious, get help now — call 112.",
        note: "Emergency help is always free and always shown.",
      },
      rebook: {
        checkinId: row.id,
        consultationId: row.consultationId,
        notifyDoctor: !!body.notifyDoctor,
        note: "See a doctor again — ideally the same one. With your agreement the doctor is told.",
      },
    });
  }
  return NextResponse.json({ recorded: body.feeling });
}
