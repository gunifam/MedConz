import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { getUser, unauthorized } from "@/lib/session";
import { user } from "@medconz/db";
import { LANGS } from "@medconz/i18n";

// PATCH {preferredLanguage} — switch language any time without losing answers.
export async function PATCH(req: Request) {
  const u = await getUser();
  if (!u) return unauthorized();
  const body = (await req.json().catch(() => ({}))) as { preferredLanguage?: string };
  if (!body.preferredLanguage || !(LANGS as string[]).includes(body.preferredLanguage)) {
    return NextResponse.json({ error: "Use en|ha|yo|ig" }, { status: 400 });
  }
  await db
    .update(user)
    .set({ preferredLanguage: body.preferredLanguage, updatedAt: new Date() })
    .where(eq(user.id, u.id));
  return NextResponse.json({ preferredLanguage: body.preferredLanguage });
}
