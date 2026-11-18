// Which wires of the repository chain's retained picture (still-picture.spec.ts "Local Map, retained") have lane samples in a
// foreign directory, and which directory's membrane holds them; the test's own reader, against the gate's build on port 8900.
import { test } from "@playwright/test";
import { LOCAL_MAP, displayNames, loadGraph, localRetainUrl, readPicture } from "../still-picture";
import { CHAIN_REPOSITORY } from "../scopes";


test("foreign lanes", async ({ page }) => {
  const base = "/";
  const graph = await loadGraph(page, base);
  const names = displayNames(graph, graph.nodes.map(node => node.id));
  await page.goto(localRetainUrl(base, CHAIN_REPOSITORY));
  await page.waitForSelector("#map-container .branch-mode", { timeout: 20_000 });
  await page.waitForSelector("#map-connections .connection-path:not(.bundle-run)", { state: "attached", timeout: 10_000 });
  await page.waitForTimeout(900);
  const picture = await readPicture(page, LOCAL_MAP, names);
  const foreign = picture.wires.filter(wire => wire.foreignLaneSamples > 0);
  console.log(`wires ${picture.wires.length}, with foreign samples ${foreign.length}, foreign lane samples ${picture.wires.reduce((n, w) => n + w.foreignLaneSamples, 0)}`);
  for (const wire of foreign) {
    // Which membranes hold the wire's foreign points.
    const holders = await page.evaluate(({ points, consumer, provider }) => {
      const folderOf = (file: string) => file.includes("/") ? file.slice(0, file.lastIndexOf("/")) : "";
      const under = (directory: string, file: string) => directory === "" || folderOf(file) === directory || folderOf(file).startsWith(`${directory}/`);
      const shapes = [...document.querySelectorAll<SVGGeometryElement>("#map-container .local-membrane-shape[data-directory]")];
      const lanes = [...document.querySelectorAll<HTMLElement>("#map-container .local-pass-through")].map(el => ({ rect: el.getBoundingClientRect(), text: el.textContent?.trim() ?? "", id: el.dataset.id ?? el.className }));
      const out: Record<string, { samples: number; inLane: number; lanes: Set<string>; at: number[][] }> = {};
      for (let i = 0; i < points.length; i += 2) {
        const x = points[i], y = points[i + 1];
        for (const el of shapes) {
          const directory = el.dataset.directory ?? "";
          if (under(directory, consumer) || under(directory, provider)) continue;
          const inverse = el.getScreenCTM()?.inverse();
          if (!inverse || !el.isPointInFill(new DOMPoint(x, y).matrixTransform(inverse))) continue;
          const entry = out[directory] ??= { samples: 0, inLane: 0, lanes: new Set(), at: [] };
          entry.samples += 1;
          const lane = lanes.find(l => x >= l.rect.left && x <= l.rect.right && y >= l.rect.top && y <= l.rect.bottom);
          if (lane) { entry.inLane += 1; entry.lanes.add(`${lane.text || lane.id} @ ${Math.round(lane.rect.left)},${Math.round(lane.rect.top)} ${Math.round(lane.rect.width)}x${Math.round(lane.rect.height)}`); entry.at.push([Math.round(x), Math.round(y)]); }
        }
      }
      return Object.fromEntries(Object.entries(out).map(([k, v]) => [k, { samples: v.samples, inLane: v.inLane, lanes: [...v.lanes], at: v.at }]));
    }, { points: wire.points, consumer: wire.consumer, provider: wire.provider });
    console.log(`\n${wire.consumer} -> ${wire.provider} (${wire.key}) foreign ${wire.foreignSamples} of ${wire.samples + 0}, lane ${wire.laneSamples}, foreign lane ${wire.foreignLaneSamples}${wire.stub ? " [stub]" : ""}`);
    console.log(JSON.stringify(holders, null, 1));
  }
  const lanes = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>("#map-container .local-pass-through")].map(el => { const r = el.getBoundingClientRect(); return { text: el.textContent?.trim().slice(0, 60), attrs: Object.fromEntries([...el.attributes].map(a => [a.name, a.value.slice(0, 80)])), box: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)] }; }));
  console.log("\nlanes:", JSON.stringify(lanes, null, 1));
  await page.screenshot({ path: process.env.SHOT ?? "/tmp/claude-1000/-workspaces-Live-Documentation/63ede1ac-43c3-4bdf-bcae-301ec14bfb85/scratchpad/diagnose/foreign-lanes.png", fullPage: false });
});
