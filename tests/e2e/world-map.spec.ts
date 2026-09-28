import { test, expect, type Page } from "@playwright/test";

/**
 * The World Map, over this repository's own board.
 *
 * The bundle under test is built with `npm run live-docs:visualize`, which
 * carries `.mdmd/layer-3/board.mdmd.md`. These specs drive the view through
 * the handle it leaves at `window.__worldMap`, so they test what is drawn and
 * what a person can do, not pixels.
 */

interface WorldMapHandle {
  ready: boolean;
  instant: (value: boolean) => void;
  pieces: () => string[];
  roads: () => string[];
  hover: (kind: string | null, id?: string) => void;
  pin: (kind: string, id: string) => void;
  unpin: () => void;
  move: (name: string, x: number, y: number) => void;
  reset: () => void;
  boardText: () => string;
  state: () => { theta: number; phi: number; k: number; positions: Record<string, [number, number]>; pinned: { kind: string; id: string } | null };
  rotate: (quarters?: number) => Promise<void>;
  tilt: () => Promise<void>;
  screenPointOf: (name: string) => [number, number];
}

declare global {
  interface Window {
    __worldMap?: WorldMapHandle;
  }
}

async function openWorldMap(page: Page): Promise<void> {
  await page.goto("/?view=world");
  await page.waitForFunction(() => window.__worldMap?.ready === true, null, { timeout: 20_000 });
  await page.evaluate(() => {
    window.__worldMap!.instant(true);
    window.localStorage.clear();
    window.__worldMap!.reset();
  });
}

test.describe("World Map", () => {
  test("opens on the board and draws its things, regions and wires", async ({ page }) => {
    await openWorldMap(page);
    const pieces = await page.evaluate(() => window.__worldMap!.pieces());
    expect(pieces).toContain("engine");
    expect(pieces).toContain("scripts");
    expect(await page.locator("#view-world .w-piece").count()).toBe(pieces.length);
    expect(await page.locator("#view-world .w-region").count()).toBeGreaterThan(0);
    expect(await page.locator("#view-world .w-road-group").count()).toBeGreaterThan(0);
    await expect(page.locator("#view-world .world-crumbs")).toContainText("Live Documentation");
  });

  test("shows a thing's facts on hover and pins them on click", async ({ page }) => {
    await openWorldMap(page);
    await page.evaluate(() => window.__worldMap!.hover("piece", "engine"));
    const evidence = page.locator("#view-world .world-evidence");
    await expect(evidence).toBeVisible();
    await expect(evidence).toContainText("engine");
    await expect(evidence).toContainText("files");
    await page.evaluate(() => window.__worldMap!.pin("piece", "scripts"));
    await expect(evidence).toHaveClass(/pinned/);
    await expect(evidence).toContainText("scripts");
    await page.evaluate(() => window.__worldMap!.unpin());
    expect(await page.evaluate(() => window.__worldMap!.state().pinned)).toBeNull();
  });

  test("shows how a wire is known", async ({ page }) => {
    await openWorldMap(page);
    const road = await page.evaluate(() => window.__worldMap!.roads().find((id) => id.startsWith("scripts>engine")));
    expect(road).toBeDefined();
    await page.evaluate((id) => window.__worldMap!.hover("road", id), road!);
    const evidence = page.locator("#view-world .world-evidence");
    await expect(evidence).toContainText("scripts uses engine");
    await expect(evidence).toContainText("from source");
  });

  test("keeps a moved thing where it was put and writes it into the board text", async ({ page }) => {
    await openWorldMap(page);
    const before = await page.evaluate(() => window.__worldMap!.state().positions.engine);
    await page.evaluate(() => window.__worldMap!.move("engine", 12.5, 9));
    const after = await page.evaluate(() => window.__worldMap!.state().positions.engine);
    expect(after).toEqual([12.5, 9]);
    expect(after).not.toEqual(before);
    const text = await page.evaluate(() => window.__worldMap!.boardText());
    expect(text).toContain("- `engine` at 12.5, 9");
    expect(text).toContain("## Layout");
    await page.reload();
    await page.waitForFunction(() => window.__worldMap?.ready === true, null, { timeout: 20_000 });
    expect(await page.evaluate(() => window.__worldMap!.state().positions.engine)).toEqual([12.5, 9]);
  });

  test("turns and looks down without anything on the board changing size", async ({ page }) => {
    await openWorldMap(page);
    const k0 = await page.evaluate(() => window.__worldMap!.state().k);
    await page.evaluate(() => window.__worldMap!.rotate(1));
    const turned = await page.evaluate(() => window.__worldMap!.state());
    expect(turned.theta).toBeCloseTo(Math.PI / 2, 5);
    expect(turned.k).toBeCloseTo(k0, 5);
    await page.evaluate(() => window.__worldMap!.tilt());
    const down = await page.evaluate(() => window.__worldMap!.state());
    expect(down.phi).toBeCloseTo(Math.PI / 2, 5);
    const fontSize = await page.locator("#view-world text.w-zone").first().evaluate((node) => getComputedStyle(node).fontSize);
    expect(fontSize).toBe("11px");
  });

  test("drags a thing with the pointer", async ({ page }) => {
    await openWorldMap(page);
    const [sx, sy] = await page.evaluate(() => window.__worldMap!.screenPointOf("cli"));
    const before = await page.evaluate(() => window.__worldMap!.state().positions.cli);
    await page.mouse.move(sx, sy);
    await page.mouse.down();
    await page.mouse.move(sx + 60, sy + 30, { steps: 6 });
    await page.mouse.up();
    const after = await page.evaluate(() => window.__worldMap!.state().positions.cli);
    expect(after).not.toEqual(before);
  });
});
