import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { FinishClient } from "./finish-client";

export default async function FinishCheckPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login?next=/check/finish");
  return <FinishClient />;
}
