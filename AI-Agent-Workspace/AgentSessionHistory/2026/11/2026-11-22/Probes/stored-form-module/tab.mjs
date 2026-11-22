// Probe of 2026-11-22 (not product code): the stored form read in a Chromium tab opened from disk, its facts carried
// in the page as base64 in a block the browser does not run, and the module's built script inline, unchanged.
//
//   node <this folder>/tab.mjs page <dist/storedForm.js> <file.bin> <out.html>     (outside the browser lane)
//   node scripts/browser-lane.mjs --label stored-form -- node <this folder>/tab.mjs run <out.html> <throttle>
//     prints the first answer, the whole read and the graph built only as asked, and the tab's JS heap.
import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const [mode, a, b, c] = process.argv.slice(2);

if (mode === "page") {
  const moduleText = readFileSync(a, "utf8").replace(/\/\/# sourceMappingURL=.*$/mu, "");
  const data = readFileSync(b).toString("base64");
  const measure = `
const decode = (s) => { const raw = atob(s); const out = new Uint8Array(raw.length); for (let i = 0; i < raw.length; i += 1) out[i] = raw.charCodeAt(i); return out; };
(async () => {
  const bytes = decode(document.getElementById("facts").textContent.trim());
  const t0 = performance.now();
  const opened = await openScan(bytes);
  if (!opened.ok) { window.result = { refused: opened.reason }; return; }
  const scan = opened.value;
  let hub = 0;
  for (let i = 0; i < scan.paths.length; i += 1) if (scan.inbound(i).length > scan.inbound(hub).length) hub = i;
  const answer = scan.inbound(hub).map((j) => scan.paths[j]);
  const firstMs = performance.now() - t0;
  const whole = await readScan(bytes);
  if (!whole.ok) { window.result = { refused: whole.reason }; return; }
  const factsMs = performance.now() - t0;
  const view = graphViewOf(whole.value);
  const hubFile = view.file(scan.paths[hub]);
  const viewMs = performance.now() - t0;
  const graph = graphOf(whole.value);
  const graphMs = performance.now() - t0;
  window.result = { files: whole.value.files.length, dependents: answer.length, hubInbound: hubFile.inbound.length, graphFiles: Object.keys(graph.files).length, firstMs, factsMs, viewMs, graphMs };
})().catch((e) => { window.result = { error: String(e) }; });
`;
  // The policy admits the one inline script by its hash, and nothing from the network.
  const script = `${moduleText}\n${measure}`;
  const hash = (await import("node:crypto")).createHash("sha256").update(script).digest("base64");
  const html = `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'sha256-${hash}'"><title>stored form</title></head><body><script type="application/octet-stream" id="facts">${data}</script><script type="module">${script}</script></body></html>`;
  writeFileSync(c, html);
  console.log(JSON.stringify({ page: c, bytes: Buffer.byteLength(html), facts: readFileSync(b).length }));
} else if (mode === "run") {
  const { chromium } = await import("@playwright/test");
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    const session = await page.context().newCDPSession(page);
    const rate = Number(b ?? 1);
    if (rate > 1) await session.send("Emulation.setCPUThrottlingRate", { rate });
    await session.send("Performance.enable");
    const errors = [];
    page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
    page.on("pageerror", (e) => errors.push(String(e)));
    await page.goto(pathToFileURL(a).href);
    await page.waitForFunction(() => window.result !== undefined, null, { timeout: 120_000 });
    const result = await page.evaluate(() => window.result);
    const metrics = (await session.send("Performance.getMetrics")).metrics;
    const heap = metrics.find((m) => m.name === "JSHeapUsedSize")?.value ?? 0;
    console.log(JSON.stringify({ throttle: rate, ...result, jsHeapMb: Math.round(heap / 1048576), errors }));
  } finally {
    await browser.close();
  }
} else {
  throw new Error("usage: tab.mjs page <dist/storedForm.js> <file.bin> <out.html> | run <page.html> <throttle>");
}
