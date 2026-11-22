// What the still-picture instrument's reading costs, where its time goes, and whether a changed reading gives the same
// numbers. On each picture, in one page and back to back: the reference reading (the instrument as it stood until
// 2026-11-22, `tests/e2e/still-picture-reference.ts`) twice, to see that two readings of one page agree at all, then
// the instrument's reading as it stands (`readPicture`), each timed; the readings are compared as their JSON, so to
// the last digit of every number. With `profile` the reference reading of the first picture is taken under the
// browser's own sampling profiler, and the samples summed by the function they fell in.
//   node scripts/browser-lane.mjs --label <who> -- npx tsx --tsconfig ./tsconfig.base.json <this file> <repository> <out> [profile] [only=<name>]
import { createRequire } from "node:module";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";

const [repo, out, ...flags] = process.argv.slice(2);
const require = createRequire(path.join(repo, "package.json"));
const { chromium } = require("@playwright/test");
const { browserLaunchOptions } = await import(path.join(repo, "tests/e2e/browser-launch.ts"));
const { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } = await import(path.join(repo, "packages/explorer/src/client/persistence/local-storage.ts"));
const { readPicture, LOCAL_MAP, loadGraph, displayNames, localRetainUrl, localMapSettled } = await import(path.join(repo, "tests/e2e/still-picture.ts"));
const { readPictureReference } = await import(path.join(repo, "tests/e2e/still-picture-reference.ts"));
fs.mkdirSync(out, { recursive: true });

const root = path.join(repo, "dist/explorer");
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url ?? "/", "http://x").pathname);
  if (p.endsWith("/")) p += "index.html";
  const file = path.join(root, p);
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { "content-type": ({ ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json" } as Record<string, string>)[path.extname(file)] ?? "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
});
await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
const origin = `http://127.0.0.1:${(server.address() as { port: number }).port}`;

// The lanes case's picture (`tests/e2e/local-map-branches.spec.ts`), and two others of other shapes: a retained
// picture of the estate sample, and one file of this repository with its neighbours, as a link opens it.
const pictures = [
  { name: "lanes", base: "/", viewport: { width: 1600, height: 1000 }, url: localRetainUrl("/", [
    "packages/engine/src/live-docs/graph.ts", "packages/engine/src/live-docs/document.ts", "packages/engine/src/live-docs/graphFiles.ts",
    "packages/explorer/src/shared/staticExplorerData.ts", "packages/explorer/src/shared/staticBuilder.ts"]) },
  { name: "estate-retained", base: "/samples/estate/", viewport: { width: 1280, height: 800 }, url: localRetainUrl("/samples/estate/", [
    "PaymentService/PaymentService.cs", "Portal/Services/GatewayClient.cs", "Hub/App.config"]) },
  { name: "pathfind-link", base: "/", viewport: { width: 1280, height: 800 }, url: `/?view=local&mode=2d&node=${encodeURIComponent("packages/engine/src/live-docs/pathfind.ts")}` }
].filter(picture => !flags.some(flag => flag.startsWith("only=")) || flags.includes(`only=${picture.name}`));

const browser = await chromium.launch(browserLaunchOptions());
const results: unknown[] = [];
for (const picture of pictures) {
  const context = await browser.newContext({ viewport: picture.viewport, deviceScaleFactor: 1 });
  await context.addInitScript(({ key, value }: { key: string; value: string }) => localStorage.setItem(key, value),
    { key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { searchStarts: 0 } } }) });
  const page = await context.newPage();
  await page.goto(`${origin}${picture.url}`);
  await page.waitForSelector("#map-container .local-placed", { timeout: 120_000 });
  await page.waitForSelector("#map-connections .connection-path:not(.bundle-run)", { state: "attached", timeout: 120_000 });
  await localMapSettled(page, 120_000);
  await page.waitForTimeout(900);
  // Run by tsx, a function sent to the page carries calls to a helper only the node side has (as scripts/layout-lab/scopes.ts notes).
  await page.evaluate("window.__name = window.__name || ((target) => target)");
  const graph = await loadGraph(page, `${origin}${picture.base}`);
  const names = displayNames(graph, graph.nodes.map((node: { id: string }) => node.id));
  const timed = async <T,>(read: () => Promise<T>): Promise<{ ms: number; reading: T }> => {
    const start = performance.now();
    const reading = await read();
    return { ms: Math.round(performance.now() - start), reading };
  };
  let profile: Array<{ fn: string; ms: number }> | null = null;
  const cdp = await context.newCDPSession(page);
  const profiled = flags.includes("profile") && picture === pictures[0];
  if (profiled) { await cdp.send("Profiler.enable"); await cdp.send("Profiler.setSamplingInterval", { interval: 500 }); await cdp.send("Profiler.start"); }
  const first = await timed(() => readPictureReference(page, LOCAL_MAP, names));
  if (profiled) {
    const { profile: taken } = await cdp.send("Profiler.stop");
    const selfUs = new Map<number, number>();
    taken.samples?.forEach((id: number, i: number) => selfUs.set(id, (selfUs.get(id) ?? 0) + (taken.timeDeltas?.[i] ?? 0)));
    const byFunction = new Map<string, number>();
    for (const node of taken.nodes) {
      const name = `${node.callFrame.functionName || "(anonymous)"}${node.callFrame.url ? "" : " [browser]"}`;
      byFunction.set(name, (byFunction.get(name) ?? 0) + (selfUs.get(node.id) ?? 0));
    }
    profile = [...byFunction].map(([fn, us]) => ({ fn, ms: Math.round(us / 1000) })).filter(entry => entry.ms > 0).sort((a, b) => b.ms - a.ms).slice(0, 25);
  }
  // `once` takes each reading once, where a loaded machine would not fit four readings of a large picture in one hold.
  const once = flags.includes("once");
  const second = once ? first : await timed(() => readPictureReference(page, LOCAL_MAP, names));
  const now = await timed(() => readPicture(page, LOCAL_MAP, names));
  const nowAgain = once ? now : await timed(() => readPicture(page, LOCAL_MAP, names));
  const quickReference = await timed(() => readPictureReference(page, LOCAL_MAP, names, false));
  const quickNow = await timed(() => readPicture(page, LOCAL_MAP, names, false));
  const text = (reading: unknown): string => JSON.stringify(reading);
  /** Where two readings first differ, as a path into them; null when they are the same to the number. */
  const firstDifference = (a: unknown, b: unknown, at = ""): string | null => {
    if (Object.is(a, b)) return null;
    if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return `${at}: ${JSON.stringify(a)} against ${JSON.stringify(b)}`;
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const key of keys) {
      const found = firstDifference((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key], `${at}/${key}`);
      if (found) return found;
    }
    return null;
  };
  const wires = first.reading.wires;
  const result = {
    picture: picture.name, viewport: picture.viewport, load: os.loadavg().map(n => +n.toFixed(2)),
    wires: wires.length, cards: first.reading.cards.length, samples: wires.reduce((sum: number, wire: { points: number[] }) => sum + wire.points.length / 2, 0),
    referenceMs: [first.ms, second.ms], nowMs: [now.ms, nowAgain.ms], withoutSamplingMs: { reference: quickReference.ms, now: quickNow.ms },
    referenceAgreesWithItself: text(first.reading) === text(second.reading),
    sameToTheNumber: text(second.reading) === text(now.reading) && text(now.reading) === text(nowAgain.reading),
    sameWithoutSampling: text(quickReference.reading) === text(quickNow.reading),
    firstDifference: firstDifference(second.reading, now.reading),
    profile
  };
  results.push(result);
  console.log(JSON.stringify(result, null, 1));
  await context.close();
}
fs.writeFileSync(path.join(out, `reading--${flags.find(flag => flag.startsWith("label="))?.slice(6) ?? "run"}.json`), `${JSON.stringify(results, null, 1)}\n`);
await browser.close();
server.close();
