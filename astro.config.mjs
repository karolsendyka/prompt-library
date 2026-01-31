// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import node from "@astrojs/node";

import astroFont from "astro-font";

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [react(), sitemap(), astroFont({
    fonts: [
      {
        name: "Inter Variable",
        src: "/fonts/inter-latin-variable.woff2",
        weight: "100 900",
        // Add `preload` to ensure fonts are loaded without a flash of unstyled text
        preload: true,
        // Optional: define a fallback font for better user experience
        // fallback: "sans-serif",
        // Optional: define font display strategy
        // display: "swap",
      },
    ],
  })],
  server: { port: 3000 },
  vite: {
    plugins: [tailwindcss()],
  },
  adapter: node({
    mode: "standalone",
  }),
});
