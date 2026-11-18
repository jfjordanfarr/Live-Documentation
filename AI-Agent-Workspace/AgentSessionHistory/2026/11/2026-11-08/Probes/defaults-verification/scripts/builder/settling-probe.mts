import { chromium, expect } from "@playwright/test";
import { readFile, writeFile } from "node:fs/promises";
import { performance } from "node:perf_hooks";
import { observeGraph, renderedNodes } from "../../tests/e2e/force-graph-observation.ts";
import { loadGraph } from "../../tests/e2e/still-picture.ts";
import { compressSnapshot, DEFAULT_SNAPSHOT } from "../../packages/explorer/src/client/persistence/compressed-url-state.ts";
import { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } from "../../packages/explorer/src/client/persistence/local-storage.ts";
import { spatialGraphOf } from "../../packages/explorer/src/client/views/forceGraphData.ts";
import { linkPulls } from "../../packages/explorer/src/client/views/forceGraphLayout.ts";
import { spatialScope, startHops, startOf } from "../../packages/explorer/src/client/views/forceGraphScope.ts";

const output = "/tmp/live-docs-20261108-defaults-diagnostics";
const browser = await chromium.launch({ headless: true });
const reports: unknown[] = [];
const origin = "http://localhost:8911";
const seedUrl = (extra = {}) => `${origin}/?s=${compressSnapshot({ ...DEFAULT_SNAPSHOT, perspective: "3d", spatialLayout: "connections", layout: { forceGraph: { groupWrappers: "off", hops: 2 } }, filters: { showTests: true, showAssets: false }, ...extra })}`;

async function context(stage: string) {
  const context = await browser.newContext({ baseURL: origin, viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  const bundle = await readFile(`${output}/${stage}.js`, "utf8");
  await page.route("**/static/index.js", route => route.fulfill({ body: bundle, contentType: "application/javascript" }));
  // tsx preserves function names in the serialized observer with this harmless helper.
  await page.addInitScript({ content: "globalThis.__name = value => value;" });
  await page.addInitScript(({ key, version }) => localStorage.setItem(key, JSON.stringify({ version, tuning: { localMap: { searchStarts: 0 } } })), { key: PERSISTED_UI_KEY, version: PERSISTED_UI_VERSION });
  await observeGraph(page);
  return { context, page };
}

async function state(page: any) {
  const observed = await page.evaluate(() => ({ busy: document.querySelector("#graph-svg")?.getAttribute("aria-busy"), diagnostic: (window as any).forceDiagnostic?.(), frames: (window as any).renderedFrames }));
  const nodes = await renderedNodes(page);
  return { ...observed, nodes: nodes.length, ids: nodes.map(node => node.id), opacity: Object.fromEntries(nodes.map(node => [node.id, node.opacity])), places: Object.fromEntries(nodes.map(node => [node.id, node.world])) };
}

async function monitor(page: any, stage: string, subject: string, deadline: number) {
  const start = performance.now();
  const frames: unknown[] = [];
  for (;;) {
    const snapshot = await state(page);
    const elapsed = performance.now() - start;
    frames.push({ elapsed, ...snapshot });
    console.log(JSON.stringify({ stage, subject, elapsed, busy: snapshot.busy, ...snapshot.diagnostic, nodes: snapshot.nodes }));
    if (snapshot.busy === "false" && snapshot.diagnostic?.ready && snapshot.diagnostic?.packing.length === 0 || elapsed >= deadline) break;
    await page.waitForTimeout(Math.min(10_000, deadline - elapsed));
  }
  return { stage, subject, deadline, frames };
}

try {
  // Two renderer builds receive the same gate-3 graph bytes served at the same URL.
  for (const stage of ["candidate", "base"]) {
    const { context: ctx, page } = await context(stage);
    try {
      await page.goto(seedUrl());
      await expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "false", { timeout: 120_000 });
      const graph = await loadGraph(page, "/");
      const data = spatialGraphOf(graph, node => (node.archetype || "").toLowerCase() !== "asset", [], "connections");
      const pulls = (link: any) => linkPulls(link, "connections");
      const asked = startOf(data.nodes, data.links, "connections", pulls);
      const scope = spatialScope(data.nodes, data.links, asked, startHops("connections", 2), pulls);
      const largest = [...scope.groups].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0];
      const seed = (await renderedNodes(page)).find(node => node.id === largest[0])!;
      await page.mouse.move(seed.x, seed.y);
      await page.locator(`.force-graph-label[data-node-id="${seed.id}"]`).click();
      await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => resolve())));
      reports.push(await monitor(page, stage, `seed ${seed.id}; group ${largest[1]}`, 120_000));
    } finally { await ctx.close(); }
  }
  for (const stage of ["candidate", "base"]) {
    const { context: ctx, page } = await context(stage);
    try {
      // Both stages explicitly receive Skin/one hop on their first navigation, even though the base factory differs.
      await page.goto(seedUrl({ selectedNodeId: "packages/generator/src/generator.ts", layout: { forceGraph: { groupWrappers: "skin", hops: 1 } } }));
      await page.waitForFunction(() => Boolean((window as any).forceDiagnostic));
      await page.waitForFunction(() => Boolean((window as any).renderedGraph));
      reports.push(await monitor(page, stage, "generator.ts Skin/1", 60_000));
    } finally { await ctx.close(); }
  }
  {
    const { context: ctx, page } = await context("candidate");
    try {
      const file = "Portal/Services/GatewayClient.cs";
      await page.goto(`${origin}/samples/estate/?s=${compressSnapshot({ ...DEFAULT_SNAPSHOT, perspective: "3d", pinSet: { entries: [{ nodeId: file, symbol: "*" }, { nodeId: "Estate.sln", symbol: "*" }] } })}`);
      await expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "false", { timeout: 25_000 });
      const before = await state(page);
      await page.locator('.force-graph-label[data-node-id="Estate.sln"], .force-graph-focus[data-node-id="Estate.sln"]').click();
      await expect(page.locator(".pin-tray-toggle")).toHaveText("1 pin");
      await page.waitForTimeout(5000);
      const after = await state(page);
      await page.mouse.move(20, 20);
      await page.waitForTimeout(1000);
      const leave = await state(page);
      reports.push({ stage: "candidate", subject: "Estate.sln release/hover", before, after, leave });
      console.log(JSON.stringify({ subject: "orphan", after: after.diagnostic, alpha: after.opacity["Estate.sln"], leave: leave.diagnostic, leaveAlpha: leave.opacity["Estate.sln"] }));
    } finally { await ctx.close(); }
  }
  {
    const { context: ctx, page } = await context("candidate");
    try {
      const data = await (await page.request.get(`${origin}/samples/history/explorer-data.json`)).json();
      const sequence = await (await page.request.get(`${origin}/samples/history/${data.history.file}`)).json();
      await page.goto(`${origin}/samples/history/?s=${compressSnapshot({ ...DEFAULT_SNAPSHOT, perspective: "3d", spatialLayout: "structure", selectedNodeId: "lib/huge.ts", pinSet: { entries: [{ nodeId: "lib/huge.ts", symbol: "*" }] }, commit: sequence.base.commit.id, layout: { forceGraph: { updateEnergy: 1 } } })}`);
      await expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "false", { timeout: 60_000 });
      const snapshot = await state(page);
      reports.push({ stage: "candidate", subject: "absent historical request", ...snapshot });
      console.log(JSON.stringify({ subject: "absent", ...snapshot }));
    } finally { await ctx.close(); }
  }
} finally {
  await writeFile(`${output}/settling-states.json`, JSON.stringify(reports, null, 2) + "\n");
  await browser.close();
}
