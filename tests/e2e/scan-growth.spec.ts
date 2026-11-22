import { expect, test, type Page } from "@playwright/test";

import { compressSnapshot, decompressSnapshot, DEFAULT_SNAPSHOT } from "../../packages/explorer/src/client/persistence/compressed-url-state";
import type { ScanGrowth, ScanPace } from "../../packages/explorer/src/client/types";
import { describeFaults, overlapsAmong, textBoxes, truncations } from "./design-audit";
import { observeGraph, renderedNodes } from "./force-graph-observation";

/**
 * The scan trial of the 3D Local Map (Tuning's Scan Growth, off by default; the owner's wish of 2026-11-21, to explore
 * the map "_while the scan is happening_"): opened with nothing asked about, the map waits as a scan waits, with no
 * file, then fills with the finished graph's files in a scan's rhythm until it is the picture the lever's off value
 * shows; a sign says the two phases in the owner's words; and a press made while it fills pins the sphere pressed,
 * since the building rule that refuses the pointer is suspended for the length of a scan. What happened and in what
 * order is asserted, never how long it took.
 */
test.use({ viewport: { width: 1440, height: 900 } });

const entry = (base: string, growth: ScanGrowth, pace: ScanPace = "measured"): string => `${base}?s=${compressSnapshot({
  ...DEFAULT_SNAPSHOT, perspective: "3d", spatialLayout: "connections",
  ...(growth === "off" ? {} : { layout: { forceGraph: { scanGrowth: growth, ...(pace === "measured" ? {} : { scanPace: pace }) } } })
})}`;

interface Seen { words: string | null; scan: string | null; arrived: number | null; held: number | null; building: string | null }

/** Record, at every frame that differs from the last, what the scan's sign says, its phase, and the files the picture holds. */
async function watchScan(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const log: Seen[] = [];
    (window as unknown as { scanLog: Seen[] }).scanLog = log;
    let last = "";
    const read = (): void => {
      const map = document.getElementById("graph-svg"), view = document.getElementById("view-graph");
      const sign = document.querySelector<HTMLElement>(".scan-progress");
      const held = /of ([\d,]+) files shown/.exec(document.getElementById("stats-line")?.textContent ?? "");
      const seen: Seen = { words: sign && !sign.hidden ? sign.textContent : null, scan: view?.dataset.scan ?? null,
        arrived: map?.dataset.scanArrived === undefined ? null : Number(map.dataset.scanArrived),
        held: held ? Number(held[1].replace(/,/g, "")) : null, building: map?.dataset.building ?? null };
      const key = JSON.stringify(seen);
      if (key !== last) { last = key; log.push(seen); }
      requestAnimationFrame(read);
    };
    requestAnimationFrame(read);
  });
}

const scanLog = (page: Page): Promise<Seen[]> => page.evaluate(() => (window as unknown as { scanLog: Seen[] }).scanLog);
const map = (page: Page) => page.locator("#graph-svg");
const pins = (page: Page): string[] => decompressSnapshot(new URL(page.url()).searchParams.get("s")!).pinSet.entries.map(pin => pin.nodeId).sort();

/** The picture at rest: the spheres drawn, by id, and the sidebar's counts. */
async function atRest(page: Page): Promise<{ ids: string[]; stats: string }> {
  await expect(map(page)).toHaveAttribute("aria-busy", "false", { timeout: 120_000 });
  return { ids: (await renderedNodes(page)).map(node => node.id).sort(), stats: (await page.locator("#stats-line").textContent()) ?? "" };
}

test("off, the map opens as it did: no sign, no scan, and nothing of the trial in the address", async ({ page }) => {
  await observeGraph(page);
  await watchScan(page);
  await page.goto(entry("/samples/estate/", "off"));
  const rest = await atRest(page);
  expect(rest.ids.length, "the estate's archipelago is drawn").toBeGreaterThan(0);
  const log = await scanLog(page);
  expect(log.filter(seen => seen.words !== null || seen.scan !== null || seen.arrived !== null), "nothing of a scan was shown at any frame").toEqual([]);
  await expect(page.locator(".scan-progress")).toBeHidden();
  expect(await map(page).getAttribute("data-layout-settings"), "the layout settings a link would carry say nothing of the trial").not.toMatch(/scan/i);
  await expect(page.locator("#tuning-force-scan-growth")).toHaveValue("off");
  await expect(page.locator("#tuning-force-scan-pace")).toHaveValue("measured");
});

for (const pace of ["measured", "slower"] as const) {
  test(`on, in path order at the ${pace} pace: the sign lists, then reads; the files held only rise; and the picture ends as off shows it`, async ({ page, browser }) => {
    test.setTimeout(180_000);
    // What off shows, in a page of its own.
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const offPage = await context.newPage();
    await observeGraph(offPage);
    await offPage.goto(entry("/samples/estate/", "off"));
    const off = await atRest(offPage);
    await context.close();

    await observeGraph(page);
    await watchScan(page);
    await page.goto(entry("/samples/estate/", "path", pace));
    // The scan has played once its sign has been shown and is gone.
    await expect.poll(async () => { const log = await scanLog(page); return log.some(seen => seen.scan !== null) && log.at(-1)!.scan === null; },
      { timeout: 120_000, message: "the scan played to its end" }).toBe(true);
    const on = await atRest(page);
    const log = await scanLog(page);

    // The sign: the listing with its count, then the reading with its two counts, never the listing again.
    const words = log.map(seen => seen.words).filter((said): said is string => said !== null);
    expect(words[0], "the sign begins with the listing").toMatch(/^Listing Files… \(\d[\d,]*\)$/);
    const firstReading = words.findIndex(said => said.startsWith("Reading"));
    expect(firstReading, "the reading follows the listing").toBeGreaterThan(0);
    for (const said of words.slice(0, firstReading)) expect(said).toMatch(/^Listing Files… \(\d[\d,]*\)$/);
    for (const said of words.slice(firstReading)) expect(said).toMatch(/^Reading File Text… \(\d[\d,]*\/\d[\d,]*\)$/);
    const count = (said: string): number => Number(/\((\d[\d,]*)/.exec(said)![1].replace(/,/g, ""));
    const listed = words.slice(0, firstReading).map(count), read = words.slice(firstReading).map(count);
    expect(listed, "the listing counts up").toEqual([...listed].sort((a, b) => a - b));
    expect(read[0], "the first pass finishes no file").toBe(0);
    expect(read, "the reading counts up").toEqual([...read].sort((a, b) => a - b));
    // The estate's 36 files arrive within a third of a second at the measured pace, which the page may take in one
    // cut; at the slower pace they are seen to arrive at several moments.
    expect(new Set(read).size, "the reading's count moved").toBeGreaterThan(pace === "slower" ? 2 : 1);

    // The picture: no file while the scan lists and through the first pass; then the files it holds only rise.
    const during = log.filter(seen => seen.scan !== null);
    expect(during.filter(seen => seen.scan === "listing").every(seen => seen.arrived === 0 || seen.arrived === null), "no file while the folder is listed").toBe(true);
    const arrived = during.map(seen => seen.arrived).filter((files): files is number => files !== null);
    expect(arrived, "the files fed to the picture only rise").toEqual([...arrived].sort((a, b) => a - b));
    const held = during.map(seen => seen.held).filter((files): files is number => files !== null);
    expect(held, "the files the picture holds only rise").toEqual([...held].sort((a, b) => a - b));
    expect(held[0], "the picture begins empty").toBe(0);
    expect(during.every(seen => seen.building === null), "the map never says it is building while a scan fills it").toBe(true);

    // The end: the sign gone, and the picture the one off shows.
    await expect(page.locator(".scan-progress")).toBeHidden();
    expect(await map(page).getAttribute("data-scan-arrived")).toBeNull();
    expect(on.ids, "the same spheres as off").toEqual(off.ids);
    expect(on.stats, "the same counts as off").toBe(off.stats);
  });
}

test("a press made while this repository's map fills pins the sphere pressed, and the scan goes on", async ({ page }) => {
  test.setTimeout(240_000);
  await observeGraph(page);
  await watchScan(page);
  await page.goto(entry("/", "path"));
  await expect.poll(async () => Number(await map(page).getAttribute("data-scan-arrived") ?? 0), { timeout: 120_000, intervals: [50] }).toBeGreaterThan(60);
  // The largest sphere standing over the bare canvas, pressed where it stands now.
  const spheres = (await renderedNodes(page)).filter(sphere => sphere.depth > -1 && sphere.depth < 1).sort((a, b) => b.screenRadius - a.screenRadius);
  const open = await page.evaluate(points => points.map(({ x, y }) => document.elementFromPoint(x, y) === document.querySelector("#graph-svg canvas")),
    spheres.map(sphere => ({ x: sphere.x, y: sphere.y })));
  const target = spheres.find((_, index) => open[index])!;
  expect(target, "a sphere stands over the bare canvas while the map fills").toBeDefined();
  await page.mouse.move(target.x, target.y);
  await page.mouse.down(); await page.mouse.up();
  await expect.poll(() => pins(page), { message: "the press pinned a sphere" }).toHaveLength(1);
  const [pinned] = pins(page);
  const before = await scanLog(page);
  expect(before.at(-1)!.scan, "the scan is still under way when the pin stands").toBe("reading");
  expect(before.every(seen => seen.building === null), "the map did not say it was building, before the press or at it").toBe(true);
  // What was pinned is a sphere that stood within the press's reach: the one read, or one that had slid under the pointer.
  expect(spheres.map(sphere => sphere.id), "the pinned file was a sphere of the picture pressed").toContain(pinned);
  // The design audit over the sign while the map fills, a pin's name on screen: the sign's words are whole, and no
  // name stands on them or they on a name.
  const cut = await truncations(page, [".scan-progress"]);
  const boxes = await textBoxes(page, [".scan-progress", ".force-graph-label", ".force-graph-focus"]);
  expect(boxes.some(box => box.text.startsWith("Reading File Text…")), "the sign is among the words audited").toBe(true);
  const collisions = overlapsAmong(boxes).filter(overlap => [overlap.a, overlap.b].some(box => box.text.startsWith("Reading File Text…")));
  expect(describeFaults(collisions, cut), "the sign is whole and clear of every name").toBe("no faults");
  // The scan goes on to its end around the pin, and the pin holds.
  await expect.poll(async () => (await scanLog(page)).at(-1)!.scan, { timeout: 180_000, message: "the scan played to its end" }).toBeNull();
  const after = (await scanLog(page)).slice(before.length).map(seen => seen.arrived).filter((files): files is number => files !== null);
  expect(after.length, "files went on arriving after the press").toBeGreaterThan(0);
  expect(after, "and only rose").toEqual([...after].sort((a, b) => a - b));
  expect(pins(page), "the pin holds at the scan's end").toEqual([pinned]);
});

test("first-commit order is offered only where the bundle carries a history, and says why where it does not", async ({ page }) => {
  await page.goto(entry("/samples/estate/", "off"));
  const lever = page.locator("#tuning-force-scan-growth");
  // An option of a closed list is read by its own property: Playwright's `toBeDisabled` answers for controls.
  await expect(lever.locator('option[value="first-commit"]')).toHaveJSProperty("disabled", true);
  await expect(lever).toHaveAttribute("title", /needs a history, which this map does not carry\.$/);
  await expect(page.locator("#tuning-force-scan-growth-help")).toHaveText(/needs a history, which this map does not carry\.$/);
  await page.goto(entry("/samples/history/", "off"));
  await expect(page.locator('#tuning-force-scan-growth option[value="first-commit"]')).toHaveJSProperty("disabled", false);
  await expect(page.locator("#tuning-force-scan-growth")).not.toHaveAttribute("title", /needs a history/);
});
