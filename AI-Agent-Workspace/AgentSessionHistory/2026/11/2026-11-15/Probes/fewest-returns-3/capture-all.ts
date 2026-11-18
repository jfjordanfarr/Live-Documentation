// Captures every changed picture's cards from the built page, once, with the search off (the first draw), so that the
// lab can lay any of its cycle orders out on real card sizes without a browser; and checks the lab's first draw against it.
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

import { captureFromPage, writeCapture } from "../../../../scripts/layout-lab/capture";
import { baselineConfig, driftOf, evaluate } from "../../../../scripts/layout-lab/evaluate";
import { loadBundleGraph, ORIGIN, serveBundle, type ScopeRun } from "../../../../scripts/layout-lab/scopes";
import { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } from "../../../../packages/explorer/src/client/persistence/local-storage";
import { localRetainUrl } from "../../../../tests/e2e/still-picture";

const [listPath, outDir] = process.argv.slice(2);
const files = fs.readFileSync(listPath, "utf8").split("\n").flatMap(line => {
  const match = /\s(\S+)$/u.exec(line.trim());
  return match && line.includes("->") && !match[1].endsWith("/") ? [match[1]] : [];
});

async function main(): Promise<void> {
  const browser = await chromium.launch();
  try {
    for (const file of files) {
      const run: ScopeRun = { bundle: "repository", base: "/", scopeName: file, scope: [file], subject: file };
      const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
      try {
        await serveBundle(page);
        await page.addInitScript(({ key, value }) => { window.localStorage.setItem(key, value); }, { key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { searchStarts: 0 } } }) });
        await page.goto(`${ORIGIN}${localRetainUrl(run.base, run.scope)}`);
        const capture = await captureFromPage(page, run);
        await writeCapture(capture, path.join(outDir, `${file.replaceAll("/", "__")}.json`));
        const drift = driftOf(capture, evaluate(capture, await loadBundleGraph(run), run, baselineConfig()));
        console.log(file, "warnings", capture.warnings.length, "drift", drift.length, drift.slice(0, 2).join("; "));
      } catch (error) {
        console.log(file, "error", String(error).slice(0, 160));
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }
}
void main();
