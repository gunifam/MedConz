import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "./auth";

export async function getUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
}

export function unauthorized() {
  return NextResponse.json({ error: "Not signed in" }, { status: 401 });
}
