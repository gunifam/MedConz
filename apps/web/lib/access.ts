import { db } from "./db";
import { accessLogs } from "@medconz/db";

/** Append-only audit. Records WHAT was opened, never the contents. */
export async function logAccess(args: {
  actorId?: string | null;
  patientId: string;
  whatOpened: string;
  reason?: string;
}) {
  await db.insert(accessLogs).values({
    actorId: args.actorId ?? null,
    patientId: args.patientId,
    whatOpened: args.whatOpened,
    reason: args.reason ?? null,
  });
}
