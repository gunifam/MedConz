import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { getUser, unauthorized } from "@/lib/session";
import { sharedLinks } from "@medconz/db";

// DELETE — cancel a link at any moment. Recipients see only the neutral message.
// (Access requests live at POST /api/share/:id/request.)
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const u = await getUser();
  if (!u) return unauthorized();
  await db
    .update(sharedLinks)
    .set({ revokedAt: new Date() })
    .where(and(eq(sharedLinks.id, params.id), eq(sharedLinks.patientId, u.id)));
  return NextResponse.json({ revoked: true });
}
