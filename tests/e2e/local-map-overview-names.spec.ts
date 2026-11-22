import { expect, test, type Page } from "@playwright/test";

import { compressSnapshot, DEFAULT_SNAPSHOT } from "../../packages/explorer/src/client/persistence/compressed-url-state";
import { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } from "../../packages/explorer/src/client/persistence/local-storage";
import { AT_READING_SIZE, localMapStill } from "./still-picture";

/**
 * A file's name in the overview look of a card that keeps its size (2026-11-15): read from its drawn lines, it is not
 * broken inside a word while a smaller size, down to the connections look's, would keep its pieces whole. The fitting is
 * the one files only has used since 2026-11-13 (`overview-files.ts`'s filesNameScale). This spec was written with a
 * second answer to the blank overview card, each silent row drawn as a faint bar, which the owner's eye and a comparison
 * with files only did not choose; its two cases went with the bars, and files only became the default, so this case
 * chooses "Cards keep their size".
 */
// A file of this repository whose neighbours' cards are narrow beside their names' longest words.
const narrowNames = "packages/explorer/src/client/types.ts";

test.use({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });

async function zoomOut(page: Page, presses: number): Promise<void> {
  for (let press = 0; press < presses; press += 1) {
    await page.getByRole("button", { name: "Zoom Out", exact: true }).click();
    await localMapStill(page);
  }
  // A change of look fades over 160 ms.
  await page.waitForFunction(() => document.getAnimations().every(animation => animation.playState !== "running"));
  await page.waitForTimeout(250);
}

/**
 * The audit's own word on where a held name may break, independent of the code under test, as zoom-looks.spec.ts and
 * card-ladder-boxes.spec.ts word it: after a hyphen; after a dot, unless what follows it is a short extension of one or
 * two characters, which stays with its dot; before such a dot; and before a capital that follows a small letter.
 */
function seamSegments(name: string): string[] {
  const cuts = new Set<number>();
  const shortExtension = /\.[^.-]{1,2}$/u.exec(name);
  for (let at = 1; at < name.length; at++) {
    const before = name[at - 1], here = name[at];
    if (before === "-") cuts.add(at);
    if (before === "." && !(shortExtension && at - 1 === shortExtension.index)) cuts.add(at);
    if (shortExtension && at === shortExtension.index) cuts.add(at);
    if (/\p{Ll}/u.test(before) && /\p{Lu}/u.test(here)) cuts.add(at);
  }
  const segments: string[] = [];
  let start = 0;
  for (const cut of [...cuts].sort((a, b) => a - b)) { segments.push(name.slice(start, cut)); start = cut; }
  segments.push(name.slice(start));
  return segments.filter(segment => segment);
}

test("in the overview look a file's name is not broken inside a word while a smaller size, down to the connections look's, keeps its pieces whole", async ({ page }) => {
  test.setTimeout(120_000);
  await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
    key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { ...AT_READING_SIZE, searchStarts: 0, overviewFiles: "keep" } } })
  });
  await page.goto(`/?s=${compressSnapshot({ ...DEFAULT_SNAPSHOT, view: "map", perspective: "2d", selectedNodeId: narrowNames, pinSet: { entries: [{ nodeId: narrowNames, symbol: "*" }] } })}`);
  await page.locator(`.node-card[data-id="${narrowNames}"]`).waitFor({ timeout: 60_000 });
  await localMapStill(page);
  await page.mouse.move(700, 880);
  await zoomOut(page, 7);
  await expect(page.locator("#map-container")).toHaveAttribute("data-look", "overview");
  await expect(page.locator("#map-container")).not.toHaveAttribute("data-overview-files", /.*/u);
  const names = await page.evaluate(() => {
    const canvas = document.createElement("canvas").getContext("2d")!;
    return [...document.querySelectorAll<HTMLElement>("#map-container .local-slot-card .local-file-name-held")].map(held => {
      const content = getComputedStyle(held, "::after").content, style = getComputedStyle(held);
      canvas.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      const name = held.dataset.name ?? "";
      return { name, lines: content.startsWith("\"") ? content.slice(1, -1).replace(/\\a ?/gu, "\n").replace(/\\(.)/gu, "$1").split("\n") : [],
        // The scale the name is drawn at, in the map's own units, and the room across it has at that scale.
        scale: new DOMMatrix(style.transform).a, room: held.clientWidth, widths: [...name].map((_, at) => canvas.measureText(name.slice(0, at + 1)).width) };
    });
  });
  expect(names.length).toBeGreaterThan(5);
  const LOOK = 3.6, FLOOR = 2.2;
  const fitted: string[] = [];
  for (const { name, lines, scale, room, widths } of names) {
    const segments = seamSegments(name), width = (from: number, to: number): number => widths[to - 1] - (from ? widths[from - 1] : 0);
    let at = 0;
    const seams = new Set<number>(), spans: [number, number][] = [];
    for (const segment of segments) { seams.add(at); spans.push([at, at + segment.length]); at += segment.length; }
    const widest = Math.max(...spans.map(([from, to]) => width(from, to)));
    expect.soft(scale, `${name}: held no larger than the look's size`).toBeLessThanOrEqual(LOOK + 0.01);
    expect.soft(scale, `${name}: held no smaller than the connections look's`).toBeGreaterThanOrEqual(FLOOR - 0.01);
    // A name drawn below the look's size whose widest word would not fit across at the look's size: fitted. (A name
    // may also be smaller because its room is short, which this case does not judge.)
    if (scale < LOOK - 0.01 && widest * LOOK / scale > room + 0.5) fitted.push(name);
    let end = 0;
    for (const line of lines.slice(0, -1)) {
      end += line.length;
      if (seams.has(end)) continue;
      // A line that ends inside a word: only at the floor, where the word is wider than a line even there.
      expect.soft(scale, `${name}: "${line}" ends inside a word while a smaller size would keep it whole`).toBeLessThanOrEqual(FLOOR + 0.01);
    }
  }
  expect(fitted.length, "this picture has names whose widest word needs a smaller size than the look's").toBeGreaterThan(0);
});
