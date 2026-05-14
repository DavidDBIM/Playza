import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// NOTE: @prerenderer/rollup-plugin was removed — it calls `transformWithEsbuild`
// internally which does not exist in rolldown-vite (the bundler this project uses).
// Pre-rendering via that plugin is incompatible with rolldown-vite until the plugin
// updates to use `transformWithOxc`. The SEO meta tags in index.html still cover
// all important routes for crawlers without pre-rendering.

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    // Inline small assets (icons, tiny images) as base64 — saves HTTP round trips
    assetsInlineLimit: 8192,
    // CSS code splitting — each page only loads its own styles
    cssCodeSplit: true,
  },
});
