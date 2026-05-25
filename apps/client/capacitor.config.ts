import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.persephone.app",
  appName: "Persephone",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
};

export default config;
