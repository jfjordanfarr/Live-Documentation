import { test } from "@playwright/test";
import { localRetainUrl } from "../still-picture";
import { CHAIN_REPOSITORY } from "../scopes";

test("lane columns", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto(localRetainUrl("/", CHAIN_REPOSITORY));
  await page.waitForSelector("#map-container .branch-mode", { timeout: 20_000 });
  await page.waitForSelector("#map-connections .connection-path:not(.bundle-run)", { state: "attached", timeout: 10_000 });
  await page.waitForTimeout(900);
  const out = await page.evaluate(() => {
    const info = (id: string) => {
      const el = document.querySelector<HTMLElement>(`#map-container .node-card[data-id="${id}"]`);
      if (!el) return null;
      const column = el.closest<HTMLElement>(".local-column[data-column]");
      const r = el.getBoundingClientRect(), c = column?.getBoundingClientRect();
      const pins = [...el.querySelectorAll<HTMLElement>(".symbol-pin, .local-file-pin, [data-pin-direction]")].slice(0, 3).map(p => { const b = p.getBoundingClientRect(); return { cls: p.className.slice(0, 60), box: [Math.round(b.left), Math.round(b.top), Math.round(b.width)] }; });
      return { column: column?.dataset.column, card: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)], columnBox: c ? [Math.round(c.left), Math.round(c.top), Math.round(c.width), Math.round(c.height)] : null, pins };
    };
    const columns = [...document.querySelectorAll<HTMLElement>("#map-container .local-column[data-column]")].map(el => { const r = el.getBoundingClientRect(); return { column: el.dataset.column, cls: el.className, box: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)], cards: [...el.querySelectorAll<HTMLElement>(".node-card")].map(c => `${c.dataset.id} ${Math.round(c.getBoundingClientRect().width)}`) }; });
    const byColumn: Record<string, { lefts: Set<number>; widths: Set<number>; n: number }> = {};
    for (const col of columns) { const e = byColumn[col.column!] ??= { lefts: new Set(), widths: new Set(), n: 0 }; e.lefts.add(col.box[0]); e.widths.add(col.box[2]); e.n += col.cards.length; }
    return {
      provider: info("packages/explorer/src/client/persistence/compressed-url-state.ts"),
      measurer: info("scripts/layout-lab/measurer.ts"),
      scrubber: info("tests/e2e/history-scrubber.spec.ts"),
      wrappers: columns.length,
      byColumn: Object.fromEntries(Object.entries(byColumn).map(([k, v]) => [k, { lefts: [...v.lefts], widths: [...v.widths], cards: v.n }])),
      column5: columns.filter(c => c.column === "5").map(c => ({ box: c.box, cards: c.cards }))
    };
  });
  console.log(JSON.stringify(out, null, 1));
});
