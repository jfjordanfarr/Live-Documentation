// Probe of 2026-11-22 (not product code): design 2 in a tab. A page opened from disk, its facts inside it, starts a
// worker from a blob holding the module, hands it the bytes (transferred), and measures: whether the page's policy
// lets a worker start at all; the whole read in the worker; the scan cloned back; and one file asked by message.
//
//   node <this folder>/tab-worker.mjs page <dist/storedForm.js> <file.bin> <out.html> <policy: today|worker>
//   node scripts/browser-lane.mjs --label stored-form -- node <this folder>/tab-worker.mjs run <out.html>
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const [mode, a, b, c, policy] = process.argv.slice(2);

if (mode === "page") {
  const moduleText = readFileSync(a, "utf8").replace(/\/\/# sourceMappingURL=.*$/mu, "");
  const workerBody = `${moduleText}
let scan;
self.onmessage = async (e) => {
  if (e.data.bytes) {
    const t = performance.now();
    const read = await readScan(e.data.bytes);
    if (!read.ok) { self.postMessage({ refused: read.reason }); return; }
    scan = read.value;
    const readMs = performance.now() - t;
    if (e.data.clone) self.postMessage({ readMs, scan }); else self.postMessage({ readMs, files: scan.files.length });
  } else {
    self.postMessage({ file: scan.files[e.data.ask] });
  }
};`;
  const measure = `
const decode = (s) => { const raw = atob(s); const out = new Uint8Array(raw.length); for (let i = 0; i < raw.length; i += 1) out[i] = raw.charCodeAt(i); return out; };
const once = (w) => new Promise((resolve, reject) => { w.onmessage = (e) => resolve(e.data); w.onerror = (e) => reject(new Error(e.message || "the worker failed")); });
(async () => {
  let worker;
  try {
    worker = new Worker(URL.createObjectURL(new Blob([document.getElementById("worker").textContent], { type: "text/javascript" })), { type: "module" });
  } catch (e) { window.result = { workerStarts: false, error: String(e) }; return; }
  const run = async (clone) => {
    const bytes = decode(document.getElementById("facts").textContent.trim());
    const t = performance.now();
    worker.postMessage({ bytes, clone }, [bytes.buffer]);
    const answer = await once(worker);
    return { ...answer, totalMs: performance.now() - t, scan: undefined, files: answer.scan ? answer.scan.files.length : answer.files };
  };
  try {
    const kept = await run(false);
    const t = performance.now();
    worker.postMessage({ ask: 0 });
    const asked = await once(worker);
    const askMs = performance.now() - t;
    const cloned = await run(true);
    window.result = { workerStarts: true, kept: { readMs: kept.readMs, totalMs: kept.totalMs, files: kept.files }, askMs, askedSymbols: asked.file.symbols.length, cloned: { readMs: cloned.readMs, totalMs: cloned.totalMs, cloneMs: cloned.totalMs - cloned.readMs, files: cloned.files } };
  } catch (e) { window.result = { workerStarts: true, error: String(e) }; }
})();
`;
  const hash = createHash("sha256").update(measure).digest("base64");
  const workerSrc = policy === "worker" ? "; worker-src blob:" : "";
  const html = `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'sha256-${hash}'${workerSrc}"><title>stored form worker</title></head><body><script type="application/octet-stream" id="facts">${readFileSync(b).toString("base64")}</script><script type="text/plain" id="worker">${workerBody.replace(/<\/script/giu, "<\\/script")}</script><script>${measure}</script></body></html>`;
  writeFileSync(c, html);
  console.log(JSON.stringify({ page: c, policy, bytes: Buffer.byteLength(html) }));
} else if (mode === "run") {
  const { chromium } = await import("@playwright/test");
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    const messages = [];
    page.on("console", (m) => messages.push(m.text().slice(0, 200)));
    await page.goto(pathToFileURL(a).href);
    await page.waitForFunction(() => window.result !== undefined, null, { timeout: 120_000 });
    console.log(JSON.stringify({ page: a.split("/").pop(), ...(await page.evaluate(() => window.result)), console: messages.slice(0, 3) }));
  } finally {
    await browser.close();
  }
}
