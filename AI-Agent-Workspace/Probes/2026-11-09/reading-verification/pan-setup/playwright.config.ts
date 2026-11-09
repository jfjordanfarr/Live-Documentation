import { defineConfig, devices } from "/workspaces/Live-Documentation/node_modules/@playwright/test/index.js";
import base from "/workspaces/Live-Documentation/tests/e2e/playwright.config";
import { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } from "/workspaces/Live-Documentation/packages/explorer/src/client/persistence/local-storage";
const origin = "http://localhost:8911";
export default defineConfig({
  ...base,
  testDir: "/tmp/live-docs-20261109-pan",
  testMatch: "pan.spec.ts",
  outputDir: "/tmp/live-docs-20261109-pan/results",
  reporter: [["list"], ["json", {outputFile: "/tmp/live-docs-20261109-pan/report.json"}]],
  timeout: 30_000, workers: 1, retries: 0,
  use: {
    ...base.use, baseURL: origin,
    storageState: {cookies: [], origins: [{origin, localStorage: [{name: PERSISTED_UI_KEY, value: JSON.stringify({version: PERSISTED_UI_VERSION, tuning:{localMap:{searchStarts:0}}})}]}]},
    trace: {mode: "on", snapshots: false, screenshots: true},
    video: {mode: "on", size: {width: 1600, height: 1000}},
  },
  projects: [{name: "chromium", use: {...devices["Desktop Chrome"]}}],
  webServer: undefined,
});
