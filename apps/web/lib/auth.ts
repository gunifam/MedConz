import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { phoneNumber } from "better-auth/plugins";
import { db } from "./db";
import { sendMail } from "./email";
import * as schema from "@medconz/db";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET ?? "local-dev-secret-32-chars-minimum-xxxx",
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3100",
  // LAN / tunnel origins the APK WebView uses (comma-separated). Without
  // these, BetterAuth rejects the WebView's origin on auth calls.
  trustedOrigins: (process.env.TRUSTED_ORIGINS ?? "").split(",").map((s) => s.trim()).filter(Boolean),
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }) => {
      await sendMail({
        to: user.email,
        subject: "Reset your MedConz password",
        text: `You asked to reset your password. Use this link within 1 hour:\n\n${url}\n\nIf you did not ask, ignore this message.`,
      });
    },
  },
  user: {
    additionalFields: {
      role: { type: "string", defaultValue: "patient", required: false },
      specialty: { type: "string", required: false },
      preferredLanguage: { type: "string", defaultValue: "en", required: false },
      phoneNumber: { type: "string", required: false },
    },
  },
  session: { expiresIn: 60 * 60 * 24, updateAge: 60 * 60 * 12 },
  // NOTE: the admin() plugin is deliberately off in local dev because it
  // forbids setting `role` at signup. Production must authorize every
  // doctor/dentist (PRD 11.2) — re-add admin() with an approval flow then.
  plugins: [phoneNumber({ sendOTP: async () => {} })],
});
