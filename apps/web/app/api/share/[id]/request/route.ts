import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { shareBlocks, shareRequests, sharedLinks } from "@medconz/db";
import { throttle } from "@/lib/share/codes";

// POST /api/share/:id/request {name} — "Request access" on a dead link.
// Rate-limited; blocked names hear nothing different.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = (await req.json().catch(() => ({}))) as { name?: string };
  const name = (body.name ?? "").trim().slice(0, 80);
  if (!name) return NextResponse.json({ error: "Tell us your name." }, { status: 400 });
  const links = await db.select().from(sharedLinks).where(eq(sharedLinks.id, params.id)).limit(1);
  const link = links[0];
  if (!link) return NextResponse.json({ received: true }); // neutral
  if (!throttle(`req:${params.id}:${name.toLowerCase()}`, 3, 60 * 60_000)) {
    return NextResponse.json({ error: "Too many requests. Try later." }, { status: 429 });
  }
  const blocked = await db
    .select({ id: shareBlocks.id })
    .from(shareBlocks)
    .where(and(eq(shareBlocks.patientId, link.patientId), eq(shareBlocks.name, name)))
    .limit(1);
  if (blocked.length > 0) return NextResponse.json({ received: true }); // neutral
  await db.insert(shareRequests).values({ linkId: link.id, patientId: link.patientId, fromName: name });
  return NextResponse.json({ received: true, note: "The patient sees who is asking and can approve or ignore." });
}
