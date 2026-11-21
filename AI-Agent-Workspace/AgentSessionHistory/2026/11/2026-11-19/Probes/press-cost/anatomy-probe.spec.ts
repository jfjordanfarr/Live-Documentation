import { test, expect } from "@playwright/test";

import { compressSnapshot, DEFAULT_SNAPSHOT } from "../../../packages/explorer/src/client/persistence/compressed-url-state";

/** What each of setActiveView's changes costs the next read of geometry, on the 2D map of a picture (2026-11-20). */
const pictures = [
  { name: "graph", url: `/?view=local&node=${encodeURIComponent("packages/engine/src/live-docs/graph.ts")}` },
  { name: "pins", url: `/?s=${compressSnapshot({ ...DEFAULT_SNAPSHOT, perspective: "2d",
    pinSet: { entries: [{ nodeId: "packages/engine/src/live-docs/graph.ts", symbol: "*" }, { nodeId: "packages/explorer/src/client/persistence/local-storage.ts", symbol: "*" }] } })}` }
];

for (const picture of pictures) {
  test(`anatomy: ${picture.name}`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto(picture.url);
    await expect(page.locator(".node-card").first()).toBeVisible({ timeout: 60_000 });
    await page.waitForTimeout(3000);
    const result = await page.evaluate(() => {
      const map = document.getElementById("view-map")!, graph = document.getElementById("view-graph")!;
      const read = (): number => { const t = performance.now(); void graph.getBoundingClientRect(); return performance.now() - t; };
      const out: Record<string, number> = {};
      const time = (name: string, change: () => void, undo: () => void): void => {
        read();
        change(); out[name] = read();
        undo(); read();
      };
      time("nothing", () => {}, () => {});
      time("map inert", () => { map.inert = true; }, () => { map.inert = false; });
      time("map aria-hidden", () => map.setAttribute("aria-hidden", "true"), () => map.setAttribute("aria-hidden", "false"));
      time("map class active off", () => map.classList.remove("active"), () => map.classList.add("active"));
      time("graph class active on", () => graph.classList.add("active"), () => graph.classList.remove("active"));
      time("body force-graph-active", () => document.body.classList.add("force-graph-active"), () => document.body.classList.remove("force-graph-active"));
      time("body local-map-active off", () => document.body.classList.remove("local-map-active"), () => document.body.classList.add("local-map-active"));
      const toolbar = document.getElementById("pathfind-toolbar");
      if (toolbar) time("toolbar moved", () => graph.prepend(toolbar), () => map.prepend(toolbar));
      time("perspective-held", () => map.classList.add("perspective-held"), () => map.classList.remove("perspective-held"));
      time("cv hidden alone", () => { map.style.contentVisibility = "hidden"; }, () => { map.style.contentVisibility = ""; });
      read();
      map.style.contentVisibility = "hidden"; map.inert = true; out["cv hidden and inert"] = read();
      const card = map.querySelector<HTMLElement>(".node-card")!;
      let t = performance.now(); void card.getBoundingClientRect(); out["a card read while hidden"] = performance.now() - t;
      t = performance.now(); void card.getBoundingClientRect(); out["again"] = performance.now() - t;
      map.style.contentVisibility = ""; map.inert = false; out["shown again, not inert"] = read();
      out.elements =document.querySelectorAll("#view-map *").length;
      return out;
    });
    console.log(`ANATOMY ${picture.name} ${JSON.stringify(result)}`);
  });
}
