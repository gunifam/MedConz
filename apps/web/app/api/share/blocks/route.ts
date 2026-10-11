import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { getUser, unauthorized } from "@/lib/session";
import { shareBlocks } from "@medconz/db";

// POST /api/share/blocks {name} — block future requests from a name.
export async function POST(req: Request) {
  const u = await getUser();
  if (!u) return unauthorized();
  const body = (await req.json().catch(() => ({}))) as { name?: string };
  const name = (body.name ?? "").trim().slice(0, 80);
  if (!name) return NextResponse.json({ error: "Name required." }, { status: 400 });
  await db.insert(shareBlocks).values({ patientId: u.id, name });
  return NextResponse.json({ blocked: true });
}
