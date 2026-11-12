import { expect, test, type Page } from "@playwright/test";

import { describeFaults, overlapsAmong, textBoxes, truncations } from "./design-audit";
import { LOCAL_MAP, localMapSettled, localRetainUrl } from "./still-picture";
import { compressSnapshot, decompressSnapshot, DEFAULT_SNAPSHOT } from "../../packages/explorer/src/client/persistence/compressed-url-state";

/**
 * Directories open and close inside the Local Map (the owner's grammar,
 * 2026-10-08). A directory has three states on one scale: closed, a box
 * without symbols standing in for everything under it; encasing, the
 * membrane around the files party to the wires, the rest counted on its
 * label; open, every file inside as a compact card and every subdirectory as
 * a closed box. Names inspect; explicit Open controls disclose contents,
 * the X closes as far as pins allow, and no wire reaches a closed box.
 */

const ENGINE = "packages/engine/src";
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

test("a closed box opens in place, the membrane growing from the box while the picture moves, and its X closes it back to a box", async ({ page }) => {
  await page.goto(`/?view=local&dir=${ENGINE}`);
  await settled(page);
  const before = (await box(page, LIVE_DOCS).boundingBox())!;
  const moveStarted = page.waitForFunction(() => document.querySelector<HTMLElement>("#map-container .local-placed")?.dataset.moving === "true", undefined, { timeout: 5_000 });
  await box(page, LIVE_DOCS).locator(".local-directory-open").click();
  await moveStarted;
  // Early in the move the new membrane stands where the box stood, no wider than the box was, and grows from there.
  const early = (await page.locator(`#map-container .local-directory-band[data-directory="${LIVE_DOCS}"]`).boundingBox())!;
  expect(Math.abs(early.x - before.x)).toBeLessThan(40);
  expect(Math.abs(early.y - before.y)).toBeLessThan(40);
  await settled(page);
  const after = (await page.locator(`#map-container .local-directory-band[data-directory="${LIVE_DOCS}"]`).boundingBox())!;
  expect(after.width).toBeGreaterThan(early.width);
  expect(after.height).toBeGreaterThan(early.height);
  // Open: its files compact, its subdirectories closed boxes, the parent's other boxes still boxes, and still no wire.
  await expect(box(page, LIVE_DOCS)).toHaveCount(0);
  await expect(box(page, `${LIVE_DOCS}/adapters`)).toBeVisible();
  await expect(box(page, `${LIVE_DOCS}/heuristics`)).toBeVisible();
  await expect(box(page, `${ENGINE}/config`)).toBeVisible();
  const compact = await cards(page).count();
  expect(compact).toBeGreaterThan(20);
  await expect(page.locator("#map-container .node-card .symbol-row:not(.branch-symbol-hidden)")).toHaveCount(0);
  await expect(wires(page)).toHaveCount(0);
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
  const opened = (await label(page, LIVE_DOCS).boundingBox())!;
  const frame = (await page.locator("#view-map").boundingBox())!;
  expect(opened.x).toBeGreaterThanOrEqual(frame.x);
  expect(opened.y).toBeGreaterThanOrEqual(frame.y);
  expect(opened.x + opened.width).toBeLessThanOrEqual(frame.x + frame.width);
  expect(opened.y + opened.height).toBeLessThanOrEqual(frame.y + frame.height);
  await expect(label(page, LIVE_DOCS).locator(".local-directory-close")).toBeInViewport();
  await label(page, LIVE_DOCS).locator(".local-directory-close").click();
  await settled(page);
  await expect(box(page, LIVE_DOCS)).toBeVisible();
  await expect(cards(page)).toHaveCount(0);
  await expect(page.locator("#map-container .local-directory-closed")).toHaveCount(4);
});

test("an encasing membrane counts what it hides, Open discloses it around pinned files, and no wire reaches a closed box", async ({ page }) => {
  const graph = `${LIVE_DOCS}/graph.ts`;
  const builder = "packages/explorer/src/shared/staticBuilder.ts";
  await page.goto(localRetainUrl("/", [graph, builder]));
  await settled(page);
  await page.waitForSelector("#map-connections .connection-path:not(.bundle-run)", { state: "attached" });
  const drawn = await wires(page).count();
  expect(drawn).toBeGreaterThan(0);
  // The live-docs membrane encases graph.ts and whatever its pins reach; the rest of its files and its two subdirectories are counted, and no X shows.
  const more = label(page, LIVE_DOCS).locator(".local-directory-more");
  await expect(more).toHaveText(/^\+\d+\sfiles, 2\sdirectories$/);
  await expect(label(page, LIVE_DOCS).locator(".local-directory-close")).toHaveCount(0);
  const partyCards = await cards(page).count();
  // The map does not scroll and the encased picture may be wider than the frame, with its label under the sidebar, so
  // the click is dispatched to Open rather than aimed at the frame, as the member's Pin and the X are below.
  await label(page, LIVE_DOCS).locator(".local-directory-open").evaluate(button => (button as HTMLButtonElement).click());
  await settled(page);
  // Open: every file of live-docs is drawn, the ones not party compact and unwired, and its subdirectories are boxes; the wires are the same.
  await expect(label(page, LIVE_DOCS).locator(".local-directory-close")).toBeVisible();
  await expect(more).toHaveCount(0);
  expect(await cards(page).count()).toBeGreaterThan(partyCards);
  await expect(page.locator("#map-container .node-card.branch-member .symbol-row:not(.branch-symbol-hidden)")).toHaveCount(0);
  await expect(wires(page)).toHaveCount(drawn);
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

// ─── The directory flow trial (Tuning → 2D Layout → Opened Directory, 2026-11-12) ───────────────────────────────────────
// A newcomer opened three directories, saw cards and no line, and concluded that the map draws no connections (the
// first-visit review of 2026-11-12, finding 3). The trial, beside the grid above, which stays the default: an opened
// directory's files stand in the order the code flows, one line joins each pair of cards where one uses the other, a
// card counts only what is not drawn, and a card's hover lights its lines and fades the rest.

const CLIENT = "packages/explorer/src/client";

/** The page's link for a directory opened with nothing pinned, with the trial's layout or, without one, as any link was before the trial. */
const opened = (directory: string, layout?: "flow"): string => `/?s=${compressSnapshot({
  ...DEFAULT_SNAPSHOT, view: "map", perspective: "2d", openDirectories: new Set([directory]),
  ...(layout ? { layout: { localMap: { directoryLayout: layout } } } : {})
})}`;

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
  // The grid, the default: the same directory's cards with no line, each counting every connection it has.
  await page.goto(opened(CLIENT));
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

test("Opened Directory is chosen in Tuning, travels in the page's link, and a link made with it off carries nothing of it", async ({ page }) => {
  test.setTimeout(120_000);
  const linesOf = (target: Page) => target.locator("#map-connections path.connection-path.gathered");
  const layoutOf = (address: string): Record<string, unknown> | undefined =>
    decompressSnapshot(new URL(address).searchParams.get("s") ?? "").layout?.localMap as Record<string, unknown> | undefined;
  await page.goto(`/?view=local&dir=${CLIENT}`);
  await settled(page);
  await expect(linesOf(page)).toHaveCount(0);
  await page.getByRole("button", { name: /^Layout tuning/ }).click();
  const control = page.locator("#tuning-directory-layout");
  await expect(control).toHaveValue("grid");
  await expect(control.locator("option")).toHaveCount(2);
  await control.selectOption("flow");
  await settled(page);
  expect(await linesOf(page).count()).toBeGreaterThan(3);
  expect(layoutOf(page.url())).toHaveProperty("directoryLayout", "flow");
  // A link made with the trial off says nothing of it: it is the link it was before the trial.
  await control.selectOption("grid");
  await settled(page);
  await expect(linesOf(page)).toHaveCount(0);
  expect(layoutOf(page.url())).toBeDefined();
  expect(layoutOf(page.url())).not.toHaveProperty("directoryLayout");
  const off = page.url();
  await control.selectOption("flow");
  await settled(page);
  // The link shows the trial to a visitor with no saved choice.
  const fresh = await page.context().browser()!.newContext({ viewport: { width: 1800, height: 1100 } });
  const visitor = await fresh.newPage();
  await visitor.goto(page.url());
  await settled(visitor);
  expect(await linesOf(visitor).count()).toBe(await linesOf(page).count());
  await expect(visitor.locator("#tuning-directory-layout")).toHaveValue("flow");
  await fresh.close();
  // The link made with the trial off shows the grid even here, where the trial was last chosen and is kept for the next visit.
  await page.goto(off);
  await settled(page);
  await expect(linesOf(page)).toHaveCount(0);
  await expect(page.locator("#tuning-directory-layout")).toHaveValue("grid");
});
