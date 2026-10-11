import type { CapacitorConfig } from "@capacitor/cli";

// The APK loads MedConz from an https backend (no PC needed on the phone).
// Default is the live site. For LAN testing against a dev server instead:
//   server: { url: "http://<PC_WIFI_IP>:3100", cleartext: true }
const LIVE_URL =
  process.env.MEDCONZ_APP_URL ?? "https://medconz-app.netlify.app";

const config: CapacitorConfig = {
  appId: "com.medconz.app",
  appName: "MedConz",
  webDir: "capacitor-stub",
  server: {
    url: LIVE_URL,
    cleartext: false,
  },
};

export default config;
