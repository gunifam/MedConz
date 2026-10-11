import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { VisitsClient } from "./visits-client";

export default async function DoctorVisitsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");
  return (
    <main>
      <h1>My visits</h1>
      <VisitsClient />
    </main>
  );
}
