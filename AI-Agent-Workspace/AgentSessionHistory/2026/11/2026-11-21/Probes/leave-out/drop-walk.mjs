#!/usr/bin/env node
// A folder dropped on a page, without a person: the browser's debugging protocol makes the drop
// (`Input.dispatchDragEvent`, its drag data a list of file paths), the page asks the dropped item for a handle
// (`DataTransferItem.getAsFileSystemHandle()`), and, if it is a folder's, walks it lazily with the engine's
// `leaveOut` deciding each folder before it is entered: a folder left out is never listed, and the evidence rules'
// names are listed one level further where they ask. Timed at full speed and slowed, beside handing the same folder
// to an `<input webkitdirectory>`. Only through the browser lane, the bundle built first:
//   node decide-bench.mjs bundle <bundle.js>
//   node drop-walk.mjs <folder> <bundle.js> [rate]
import { chromium } from "@playwright/test";
import fs from "node:fs";
import os from "node:os";

const [folder, bundleFile, rateText = "1"] = process.argv.slice(2);
const rate = Number(rateText);

/** The page's walk: list a folder, read its ignore files, decide each child folder before entering it. */
const WALK = `async (handle, apply) => {
  const started = performance.now();
  const names = new Map();
  const listedEntries = new Map();
  const ignoreTexts = new Map();
  let listed = 0, listings = 0, evidenceListings = 0, kept = 0, leftOutFolders = 0;
  const list = async (path, dir) => {
    if (listedEntries.has(path)) return listedEntries.get(path);
    listings += 1;
    const entries = [];
    for await (const [name, child] of dir.entries()) entries.push([name, child]);
    names.set(path, entries.map(([name, child]) => (child.kind === "directory" ? name + "/" : name)));
    const own = [];
    for (const [name, child] of entries) {
      if (child.kind === "file" && (name === ".gitignore" || name.toLowerCase() === ".tfignore")) own.push({ path: path ? path + "/" + name : name, text: await (await child.getFile()).text() });
    }
    ignoreTexts.set(path, own);
    listedEntries.set(path, entries);
    return entries;
  };
  const decide = globalThis.leaveOut({ ignoreFiles: (path) => ignoreTexts.get(path) ?? [], gitIgnoreCase: true, ownOutput: [".live-documentation"], evidence: { names: (path) => names.get(path) ?? [], apply } });
  const LOOK = { packages: 1, node_modules: 2 };
  const walk = async (path, dir) => {
    const entries = await list(path, dir);
    listed += entries.length;
    for (const [name, child] of entries) {
      const at = path ? path + "/" + name : name;
      if (child.kind === "directory") {
        const depth = LOOK[name.toLowerCase()];
        if (depth) {
          evidenceListings += 1;
          const inner = await list(at, child);
          if (depth === 2) for (const [innerName, grand] of inner.filter(([, c]) => c.kind === "directory").slice(0, 3)) { evidenceListings += 1; await list(at + "/" + innerName, grand); }
        }
        const verdict = decide.folder(at);
        if (verdict.prunable) leftOutFolders += 1;
        else await walk(at, child);
      } else if (decide.file(at).kept) kept += 1;
    }
  };
  await walk("", handle);
  return { ms: performance.now() - started, listed, listings, evidenceListings, kept, leftOutFolders };
}`;

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(`<!doctype html><body style="width:400px;height:400px"><script>${fs.readFileSync(bundleFile, "utf8")}</script><script>
  document.body.addEventListener("dragover", (event) => event.preventDefault());
  document.body.addEventListener("drop", (event) => {
    event.preventDefault();
    const item = event.dataTransfer.items[0];
    window.dropped = { items: event.dataTransfer.items.length, kind: item && item.kind, getAsFileSystemHandle: typeof (item && item.getAsFileSystemHandle) };
    window.handle = item && item.getAsFileSystemHandle ? item.getAsFileSystemHandle() : Promise.resolve(null);
  });
</script></body>`);
const cdp = await page.context().newCDPSession(page);
const record = { folder, rate, cores: os.availableParallelism(), load: os.loadavg()[0].toFixed(1) };
try {
  const data = { items: [], files: [folder], dragOperationsMask: 1 };
  for (const type of ["dragEnter", "dragOver", "drop"]) await cdp.send("Input.dispatchDragEvent", { type, x: 100, y: 100, data });
  const dropped = Date.now();
  await page.waitForFunction(() => window.dropped !== undefined, undefined, { timeout: 120_000 });
  record.dropEventMs = Date.now() - dropped;
  record.dropped = await page.evaluate(() => window.dropped);
  record.handle = await page.evaluate(async () => {
    const handle = await window.handle;
    return handle ? { kind: handle.kind, name: handle.name } : null;
  });
  if (record.handle?.kind === "directory") {
    if (rate > 1) await cdp.send("Emulation.setCPUThrottlingRate", { rate });
    for (const apply of [true, false]) record[apply ? "evidenceApplied" : "evidenceReported"] = await page.evaluate(`(async () => (${WALK})(await window.handle, ${apply}))()`);
  }
} catch (error) {
  record.failed = String(error).slice(0, 500);
}
console.log(JSON.stringify(record));
await browser.close();
