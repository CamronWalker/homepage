import { defineConfig } from "vite";

export default defineConfig({
  build: { outDir: "dist", assetsInlineLimit: 0 },
  server: { port: 5173, strictPort: true },
});
