// Times one scan in the probe's scanning page, opened as a file, with the page's processor slowed by the browser's own
// throttle. Prints one JSON line. Run only through the browser lane, from the repository root:
//   node scripts/browser-lane.mjs --label <who> -- node <this file> <page folder> <corpus folder> <rate>
// and under `taskset -c 0,1` to hold the whole browser to two processor cores.
// While the scan runs the page also counts the frames it could draw, since a progress indicator on the same thread can
// only move when the scan lets a frame through.
import { chromium } from "@playwright/test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const [pageDir, corpusDir, rateText = "1"] = process.argv.slice(2);
const rate = Number(rateText);

function rendererPeakMB() {
  let peak = 0;
  for (const pid of fs.readdirSync("/proc").filter((d) => /^\d+$/.test(d))) {
    try {
      if (!fs.readFileSync(`/proc/${pid}/cmdline`, "utf8").includes("--type=renderer")) continue;
      const stat = fs.readFileSync(`/proc/${pid}/stat`, "utf8").split(") ")[1].split(" ");
      // Only renderers of this driver's own browser: walk up to this process.
      let parent = +stat[1], mine = false;
      for (let hops = 0; hops < 6 && parent > 1; hops += 1) {
        if (parent === process.pid) { mine = true; break; }
        parent = +fs.readFileSync(`/proc/${parent}/stat`, "utf8").split(") ")[1].split(" ")[1];
      }
      if (!mine) continue;
      peak = Math.max(peak, Math.round(+/VmHWM:\s+(\d+)/.exec(fs.readFileSync(`/proc/${pid}/status`, "utf8"))[1] / 1024));
    } catch { /* gone */ }
  }
  return peak;
}

const browser = await chromium.launch({ args: ["--enable-precise-memory-info"] });
const context = await browser.newContext();
const page = await context.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(String(error).slice(0, 300)));
page.on("console", (message) => { if (message.type() === "error") errors.push(message.text().slice(0, 300)); });
const cdp = await context.newCDPSession(page);
if (rate > 1) await cdp.send("Emulation.setCPUThrottlingRate", { rate });

const record = { corpus: path.basename(corpusDir), rate, cores: os.availableParallelism(), loadBefore: os.loadavg()[0].toFixed(1) };
try {
  const t0 = Date.now();
  await page.goto(`file://${path.join(pageDir, "page.html")}`);
  await page.evaluate(() => window.__probe.wasmReady);
  record.pageReadyMs = Date.now() - t0;

  await page.evaluate(() => { const input = document.createElement("input"); input.type = "file"; input.id = "probe-files"; input.webkitdirectory = true; document.body.append(input); });
  const t1 = Date.now();
  await page.setInputFiles("#probe-files", corpusDir);
  record.folderGivenMs = Date.now() - t1;
  const load = await page.evaluate(() => window.__probe.loadFromFiles(document.getElementById("probe-files").files));
  record.filesRead = load.files;
  record.megabytesRead = +(load.bytes / 1048576).toFixed(1);
  record.readMs = Math.round(load.readMs);

  const scan = await page.evaluate(async () => {
    const frames = [];
    let counting = true;
    const tick = (now) => { frames.push(now); if (counting) requestAnimationFrame(tick); };
    const started = performance.now();
    requestAnimationFrame(tick);
    const result = await window.__probe.generate();
    const ended = performance.now();
    counting = false;
    // The longest stretch with no frame, the stretch from the last frame to the scan's end among them.
    let longest = 0, previous = started;
    for (const at of frames) { longest = Math.max(longest, at - previous); previous = Math.max(previous, at); }
    longest = Math.max(longest, ended - previous);
    return { ms: result.ms, processed: result.processed, docs: result.docs, warnings: result.warnings, reads: result.reads, frames: frames.length, longestGapMs: longest, heapMB: result.memory.heap ? Math.round(result.memory.heap.usedJSHeapSize / 1048576) : null };
  });
  record.scanSeconds = +(scan.ms / 1000).toFixed(1);
  record.processed = scan.processed;
  record.docs = scan.docs;
  record.warnings = scan.warnings;
  record.fileReads = scan.reads;
  record.framesDuringScan = scan.frames;
  record.longestFreezeSeconds = +(scan.longestGapMs / 1000).toFixed(1);
  record.heapAfterMB = scan.heapMB;
} catch (error) {
  record.failed = String(error).slice(0, 500);
}
record.rendererPeakMB = rendererPeakMB();
record.errors = errors.slice(0, 5);
record.loadAfter = os.loadavg()[0].toFixed(1);
console.log(JSON.stringify(record));
await browser.close();
