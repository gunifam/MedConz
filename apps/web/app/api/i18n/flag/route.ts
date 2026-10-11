import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { getUser, unauthorized } from "@/lib/session";
import { translationFlags } from "@medconz/db";
import { LANGS } from "@medconz/i18n";

// POST /api/i18n/flag {lang, key, note?} — one-tap "translation looks wrong"
// for doctors and patients. Reviewed with the medical team.
export async function POST(req: Request) {
  const u = await getUser();
  if (!u) return unauthorized();
  const body = (await req.json().catch(() => ({}))) as { lang?: string; key?: string; note?: string };
  if (!body.lang || !(LANGS as string[]).includes(body.lang) || !body.key) {
    return NextResponse.json({ error: "Use a valid lang + key." }, { status: 400 });
  }
  await db.insert(translationFlags).values({
    reporterId: u.id,
    lang: body.lang,
    key: body.key.slice(0, 80),
    note: (body.note ?? "").slice(0, 300) || null,
  });
  return NextResponse.json({ thanks: true });
}
