import { expect, test, type Browser, type Page } from "@playwright/test";

import { localMapSettled } from "./still-picture";
import { decompressSnapshot } from "../../packages/explorer/src/client/persistence/compressed-url-state";
import { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } from "../../packages/explorer/src/client/persistence/local-storage";
import { CLOSED_DIRECTORY_LOOKS, type ClosedDirectoryLook } from "../../packages/explorer/src/client/types";

/**
 * The Closed Directory trial (2026-11-13): beside today's box, a skin with cells, a stack and a folded membrane, for the
 * owner to compare by switching ("this thing can pop open and let out a lot of stuff", Turn 7 of the November 13
 * record). Looks only: each choice draws, keeps every box and card exactly where the box keeps them under both this
 * machine's font lines and Segoe UI's, opens by pointer and by keyboard, and is carried by a link only when it is not
 * the box; in the far looks the box's name is held, and the skin's cells are held at the look's scale under it.
 */

/** Segoe UI's line metrics over this machine's fallback face, as zoom-looks.spec.ts draws the owner's screen. */
const SEGOE_LINES = ["400", "700"].map(weight => `@font-face { font-family: "Segoe UI"; font-weight: ${weight}; src: local("DejaVu Sans${weight === "700" ? " Bold" : ""}"); ascent-override: 107.9%; descent-override: 25.1%; line-gap-override: 0%; }`).join(" ");

const SCRIPTS = "scripts";
const DOC_TOOLS = "scripts/doc-tools";

async function still(page: Page): Promise<void> {
  await page.waitForSelector("#map-container .branch-mode", { timeout: 20_000 });
  await localMapSettled(page);
  await page.waitForTimeout(500);
}

/** A fresh visitor with the given look, under this machine's lines or Segoe UI's, at a directory opened by address. */
async function visit(browser: Browser, look: ClosedDirectoryLook, lines: "fallback" | "segoe", directory = SCRIPTS) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await context.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
    key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { searchStarts: 0, closedDirectory: look } } })
  });
  if (lines === "segoe") await context.addInitScript(css => {
    const add = (): void => { const style = document.createElement("style"); style.textContent = css; document.documentElement.appendChild(style); };
    if (document.documentElement) add(); else document.addEventListener("readystatechange", add, { once: true });
  }, SEGOE_LINES);
  const page = await context.newPage();
  await page.goto(`/?view=local&dir=${directory}`);
  await still(page);
  return { context, page };
}

/** Every box and card of the picture, by its directory or file, where the layout put it inside the picture. */
async function placements(page: Page): Promise<Record<string, string>> {
  return page.evaluate(() => {
    const root = document.querySelector<HTMLElement>("#map-container .local-placed")!.getBoundingClientRect();
    const scale = new DOMMatrix(getComputedStyle(document.querySelector("#map-viewport")!).transform).a || 1;
    return Object.fromEntries([...document.querySelectorAll<HTMLElement>("#map-container .local-directory-closed, #map-container .node-card")].map(element => {
      const rect = element.getBoundingClientRect();
      return [element.dataset.directory ?? element.dataset.id ?? "", [rect.x - root.x, rect.y - root.y, rect.width, rect.height].map(value => (value / scale).toFixed(1)).join(" ")];
    }));
  });
}

const box = (page: Page, directory: string) => page.locator(`#map-container .local-directory-closed[data-directory="${directory}"]`);
const closeOf = (page: Page, directory: string) => page.locator(`#map-container .local-directory-label[data-directory="${directory}"] .local-directory-close`);

for (const lines of ["fallback", "segoe"] as const) {
  test(`each Closed Directory look draws, keeps every box and card where the box keeps them, and opens by pointer and keyboard (${lines})`, async ({ browser }) => {
    test.setTimeout(240_000);
    const reference = await visit(browser, "box", lines);
    const expected = await placements(reference.page);
    expect(Object.keys(expected).length).toBeGreaterThan(5);
    await reference.context.close();
    for (const look of CLOSED_DIRECTORY_LOOKS) {
      const { context, page } = await visit(browser, look, lines);
      // No layout number changes: every box and card stands where it stands with the box.
      expect(await placements(page), look).toEqual(expected);
      const target = box(page, DOC_TOOLS);
      if (look === "box") await expect(page.locator("#map-container .local-directory-closed[class*='local-closed--']")).toHaveCount(0);
      else await expect(target).toHaveClass(new RegExp(`local-closed--${look}`));
      if (look === "cells") {
        // A cell for each file directly in it, a small skin for its subdirectory; the counts stay in the hover text and the accessibility tree.
        await expect(target.locator(".local-closed-cells circle.local-cell")).not.toHaveCount(0);
        await expect(target.locator(".local-closed-cells rect.local-cell-skin")).toHaveCount(1);
        await expect(target).toHaveAttribute("title", /scripts\/doc-tools: \d+\sfiles?,\s1\sdirectory/u);
        await expect(target.locator(".local-directory-closed__count")).toHaveText(/files?/u);
      }
      if (look === "stack") {
        await expect(target).toHaveAttribute("data-edges", /^[123]$/u);
        expect(await target.evaluate(element => getComputedStyle(element).boxShadow)).not.toBe("none");
      }
      if (look === "folded") {
        await expect(target.locator(".local-closed-label")).toBeVisible();
        // The disclosure mark stands before the name, More at the right, both on the label's line.
        const [open, label, more] = await Promise.all([".local-directory-open", ".local-closed-label", ".local-directory-actions"].map(async selector => (await target.locator(selector).boundingBox())!));
        expect(open.x + open.width).toBeLessThanOrEqual(label.x + 1);
        expect(more.x).toBeGreaterThan(label.x);
        expect(Math.abs(open.y + open.height / 2 - (more.y + more.height / 2))).toBeLessThan(1);
      }
      // Open keeps its name and its action: by pointer here, by keyboard on a fresh visit.
      await expect(target.getByRole("button", { name: `Open ${DOC_TOOLS}` })).toBeVisible();
      await target.getByRole("button", { name: `Open ${DOC_TOOLS}` }).click();
      await still(page);
      await expect(closeOf(page, DOC_TOOLS)).toBeVisible();
      // A link carries the choice only when it is not the box.
      const carried = decompressSnapshot(new URL(page.url()).searchParams.get("s")!).layout?.localMap?.closedDirectory;
      expect(carried, look).toBe(look === "box" ? undefined : look);
      await context.close();
      const keyboard = await visit(browser, look, lines);
      await box(keyboard.page, DOC_TOOLS).getByRole("button", { name: `Open ${DOC_TOOLS}` }).focus();
      await keyboard.page.keyboard.press("Enter");
      await still(keyboard.page);
      await expect(closeOf(keyboard.page, DOC_TOOLS)).toBeVisible();
      await keyboard.context.close();
    }
  });
}

test("a stack's cards under its top card never reach a neighbouring card or box", async ({ browser }) => {
  test.setTimeout(120_000);
  for (const directory of [SCRIPTS, "packages/explorer/src/client"]) {
    const { context, page } = await visit(browser, "stack", "fallback", directory);
    const touching = await page.evaluate(() => {
      const items = [...document.querySelectorAll<HTMLElement>("#map-container .local-directory-closed, #map-container .node-card")]
        .map(element => ({ element, rect: element.getBoundingClientRect() }));
      const scale = new DOMMatrix(getComputedStyle(document.querySelector("#map-viewport")!).transform).a || 1;
      const found: string[] = [];
      for (const { element, rect } of items) {
        const edges = Number(element.dataset.edges ?? 0);
        if (!edges) continue;
        const reach = { left: rect.left, top: rect.top, right: rect.right + 4 * edges * scale, bottom: rect.bottom + 4 * edges * scale };
        for (const other of items) {
          if (other.element === element) continue;
          const o = other.rect;
          if (reach.left < o.right && o.left < reach.right && reach.top < o.bottom && o.top < reach.bottom) found.push(`${element.dataset.directory} reaches ${other.element.dataset.directory ?? other.element.dataset.id}`);
        }
      }
      return { found, stacks: items.filter(item => item.element.dataset.edges).length };
    });
    expect(touching.stacks, directory).toBeGreaterThan(0);
    expect(touching.found, directory).toEqual([]);
    await context.close();
  }
});

for (const lines of ["fallback", "segoe"] as const) {
  test(`in the far looks each look keeps the box's name held, and the skin holds its cells at the look's scale (${lines})`, async ({ browser }) => {
    test.setTimeout(240_000);
    for (const look of CLOSED_DIRECTORY_LOOKS) {
      const { context, page } = await visit(browser, look, lines);
      for (let press = 0; press < 3; press += 1) {
        await page.getByRole("button", { name: "Zoom Out", exact: true }).click();
        await still(page);
      }
      await expect(page.locator("#map-container")).toHaveAttribute("data-lod", "far");
      const seen = await box(page, "scripts/layout-lab").evaluate(element => {
        const scale = new DOMMatrix(getComputedStyle(document.querySelector("#map-viewport")!).transform).a || 1;
        const held = element.querySelector<HTMLElement>(".local-directory-closed__held")!;
        const style = getComputedStyle(held);
        const line = parseFloat(style.lineHeight) * (new DOMMatrix(style.transform).a || 1) * scale;
        const cells = [...element.querySelectorAll<SVGCircleElement>(".local-cells-look[data-look='connections'] circle.local-cell")]
          .filter(circle => circle.getClientRects().length).map(circle => circle.getBoundingClientRect().width);
        const reading = element.querySelector<SVGElement>(".local-closed-cells");
        return { display: style.display, content: getComputedStyle(held, "::after").content, line, cells, readingShown: reading ? getComputedStyle(reading).visibility === "visible" : false };
      });
      // The name is held at the look's size: at least the reading size's line on screen, drawn by the held element.
      expect(seen.display, look).toBe("block");
      expect(seen.content, look).toContain("layout-lab");
      expect(seen.line, look).toBeGreaterThanOrEqual(14);
      if (look === "cells") {
        // At least a row of cells, each held about as large on screen as at reading size, not the map's sliver.
        expect(seen.cells.length).toBeGreaterThan(2);
        expect(Math.min(...seen.cells)).toBeGreaterThanOrEqual(7);
        expect(seen.readingShown).toBe(false);
      } else expect(seen.cells).toEqual([]);
      await context.close();
    }
  });
}
