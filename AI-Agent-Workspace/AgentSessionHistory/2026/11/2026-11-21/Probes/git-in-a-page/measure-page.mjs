// Probe of November 21, 2026 (not product code): one task of the workload in the probe page, opened from disk, with a
// folder handed to its folder input as a person choosing it would (Chromium lists the folder itself), the page's
// processor slowed by the browser's own throttle where asked. Prints one JSON line. Run only through the browser lane:
//   node scripts/browser-lane.mjs --label git-probe -- node <this file> <folder> <rate> <task>
// and, for two cores, under `taskset -c 0,1`. Tasks: all (every commit, every changed file's bytes), newest100 (the
// newest hundred commits, their changed files, and every file of the head), commits (every commit, no bytes), renames
// (every commit with git's renames, as the history asks them), commitsStream (commits, inflated by DecompressionStream).
import { chromium } from "@playwright/test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const [folder, rateText = "1", task = "all"] = process.argv.slice(2);
const rate = Number(rateText);
const tasks = { all: {}, commits: { blobs: false }, newest100: { limit: 100, headTree: true }, renames: { blobs: false, renames: true }, commitsStream: { blobs: false, inflate: "stream" } };

function rendererPeakMB() {
  let peak = 0;
  for (const pid of fs.readdirSync("/proc").filter((d) => /^\d+$/u.test(d))) {
    try {
      if (!fs.readFileSync(`/proc/${pid}/cmdline`, "utf8").includes("--type=renderer")) continue;
      let parent = +fs.readFileSync(`/proc/${pid}/stat`, "utf8").split(") ")[1].split(" ")[1];
      let mine = false;
      for (let hops = 0; hops < 6 && parent > 1; hops += 1) {
        if (parent === process.pid) {
          mine = true;
          break;
        }
        parent = +fs.readFileSync(`/proc/${parent}/stat`, "utf8").split(") ")[1].split(" ")[1];
      }
      if (mine) peak = Math.max(peak, Math.round(+/VmHWM:\s+(\d+)/u.exec(fs.readFileSync(`/proc/${pid}/status`, "utf8"))[1] / 1024));
    } catch {
      // gone
    }
  }
  return peak;
}

const browser = await chromium.launch({ args: ["--enable-precise-memory-info"] });
const context = await browser.newContext();
const page = await context.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(String(error).slice(0, 300)));
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text().slice(0, 300));
});
const cdp = await context.newCDPSession(page);
if (rate > 1) await cdp.send("Emulation.setCPUThrottlingRate", { rate });
const record = { folder: path.basename(folder), rate, task, cores: os.availableParallelism(), loadBefore: os.loadavg()[0].toFixed(1) };
try {
  await page.goto(`file://${path.join(here, "probe.html")}`);
  const t0 = Date.now();
  await page.setInputFiles("#folder", folder);
  await page.waitForFunction(() => window.__probe.described !== undefined, undefined, { timeout: 600000 });
  record.folderGivenMs = Date.now() - t0;
  record.described = await page.evaluate(() => window.__probe.described);
  record.result = await page.evaluate((options) => window.__probe.run(options), tasks[task]);
  record.shown = await page.textContent("#progress");
} catch (error) {
  record.failed = String(error).slice(0, 500);
}
record.rendererPeakMB = rendererPeakMB();
record.errors = errors.slice(0, 5);
record.loadAfter = os.loadavg()[0].toFixed(1);
console.log(JSON.stringify(record));
await browser.close();
