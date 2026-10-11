import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { getUser, unauthorized } from "@/lib/session";
import { user } from "@medconz/db";
import { LANGS } from "@medconz/i18n";

// PATCH {name?, preferredLanguage?} — edit profile. Language switches any
// time without losing answers.
export async function PATCH(req: Request) {
  const u = await getUser();
  if (!u) return unauthorized();
  const body = (await req.json().catch(() => ({}))) as {
    preferredLanguage?: string;
    name?: string;
  };
  const patch: Partial<typeof user.$inferInsert> = { updatedAt: new Date() };
  if (body.preferredLanguage !== undefined) {
    if (!(LANGS as string[]).includes(body.preferredLanguage)) {
      return NextResponse.json({ error: "Use en|ha|yo|ig" }, { status: 400 });
    }
    patch.preferredLanguage = body.preferredLanguage;
  }
  if (body.name !== undefined) {
    const name = body.name.trim().slice(0, 80);
    if (!name) return NextResponse.json({ error: "Name cannot be empty." }, { status: 400 });
    patch.name = name;
  }
  await db.update(user).set(patch).where(eq(user.id, u.id));
  const rows = await db.select().from(user).where(eq(user.id, u.id)).limit(1);
  return NextResponse.json({
    name: rows[0]?.name ?? null,
    preferredLanguage: rows[0]?.preferredLanguage ?? "en",
  });
}
