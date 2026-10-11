import nodemailer from "nodemailer";

// Outgoing mail. Production needs SMTP_* env set. Without it (local dev),
// the message is printed to the server console instead of sent — clearly
// labelled, never exposed to the browser.
export async function sendMail(args: { to: string; subject: string; text: string }) {
  const host = process.env.SMTP_HOST;
  if (!host) {
    console.log(`[dev-mail] To: ${args.to}\nSubject: ${args.subject}\n${args.text}`);
    return { sent: false as const, dev: true as const };
  }
  const transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: (process.env.SMTP_SECURE ?? "false") === "true",
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS ?? "" }
      : undefined,
  });
  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? "MedConz <no-reply@medconz.app>",
    to: args.to,
    subject: args.subject,
    text: args.text,
  });
  return { sent: true as const, dev: false as const };
}
