// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Disable Fast Refresh (removes dev-time eval usage)
export default defineConfig({
  plugins: [react({ fastRefresh: false })],
  server: {
    strictPort: true,
    port: 5173,
    hmr: false, // extra belt & suspenders
  },
  preview: {
    strictPort: true,
    port: 4173,
  },
  build: {
    sourcemap: false,
    target: "es2017",
  },
});
