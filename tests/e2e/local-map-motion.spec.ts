import { expect, test, type Page } from "@playwright/test";

import { localMapSettled, localRetainUrl } from "./still-picture";
import { PERSISTED_UI_KEY } from "../../packages/explorer/src/client/persistence/local-storage";

/**
 * The animated re-layout: a change of pins moves the branch picture from one
 * arrangement to the next instead of redrawing it. Every card keeps its
 * element, each slides from where it stood to where it now belongs, the
 * symbol row the person last acted on is held still on screen by the camera, and the
 * picture comes to rest with nothing of the move left on it. With the move
 * length at zero, or motion reduced, the picture jumps as before (the
 * owner's plan and answers, 2026-10-07, Turns 15 and 16).
 *
 * The picture is the rosetta sample program's helpers file with its users, so
 * that it fits the frame and keeps a card whose dependencies are not yet drawn,
 * whatever this repository's own code grows into; the engine's live-docs folder
 * served until 2026-10-09, when it grew too dense for a pin to move anything.
 */

const ROOT = "tests/integration/programs/typescript/rosetta/src/";
const FILES = [`${ROOT}helpers.ts`];

interface WireFrame { moving: boolean; attached: boolean; error: number; layerOpacity: number; entering: number[] }

test.use({ viewport: { width: 1600, height: 1000 } });

interface Seen { id: string; stamp: string; left: number; top: number }

/** Every card's wrapper: its file, the stamp it was given, and where it stands on screen. */
async function cards(page: Page): Promise<Seen[]> {
  return page.evaluate(() => [...document.querySelectorAll<HTMLElement>("#map-container .local-placed .local-column")].map(el => {
    const r = el.getBoundingClientRect();
    return { id: el.querySelector<HTMLElement>(".node-card")!.dataset.id!, stamp: el.dataset.stamp ?? "", left: r.left, top: r.top };
  }));
}

/** Marks every wrapper so that a later reading tells whether it is the same element. */
async function stamp(page: Page): Promise<void> {
  await page.evaluate(() => document.querySelectorAll<HTMLElement>("#map-container .local-placed .local-column").forEach((el, i) => { el.dataset.stamp = `s${i}`; }));
}

const moving = (page: Page): Promise<boolean> => page.evaluate(() => document.querySelector<HTMLElement>("#map-container .local-placed")?.dataset.moving === "true");

/** The move's length for the first test: long enough that the samples below fall inside it whatever the machine's frame rate. */
const LONG_MOVE_MS = 1500;

test("wires keep their elements and follow pins through interrupted, zoomed pin transitions", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("live-docs-explorer:ui:v1", JSON.stringify({ version: 1,
    tuning: { localMap: { moveMs: 1200, searchStarts: 0 } } })));
  await page.goto(`/?view=local&node=${ROOT}main.ts`);
  await localMapSettled(page);
  await page.waitForTimeout(700);
  await page.mouse.move(1050, 500);
  await page.mouse.wheel(0, 500);
  await page.waitForTimeout(500);
  await page.evaluate(root => {
    const stored = window as unknown as { wireFrames: WireFrame[]; wireFramesDone: boolean };
    stored.wireFrames = []; stored.wireFramesDone = false;
    const selector = `.connection-path[data-source-id="${root}main.ts"][data-target-id="${root}models.ts"][data-target-symbol="report"]`;
    const original = document.querySelector<SVGPathElement>(selector)!;
    const start = performance.now();
    const sample = (): void => {
      const wire = document.querySelector<SVGPathElement>(selector)!;
      const scale = new DOMMatrix(getComputedStyle(document.querySelector("#map-viewport")!).transform).a;
      const source = document.querySelector<HTMLElement>(`.node-card[data-id="${root}models.ts"] .symbol-row[data-symbol="Report"] .symbol-anchor.outbound`)!.getBoundingClientRect();
      const target = document.querySelector<HTMLElement>(`.node-card[data-id="${root}main.ts"] .internals-anchor.inbound`)!.getBoundingClientRect();
      const matrix = wire.getScreenCTM()!;
      const a = wire.getPointAtLength(0), b = wire.getPointAtLength(wire.getTotalLength());
      const from = new DOMPoint(a.x, a.y).matrixTransform(matrix), to = new DOMPoint(b.x, b.y).matrixTransform(matrix);
      const entering = [...document.querySelectorAll<SVGPathElement>(`.connection-path[data-target-id="${root}helpers.ts"]`)]
        .map(path => Number(path.style.strokeOpacity));
      stored.wireFrames.push({ moving: !!document.querySelector(".local-placed[data-moving]"), attached: wire === original,
        error: Math.max(Math.hypot(from.x - source.left - source.width / 2 - 6 * scale, from.y - source.top - source.height / 2),
          Math.hypot(to.x - target.left - target.width / 2 + 6 * scale, to.y - target.top - target.height / 2)),
        layerOpacity: Number(getComputedStyle(document.querySelector("#map-connections")!).opacity), entering });
      if (performance.now() - start < 3500) requestAnimationFrame(sample);
      else stored.wireFramesDone = true;
    };
    requestAnimationFrame(sample);
  }, ROOT);
  const pin = page.locator(`.node-card[data-id="${ROOT}processor.ts"] .symbol-row[data-symbol="run"] .local-symbol-pin`);
  await pin.click();
  await page.waitForTimeout(200);
  // Keyboard activation is possible while the row is moving; a second
  // gesture must start from the live picture, not only work after it settles.
  await pin.press("Enter");
  await page.mouse.move(30, 50);
  await page.waitForFunction(() => (window as unknown as { wireFramesDone: boolean }).wireFramesDone);
  const frames = await page.evaluate(() => (window as unknown as { wireFrames: WireFrame[] }).wireFrames);
  expect(frames.filter(frame => frame.moving).length).toBeGreaterThan(5);
  expect(frames.every(frame => frame.attached), "a retained reference keeps the same path element").toBe(true);
  for (const frame of frames) {
    expect(frame.error, "each drawn endpoint follows its actual pin").toBeLessThan(1);
    expect(frame.layerOpacity, "redrawing a frame does not restart the layer fade").toBeGreaterThan(.98);
  }
  expect(frames.some(frame => frame.entering.some(opacity => opacity > 0 && opacity < 1)), "new wires fade in with their entering cards").toBe(true);
  await expect(page.locator("#map-container")).not.toHaveClass(/symbol-hover-active/);
  await expect(page.locator("#map-connections")).not.toHaveClass(/symbol-hover-active/);
});

async function openPicture(page: Page, moveMs?: number): Promise<void> {
  if (moveMs !== undefined) await page.addInitScript(({ key, value }) => { window.localStorage.setItem(key, value); }, { key: PERSISTED_UI_KEY, value: JSON.stringify({ version: 1, tuning: { localMap: { moveMs, searchStarts: 0 } } }) });
  await page.goto(localRetainUrl("/", FILES));
  await page.waitForSelector("#map-container .branch-mode", { timeout: 20_000 });
  await page.waitForSelector("#map-connections .connection-path:not(.bundle-run)", { state: "attached", timeout: 15_000 });
  // The first picture's camera settles over a third of a second.
  await page.waitForTimeout(700);
}

interface IndexFile { symbols: Array<{ name: string; slug?: string }>; edges: Array<{ to?: string; toSymbol?: string }>; outbound: string[] }

/**
 * A row to pin on a card that is not the subject and stands wholly in the frame, since the map does not scroll and a
 * click lands only on what is shown, chosen so that pinning it rearranges the picture: first the internals row of a
 * card with a dependency not yet drawn, since what it brings in lands in a column already drawn and moves its
 * neighbours, then a symbol row whose symbol a file not yet drawn uses. The choice is made from the bundle's own data,
 * so it holds whatever this repository's graph becomes.
 */
async function rowToPin(page: Page) {
  const data = await (await page.request.get("/explorer-data.json")).json() as { graph: { files: Record<string, IndexFile> } };
  const seen = await page.evaluate(() => {
    const drawn = [...document.querySelectorAll<HTMLElement>("#map-container .node-card")].map(card => card.dataset.id!);
    const rows: Array<{ id: string; symbol: string }> = [];
    for (const card of document.querySelectorAll<HTMLElement>("#map-container .node-card:not(.local-focus)")) {
      const r = card.getBoundingClientRect();
      if (r.left < 0 || r.top < 0 || r.right > innerWidth || r.bottom > innerHeight) continue;
      for (const row of card.querySelectorAll<HTMLElement>(".symbol-row:not(.branch-symbol-hidden)")) {
        rows.push({ id: card.dataset.id!, symbol: row.dataset.symbol! });
      }
    }
    return { drawn, rows };
  });
  const shown = new Set(seen.drawn);
  const internals = seen.rows.find(({ id, symbol }) => symbol === "__internals__" && (data.graph.files[id]?.outbound ?? []).some(other => !shown.has(other)));
  const offered = seen.rows.find(({ id, symbol }) => {
    if (symbol === "__internals__") return false;
    const slug = data.graph.files[id]?.symbols.find(s => s.name === symbol || s.name.replace(/ \([^()]*\)$/u, "") === symbol || s.slug === symbol)?.slug;
    return slug !== undefined && Object.entries(data.graph.files).some(([other, file]) => !shown.has(other) && file.edges.some(edge => edge.to === id && edge.toSymbol === slug));
  });
  const found = internals ?? offered;
  expect(found, "a card wholly in the frame with a row whose pin brings a file not yet drawn").toBeDefined();
  return page.locator(`#map-container .node-card[data-id="${found!.id}"] .symbol-row[data-symbol="${found!.symbol}"] .symbol-label-wrapper`);
}

interface Frame { t: number; moving: boolean; cards: Array<[string, number, number]>; held: [number, number] | null }

/** Records every wrapper and the acted-on row on each frame, with whether the picture is moving. */
async function recordFrames(page: Page, heldSelector: string): Promise<void> {
  await page.evaluate(selector => {
    const frames: Frame[] = [];
    (window as unknown as { __frames: Frame[] }).__frames = frames;
    const t0 = performance.now();
    const tick = (): void => {
      const root = document.querySelector<HTMLElement>("#map-container .local-placed");
      const cards = [...document.querySelectorAll<HTMLElement>("#map-container .local-placed .local-column")].map(el => {
        const r = el.getBoundingClientRect();
        return [el.querySelector<HTMLElement>(".node-card")!.dataset.id!, r.left, r.top] as [string, number, number];
      });
      const held = document.querySelector(selector)?.getBoundingClientRect();
      frames.push({ t: performance.now() - t0, moving: root?.dataset.moving === "true", cards, held: held ? [held.left, held.top] : null });
      if (performance.now() - t0 < 4000) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, heldSelector);
}

test("a pin moves the picture: cards keep their elements, the acted-on row holds still, and the rest slide to their new places", async ({ page }) => {
  await openPicture(page, LONG_MOVE_MS);
  await stamp(page);
  const before = await cards(page);
  expect(before.length).toBeGreaterThan(2);
  const row = await rowToPin(page);
  const clicked = await row.evaluate(el => ({
    id: el.closest<HTMLElement>(".node-card")!.dataset.id!,
    symbol: el.closest<HTMLElement>(".symbol-row")!.dataset.symbol!
  }));
  const heldSelector = `#map-container .node-card[data-id="${clicked.id}"] .symbol-row[data-symbol="${clicked.symbol}"] .symbol-label-wrapper`;
  const start = (await row.boundingBox())!;
  // The page itself records each frame, since the test runner's own clock says nothing about when the page drew.
  await recordFrames(page, heldSelector);
  await row.locator(".local-symbol-pin").click();
  await localMapSettled(page);
  await page.waitForTimeout(100);
  const after = await cards(page);
  const frames = (await page.evaluate(() => (window as unknown as { __frames: Frame[] }).__frames)).filter(frame => frame.moving);
  expect(frames.length, "the picture was drawn several times while moving").toBeGreaterThanOrEqual(3);
  const was = new Map(before.map(card => [card.id, card]));
  const at = (frame: Frame, id: string): [number, number] | null => { const found = frame.cards.find(card => card[0] === id); return found ? [found[1], found[2]] : null; };
  // Every card the two pictures share is the same element.
  const shared = after.filter(card => was.has(card.id));
  expect(shared.length).toBeGreaterThan(1);
  for (const card of shared) expect(card.stamp, `${card.id} keeps its element`).toBe(was.get(card.id)!.stamp);
  // The direct Pin acts on a symbol. Its label, including its movement inside the card, stays under the eye.
  for (const frame of frames) {
    expect(frame.held, "the acted-on row remains drawn during the move").not.toBeNull();
    expect(Math.abs(frame.held![0] - start.x), `${clicked.symbol} holds its place at ${Math.round(frame.t)} ms`).toBeLessThanOrEqual(1.5);
    expect(Math.abs(frame.held![1] - start.y), `${clicked.symbol} holds its place at ${Math.round(frame.t)} ms`).toBeLessThanOrEqual(1.5);
  }
  const rest = (await row.boundingBox())!;
  expect(Math.hypot(rest.x - start.x, rest.y - start.y), `${clicked.symbol} is where it was at rest`).toBeLessThanOrEqual(1.5);
  // The picture changed, and every card that moved far went monotonically from its old place to its new, part way at the middle frame.
  const movers = shared.filter(card => Math.hypot(card.left - was.get(card.id)!.left, card.top - was.get(card.id)!.top) > 20);
  expect(movers.length, "some card moved with the change of pins").toBeGreaterThan(0);
  const middle = frames[Math.floor(frames.length / 2)];
  for (const card of movers) {
    const from = was.get(card.id)!;
    for (const axis of [0, 1] as const) {
      const a = axis === 0 ? from.left : from.top, b = axis === 0 ? card.left : card.top;
      if (Math.abs(a - b) <= 20) continue;
      const path = frames.map(frame => at(frame, card.id)![axis]);
      const sign = Math.sign(b - a);
      for (let i = 1; i < path.length; i++) expect(sign * (path[i] - path[i - 1]), `${card.id} moves one way on axis ${axis}`).toBeGreaterThanOrEqual(-1);
      const mid = at(middle, card.id)![axis];
      expect(Math.abs(mid - a), `${card.id} has left its old place by the middle frame`).toBeGreaterThan(1);
      expect(Math.abs(mid - b), `${card.id} has not yet arrived at the middle frame`).toBeGreaterThan(1);
    }
  }
  // At rest nothing of the move remains: no element mid-fade, no row displaced.
  const remnants = await page.evaluate(() => ({
    faded: document.querySelectorAll('#map-container .local-placed [style*="opacity"]').length,
    displaced: document.querySelectorAll('#map-container .local-placed [style*="translateY"]').length
  }));
  expect(remnants).toEqual({ faded: 0, displaced: 0 });
});

for (const way of ["the move length at zero", "motion reduced"] as const) {
  test(`with ${way} the picture jumps to its new arrangement, as it did before`, async ({ page }) => {
    if (way === "motion reduced") await page.emulateMedia({ reducedMotion: "reduce" });
    await openPicture(page, way === "motion reduced" ? undefined : 0);
    await stamp(page);
    const before = await cards(page);
    await (await rowToPin(page)).locator(".local-symbol-pin").click();
    expect(await moving(page), "no move runs").toBe(false);
    const after = await cards(page);
    await page.waitForTimeout(300);
    expect(await cards(page), "the picture is at rest from the first frame").toEqual(after);
    // The elements are kept all the same.
    const was = new Map(before.map(card => [card.id, card.stamp]));
    for (const card of after) if (was.has(card.id)) expect(card.stamp).toBe(was.get(card.id));
  });
}
