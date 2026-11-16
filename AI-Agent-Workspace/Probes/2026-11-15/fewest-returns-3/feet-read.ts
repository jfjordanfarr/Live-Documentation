// The page's own record of branches.ts's cycle trials on a served build, beside the final build's from agree-all.json.
import { chromium } from "@playwright/test";
import fs from "node:fs";

import { localMapSettled, localRetainUrl } from "../../../../tests/e2e/still-picture";
import { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } from "../../../../packages/explorer/src/client/persistence/local-storage";

const [origin, agreeJson, ...files] = process.argv.slice(2);

async function main(): Promise<void> {
  const rows = JSON.parse(fs.readFileSync(agreeJson, "utf8")) as Array<{ file: string; lab: { trials: Array<{ signals: Record<string, number>; base: number }> }; page: { trials: Array<{ predicted: { signals: Record<string, number>; base: number } }> } }>;
  const browser = await chromium.launch();
  try {
    for (const file of files.length ? files : rows.map(r => r.file)) {
      const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
      await page.addInitScript(({ key, value }) => { window.localStorage.setItem(key, value); }, { key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { searchStarts: 1, searchPatience: 1 } } }) });
      await page.goto(`${origin}${localRetainUrl("/", [file])}`);
      await page.waitForSelector("#map-container .local-placed", { timeout: 60_000 });
      await localMapSettled(page, 120_000);
      const trials = await page.evaluate(() => JSON.parse(document.querySelector<HTMLElement>("#map-container .local-placed")!.dataset.searchCycleTrials ?? "[]") as Array<{ predicted: { signals: Record<string, number>; base: number } }>);
      const row = rows.find(r => r.file === file)!;
      trials.forEach((trial, index) => {
        const final = row.page.trials[index], lab = row.lab.trials[index];
        const same = JSON.stringify(trial.predicted.signals) === JSON.stringify(final?.predicted.signals);
        console.log(`${file.split("/").pop()} ${index + 1}: served ${Math.round(trial.predicted.base)} final ${Math.round(final?.predicted.base)} lab ${Math.round(lab?.base)} ${same ? "same" : `DIFFERS served ${JSON.stringify(trial.predicted.signals)} final ${JSON.stringify(final?.predicted.signals)} lab ${JSON.stringify(lab?.signals)}`} adopted ${(trial as unknown as { adopted: boolean }).adopted}`);
      });
      await page.close();
    }
  } finally {
    await browser.close();
  }
}
void main();
