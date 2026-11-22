import { test } from "@playwright/test";

import { displayNames, loadGraph, LOCAL_MAP, localRetainUrl, readPicture } from "./still-picture";

// A probe, not a case: what the lanes case of local-map-branches.spec.ts reads, with its times and its highest wire said.
test("probe: threads skipped references through lanes", async ({ page }) => {
  test.setTimeout(300_000);
  await page.setViewportSize({ width: 1600, height: 1000 });
  const files = [
    "packages/engine/src/live-docs/graph.ts",
    "packages/engine/src/live-docs/document.ts",
    "packages/engine/src/live-docs/graphFiles.ts",
    "packages/explorer/src/shared/staticExplorerData.ts",
    "packages/explorer/src/shared/staticBuilder.ts"
  ];
  const started = Date.now();
  await page.goto(localRetainUrl("/", files));
  await page.waitForSelector("#map-container .branch-mode");
  await page.waitForSelector("#map-connections .connection-path:not(.bundle-run)", { state: "attached" });
  await page.waitForTimeout(900);
  const drawn = Date.now();
  const graph = await loadGraph(page, "/");
  const loaded = Date.now();
  const picture = await readPicture(page, LOCAL_MAP, displayNames(graph, graph.nodes.map(node => node.id)));
  const read = Date.now();
  const top = await page.evaluate(() => Math.min(...[...document.querySelectorAll<HTMLElement>("#map-container .node-card, #map-container .local-pass-through")].map(el => el.getBoundingClientRect().top)));
  let highest = Infinity, which = -1;
  picture.wires.forEach((wire, index) => wire.points.forEach((point, i) => { if (i % 2 === 1 && point < highest) { highest = point; which = index; } }));
  const samples = picture.wires.reduce((sum, wire) => sum + wire.points.length / 2, 0);
  const page_ = await page.evaluate(() => {
    const paths = [...document.querySelectorAll<SVGGeometryElement>("#map-connections .connection-path")];
    const tops = paths.map(path => ({ top: path.getBoundingClientRect().top, classes: path.getAttribute("class"), key: path.dataset.connectionKey, d: (path.getAttribute("d") ?? path.getAttribute("points") ?? "").slice(0, 90), display: getComputedStyle(path).display, opacity: getComputedStyle(path).opacity }));
    tops.sort((a, b) => a.top - b.top);
    return { paths: paths.length, cards: document.querySelectorAll("#map-container .node-card").length, rows: document.querySelectorAll("#map-container .symbol-row").length, highestThree: tops.slice(0, 3),
      layer: document.getElementById("map-viewport")!.getAttributeNames().join(" "), symbols: 0 };
  });
  const graphFile = graph.nodes.find(node => node.id === files[0]) as unknown as { symbols?: unknown[] } | undefined;
  console.log("LANES-PROBE " + JSON.stringify({ msToDrawn: drawn - started, msGraph: loaded - drawn, msReadPicture: read - loaded, wires: picture.wires.length, samples, top, highest, aboveTopBy: Math.round(top - highest),
    highestWire: which >= 0 ? { ...picture.wires[which], points: picture.wires[which].points.length } : null, graphTsSymbols: graphFile?.symbols?.length ?? null, ...page_ }));
});
