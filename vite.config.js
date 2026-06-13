import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist",
    assetsInlineLimit: 0,
    rollupOptions: {
      input: {
        main:      "index.html",
        notfound:  "404.html",
      },
    },
  },
  server: { port: 5173, strictPort: true },
  test: { exclude: ["**/node_modules/**", "tests/e2e/**"] },   // e2e belongs to Playwright
});
