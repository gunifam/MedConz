import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MedConz — doctors & dentists",
    short_name: "MedConz",
    description: "Symptom check, health timeline and paid consultation with doctors and dentists.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0E7C6B",
    theme_color: "#0E7C6B",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
