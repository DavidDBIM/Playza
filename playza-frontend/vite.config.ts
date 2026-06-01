import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    minify: "esbuild",
    assetsInlineLimit: 4096,
    // Enable CSS code splitting — each lazy page only loads its own CSS
    cssCodeSplit: true,
    // Generate source maps only in dev, not prod (speeds up build + reduces size)
    sourcemap: false,
    rollupOptions: {
      output: {
        // Keep chunk filenames stable for better CDN caching
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
        manualChunks(id) {
          if (!id.includes("node_modules")) return;

          // 3D engine — only Chess3D / SpeedTap pages (~2.5MB)
          if (id.includes("three") || id.includes("@react-three")) return "vendor-3d";

          // Physics engines — only specific game pages (~800KB)
          if (id.includes("phaser")) return "vendor-phaser";
          if (id.includes("matter-js")) return "vendor-matter";

          // Chess — only chess game page (~200KB)
          if (id.includes("chess.js") || id.includes("react-chessboard")) return "vendor-chess";

          // React core — always needed
          if (id.includes("react-dom") || id.includes("react/")) return "vendor-react";
          if (id.includes("react-router")) return "vendor-router";

          // Animation — used on many pages
          if (id.includes("motion") || id.includes("framer")) return "vendor-motion";

          // Icons — large, used everywhere
          if (id.includes("lucide-react") || id.includes("react-icons")) return "vendor-icons";

          // Socket.IO — only game/quiz pages (~200KB)
          if (id.includes("socket.io")) return "vendor-socket";

          // Forms + validation — only auth/profile pages
          if (id.includes("react-hook-form") || id.includes("@hookform") || id.includes("zod")) return "vendor-forms";

          // Radix UI
          if (id.includes("radix-ui") || id.includes("@radix-ui")) return "vendor-radix";

          // Tanstack Query
          if (id.includes("@tanstack")) return "vendor-query";

          // Supabase — split into its own chunk, it's heavy
          if (id.includes("@supabase")) return "vendor-supabase";

          // Everything else
          return "vendor-misc";
        },
      },
    },
  },
});
