import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "./auth";
import { db } from "./db";
import { user } from "@medconz/db";

export async function getUserWithRole() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;
  const rows = await db.select().from(user).where(eq(user.id, session.user.id)).limit(1);
  const role = rows[0]?.role ?? "patient";
  return { ...session.user, role };
}

export function forbidden() {
  return NextResponse.json({ error: "Not allowed." }, { status: 403 });
}

export const DOCTOR_ROLES = ["doctor", "dentist", "medical_team", "top_clearance"];
