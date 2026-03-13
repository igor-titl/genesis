import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";

export default defineConfig({
  base: "/app",
  build: {
    assetsPrefix: "/app",
  },
  output: "server",

  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),

  integrations: [react()],

  vite: {
    resolve: {
      alias: import.meta.env.PROD
        ? {
            "react-dom/server": "react-dom/server.edge",
          }
        : undefined,
    },
  },
});
