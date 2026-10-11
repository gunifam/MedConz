import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { getUser, unauthorized } from "@/lib/session";
import { timelineEntries } from "@medconz/db";

const HOLD_MONTHS = 6;

// DELETE /api/timeline/:id — leaves patient + doctor views immediately,
// held for 6 months before permanent erasure (top-clearance only).
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const u = await getUser();
  if (!u) return unauthorized();
  const heldUntil = new Date();
  heldUntil.setMonth(heldUntil.getMonth() + HOLD_MONTHS);
  const updated = await db
    .update(timelineEntries)
    .set({ visible: false, deletedAt: new Date(), heldUntil })
    .where(
      and(eq(timelineEntries.id, params.id), eq(timelineEntries.patientId, u.id)),
    )
    .returning({ id: timelineEntries.id });
  if (updated.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({
    deleted: true,
    heldUntil,
    note: "Gone from your and your doctors' view now. Permanently erased after 6 months.",
  });
}
