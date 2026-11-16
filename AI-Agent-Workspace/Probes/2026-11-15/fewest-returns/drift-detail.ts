// The lab's drift from the new page, line by line, on the pictures where it is not nothing.
import { chromium } from "@playwright/test";

import { captureFromPage } from "../../../../scripts/layout-lab/capture";
import { baselineConfig, driftOf, evaluate } from "../../../../scripts/layout-lab/evaluate";
import { loadBundleGraph, ORIGIN, serveBundle } from "../../../../scripts/layout-lab/scopes";
import { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } from "../../../../packages/explorer/src/client/persistence/local-storage";
import { localRetainUrl } from "../../../../tests/e2e/still-picture";

async function main(): Promise<void> {
  const browser = await chromium.launch();
  try {
    for (const file of process.argv.slice(2)) {
      const run = { bundle: "repository" as const, base: "/", scopeName: file, scope: [file], subject: file };
      const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
      await serveBundle(page);
      await page.addInitScript(({ key, value }) => { window.localStorage.setItem(key, value); }, { key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { searchStarts: 0 } } }) });
      await page.goto(`${ORIGIN}${localRetainUrl(run.base, run.scope)}`);
      const capture = await captureFromPage(page, run);
      const evaluation = evaluate(capture, await loadBundleGraph(run), run, baselineConfig());
      console.log(file, capture.warnings, driftOf(capture, evaluation));
      await page.close();
    }
  } finally {
    await browser.close();
  }
}
void main();
