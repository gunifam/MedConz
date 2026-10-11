import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { DetailClient } from "./detail-client";

export default async function DoctorDetailPage({ params }: { params: { id: string } }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");
  return <DetailClient id={params.id} />;
}
