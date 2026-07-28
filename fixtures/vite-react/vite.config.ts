import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { defineConfig } from "vite";

const selectedEntry = process.env.TREE_SHAKING_ENTRY;
const input = selectedEntry
  ? resolve(import.meta.dirname, `src/${selectedEntry}.tsx`)
  : resolve(import.meta.dirname, "index.html");

export default defineConfig({
  plugins: [react()],
  build: {
    manifest: true,
    rollupOptions: {
      input
    }
  }
});
