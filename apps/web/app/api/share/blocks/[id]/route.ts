import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { getUser, unauthorized } from "@/lib/session";
import { shareBlocks } from "@medconz/db";

// DELETE /api/share/blocks/:id — unblock.
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const u = await getUser();
  if (!u) return unauthorized();
  await db
    .delete(shareBlocks)
    .where(and(eq(shareBlocks.id, params.id), eq(shareBlocks.patientId, u.id)));
  return NextResponse.json({ unblocked: true });
}
