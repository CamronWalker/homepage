import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 90_000,
  // One worker: prevents two scroll-scrub tests from competing for the same
  // dev-server CPU budget, which can cause GSAP scrub tweens to stall.
  workers: 1,
  webServer: { command: "npm run dev", port: 5173, reuseExistingServer: true, timeout: 30_000 },
  use: { baseURL: "http://localhost:5173" },
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { viewport: { width: 390, height: 844 }, hasTouch: true } },
  ],
});
