import { expect, test, type Page } from "@playwright/test";

import { compressSnapshot, decompressSnapshot, DEFAULT_SNAPSHOT } from "../../packages/explorer/src/client/persistence/compressed-url-state";
import { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } from "../../packages/explorer/src/client/persistence/local-storage";
import { NOMINAL_CARD } from "../../packages/explorer/src/client/views/localView/directory-flow";
import { describeFaults, overlapsAmong, textBoxes, truncations } from "./design-audit";
import { LOCAL_MAP, localMapSettled, localRetainUrl } from "./still-picture";

/**
 * Directories open and close inside the Local Map (the owner's grammar,
 * 2026-10-08). A directory has three states on one scale: closed, a box
 * without symbols standing in for everything under it; encasing, the
 * membrane around the files party to the wires, the rest counted on its
 * label; open, every file inside as a compact card and every subdirectory as
 * a closed box. A closed box opens by a press anywhere on it, and a drawn
 * directory's label is the handle that opens it or closes it as far as pins
 * allow (2026-11-15); the evidence reader is behind More, and no wire
 * reaches a closed box.
 */

const ENGINE = "packages/engine/src";
const CLIENT = "packages/explorer/src/client";
/** The page's link for a directory opened with nothing pinned, in the layout named or, without one, as a link says nothing of it. */
const opened = (directory: string, layout?: "flow" | "grid"): string => `/?s=${compressSnapshot({
  ...DEFAULT_SNAPSHOT, view: "map", perspective: "2d", openDirectories: new Set([directory]),
  ...(layout ? { layout: { localMap: { directoryLayout: layout } } } : {})
})}`;

const LIVE_DOCS = `${ENGINE}/live-docs`;

test.use({ viewport: { width: 1800, height: 1100 } });

const box = (page: Page, directory: string) => page.locator(`#map-container .local-directory-closed[data-directory="${directory}"]`);
const label = (page: Page, directory: string) => page.locator(`#map-container .local-directory-label[data-directory="${directory}"]`);
const cards = (page: Page) => page.locator("#map-container .node-card");
const wires = (page: Page) => page.locator("#map-connections .connection-path:not(.bundle-run)");

async function settled(page: Page): Promise<void> {
  await page.waitForSelector("#map-container .branch-mode", { timeout: 20_000 });
  await localMapSettled(page);
  await page.waitForTimeout(600);
}

/** Chooses how an opened directory stands for every page this test opens, beside the suite's own saved tuning. */
async function chooseLayout(page: Page, layout: "flow" | "grid"): Promise<void> {
  await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
    key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { searchStarts: 0, directoryLayout: layout } } })
  });
}

/** Every text box of the Local Map, checked for collisions and cut-offs as the design audit does. */
async function expectNoTextFault(page: Page): Promise<void> {
  const boxes = await textBoxes(page, LOCAL_MAP.text);
  expect(boxes.length).toBeGreaterThan(4);
  const overlaps = overlapsAmong(boxes);
  const cut = await truncations(page, LOCAL_MAP.text);
  expect(overlaps.length + cut.length, describeFaults(overlaps, cut)).toBe(0);
}

/** "N files, M directories" for a directory, as the Explorer counts it, from the bundle's data by this file's own reading. */
async function expectedCounts(page: Page, directory: string): Promise<string> {
  const data = await (await page.request.get("/explorer-data.json")).json() as { graph: { files: Record<string, { codePath: string; archetype?: string }> } };
  const under = Object.values(data.graph.files)
    .filter(file => (file.archetype ?? "").toLowerCase() !== "asset" && file.codePath.startsWith(`${directory}/`))
    .map(file => file.codePath.slice(directory.length + 1));
  const subdirectories = new Set(under.filter(path => path.includes("/")).map(path => path.slice(0, path.indexOf("/"))));
  return `${under.length} files, ${subdirectories.size} directories`;
}

test("a directory entered with nothing pinned is a grid of compact cards and closed boxes, with no wire, and its address round-trips", async ({ page }) => {
  await page.goto(`/?view=local&dir=${ENGINE}`);
  await settled(page);
  // packages/engine/src holds only directories: four closed boxes, each named and counted, inside one membrane that says it is open.
  await expect(page.locator("#map-container .local-directory-closed")).toHaveCount(4);
  await expect(box(page, LIVE_DOCS).locator(".local-directory-closed__name")).toHaveText("live-docs");
  // A box counts the files under it at any depth and its immediate subdirectories, over the files the picture shows: tests
  // in, assets out by default. The expectation is read from the bundle's data, so that the repository may grow a folder.
  await expect(box(page, LIVE_DOCS).locator(".local-directory-closed__count")).toHaveText(await expectedCounts(page, LIVE_DOCS));
  await expect(cards(page)).toHaveCount(0);
  await expect(wires(page)).toHaveCount(0);
  await expect(label(page, ENGINE).locator(".local-directory-close")).toBeVisible();
  await expect(page.locator("#context-name")).toHaveText(ENGINE);
  await expect(page.locator("#map-container .node-card.local-focus")).toHaveCount(0);
  // The whole picture is in the frame: nothing to focus on, so the fit keeps it visible.
  const frame = (await page.locator("#view-map").boundingBox())!;
  for (const b of await page.locator("#map-container .local-directory-closed").all()) {
    const r = (await b.boundingBox())!;
    expect(r.x).toBeGreaterThanOrEqual(frame.x);
    expect(r.x + r.width).toBeLessThanOrEqual(frame.x + frame.width);
    expect(r.y + r.height).toBeLessThanOrEqual(frame.y + frame.height);
  }
  await expectNoTextFault(page);
  // Opening a box writes the opened set into the address, and the address reopens the same picture.
  await box(page, `${ENGINE}/config`).locator(".local-directory-open").click();
  await settled(page);
  await expect(label(page, `${ENGINE}/config`).locator(".local-directory-close")).toBeVisible();
  await expect(cards(page)).toHaveCount(2);
  expect(page.url()).toContain("?s=");
  await page.reload();
  await settled(page);
  await expect(label(page, `${ENGINE}/config`).locator(".local-directory-close")).toBeVisible();
  await expect(cards(page)).toHaveCount(2);
  await expect(page.locator("#map-container .local-directory-closed")).toHaveCount(3);
});

/**
 * The handle at the farthest look (the owner, 2026-11-15: directories "aren't exceptionally _useful_ (interaction-wise)
 * at high zoom-outs because there are no buttons to interact with at that distance"). Seven presses out, where the
 * overview look begins: every closed box draws its name whole after a chevron; a click on a box's body, away from its
 * name, opens the directory; the opened directory's name is drawn no smaller than the file names inside it, inside its
 * membrane and above its first card; a click on that name closes it; and the keyboard does both from the handle.
 */
test("at the overview a closed directory opens by a click anywhere on its box and closes by its handle, by pointer and by keyboard", async ({ page }) => {
  test.setTimeout(90_000);
  const HISTORY = `${CLIENT}/history`;
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`/?view=local&dir=${CLIENT}`);
  await settled(page);
  // At reading size a closed box's More stands on its name's line, after the name and inside the box: no row is given
  // to a lone control (the owner's rule of 2026-11-07). Where it stands on that line is the look's: at the box's right
  // in the plain box, beside the name on a folder's tab (closed-directory-looks.spec.ts).
  const arrival = await box(page, HISTORY).evaluate(element => {
    const name = element.querySelector(".local-directory-closed__name")!.getBoundingClientRect(), more = element.querySelector(".local-directory-actions")!.getBoundingClientRect();
    return { apart: Math.abs((more.top + more.bottom) / 2 - (name.top + name.bottom) / 2), after: more.left - name.right, toEdge: element.getBoundingClientRect().right - more.right };
  });
  expect(arrival.apart, "More's centre against the name line's").toBeLessThan(3);
  expect(arrival.after, "More after the name").toBeGreaterThanOrEqual(0);
  expect(arrival.toEdge, "More inside the box").toBeGreaterThanOrEqual(0);
  for (let press = 0; press < 7; press += 1) {
    await page.getByRole("button", { name: "Zoom Out", exact: true }).click();
    await localMapSettled(page);
  }
  await expect(page.locator("#map-container")).toHaveAttribute("data-look", "overview");
  // Every closed box: its name whole on the lines the look draws, after a chevron, with no text button.
  const boxes = await page.locator("#map-container .local-directory-closed").evaluateAll(elements => elements.map(element => {
    const held = element.querySelector<HTMLElement>(".local-directory-closed__held");
    const content = held ? getComputedStyle(held, "::after").content : "";
    const chevron = held?.querySelector(".local-directory-chevron")?.getBoundingClientRect();
    return { directory: (element as HTMLElement).dataset.directory!, lines: content.startsWith("\"") ? content.slice(1, -1).replaceAll("\\a ", "").replaceAll("\\a", "") : "",
      chevron: chevron ? chevron.height : 0, words: [...element.querySelectorAll("button")].map(button => button.textContent?.trim() ?? "") };
  }));
  expect(boxes.length).toBeGreaterThan(4);
  for (const seen of boxes) {
    expect.soft(seen.lines, `${seen.directory}: its name drawn whole`).toBe(seen.directory.split("/").pop());
    expect.soft(seen.chevron, `${seen.directory}: its chevron drawn at a size to see`).toBeGreaterThan(6);
    expect.soft(seen.words, `${seen.directory}: no text button`).not.toContain("Open");
  }
  const handle = box(page, HISTORY).getByRole("button", { name: `Open ${HISTORY}`, exact: true });
  await expect(handle).toHaveAttribute("aria-expanded", "false");
  // The box's body, in its lower right, away from the name and from More.
  const closed = (await box(page, HISTORY).boundingBox())!;
  await page.mouse.click(closed.x + closed.width * 0.6, closed.y + closed.height * 0.8);
  await settled(page);
  await expect(box(page, HISTORY)).toHaveCount(0);
  const close = label(page, HISTORY).getByRole("button", { name: `Close ${HISTORY}`, exact: true });
  await expect(close).toHaveAttribute("aria-expanded", "true");
  // The opened handle is one target: the button holds the chevron and the directory's own name, and a press in the
  // membrane's padding just above the name still lands on it, the pressable area being the strip's height and that
  // padding over the handle (at the overview the strip leaves under the line only its 6 units of air, under 2 px).
  const target = await close.evaluate(element => {
    const box = element.getBoundingClientRect(), above = document.elementFromPoint(box.left + box.width / 2, box.top - 2);
    return { chevron: !!element.querySelector(".local-directory-chevron"), name: element.querySelector(".local-directory-leaf")?.textContent, above: !!above && element.contains(above) };
  });
  expect(target).toEqual({ chevron: true, name: "history", above: true });
  // Hierarchy and room: each drawn directory's own name on screen against the file names held inside it, its line
  // inside its membrane's strip, above the first card of the membrane.
  const drawn = await page.evaluate(() => {
    const px = (element: HTMLElement): number => parseFloat(getComputedStyle(element).fontSize) * element.getBoundingClientRect().height / element.offsetHeight;
    const files = [...document.querySelectorAll<HTMLElement>("#map-container .local-file-name-held")].filter(name => name.offsetHeight > 0).map(px);
    return [...document.querySelectorAll<HTMLElement>("#map-container .local-directory-label")].map(element => {
      const leaf = element.querySelector<HTMLElement>(".local-directory-leaf"), row = element.querySelector<HTMLElement>(".local-directory-row");
      // The label's box is the strip: the run of the membrane's leading columns whose tops are level. The cards of
      // those columns stand below the handle; a column whose top steps away has its cards beside the strip, not under it.
      const band = element.parentElement!, strip = element.getBoundingClientRect();
      const cardTops = [...band.querySelectorAll(":scope > .local-column")].map(card => card.getBoundingClientRect())
        .filter(card => card.left < strip.right && card.right > strip.left).map(card => card.top);
      return { directory: element.dataset.directory!, name: leaf ? px(leaf) : 0, whole: !!leaf && leaf.scrollWidth <= leaf.clientWidth, files: Math.max(...files),
        foot: row ? row.getBoundingClientRect().bottom : Infinity, firstCard: Math.min(...cardTops) };
    });
  });
  expect(drawn.map(each => each.directory).sort()).toEqual([CLIENT, HISTORY]);
  for (const each of drawn) {
    expect.soft(each.name, `${each.directory}: its name against file names of ${each.files.toFixed(1)} px`).toBeGreaterThanOrEqual(each.files - 0.2);
    expect.soft(each.whole, `${each.directory}: its own name whole`).toBe(true);
    expect.soft(each.foot, `${each.directory}: its handle above the first card of the columns its strip spans`).toBeLessThanOrEqual(each.firstCard + 0.5);
  }
  // The handle closes: a click on the directory's own name.
  await label(page, HISTORY).locator(".local-directory-leaf").click();
  await settled(page);
  await expect(label(page, HISTORY)).toHaveCount(0);
  await expect(box(page, HISTORY)).toHaveCount(1);
  // The keyboard: Enter on the closed box's handle opens, Space on the opened label's handle closes, and the focus stays on the handle.
  await box(page, HISTORY).getByRole("button", { name: `Open ${HISTORY}`, exact: true }).focus();
  await page.keyboard.press("Enter");
  await settled(page);
  await expect(close).toBeFocused();
  await page.keyboard.press("Space");
  await settled(page);
  await expect(label(page, HISTORY)).toHaveCount(0);
  await expect(box(page, HISTORY).getByRole("button", { name: `Open ${HISTORY}`, exact: true })).toBeFocused();
});

for (const layout of ["flow", "grid"] as const) test(`a closed box opens in place, the membrane growing from the box while the picture moves, and its handle closes it back to a box (${layout})`, async ({ page }) => {
  await page.goto(opened(ENGINE, layout));
  await settled(page);
  const before = (await box(page, LIVE_DOCS).boundingBox())!;
  const moveStarted = page.waitForFunction(() => document.querySelector<HTMLElement>("#map-container .local-placed")?.dataset.moving === "true", undefined, { timeout: 5_000 });
  // The new membrane as the move's first frame draws it, read in the page: a reading taken from the test after the move
  // began landed some frames in, and in Flow, whose opened picture is larger and reframed, frames in had moved it 53 to
  // 73 px (2026-11-13), while its first frame stood exactly where the box stood.
  const firstFrame = page.evaluate(directory => new Promise<{ x: number; y: number; width: number; height: number }>(resolve => {
    const look = (): void => {
      const band = document.querySelector(`#map-container .local-directory-band[data-directory="${directory}"]`);
      const moving = document.querySelector<HTMLElement>("#map-container .local-placed")?.dataset.moving === "true";
      if (band && moving) { const { x, y, width, height } = band.getBoundingClientRect(); resolve({ x, y, width, height }); } else requestAnimationFrame(look);
    };
    requestAnimationFrame(look);
  }), LIVE_DOCS);
  await box(page, LIVE_DOCS).locator(".local-directory-open").click();
  await moveStarted;
  // Early in the move the new membrane stands where the box stood, no wider than the box was, and grows from there.
  const early = await firstFrame;
  expect(Math.abs(early.x - before.x)).toBeLessThan(40);
  expect(Math.abs(early.y - before.y)).toBeLessThan(40);
  await settled(page);
  const after = (await page.locator(`#map-container .local-directory-band[data-directory="${LIVE_DOCS}"]`).boundingBox())!;
  expect(after.width).toBeGreaterThan(early.width);
  expect(after.height).toBeGreaterThan(early.height);
  // Open: its files compact, its subdirectories closed boxes, the parent's other boxes still boxes; no wire between
  // symbols, and in Flow one line for each pair of its files where one uses the other, none in the grid.
  await expect(box(page, LIVE_DOCS)).toHaveCount(0);
  await expect(box(page, `${LIVE_DOCS}/adapters`)).toBeVisible();
  await expect(box(page, `${LIVE_DOCS}/heuristics`)).toBeVisible();
  await expect(box(page, `${ENGINE}/config`)).toBeVisible();
  const compact = await cards(page).count();
  expect(compact).toBeGreaterThan(20);
  await expect(page.locator("#map-container .node-card .symbol-row:not(.branch-symbol-hidden)")).toHaveCount(0);
  await expect(page.locator("#map-connections .connection-path:not(.bundle-run):not(.gathered)")).toHaveCount(0);
  if (layout === "grid") await expect(wires(page)).toHaveCount(0);
  else expect(await wires(page).count()).toBeGreaterThan(0);
  // A compact card counts its collapsed public symbols on its reveal; a file with none, a test file, has no reveal, since the Internals row is not a symbol.
  const graphCard = page.locator(`#map-container .node-card[data-id="${LIVE_DOCS}/graph.ts"]`);
  const publicRows = await graphCard.locator(".symbol-row:not(.internals-row)").count();
  expect(publicRows).toBeGreaterThan(0);
  // The page joins a count and its unit by a no-break space (2026-10-30); `\s` reads it and a plain space alike.
  await expect(graphCard.getByRole("button", { name: /^\+\d+\ssymbols$/ })).toHaveText(`+${publicRows} symbols`);
  const testCard = page.locator(`#map-container .node-card[data-id="${LIVE_DOCS}/graph.test.ts"]`);
  await expect(testCard).toHaveCount(1);
  await expect(testCard.locator(".symbol-row:not(.internals-row)")).toHaveCount(0);
  await expect(testCard.getByRole("button", { name: /^\+\d+\ssymbols$/ })).toHaveCount(0);
  // The unfolding began at the clicked box (asserted above). The final camera may recover the expanded picture's
  // frame; its directory identity and Close remain inside that frame instead of being held offscreen indefinitely.
  // The label's own box is the strip across the membrane (2026-11-15); what must be in the frame is what it draws, its name.
  const unfolded = (await label(page, LIVE_DOCS).locator(".local-directory-caption").boundingBox())!;
  const frame = (await page.locator("#view-map").boundingBox())!;
  expect(unfolded.x).toBeGreaterThanOrEqual(frame.x);
  expect(unfolded.y).toBeGreaterThanOrEqual(frame.y);
  expect(unfolded.x + unfolded.width).toBeLessThanOrEqual(frame.x + frame.width);
  expect(unfolded.y + unfolded.height).toBeLessThanOrEqual(frame.y + frame.height);
  await expect(label(page, LIVE_DOCS).locator(".local-directory-close")).toBeInViewport();
  await label(page, LIVE_DOCS).locator(".local-directory-close").click();
  await settled(page);
  await expect(box(page, LIVE_DOCS)).toBeVisible();
  await expect(cards(page)).toHaveCount(0);
  await expect(page.locator("#map-container .local-directory-closed")).toHaveCount(4);
});

for (const layout of ["flow", "grid"] as const) test(`an encasing membrane counts what it hides, Open discloses it around pinned files, and no wire reaches a closed box (${layout})`, async ({ page }) => {
  const graph = `${LIVE_DOCS}/graph.ts`;
  const builder = "packages/explorer/src/shared/staticBuilder.ts";
  await chooseLayout(page, layout);
  await page.goto(localRetainUrl("/", [graph, builder]));
  await settled(page);
  await page.waitForSelector("#map-connections .connection-path:not(.bundle-run)", { state: "attached" });
  const drawn = await wires(page).count();
  expect(drawn).toBeGreaterThan(0);
  // The live-docs membrane encases graph.ts and whatever its pins reach; the rest of its files and its two subdirectories are counted, and no X shows.
  const more = label(page, LIVE_DOCS).locator(".local-directory-more");
  await expect(more).toHaveText(/^\+\d+\sfiles, 2\sdirectories$/);
  // Every count on a handle's line is drawn whole, on the line, or not drawn at all (2026-11-15): never cut.
  const counts = await page.locator("#map-container .local-directory-more").evaluateAll(elements => elements.map(element => {
    const line = element.closest(".local-directory-caption")!.getBoundingClientRect(), own = element.getBoundingClientRect();
    return { text: element.textContent, opacity: Number(getComputedStyle(element).opacity), onLine: own.top < line.bottom - 1 && own.right <= line.right + 0.5, whole: element.scrollWidth <= element.clientWidth + 1 };
  }));
  expect(counts.length).toBeGreaterThan(0);
  for (const count of counts) expect(count.opacity === 0 || (count.opacity > 0.5 && count.onLine && count.whole), JSON.stringify(count)).toBe(true);
  await expect(label(page, LIVE_DOCS).locator(".local-directory-close")).toHaveCount(0);
  const partyCards = await cards(page).count();
  // The map does not scroll and the encased picture may be wider than the frame, with its label under the sidebar, so
  // the click is dispatched to Open rather than aimed at the frame, as the member's Pin and the X are below.
  await label(page, LIVE_DOCS).locator(".local-directory-open").evaluate(button => (button as HTMLButtonElement).click());
  await settled(page);
  // Open: every file of live-docs is drawn, the ones not party compact, and its subdirectories are boxes; the wires between
  // symbols are the same, and in Flow one line joins each pair of the opened directory's cards where one uses the other.
  await expect(label(page, LIVE_DOCS).locator(".local-directory-close")).toBeVisible();
  await expect(more).toHaveCount(0);
  expect(await cards(page).count()).toBeGreaterThan(partyCards);
  await expect(page.locator("#map-container .node-card.branch-member .symbol-row:not(.branch-symbol-hidden)")).toHaveCount(0);
  await expect(page.locator("#map-connections .connection-path:not(.bundle-run):not(.gathered)")).toHaveCount(drawn);
  if (layout === "grid") await expect(wires(page)).toHaveCount(drawn);
  else expect(await wires(page).count()).toBeGreaterThan(drawn);
  await expect(box(page, `${LIVE_DOCS}/adapters`)).toBeVisible();
  await expect(box(page, `${LIVE_DOCS}/heuristics`)).toBeVisible();
  // No wire's end lies inside a closed box.
  const boxes = await page.locator("#map-container .local-directory-closed").evaluateAll(elements => elements.map(element => element.getBoundingClientRect().toJSON() as { left: number; top: number; right: number; bottom: number }));
  const ends = await page.locator("#map-connections .connection-path:not(.bundle-run)").evaluateAll(paths => paths.flatMap(path => {
    const svg = path.closest("svg")!;
    const origin = svg.getBoundingClientRect();
    const numbers = (path.getAttribute("d") ?? "").match(/-?\d+(?:\.\d+)?/gu)?.map(Number) ?? [];
    if (numbers.length < 4) return [];
    const scale = origin.width / Math.max(1, svg.clientWidth || origin.width);
    return [{ x: origin.left + numbers[0] * scale, y: origin.top + numbers[1] * scale }, { x: origin.left + numbers[numbers.length - 2] * scale, y: origin.top + numbers[numbers.length - 1] * scale }];
  }));
  expect(ends.length).toBeGreaterThan(0);
  for (const end of ends) for (const b of boxes) {
    expect(end.x >= b.left && end.x <= b.right && end.y >= b.top && end.y <= b.bottom, "a wire ends inside a closed box").toBe(false);
  }
  await expectNoTextFault(page);
  // A compact member's Pin retains it and reveals its wires; the directory stays open. The map does
  // not scroll and the opened picture is wide, so the click is dispatched to Pin rather than aimed at the frame.
  const member = page.locator("#map-container .node-card.branch-member").first();
  const memberId = await member.getAttribute("data-id");
  await member.locator(".local-file-pin").evaluate(button => (button as HTMLButtonElement).click());
  await settled(page);
  await expect(page.locator(`#map-container .node-card[data-id="${memberId}"]`)).not.toHaveClass(/branch-member/);
  await expect(label(page, LIVE_DOCS).locator(".local-directory-close")).toBeVisible();
  // The X steps live-docs down to encasing: the member just retained stays, the unwired ones go, the boxes go.
  await label(page, LIVE_DOCS).locator(".local-directory-close").evaluate(close => (close as HTMLElement).click());
  await settled(page);
  await expect(page.locator(`#map-container .node-card[data-id="${memberId}"]`)).toBeVisible();
  await expect(page.locator("#map-container .node-card.branch-member")).toHaveCount(0);
  await expect(page.locator("#map-container .local-directory-closed")).toHaveCount(0);
  await expect(more).toBeVisible();
});

test("keyboard release preserves an independently opened child and the enclosure required by a pinned file", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const graph = `${LIVE_DOCS}/graph.ts`;
  await page.goto(localRetainUrl("/", [graph]));
  await settled(page);
  await label(page, LIVE_DOCS).locator(".local-directory-open").focus();
  await page.keyboard.press("Enter");
  await settled(page);
  await expect(label(page, LIVE_DOCS).locator(".local-directory-close")).toBeVisible();
  await box(page, `${LIVE_DOCS}/adapters`).locator(".local-directory-open").focus();
  await page.keyboard.press("Space");
  await settled(page);
  await expect(label(page, `${LIVE_DOCS}/adapters`).locator(".local-directory-close")).toBeVisible();
  // Release only this opening. The independently opened child and graph.ts still require their enclosures.
  await label(page, LIVE_DOCS).locator(".local-directory-close").focus();
  await page.keyboard.press("Enter");
  await settled(page);
  await expect(label(page, `${LIVE_DOCS}/adapters`)).toHaveCount(1);
  await expect(label(page, `${LIVE_DOCS}/adapters`).locator(".local-directory-close")).toBeVisible();
  await expect(box(page, `${LIVE_DOCS}/adapters`)).toHaveCount(0);
  await expect(label(page, LIVE_DOCS)).toBeVisible();
  await expect(label(page, LIVE_DOCS).locator(".local-directory-close")).toHaveCount(0);
  await expect(page.locator(`#map-container .node-card[data-id="${graph}"]`)).toBeVisible();
});

// ─── Flow and the grid (Tuning → 2D Layout → Opened Directory, a trial on 2026-11-12, Flow the default since 2026-11-13) ─
// A newcomer opened three directories, saw cards and no line, and concluded that the map draws no connections (the
// first-visit review of 2026-11-12, finding 3). In Flow an opened directory's files stand in the order the code flows,
// one line joins each pair of cards where one uses the other, a card counts only what is not drawn, and a card's hover
// lights its lines and fades the rest; the grid, the default until 2026-11-13, is one choice away.

/** What a directory's picture holds, read from the page: each card's and box's column and box, its count of connections not drawn, and each pair line. */
const flowPicture = (page: Page) => page.evaluate(() => {
  const items = [...document.querySelectorAll<HTMLElement>("#map-container .local-column")].map(wrapper => {
    const item = wrapper.firstElementChild as HTMLElement, rect = wrapper.getBoundingClientRect();
    const reveal = item.querySelector<HTMLElement>(".local-reveal-connections")?.getAttribute("aria-label") ?? "";
    return {
      id: item.dataset.id ?? item.dataset.directory ?? "", box: item.classList.contains("local-directory-closed"), column: Number(wrapper.dataset.column),
      left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, notDrawn: Number(/^\+(\d+)\s/u.exec(reveal)?.[1] ?? 0),
      rows: item.querySelectorAll(".symbol-row:not(.branch-symbol-hidden)").length
    };
  });
  const lines = [...document.querySelectorAll<SVGPathElement>("#map-connections path.connection-path.gathered")].map(path => ({
    provider: path.dataset.targetId ?? "", consumer: path.dataset.sourceId ?? "", links: Number(path.dataset.references), returns: path.classList.contains("back-route"),
    name: path.getAttribute("aria-label") ?? ""
  }));
  return { items, lines, elements: document.querySelectorAll("#map-container *, #map-connections *").length };
});

test("with Opened Directory at Flow, a directory's files stand in the order of use, one line joins each pair, and a card counts only what is not drawn", async ({ page }) => {
  test.setTimeout(120_000);
  // The grid, one choice away: the same directory's cards with no line, each counting every connection it has.
  await page.goto(opened(CLIENT, "grid"));
  await settled(page);
  const grid = await flowPicture(page);
  expect(grid.lines).toHaveLength(0);
  await page.goto(opened(CLIENT, "flow"));
  await settled(page);
  const flow = await flowPicture(page);
  // The same cards and boxes, and no card opens a row for a line: a card stays the closed card it was.
  expect(flow.items.map(item => item.id).sort()).toEqual(grid.items.map(item => item.id).sort());
  expect(flow.items.filter(item => item.rows > 0)).toEqual([]);
  expect(flow.lines.length).toBeGreaterThan(5);
  const at = new Map(flow.items.map(item => [item.id, item]));
  const pairs = new Set<string>();
  for (const line of flow.lines) {
    // One line for a pair, each way, between two cards on screen; none ends on a closed box.
    expect(pairs.has(`${line.provider}\0${line.consumer}`), line.name).toBe(false);
    pairs.add(`${line.provider}\0${line.consumer}`);
    const provider = at.get(line.provider)!, consumer = at.get(line.consumer)!;
    expect(provider.box || consumer.box, line.name).toBe(false);
    expect(line.links, line.name).toBeGreaterThan(0);
    // A file stands left of the files that use it; a pair that returns in a cycle is the one exception, drawn as stubs.
    if (!line.returns) expect(provider.right, line.name).toBeLessThan(consumer.left);
  }
  // A card's count and its lines add up to what the grid's card counted: nothing is dropped and nothing counted twice.
  const before = new Map(grid.items.map(item => [item.id, item.notDrawn]));
  for (const item of flow.items.filter(each => !each.box)) {
    const drawn = flow.lines.filter(line => line.provider === item.id || line.consumer === item.id).reduce((sum, line) => sum + line.links, 0);
    expect(item.notDrawn + drawn, item.id).toBe(before.get(item.id));
  }
  expect(flow.items.some(item => !item.box && item.notDrawn < before.get(item.id)!)).toBe(true);
  expect(Math.max(...before.values())).toBeGreaterThan(0);
  // The closed boxes head their columns, level with one another, a band above the files; the files no line joins stand
  // together after the last file that a line joins.
  const joined = new Set(flow.lines.flatMap(line => [line.provider, line.consumer]));
  const boxes = flow.items.filter(item => item.box), files = flow.items.filter(item => !item.box);
  expect(boxes.length).toBeGreaterThan(2);
  expect(Math.max(...boxes.map(item => item.top)) - Math.min(...boxes.map(item => item.top))).toBeLessThanOrEqual(1);
  for (const item of boxes) for (const file of files.filter(each => each.column === item.column)) expect(item.bottom, `${item.id} above ${file.id}`).toBeLessThanOrEqual(file.top);
  const lastJoined = Math.max(...files.filter(item => joined.has(item.id)).map(item => item.column));
  const loose = files.filter(item => !joined.has(item.id));
  expect(loose.length).toBeGreaterThan(0);
  for (const item of loose) expect(item.column, item.id).toBeGreaterThan(lastJoined);
  // Arrival is still the picture's top left at reading size, and it holds directories and the start of the flow together.
  expect(await page.locator("#map-container").evaluate(map => map.parentElement!.style.transform)).toMatch(/scale\(1\)/u);
  const frame = (await page.locator("#view-map").boundingBox())!;
  const inFrame = (item: { left: number; right: number; top: number; bottom: number }): boolean =>
    item.left >= frame.x && item.right <= frame.x + frame.width && item.top >= frame.y && item.bottom <= frame.y + frame.height;
  expect(boxes.filter(inFrame).length).toBeGreaterThan(0);
  expect(files.filter(item => joined.has(item.id)).filter(inFrame).length).toBeGreaterThan(1);
  await expectNoTextFault(page);
});

test("with Opened Directory at Flow, a card's hover or focus lights its lines and fades the rest, and nothing moves or is added", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto(opened(CLIENT, "flow"));
  await settled(page);
  const before = await flowPicture(page);
  // Of the cards whole in the frame, the one the most lines touch, and which lines and cards are its own.
  const frame = (await page.locator("#view-map").boundingBox())!;
  const count = (id: string): number => before.lines.filter(line => line.provider === id || line.consumer === id).length;
  const subject = before.items
    .filter(item => !item.box && item.left >= frame.x && item.right <= frame.x + frame.width && item.top >= frame.y && item.bottom <= frame.y + frame.height)
    .sort((a, b) => count(b.id) - count(a.id))[0].id;
  const own = before.lines.filter(line => line.provider === subject || line.consumer === subject);
  expect(own.length).toBeGreaterThan(1);
  expect(own.length).toBeLessThan(before.lines.length);
  const neighbours = new Set([subject, ...own.flatMap(line => [line.provider, line.consumer])]);
  const card = page.locator(`#map-container .node-card[data-id="${subject}"]`);
  const state = () => page.evaluate(() => {
    const opacity = (element: Element): number => Number(getComputedStyle(element).opacity);
    return {
      lines: [...document.querySelectorAll<SVGPathElement>("#map-connections path.connection-path.gathered:not(.back-route)")]
        .map(path => ({ provider: path.dataset.targetId ?? "", consumer: path.dataset.sourceId ?? "", opacity: opacity(path) })),
      cards: [...document.querySelectorAll<HTMLElement>("#map-container .node-card")].map(each => ({ id: each.dataset.id ?? "", opacity: opacity(each) })),
      boxes: [...document.querySelectorAll<HTMLElement>("#map-container .local-directory-closed")].map(opacity),
      routes: [...document.querySelectorAll<SVGPathElement>("#map-connections path.back-route")].filter(path => getComputedStyle(path).display !== "none").length
    };
  });
  const rest = await state();
  const touches = (line: { provider: string; consumer: string }): boolean => line.provider === subject || line.consumer === subject;
  const expectLit = async (): Promise<void> => {
    // The fade is a 150 ms transition: wait for it to end, then read.
    await expect.poll(async () => Math.min(...(await state()).lines.filter(line => !touches(line)).map(line => line.opacity))).toBeLessThan(0.2);
    await page.waitForTimeout(250);
    const lit = await state();
    for (const [index, line] of lit.lines.entries()) {
      if (touches(line)) expect(line.opacity, `${line.provider} to ${line.consumer}`).toBe(rest.lines[index].opacity);
      else expect(line.opacity, `${line.provider} to ${line.consumer}`).toBeLessThan(0.2);
    }
    // The cards at the far ends of its lines keep their look, unboosted; every other card and every closed box is faded.
    for (const each of lit.cards) {
      if (neighbours.has(each.id)) expect(each.opacity, each.id).toBe(1);
      else expect(each.opacity, each.id).toBeLessThan(0.8);
    }
    for (const value of lit.boxes) expect(value).toBeLessThan(0.8);
    // Nothing is added, a return's route included, and nothing moves.
    expect(lit.routes).toBe(0);
    const during = await flowPicture(page);
    expect(during.elements).toBe(before.elements);
    expect(during.items).toEqual(before.items);
  };
  const expectRest = async (): Promise<void> => {
    await expect(page.locator("#map-container")).not.toHaveClass(/flow-hover/u);
    await expect.poll(async () => Math.min(...(await state()).cards.map(each => each.opacity))).toBe(1);
    await page.waitForTimeout(250);
    expect(await state()).toEqual(rest);
  };
  await card.locator(".node-path").hover();
  await expectLit();
  // Leaving the card restores every line and card.
  await page.mouse.move(0, 0);
  await expectRest();
  // The keyboard's focus on one of the card's controls does what the pointer does.
  await card.locator(".local-file-name").focus();
  await expectLit();
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  await expectRest();
});

test("Opened Directory defaults to Flow, the grid is chosen in Tuning and travels in the page's link, and a link that says nothing opens in Flow", async ({ page }) => {
  test.setTimeout(120_000);
  const linesOf = (target: Page) => target.locator("#map-connections path.connection-path.gathered");
  const layoutOf = (address: string): Record<string, unknown> | undefined =>
    decompressSnapshot(new URL(address).searchParams.get("s") ?? "").layout?.localMap as Record<string, unknown> | undefined;
  // A directory opened by its address, with nothing saved, stands in Flow: its lines are drawn.
  await page.goto(`/?view=local&dir=${CLIENT}`);
  await settled(page);
  expect(await linesOf(page).count()).toBeGreaterThan(3);
  await page.getByRole("button", { name: /^Layout tuning/ }).click();
  const control = page.locator("#tuning-directory-layout");
  await expect(control).toHaveValue("flow");
  // The default is offered first, the grid one choice away.
  await expect(control.locator("option")).toHaveText([/^Flow/u, /^Grid/u]);
  await control.selectOption("grid");
  await settled(page);
  await expect(linesOf(page)).toHaveCount(0);
  expect(layoutOf(page.url())).toHaveProperty("directoryLayout", "grid");
  const gridLink = page.url();
  // A link made with the default says nothing of it.
  await control.selectOption("flow");
  await settled(page);
  expect(await linesOf(page).count()).toBeGreaterThan(3);
  expect(layoutOf(page.url())).toBeDefined();
  expect(layoutOf(page.url())).not.toHaveProperty("directoryLayout");
  const flowLink = page.url();
  // The grid's link shows the grid to a visitor with no saved choice.
  const fresh = await page.context().browser()!.newContext({ viewport: { width: 1800, height: 1100 } });
  const visitor = await fresh.newPage();
  await visitor.goto(gridLink);
  await settled(visitor);
  await expect(linesOf(visitor)).toHaveCount(0);
  await expect(visitor.locator("#tuning-directory-layout")).toHaveValue("grid");
  // And the link that says nothing shows Flow even there, where the grid was last chosen and is kept for the next visit.
  await visitor.goto(flowLink);
  await settled(visitor);
  expect(await linesOf(visitor).count()).toBe(await linesOf(page).count());
  await expect(visitor.locator("#tuning-directory-layout")).toHaveValue("flow");
  await fresh.close();
});

// How the boxes, the files no line joins and a tall rank stand is the picture's price's to choose, its width set against
// its height (the owner's leave, 2026-11-13): the page prices several shapes and draws the cheapest.
test("with Opened Directory at Flow, the price chooses how a directory stands, Width Cost turns the choice, and the link shows it again", async ({ page }) => {
  test.setTimeout(120_000);
  const LIVE_DOCS_SCRIPTS = "scripts/live-docs";
  const shapeOf = (target: Page) => target.evaluate(() => {
    const root = document.querySelector<HTMLElement>("#map-container .branch-mode")!;
    return {
      shape: JSON.parse(root.dataset.flowShape ?? "null") as unknown,
      priced: JSON.parse(root.dataset.flowShapes ?? "[]") as Array<{ rows: number | null; boxRows: unknown; looseColumns: unknown; price: number }>,
      columns: new Set([...document.querySelectorAll<HTMLElement>("#map-container .local-column")].map(wrapper => wrapper.dataset.column)).size,
      width: document.querySelector<HTMLElement>("#map-container .local-layout")!.offsetWidth
    };
  });
  const layoutOf = (address: string): Record<string, unknown> | undefined =>
    decompressSnapshot(new URL(address).searchParams.get("s") ?? "").layout?.localMap as Record<string, unknown> | undefined;
  await page.goto(opened(LIVE_DOCS_SCRIPTS, "flow"));
  await settled(page);
  const chosen = await shapeOf(page);
  // Several shapes were priced, and the one drawn is the cheapest of them.
  expect(chosen.priced.length).toBeGreaterThan(1);
  const cheapest = chosen.priced.reduce((best, each) => (each.price < best.price ? each : best));
  expect(chosen.shape).toEqual({ rows: cheapest.rows, boxRows: cheapest.boxRows, looseColumns: cheapest.looseColumns });
  // With the width free the same directory stands wider, in more columns.
  await page.getByRole("button", { name: /^Layout tuning/ }).click();
  const lever = page.getByRole("slider", { name: /^Width Cost/ });
  await lever.focus();
  await page.keyboard.press("Home");
  await expect(lever).toHaveValue("0");
  await settled(page);
  const free = await shapeOf(page);
  expect(free.shape).not.toEqual(chosen.shape);
  expect(free.columns).toBeGreaterThan(chosen.columns);
  expect(free.width).toBeGreaterThan(chosen.width);
  // The lever travels in the link, and a visitor with no saved choice is shown the same picture.
  expect(layoutOf(page.url())).toHaveProperty("widthCost", 0);
  const fresh = await page.context().browser()!.newContext({ viewport: { width: 1800, height: 1100 } });
  const visitor = await fresh.newPage();
  await visitor.goto(page.url());
  await settled(visitor);
  const seen = await shapeOf(visitor);
  expect({ shape: seen.shape, columns: seen.columns, width: seen.width }).toEqual({ shape: free.shape, columns: free.columns, width: free.width });
  await fresh.close();
});

// A directory's shape is chosen on the directory alone, its files unpinned on a nominal card model, once for its
// filters and tuning (2026-11-13): a pin prices no shape, and the picture a person pins their way to is the picture its
// link opens on another screen.

/** Each card's and box's column, by id. */
const columnsOf = (target: Page) => target.evaluate(() => Object.fromEntries([...document.querySelectorAll<HTMLElement>("#map-container .local-column")]
  .map(wrapper => [(wrapper.firstElementChild as HTMLElement).dataset.id ?? (wrapper.firstElementChild as HTMLElement).dataset.directory ?? "", Number(wrapper.dataset.column)])));

/** Presses a file's own pin, as a person does, and waits for the picture drawn after it. */
async function pinByHand(page: Page, file: string): Promise<void> {
  const address = page.url();
  await page.locator(`#map-container .node-card[data-id="${file}"] button[aria-label^="Pin "]`).first().evaluate(button => (button as HTMLButtonElement).click());
  await expect.poll(() => page.url(), { message: "the pin is in the page's link" }).not.toBe(address);
  await settled(page);
}

test("with Opened Directory at Flow, a pin in a directory prices no shape and keeps the cards already on screen in their columns", async ({ page }) => {
  test.setTimeout(120_000);
  const LOCAL_VIEW = "packages/explorer/src/client/views/localView";
  await page.goto(opened(LOCAL_VIEW, "flow"));
  await settled(page);
  const root = page.locator("#map-container .branch-mode");
  await expect(root).toHaveAttribute("data-flow-shape-ms", /\d/u);
  const before = await columnsOf(page);
  expect(Object.keys(before).length).toBeGreaterThan(40);
  await pinByHand(page, `${LOCAL_VIEW}/directory-flow.ts`);
  const after = await columnsOf(page);
  expect(Object.keys(after).length).toBeGreaterThan(Object.keys(before).length - 1);
  const moved = Object.keys(before).filter(id => id in after && after[id] !== before[id]);
  expect(moved, "cards that changed column").toEqual([]);
  // The shape chosen for the directory was reused: the pin priced none.
  await expect(root).not.toHaveAttribute("data-flow-shape-ms", /./u);
});

test("with Opened Directory at Flow, the picture pinned by hand and the picture its link opens stand the directory's cards in the same columns", async ({ page }) => {
  test.setTimeout(180_000);
  // The explorer's client: a pin of types.ts brings some forty cards from other directories.
  await page.goto(opened(CLIENT, "flow"));
  await settled(page);
  await pinByHand(page, `${CLIENT}/types.ts`);
  const own = (columns: Record<string, number>): Record<string, number> =>
    Object.fromEntries(Object.entries(columns).filter(([id]) => id.startsWith(`${CLIENT}/`) && !id.slice(CLIENT.length + 1).includes("/")));
  const byHand = own(await columnsOf(page));
  expect(Object.keys(byHand).length).toBeGreaterThan(10);
  const fresh = await page.context().browser()!.newContext({ viewport: { width: 1800, height: 1100 } });
  const visitor = await fresh.newPage();
  await visitor.goto(page.url());
  await settled(visitor);
  const byLink = own(await columnsOf(visitor));
  await fresh.close();
  expect(byLink).toEqual(byHand);
});

test("the nominal file card the shape is chosen on stays near the page's own unpinned card", async ({ page }) => {
  test.setTimeout(120_000);
  // The unpinned cards measured on 2026-11-13 stood 154 to 208 tall (about 15% either side of the nominal 180) and their
  // medians 200 to 311 wide (about 30% either side of the nominal 240): a nominal card further than 20% from the page's
  // median height or 40% from its median width has been left behind by a change to the card.
  await page.goto(opened(CLIENT, "flow"));
  await settled(page);
  const median = await page.evaluate(() => {
    const layout = document.querySelector<HTMLElement>("#map-container .local-layout")!;
    const k = layout.getBoundingClientRect().width / layout.offsetWidth;
    const sizes = [...document.querySelectorAll<HTMLElement>("#map-container .local-column")]
      .filter(wrapper => wrapper.firstElementChild?.classList.contains("branch-member"))
      .map(wrapper => {
        const width = wrapper.style.width;
        wrapper.style.width = "max-content";
        const box = wrapper.getBoundingClientRect();
        wrapper.style.width = width;
        return { width: box.width / k, height: box.height / k };
      });
    const middle = (values: number[]): number => values.sort((a, b) => a - b)[Math.floor(values.length / 2)];
    return { count: sizes.length, width: middle(sizes.map(size => size.width)), height: middle(sizes.map(size => size.height)) };
  });
  expect(median.count).toBeGreaterThan(10);
  expect(Math.abs(NOMINAL_CARD.height - median.height) / median.height, `nominal height ${NOMINAL_CARD.height} against the page's ${median.height}`).toBeLessThanOrEqual(0.2);
  expect(Math.abs(NOMINAL_CARD.width - median.width) / median.width, `nominal width ${NOMINAL_CARD.width} against the page's ${median.width}`).toBeLessThanOrEqual(0.4);
});
