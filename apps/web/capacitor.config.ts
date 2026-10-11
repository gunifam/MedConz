import type { CapacitorConfig } from "@capacitor/cli";

// Dev APK loads the MedConz server over the LAN (phone + PC on the same
// WiFi). Production APKs point this at the hosted https backend instead.
// NOTE: change DEV_HOST to this PC's WiFi IPv4 if it moves.
const DEV_HOST = process.env.MEDCONZ_DEV_HOST ?? "10.251.191.190";
const DEV_PORT = process.env.MEDCONZ_DEV_PORT ?? "3100";

const config: CapacitorConfig = {
  appId: "com.medconz.app",
  appName: "MedConz",
  webDir: "capacitor-stub",
  server: {
    url: `http://${DEV_HOST}:${DEV_PORT}`,
    cleartext: true,
  },
};

export default config;
