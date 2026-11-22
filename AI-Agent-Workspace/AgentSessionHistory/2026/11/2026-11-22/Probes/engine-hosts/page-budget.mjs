// Times one scan in the page check's scanning page (`dist/page-scan/page.html`, built by `npm run e2e:bundles`), opened
// as a file, with the page's processor slowed by the browser's own throttle, at one read budget. Prints one JSON line:
// the scan's time to its finished map, the peak resident memory of the page's renderer, the files read and the reads.
// Run only through the browser lane, from the repository root, under `taskset -c 0,1` to hold the browser to two cores:
//   node scripts/browser-lane.mjs --label <who> -- taskset -c 0,1 node <this file> <corpus folder> <rate> <budget MiB | all>
// The way of slowing and of reading the renderer's peak is the scan-in-a-tab probe's of 2026-11-21.
import { chromium } from "@playwright/test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const [corpusDir, rateText = "4", budgetText = "all"] = process.argv.slice(2);
const rate = Number(rateText);
const page_html = path.resolve("dist", "page-scan", "page.html");

/** The highest resident memory any renderer of this driver's own browser reached (`VmHWM`), in MB. */
function rendererPeakMB() {
  let peak = 0;
  for (const pid of fs.readdirSync("/proc").filter((entry) => /^\d+$/u.test(entry))) {
    try {
      if (!fs.readFileSync(`/proc/${pid}/cmdline`, "utf8").includes("--type=renderer")) continue;
      let parent = +fs.readFileSync(`/proc/${pid}/stat`, "utf8").split(") ")[1].split(" ")[1];
      let mine = false;
      for (let hops = 0; hops < 6 && parent > 1; hops += 1) {
        if (parent === process.pid) { mine = true; break; }
        parent = +fs.readFileSync(`/proc/${parent}/stat`, "utf8").split(") ")[1].split(" ")[1];
      }
      if (mine) peak = Math.max(peak, Math.round(+/VmHWM:\s+(\d+)/u.exec(fs.readFileSync(`/proc/${pid}/status`, "utf8"))[1] / 1024));
    } catch { /* gone */ }
  }
  return peak;
}

const browser = await chromium.launch();
const page = await (await browser.newContext()).newPage();
const cdp = await page.context().newCDPSession(page);
if (rate > 1) await cdp.send("Emulation.setCPUThrottlingRate", { rate });
const record = { corpus: path.basename(corpusDir), rate, budget: budgetText, cores: os.availableParallelism(), loadBefore: os.loadavg()[0].toFixed(1) };
try {
  await page.goto(pathToFileURL(page_html).href);
  await page.waitForFunction(() => window.pageScan.ready || window.pageScan.error !== undefined, undefined, { timeout: 120_000 });
  await page.locator("#folder").evaluate((input, budget) => {
    input.dataset.now = "2026-01-01T00:00:00.000Z";
    if (budget !== "all") input.dataset.readBudget = String(Number(budget) * 1024 * 1024);
  }, budgetText);
  await page.setInputFiles("#folder", corpusDir);
  await page.waitForFunction(() => window.pageScan.result !== undefined || window.pageScan.error !== undefined, undefined, { timeout: 280_000, polling: 1000 });
  const result = await page.evaluate(() => {
    const scan = window.pageScan.result;
    if (!scan) return { error: window.pageScan.error };
    const reads = Object.entries(scan.reads).filter(([file]) => !file.startsWith(".live-documentation/") && !file.startsWith("/"));
    return { ms: scan.ms, files: scan.files, processed: scan.processed, failed: scan.failed.length, filesRead: reads.length, reads: reads.reduce((sum, [, times]) => sum + times, 0) };
  });
  Object.assign(record, result, { scanSeconds: result.ms === undefined ? undefined : +(result.ms / 1000).toFixed(1) });
} catch (error) {
  record.failed = String(error).slice(0, 500);
}
record.rendererPeakMB = rendererPeakMB();
record.loadAfter = os.loadavg()[0].toFixed(1);
console.log(JSON.stringify(record));
await browser.close();
