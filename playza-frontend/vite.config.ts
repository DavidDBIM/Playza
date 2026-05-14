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
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            // React core — smallest, most reused, loaded first
            if (
              id.includes("react-dom") ||
              id.includes("/react/") ||
              id.includes("react-router")
            )
              return "vendor-react";
            // 3D / game engines — very heavy, only needed on specific game pages
            if (id.includes("three") || id.includes("@react-three"))
              return "vendor-three";
            if (id.includes("phaser")) return "vendor-phaser";
            if (id.includes("matter-js")) return "vendor-matter";
            // Chess — only on chess H2H pages
            if (id.includes("chess.js") || id.includes("react-chessboard"))
              return "vendor-chess";
            // Animation
            if (id.includes("framer-motion") || id.includes("/motion/"))
              return "vendor-motion";
            // Icons — large but tree-shaken, keep separate for long-term caching
            if (id.includes("lucide-react") || id.includes("react-icons"))
              return "vendor-icons";
            // TanStack Query — shared data layer
            if (id.includes("@tanstack")) return "vendor-query";
            // Everything else
            return "vendor";
          }
        },
      },
    },
  },
});
