import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { getUser, unauthorized } from "@/lib/session";
import { shareBlocks, sharedLinks, shareRequests } from "@medconz/db";
import { hashCode, makeShareCode } from "@/lib/share/codes";

const SCOPES = ["6m", "1y", "all"] as const;
const DAYS = [1, 7, 30] as const;

// GET — my links (what/with whom/when + opens) + incoming access requests + blocks.
export async function GET() {
  const u = await getUser();
  if (!u) return unauthorized();
  const links = await db
    .select()
    .from(sharedLinks)
    .where(eq(sharedLinks.patientId, u.id))
    .orderBy(desc(sharedLinks.createdAt))
    .limit(50);
  const requests = await db
    .select()
    .from(shareRequests)
    .where(eq(shareRequests.patientId, u.id))
    .orderBy(desc(shareRequests.createdAt))
    .limit(50);
  const blocks = await db.select().from(shareBlocks).where(eq(shareBlocks.patientId, u.id));
  return NextResponse.json({
    links: links.map((l) => ({
      id: l.id,
      scope: l.scope,
      expiresAt: l.expiresAt,
      revokedAt: l.revokedAt,
      openCount: l.openCount,
      opened: l.openCount > 0, // first-open alert: badge + one-tap cancel
      createdAt: l.createdAt,
    })),
    requests,
    blocks: blocks.map((b) => ({ id: b.id, name: b.name })),
  });
}

// POST {scope, days} — create a link. Code shown ONCE; only its hash is stored.
export async function POST(req: Request) {
  const u = await getUser();
  if (!u) return unauthorized();
  const body = (await req.json().catch(() => ({}))) as { scope?: string; days?: number };
  if (!SCOPES.includes(body.scope as (typeof SCOPES)[number])) {
    return NextResponse.json({ error: "Use scope 6m|1y|all." }, { status: 400 });
  }
  if (!DAYS.includes(body.days as (typeof DAYS)[number])) {
    return NextResponse.json({ error: "Use 1|7|30 days." }, { status: 400 });
  }
  const code = makeShareCode();
  const [row] = await db
    .insert(sharedLinks)
    .values({
      patientId: u.id,
      scope: { range: body.scope },
      codeHash: hashCode(code),
      expiresAt: new Date(Date.now() + (body.days as number) * 24 * 3600_000),
    })
    .returning({ id: sharedLinks.id, expiresAt: sharedLinks.expiresAt });
  return NextResponse.json({
    id: row.id,
    code, // show once — we never store it
    expiresAt: row.expiresAt,
    reminder: "Only share this code with the person you chose.",
  });
}
