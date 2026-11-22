// What one sample point of a wire costs the browser, and whether a copy of the wire outside the document gives the
// same point. On the lanes case's picture: every wire is walked every 8 px, as the instrument walks it, once on the
// element in the page and once on a copy of it that stands in no document; the two walks are timed and their points
// compared to the last digit. A third walk asks the page's element after each point is taken from the copy, to see
// what the asking itself costs when nothing is computed.
//   node scripts/browser-lane.mjs --label <who> -- node point-cost.mjs <repository> <out>
import { createRequire } from "node:module";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";

const [repo, out] = process.argv.slice(2);
const require = createRequire(path.join(repo, "package.json"));
const { chromium } = require("@playwright/test");
const { compressToEncodedURIComponent } = require("lz-string");
fs.mkdirSync(out, { recursive: true });
const root = path.join(repo, "dist/explorer");
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (p.endsWith("/")) p += "index.html";
  const file = path.join(root, p);
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { "content-type": { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json" }[path.extname(file)] || "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
});
await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
const files = ["packages/engine/src/live-docs/graph.ts", "packages/engine/src/live-docs/document.ts", "packages/engine/src/live-docs/graphFiles.ts",
  "packages/explorer/src/shared/staticExplorerData.ts", "packages/explorer/src/shared/staticBuilder.ts"];
const url = `http://127.0.0.1:${server.address().port}/?s=${compressToEncodedURIComponent(JSON.stringify({ v: 1, w: "map", n: files[0], p: files.map(n => ({ n, s: "*" })) }))}`;
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 });
await context.addInitScript(({ key, value }) => localStorage.setItem(key, value),
  { key: "live-docs-explorer:ui:v2", value: JSON.stringify({ version: 2, tuning: { localMap: { searchStarts: 0 } } }) });
const page = await context.newPage();
await page.goto(url);
await page.waitForSelector("#map-container .branch-mode", { timeout: 120_000 });
await page.waitForSelector("#map-connections .connection-path:not(.bundle-run)", { state: "attached", timeout: 120_000 });
await page.waitForFunction(() => { const map = document.querySelector("#map-container"); const placed = map?.querySelector(".local-placed"); return placed && map.dataset.camera !== "moving" && placed.dataset.moving !== "true"; }, undefined, { timeout: 120_000 });
await page.waitForTimeout(1500);
const result = await page.evaluate(() => {
  // Every sixth wire, so that the three walks fit one hold of the lane.
  const wires = [...document.querySelectorAll("#map-connections .connection-path")].filter(el => typeof el.getTotalLength === "function" && getComputedStyle(el).display !== "none").filter((_, i) => i % 6 === 0);
  const walk = (el, each) => { const length = el.getTotalLength(); const points = []; for (let at = 0; at <= length; at += 8) { const p = el.getPointAtLength(at); points.push(p.x, p.y); each?.(); } const end = el.getPointAtLength(length); points.push(end.x, end.y); return points; };
  let start = performance.now();
  const inPage = wires.map(el => walk(el));
  const inPageMs = performance.now() - start;
  // A copy must be rendered to be measured (a copy in no document is refused), so the copies stand in a frame of their
  // own: a document of a few hundred elements beside the page's twelve thousand.
  const frame = document.createElement("iframe");
  frame.style.cssText = "position:fixed;left:-10px;top:-10px;width:1px;height:1px;border:0;visibility:hidden";
  document.body.append(frame);
  const svg = frame.contentDocument.createElementNS("http://www.w3.org/2000/svg", "svg");
  frame.contentDocument.body.append(svg);
  const copies = wires.map(el => { const copy = frame.contentDocument.importNode(el, false); copy.removeAttribute("class"); copy.removeAttribute("style"); svg.append(copy); return copy; });
  start = performance.now();
  const outside = copies.map(el => walk(el));
  const outsideMs = performance.now() - start;
  // The same walk on the copies, with the page asked for something at every point that needs its layout to be current.
  start = performance.now();
  copies.map((el, i) => walk(el, () => wires[i].getScreenCTM()));
  const outsideAskingMs = performance.now() - start;
  let differing = 0, samples = 0, lengthsDiffering = 0;
  inPage.forEach((points, i) => { samples += points.length / 2; if (wires[i].getTotalLength() !== copies[i].getTotalLength()) lengthsDiffering += 1; points.forEach((value, j) => { if (!Object.is(value, outside[i][j])) differing += 1; }); });
  const tags = {};
  for (const el of wires) tags[el.tagName.toLowerCase()] = (tags[el.tagName.toLowerCase()] ?? 0) + 1;
  frame.remove();

  // A fourth walk: each point asked of a short path that stands for the wire up to the segment the point lies in. The
  // browser walks a path from its start at every call, so a point far along a long wire pays for everything before it;
  // here everything before the segment is one straight line of the same length (as the browser itself measures it),
  // in a sub-path of its own, and the segment follows from its own start. Whether the browser then gives the same
  // point to the last digit is what is measured.
  const NUMBER = /[-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/gi;
  const segmentsOf = d => {
    const commands = [...d.matchAll(/([A-Za-z])([^A-Za-z]*)/g)];
    if (commands.length < 2 || commands[0][1] !== "M") return null;
    const startNumbers = commands[0][2].match(NUMBER) ?? [];
    if (startNumbers.length !== 2) return null;
    const segments = [];
    let at = startNumbers;
    for (const [, letter, args] of commands.slice(1)) {
      const size = { L: 2, C: 6, Q: 4 }[letter];
      const numbers = args.match(NUMBER) ?? [];
      if (!size || numbers.length === 0 || numbers.length % size !== 0) return null;
      for (let i = 0; i < numbers.length; i += size) {
        const part = numbers.slice(i, i + size);
        segments.push({ from: at, text: `${letter}${part.join(" ")}` });
        at = part.slice(-2);
      }
    }
    return segments;
  };
  const NS = "http://www.w3.org/2000/svg";
  let short = 0, shortFallbacks = 0, shortDiffering = 0, shortSamples = 0, shortSegments = 0;
  const made = [];
  start = performance.now();
  const plans = wires.map(el => {
    const segments = el.tagName.toLowerCase() === "path" ? segmentsOf(el.getAttribute("d") ?? "") : null;
    if (!segments) { shortFallbacks += 1; return null; }
    shortSegments += segments.length;
    const probe = document.createElementNS(NS, "path");
    probe.setAttribute("visibility", "hidden");
    el.parentNode.append(probe);
    made.push(probe);
    // The length of everything before each segment, as the browser measures that much of the wire.
    const before = [0];
    for (let k = 1; k < segments.length; k++) {
      probe.setAttribute("d", `M${segments[0].from.join(" ")}${segments.slice(0, k).map(segment => segment.text).join("")}`);
      before.push(probe.getTotalLength());
    }
    const paths = segments.map((segment, k) => {
      const path = document.createElementNS(NS, "path");
      path.setAttribute("visibility", "hidden");
      path.setAttribute("d", k === 0 ? `M${segment.from.join(" ")}${segment.text}` : `M0 0L${before[k]} 0M${segment.from.join(" ")}${segment.text}`);
      el.parentNode.append(path);
      made.push(path);
      return path;
    });
    return { before, paths };
  });
  const prepareMs = performance.now() - start;
  start = performance.now();
  const shortWalk = wires.map((el, i) => {
    const plan = plans[i];
    if (!plan) return inPage[i];
    const length = el.getTotalLength();
    const points = [];
    let k = 0;
    const point = at => { while (k + 1 < plan.before.length && plan.before[k + 1] < at) k += 1; return plan.paths[k].getPointAtLength(at); };
    for (let at = 0; at <= length; at += 8) { const p = point(at); points.push(p.x, p.y); }
    const end = point(length);
    points.push(end.x, end.y);
    return points;
  });
  short = performance.now() - start;
  let worst = 0;
  inPage.forEach((points, i) => { if (!plans[i]) return; shortSamples += points.length / 2; points.forEach((value, j) => { if (!Object.is(value, shortWalk[i][j])) { shortDiffering += 1; worst = Math.max(worst, Math.abs(value - shortWalk[i][j])); } }); });
  for (const element of made) element.remove();
  Object.assign(tags, { shortWalkMs: Math.round(short), shortPrepareMs: Math.round(prepareMs), shortFallbacks, shortSegments, shortSamples, shortNumbersDiffering: shortDiffering, shortWorstDifferencePx: worst });
  return { wires: wires.length, tags, samples, inPageMs: Math.round(inPageMs), outsideMs: Math.round(outsideMs), outsideAskingMs: Math.round(outsideAskingMs),
    microsecondsAPointInPage: +(inPageMs * 1000 / samples).toFixed(1), microsecondsAPointOutside: +(outsideMs * 1000 / samples).toFixed(1), numbersDiffering: differing, lengthsDiffering,
    mapElements: document.querySelectorAll("#map-container *").length };
});
result.load = os.loadavg().map(n => +n.toFixed(2));
console.log(JSON.stringify(result, null, 1));
fs.writeFileSync(path.join(out, "point-cost.json"), `${JSON.stringify(result, null, 1)}\n`);
await browser.close();
server.close();
