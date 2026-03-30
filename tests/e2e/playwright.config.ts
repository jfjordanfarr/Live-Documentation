import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E configuration for the Live Docs Explorer.
 *
 * Tests run against a pre-built static explorer bundle served via http-server.
 * The `webServer` block starts the server automatically before the first test
 * and tears it down after the last.
 *
 * Run:   npx playwright test --config tests/e2e/playwright.config.ts
 * Or:    npm run test:e2e
 */
export default defineConfig({
  testDir: ".",
  testMatch: "**/*.spec.ts",
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: [["list"], ["html", { open: "never", outputFolder: "../../reports/e2e" }]],
  timeout: 30_000,

  use: {
    baseURL: "http://localhost:8766",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: {
    command: "npx http-server ../../dist/explorer -p 8766 -c-1 --silent",
    port: 8766,
    reuseExistingServer: true,
    timeout: 15_000,
  },
});
