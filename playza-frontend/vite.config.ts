import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// Prerender removed — it added 18+ seconds to build time and the pages
// it generated were stale (API data baked in). index.html SEO tags are sufficient.

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    // Minify with esbuild (default, fast)
    minify: "esbuild",
    // Don't inline assets — keep them as separate files for better caching
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;

          // ── Split the heaviest libraries into their own chunks ──────────────
          // These are NEVER downloaded unless the user visits a page that needs them

          // 3D engine — only Chess3D / SpeedTap pages need this (~2.5MB)
          if (id.includes("three") || id.includes("@react-three")) return "vendor-3d";

          // Physics / game engines — only specific game pages (~800KB)
          if (id.includes("phaser"))     return "vendor-phaser";
          if (id.includes("matter-js"))  return "vendor-matter";

          // Chess — only chess game page (~200KB)
          if (id.includes("chess.js") || id.includes("react-chessboard")) return "vendor-chess";

          // React core — always needed, cached separately
          if (id.includes("react-dom") || id.includes("react/")) return "vendor-react";
          if (id.includes("react-router")) return "vendor-router";

          // Animation — used on many pages but separable
          if (id.includes("motion") || id.includes("framer")) return "vendor-motion";

          // Icons — large, used everywhere, cache separately
          if (id.includes("lucide-react") || id.includes("react-icons")) return "vendor-icons";

          // Socket.IO — only game/quiz pages (~200KB)
          if (id.includes("socket.io")) return "vendor-socket";

          // Forms + validation — only auth/profile pages
          if (id.includes("react-hook-form") || id.includes("@hookform") || id.includes("zod")) return "vendor-forms";

          // Radix UI — used across many components
          if (id.includes("radix-ui") || id.includes("@radix-ui")) return "vendor-radix";

          // Tanstack Query
          if (id.includes("@tanstack")) return "vendor-query";

          // Everything else (axios, date-fns, clsx, etc.)
          return "vendor-misc";
        },
      },
    },
  },
});
