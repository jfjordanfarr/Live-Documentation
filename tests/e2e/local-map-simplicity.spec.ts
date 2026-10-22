import { expect, test, type Page } from "@playwright/test";

import { DECK_SCOPES } from "./scopes";
import { localMapSettled, localRetainUrl } from "./still-picture";
import { getDefaultTuning, PERSISTED_UI_KEY, PERSISTED_UI_VERSION } from "../../packages/explorer/src/client/persistence/local-storage";
import { captureFromPage } from "../../scripts/layout-lab/capture";
import { baselineConfig, driftOf, evaluate } from "../../scripts/layout-lab/evaluate";
import { refine } from "../../scripts/layout-lab/refine";
import { loadBundleGraph, type ScopeRun } from "../../scripts/layout-lab/scopes";

/** The inspected generator/warehouse improvements and the actual browser-to-command competition, including its wires. */
test.use({ viewport: { width: 1600, height: 1000 } });

async function tuning(page: Page, localMap: Record<string, number>): Promise<void> {
  await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
    key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap } })
  });
}

/** The rendered facts and unscaled geometry, independent of the camera's fit or animation. */
async function picture(page: Page) {
  return page.evaluate(() => {
    const root = document.querySelector<HTMLElement>(".local-placed")!;
    const membranes = [...root.querySelectorAll<HTMLElement>(".local-directory-band[data-directory]")]
      .filter(band => band.dataset.directory).map(band => ({
        directory: band.dataset.directory!, segments: band.dataset.segments!.split(";").map(text => {
          const [column, left, top, right, bottom] = text.split(":").map(Number);
          return { column, left, top, right, bottom };
        })
      })).sort((a, b) => a.directory.localeCompare(b.directory));
    const cards = [...root.querySelectorAll<HTMLElement>(".node-card")].map(card => ({
      id: card.dataset.id!, symbols: [...card.querySelectorAll<HTMLElement>(".symbol-row")].map(row => row.dataset.symbol ?? "").sort()
    })).sort((a, b) => a.id.localeCompare(b.id));
    const references = [...new Set([...document.querySelectorAll<SVGPathElement>("#map-connections .connection-path[data-source-id]")]
      .map(path => JSON.stringify([path.dataset.sourceId, path.dataset.sourceSymbol, path.dataset.targetId, path.dataset.targetSymbol, path.dataset.kind])))].sort();
    const positions = [...root.querySelectorAll<HTMLElement>(".local-column")].map(wrapper => {
      const id = wrapper.querySelector<HTMLElement>(".node-card")?.dataset.id;
      let left = 0, top = 0;
      for (let element: HTMLElement | null = wrapper; element && element !== root; element = element.parentElement) {
        left += Number.parseFloat(element.style.left) || 0;
        top += Number.parseFloat(element.style.top) || 0;
      }
      return { id, left, top, width: Number.parseFloat(wrapper.style.width), height: wrapper.offsetHeight };
    }).sort((a, b) => (a.id ?? "").localeCompare(b.id ?? ""));
    const steps = membranes.reduce((total, band) => total + band.segments.slice(1).reduce((sum, segment, i) => sum
      + Number(segment.top !== band.segments[i].top) + Number(segment.bottom !== band.segments[i].bottom), 0), 0);
    return { membranes, positions, identity: { cards, references }, steps, score: Number(root.dataset.searchShown),
      alignmentTried: Number(root.dataset.searchAlignmentTried), alignmentAdopted: Number(root.dataset.searchAlignmentAdopted) };
  });
}

test("the simplicity slider restarts competition and removes unnecessary generator steps without losing facts", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  // Keep the inspected counterexample's alignment weight explicit. The
  // stronger Relaxed default already flattens its remaining top at50, so it
  // cannot demonstrate the additional join that this test exercises at100.
  await tuning(page, { rowLevelness: 0.25, membraneSimplicity: 0, searchStarts: 32, searchPatience: 8, moveMs: 0 });
  await page.goto("/?view=local&mode=2d&node=packages/generator/src/generator.ts");
  await page.locator(".local-placed").waitFor();
  await localMapSettled(page);
  const before = await picture(page);
  expect(before.identity.cards.length).toBeGreaterThan(2);
  expect(before.identity.references.length).toBeGreaterThan(0);
  expect(before.alignmentTried).toBe(0);
  await page.getByText("Tuning", { exact: true }).click();
  const slider = page.locator("#tuning-membrane-simplicity");
  await slider.evaluate(input => { (input as HTMLInputElement).value = "50"; input.dispatchEvent(new Event("input", { bubbles: true })); });
  await expect(page.locator("#tuning-membrane-simplicity-value")).toHaveText("50");
  await localMapSettled(page);
  const after = await picture(page);
  expect(after.identity).toEqual(before.identity);
  expect(after.alignmentAdopted).toBeGreaterThan(0);
  expect(after.steps).toBeLessThan(before.steps);
  expect(after.score, "the accepted picture beats the old picture under the new weight").toBeLessThan(before.score + 50 * before.steps);
  // At weight 100 the picture is drawn anew: the first paint takes the cheapest
  // of its starts under the new weight, the previous order among them, and the
  // continuing search only lowers that price. Which start wins depends on the
  // neighbourhood: when the inspected picture was drawn (2026-10-13) and when a
  // test importing the generator joined it (2026-10-15), the previous picture
  // won and the stage scored exactly the previous picture re-priced; once the
  // root's tooling files joined the graph (2026-10-16) the ranked start priced
  // below the previous order's placement under the new weight, with more
  // membrane steps, and the search settled under its patience before bettering
  // it, as it also did on the picture before that night's card change. So the
  // previous picture re-priced is not a bound the competition promises; what
  // it promises is kept here: the facts are the same, the alignment trials
  // still join, and the engine band's top is joined.
  await slider.evaluate(input => { (input as HTMLInputElement).value = "100"; input.dispatchEvent(new Event("input", { bubbles: true })); });
  await localMapSettled(page);
  const geometric = await picture(page);
  expect(geometric.identity).toEqual(before.identity);
  expect(geometric.alignmentAdopted).toBeGreaterThan(0);
  const engine = geometric.membranes.find(band => band.directory === "packages/engine/src")!;
  expect(engine.segments.length).toBeGreaterThan(1);
  expect(engine.segments[0].top).toBe(engine.segments[1].top);
  expect(errors).toEqual([]);
});

test("alignment trials animate their outlines while the selected file stays in place", async ({ page }) => {
  await tuning(page, { membraneSimplicity: 0, searchStarts: 16, searchPatience: 8, moveMs: 300 });
  await page.goto("/?view=local&mode=2d&node=packages/generator/src/generator.ts");
  await page.locator(".local-placed").waitFor();
  await localMapSettled(page);
  await page.waitForTimeout(700);
  const frames = await page.evaluate(async () => {
    const root = document.querySelector<HTMLElement>(".local-placed")!;
    const selected = root.querySelector<HTMLElement>('.node-card[data-id="packages/generator/src/generator.ts"]')!;
    const outline = root.querySelector<SVGPathElement>('.local-membrane-shape[data-directory="packages/engine/src"]')!;
    const first = selected.getBoundingClientRect();
    const samples: Array<{ moving: boolean; x: number; y: number; same: boolean; outline: string }> = [];
    const input = document.querySelector<HTMLInputElement>("#tuning-membrane-simplicity")!;
    input.value = "100";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    // Rerender rebuilds a card inside its retained wrapper; the move preserves
    // that wrapper and anchors the selected identity, rather than its old text element.
    const wrapper = root.querySelector<HTMLElement>('.node-card[data-id="packages/generator/src/generator.ts"]')!.parentElement!;
    await new Promise<void>(resolve => {
      const sample = (): void => {
        const current = root.querySelector<HTMLElement>('.node-card[data-id="packages/generator/src/generator.ts"]')!;
        const rect = current.getBoundingClientRect();
        samples.push({ moving: root.hasAttribute("data-moving"), x: rect.left - first.left, y: rect.top - first.top,
          same: current.parentElement === wrapper, outline: outline.getAttribute("d") ?? "" });
        if (root.dataset.searchStatus === "running" || root.hasAttribute("data-moving")) requestAnimationFrame(sample);
        else resolve();
      };
      requestAnimationFrame(sample);
    });
    return samples;
  });
  const moving = frames.filter(frame => frame.moving);
  expect(moving.length).toBeGreaterThanOrEqual(3);
  expect(new Set(moving.map(frame => frame.outline)).size, "the boundary has intermediate poses").toBeGreaterThan(2);
  for (const frame of frames) {
    expect(frame.same, "the selected file keeps its wrapper").toBe(true);
    expect(Math.hypot(frame.x, frame.y), "the selected identity holds its screen position").toBeLessThanOrEqual(1.5);
  }
});

const warehouseFile = "tests/integration/programs/java/warehouse/src/main/java/com/acme/warehouse/report/Report.java";
const generatorFile = "packages/generator/src/generator.ts";
/**
 * Each run's search must try an alignment, and the runs marked `adopts` must adopt one, so that the agreement covers an
 * adopted picture on each bundle. The warehouse report adopted until 2026-10-20, when the symbol rows' Pin and More
 * made its first placement start at the one membrane step its search used to reach (2 then 1 under the old rows, 1
 * from the start under the new, measured by the lab on both); it stays as the case whose tried alignment is rejected,
 * and the generator, which adopts under both, carries the repository bundle's adoption.
 */
const runs: Array<ScopeRun & { adopts: boolean }> = [
  { ...DECK_SCOPES.find(run => run.bundle === "estate" && run.scopeName === "five files")!, adopts: true },
  { bundle: "repository", base: "/", scopeName: "generator", scope: [generatorFile], subject: generatorFile, adopts: true },
  { bundle: "repository", base: "/", scopeName: "warehouse report", scope: [warehouseFile], subject: warehouseFile, adopts: false }];

for (const run of runs) {
  test(`continuing geometry competition agrees with the headless command: ${run.scopeName}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await tuning(page, { searchStarts: 0, membraneSimplicity: 50, moveMs: 0 });
    await page.goto(localRetainUrl(run.base, run.scope));
    const capture = await captureFromPage(page, run);
    const first = await picture(page);
    const graph = await loadBundleGraph(run);
    const config = { ...baselineConfig(), membraneSimplicity: 50 };
    expect(capture.warnings).toEqual([]);
    expect(driftOf(capture, evaluate(capture, graph, run, config))).toEqual([]);
    const settings = { searchStarts: 4, searchPatience: 2, churnCost: getDefaultTuning().localMap.churnCost };
    const expected = refine(capture, graph, run, config, settings);
    expect(expected.alignmentTried).toBeGreaterThan(0);
    if (run.adopts) expect(expected.alignmentAdopted).toBeGreaterThan(0);
    await tuning(page, { ...settings, membraneSimplicity: 50, moveMs: 0 });
    await page.goto(localRetainUrl(run.base, run.scope));
    await page.locator(".local-placed").waitFor();
    await localMapSettled(page);
    const actual = await picture(page);
    const scene = expected.final.scene;
    expect(actual.identity).toEqual(first.identity);
    expect(actual.score).toBe(expected.state.shown);
    expect(actual.alignmentTried).toBe(expected.alignmentTried);
    expect(actual.alignmentAdopted).toBe(expected.alignmentAdopted);
    expect(actual.membranes).toEqual(scene.boxes.filter(box => box.kind === "directory")
      .map(box => ({ directory: box.directory, segments: box.segments })).sort((a, b) => a.directory.localeCompare(b.directory)));
    expect(actual.positions).toEqual([...scene.items.values()].map(item => ({ id: item.id,
      left: scene.lefts[item.column] + item.inset, top: scene.tops.get(item.id),
      width: scene.widths[item.column] - 2 * item.inset, height: scene.heights.get(item.id)
    })).sort((a, b) => a.id.localeCompare(b.id)));
    expect(errors).toEqual([]);
  });
}
