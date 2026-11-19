// Drives the probe page in Chromium and prints one JSON line per measurement. Run only through the browser lane:
//   node scripts/browser-lane.mjs --label surface -- node <this file> <page folder> <corpus folder> <origins> <steps>
// origins: file,http (comma list). steps: any of features,input,opfs,picker,blank,save (comma list).
// The native folder picker cannot be pressed by an automated browser. What stands in for it: Playwright setting the
// files of an <input webkitdirectory> (the File path), and the origin private file system, whose handle is the same
// FileSystemDirectoryHandle the picker returns (the handle path, reading and writing). Neither proves the picker's own
// prompt; the picker is only called, with and without a gesture, to record what the browser answers.
import { chromium } from "@playwright/test";
import http from "node:http";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const [pageDir, corpusDir, originList = "file,http", stepList = "features,input,opfs,picker,blank,save"] = process.argv.slice(2);
const steps = new Set(stepList.split(","));
const PORT = 18437;
const server = http.createServer((req, res) => {
  const file = path.join(pageDir, decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (!file.startsWith(pageDir) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404).end(); return; }
  res.writeHead(200, { "content-type": file.endsWith(".html") ? "text/html; charset=utf-8" : "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
}).listen(PORT, "127.0.0.1");

function descendants(pid) {
  const all = fs.readdirSync("/proc").filter((d) => /^\d+$/.test(d));
  const children = new Map();
  for (const d of all) {
    try { const ppid = +fs.readFileSync(`/proc/${d}/stat`, "utf8").split(") ")[1].split(" ")[1]; (children.get(ppid) ?? children.set(ppid, []).get(ppid)).push(+d); } catch { /* gone */ }
  }
  const out = []; const stack = [pid];
  while (stack.length) { const p = stack.pop(); for (const c of children.get(p) ?? []) { out.push(c); stack.push(c); } }
  return out;
}
function rendererPeaksMB(browserPid) {
  const peaks = [];
  for (const pid of descendants(browserPid)) {
    try {
      if (!fs.readFileSync(`/proc/${pid}/cmdline`, "utf8").includes("--type=renderer")) continue;
      const status = fs.readFileSync(`/proc/${pid}/status`, "utf8");
      peaks.push({ pid, hwmMB: Math.round(+/VmHWM:\s+(\d+)/.exec(status)[1] / 1024), rssMB: Math.round(+/VmRSS:\s+(\d+)/.exec(status)[1] / 1024) });
    } catch { /* gone */ }
  }
  return peaks.sort((a, b) => b.hwmMB - a.hwmMB);
}
const emit = (record) => console.log(JSON.stringify({ ...record, load: os.loadavg().map((x) => x.toFixed(1)).join(" ") }));
const withTimeout = (promise, ms, label) => Promise.race([promise, new Promise((resolve) => setTimeout(() => resolve(`no answer within ${ms} ms (${label})`), ms))]);

for (const origin of originList.split(",")) {
  const url = origin === "file" ? `file://${path.join(pageDir, "page.html")}` : `http://127.0.0.1:${PORT}/page.html`;
  for (const step of [...steps]) {
    if (step === "features" && origin !== originList.split(",")[0] && false) continue;
    const browser = await chromium.launch({ args: ["--enable-precise-memory-info"] });
    const browserPid = process.pid; // the browser is this driver's child; its renderers are among our descendants
    const context = await browser.newContext({ acceptDownloads: true });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(String(error).slice(0, 300)));
    page.on("console", (message) => { if (message.type() === "error") errors.push(message.text().slice(0, 300)); });
    const t0 = Date.now();
    await page.goto(url);
    const wasm = await page.evaluate(() => window.__probe?.wasmReady).catch((error) => String(error));
    const loadMs = Date.now() - t0;
    let record = { origin, step, url: origin, loadMs, wasm };
    try {
      if (step === "features") {
        record.features = await page.evaluate(() => window.__probe.features());
        record.opfs = await page.evaluate(() => navigator.storage.getDirectory().then(() => "available", (e) => `${e.name}: ${e.message}`));
      } else if (step === "input") {
        await page.evaluate(() => { const input = document.createElement("input"); input.type = "file"; input.id = "probe-files"; input.webkitdirectory = true; document.body.append(input); });
        const s0 = Date.now();
        await page.setInputFiles("#probe-files", corpusDir);
        record.setInputFilesMs = Date.now() - s0;
        record.load = await page.evaluate(() => window.__probe.loadFromFiles(document.getElementById("probe-files").files));
        record.generate = await page.evaluate(() => window.__probe.generate());
        record.sample = await page.evaluate(() => { const docs = window.__probe.listFiles().filter((p) => p.includes("/.live-documentation/source/")); return { first: docs[0], index: window.__probe.listFiles().find((p) => p.endsWith("index.json")) }; });
        // Keep the page's index and docs, to compare with the same run under Node.
        const dump = await page.evaluate(() => Object.fromEntries(window.__probe.listFiles().filter((p) => p.includes("/.live-documentation/")).map((p) => [p, window.__probe.docText(p)])));
        if (process.env.PROBE_DUMP) fs.writeFileSync(process.env.PROBE_DUMP, JSON.stringify(dump));
      } else if (step === "opfs") {
        await page.evaluate(() => { const input = document.createElement("input"); input.type = "file"; input.id = "probe-files"; input.webkitdirectory = true; document.body.append(input); });
        await page.setInputFiles("#probe-files", corpusDir);
        // Copy the corpus into the origin private file system, then read it back through a directory handle as a picked folder would be read.
        record.copy = await page.evaluate(async () => {
          const root = await navigator.storage.getDirectory();
          await root.removeEntry("ws", { recursive: true }).catch(() => {});
          const ws = await root.getDirectoryHandle("ws", { create: true });
          const t = performance.now(); let n = 0;
          for (const file of document.getElementById("probe-files").files) {
            const parts = file.webkitRelativePath.split("/").slice(1);
            let dir = ws;
            for (const part of parts.slice(0, -1)) dir = await dir.getDirectoryHandle(part, { create: true });
            const w = await (await dir.getFileHandle(parts.at(-1), { create: true })).createWritable();
            await w.write(file); await w.close(); n += 1;
          }
          return { files: n, ms: performance.now() - t };
        });
        record.load = await page.evaluate(async () => window.__probe.loadFromHandle(await (await navigator.storage.getDirectory()).getDirectoryHandle("ws")));
        record.generate = await page.evaluate(() => window.__probe.generate());
        record.writeBack = await page.evaluate(async () => window.__probe.writeBack(await (await navigator.storage.getDirectory()).getDirectoryHandle("ws")));
        record.permissionQuery = await page.evaluate(async () => (await (await navigator.storage.getDirectory()).getDirectoryHandle("ws")).queryPermission({ mode: "readwrite" }));
        await page.evaluate(async () => (await navigator.storage.getDirectory()).removeEntry("ws", { recursive: true }));
      } else if (step === "picker") {
        record.withoutGesture = await withTimeout(page.evaluate(() => window.showDirectoryPicker().then(() => "opened", (e) => `${e.name}: ${e.message}`)), 5000, "no gesture");
        const chooser = page.waitForEvent("filechooser", { timeout: 5000 }).then(() => "a filechooser event fired", () => "no filechooser event");
        await page.click("#pick");
        record.withGesture = await chooser;
        await page.waitForTimeout(1500);
        record.logAfterClick = (await page.textContent("#log")).split("\n").filter((l) => !l.startsWith("grammars")).join(" | ").slice(0, 300);
        record.saveWithoutGesture = await withTimeout(page.evaluate(() => window.showSaveFilePicker().then(() => "opened", (e) => `${e.name}: ${e.message}`)), 5000, "no gesture");
      } else if (step === "blank") {
        const download = page.waitForEvent("download", { timeout: 15000 });
        await page.click("#blank");
        const saved = await download;
        const target = path.join(os.tmpdir(), `blank-${origin}.html`);
        await saved.saveAs(target);
        record.blank = { suggested: saved.suggestedFilename(), bytes: fs.statSync(target).size };
        // Open the saved copy as a file and see whether it starts again.
        const copy = await context.newPage();
        const copyErrors = [];
        copy.on("pageerror", (error) => copyErrors.push(String(error).slice(0, 200)));
        copy.on("console", (message) => { if (message.type() === "error") copyErrors.push(message.text().slice(0, 200)); });
        await copy.goto(`file://${target}`);
        record.copyStarts = await copy.evaluate(() => window.__probe?.wasmReady).catch((error) => String(error));
        record.copyErrors = copyErrors;
        fs.rmSync(target, { force: true });
      }
    } catch (error) {
      record.failed = String(error).slice(0, 400);
    }
    const cdp = await context.newCDPSession(page);
    await cdp.send("Performance.enable");
    const metrics = Object.fromEntries((await cdp.send("Performance.getMetrics")).metrics.map((m) => [m.name, m.value]));
    record.jsHeapUsedMB = Math.round(metrics.JSHeapUsedSize / 1048576);
    record.jsHeapTotalMB = Math.round(metrics.JSHeapTotalSize / 1048576);
    record.renderers = browserPid ? rendererPeaksMB(browserPid).slice(0, 2) : "no pid";
    record.errors = errors.slice(0, 5);
    emit(record);
    await browser.close();
  }
}
server.close();
