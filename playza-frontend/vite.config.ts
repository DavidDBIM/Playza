import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import PrerenderPlugin from "@prerenderer/rollup-plugin";
import Renderer from "@prerenderer/renderer-jsdom";

// ─── Routes to pre-render at build time ────────────────────────────────────
// Only pre-render public, SEO-critical pages that don't require auth.
// Dynamic routes (e.g. /games/:id) are skipped — they need runtime data.
//
// NOTE: '/' (homepage) is intentionally excluded. The homepage fires live API
// calls during render which makes the pre-renderer delete dist/index.html
// without writing a replacement. Vite's generated dist/index.html already
// contains all SEO meta tags from index.html — that's sufficient for the root.
const PRERENDER_ROUTES = [
  "/games",
  "/leaderboard",
  "/tournaments",
  "/registration",
  "/terms",
  "/privacy",
  "/referral",
  "/solo-earn",
  "/loyalty",
];

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
    assetsInlineLimit: 8192,
    cssCodeSplit: true,
    rollupOptions: {
      plugins: [
        PrerenderPlugin({
          // JSDOM-based renderer (lightweight, works on Vercel)
          renderer: new Renderer({
            // Give React time to mount and render before capturing HTML
            renderAfterTime: 2000,
          }),
          routes: PRERENDER_ROUTES,
          // Where the pre-rendered HTML files are written (relative to outDir)
          // Each route gets its own folder with an index.html
          postProcess(renderedRoute: { html: string; route: string }) {
            // Fix all asset paths to be root-relative — important when the
            // pre-rendered page is served from a sub-directory like /games/
            renderedRoute.html = renderedRoute.html
              .replace(/href="\.\//g, 'href="/')
              .replace(/src="\.\//g, 'src="/');
            // mutate in-place; postProcess must return void
          },
        }),
      ],
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react-dom") || id.includes("react/") || id.includes("react-router")) return "vendor-react";
            if (id.includes("three") || id.includes("@react-three")) return "vendor-three";
            if (id.includes("phaser")) return "vendor-phaser";
            if (id.includes("matter-js")) return "vendor-matter";
            if (id.includes("chess.js") || id.includes("react-chessboard")) return "vendor-chess";
            if (id.includes("framer-motion") || id.includes("/motion/")) return "vendor-motion";
            if (id.includes("lucide-react") || id.includes("react-icons")) return "vendor-icons";
            if (id.includes("@tanstack")) return "vendor-query";
            return "vendor";
          }
        },
      },
    },
  },
});
