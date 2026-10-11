import type { Metadata } from "next";
import { MedConzStyles } from "@medconz/ui";
import "./globals.css";

export const metadata: Metadata = {
  title: "MedConz",
  description: "Symptom check, timeline and paid consultation",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <MedConzStyles />
        {children}
      </body>
    </html>
  );
}
