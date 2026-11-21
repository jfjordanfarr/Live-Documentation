// Research of November 21, 2026 (not product code). Drives one measuring page in headless Chromium, opened as a file,
// with the page's processor slowed by the browser's own throttle, a fresh browser for every run. Prints one line of
// JSON per run. Only through the browser lane, from the repository root, with the pages built first:
//
//   node scripts/browser-lane.mjs --label stored-form -- [taskset -c 0,1] node <this file> <rate> <run> [<run> ...]
//
// A run is "read:<page.html>:<shape.json>" or "write:<page.html>:<facts.ndjson>:<stream|gather>" or "platform:<page.html>".
// The method of the scan-in-a-tab probe of the same day: CDP's Emulation.setCPUThrottlingRate, and the renderer's
// peak resident memory (VmHWM) read from /proc for the renderers of this driver's own browser.
import { chromium } from "@playwright/test";
import fs from "node:fs";
import os from "node:os";

const [rateText, ...runs] = process.argv.slice(2);
const rate = Number(rateText);

function rendererPeakMB() {
  let peak = 0;
  for (const pid of fs.readdirSync("/proc").filter((d) => /^\d+$/.test(d))) {
    try {
      if (!fs.readFileSync(`/proc/${pid}/cmdline`, "utf8").includes("--type=renderer")) continue;
      let parent = +fs.readFileSync(`/proc/${pid}/stat`, "utf8").split(") ")[1].split(" ")[1];
      let mine = false;
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

for (const run of runs) {
  const [kind, pagePath, input, mode] = run.split(":");
  const record = { kind, page: pagePath.split("/").pop(), mode, rate, cores: os.availableParallelism(), loadBefore: +os.loadavg()[0].toFixed(1) };
  const browser = await chromium.launch({ args: ["--enable-precise-memory-info"] });
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(String(error).slice(0, 300)));
    page.on("console", (message) => { if (message.type() === "error") errors.push(message.text().slice(0, 300)); });
    const cdp = await context.newCDPSession(page);
    if (rate > 1) await cdp.send("Emulation.setCPUThrottlingRate", { rate });
    const t0 = Date.now();
    await page.goto(`file://${pagePath}`, { timeout: 300000 });
    await page.waitForFunction(() => window.__bench !== undefined, null, { timeout: 300000 });
    record.pageReadyMs = Date.now() - t0;
    record.scriptStartedMs = Math.round(await page.evaluate(() => window.__bench.scriptStartedMs));
    if (kind === "read") {
      const shape = JSON.parse(fs.readFileSync(input, "utf8"));
      Object.assign(record, await page.evaluate((s) => window.__bench.read(s), shape.questions.subjects));
    } else if (kind === "write") {
      await page.evaluate(() => { const i = document.createElement("input"); i.type = "file"; i.id = "facts"; document.body.append(i); });
      await page.setInputFiles("#facts", input);
      Object.assign(record, await page.evaluate((m) => window.__bench.write(m), mode));
      record.rendererPeakMbAtWrite = rendererPeakMB();
      if (rate === 1) record.contentHash = await page.evaluate(() => window.__bench.contentHash());
    } else if (kind === "platform") {
      Object.assign(record, await page.evaluate(() => window.__bench.platform()));
    }
    for (const k of Object.keys(record)) if (typeof record[k] === "number" && !Number.isInteger(record[k])) record[k] = +record[k].toFixed(1);
    record.errors = errors.slice(0, 5);
  } catch (error) {
    record.failed = String(error).slice(0, 400);
  }
  record.rendererPeakMb = rendererPeakMB();
  record.loadAfter = +os.loadavg()[0].toFixed(1);
  console.log(JSON.stringify(record));
  await browser.close();
}
