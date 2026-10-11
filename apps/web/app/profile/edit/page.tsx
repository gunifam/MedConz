import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user } from "@medconz/db";
import { EditProfileForm } from "./edit-form";

export default async function EditProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login?next=/profile/edit");
  const rows = await db.select().from(user).where(eq(user.id, session.user.id)).limit(1);
  return (
    <EditProfileForm
      initialName={rows[0]?.name ?? ""}
      initialLang={rows[0]?.preferredLanguage ?? "en"}
    />
  );
}
