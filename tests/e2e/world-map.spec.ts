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
    await expect(evidence).toContainText("scripts stands on engine");
    await expect(evidence).toContainText("from source");
    await expect(evidence).toContainText("no call crosses this");
  });

  test("pins a thing on a click, and the pinned panel links its files to the Local Map", async ({ page }) => {
    await openWorldMap(page);
    const [sx, sy] = await page.evaluate(() => window.__worldMap!.screenPointOf("engine"));
    await page.mouse.click(sx, sy);
    const evidence = page.locator("#view-world .world-evidence");
    await expect(evidence).toHaveClass(/pinned/);
    await expect(evidence).toContainText("engine");
    expect(await page.evaluate(() => window.__worldMap!.state().pinned)).toEqual({ kind: "piece", id: "engine" });
    const link = evidence.locator("a[data-file]").first();
    await expect(link).toHaveAttribute("href", /view=local&node=/);
    const file = await link.getAttribute("data-file");
    expect(file).toMatch(/^packages\/engine\//u);
    await link.click();
    await expect(page.locator("#view-map.active")).toHaveCount(1);
    await expect.poll(() => new URL(page.url()).searchParams.get("node")).toBe(file);
  });

  test("a name in the pinned panel pins the thing it names, and a click on the board lets go", async ({ page }) => {
    await openWorldMap(page);
    await page.evaluate(() => window.__worldMap!.pin("piece", "scripts"));
    const evidence = page.locator("#view-world .world-evidence");
    await evidence.locator("a[data-pin-id='engine']").first().click();
    expect(await page.evaluate(() => window.__worldMap!.state().pinned)).toEqual({ kind: "piece", id: "engine" });
    await expect(evidence).toContainText("under");
    const box = (await page.locator("#view-world svg.world-svg").boundingBox())!;
    await page.mouse.click(box.x + 8, box.y + box.height - 8);
    expect(await page.evaluate(() => window.__worldMap!.state().pinned)).toBeNull();
  });

  test("orbits the way the force graph does: drag right and the camera turns left, drag down and it rises", async ({ page }) => {
    await openWorldMap(page);
    const before = await page.evaluate(() => window.__worldMap!.state());
    const box = (await page.locator("#view-world svg.world-svg").boundingBox())!;
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    await page.mouse.move(cx, cy);
    await page.mouse.down({ button: "right" });
    await page.mouse.move(cx + 60, cy + 60, { steps: 4 });
    await page.mouse.up({ button: "right" });
    const after = await page.evaluate(() => window.__worldMap!.state());
    expect(after.theta).toBeLessThan(before.theta);
    expect(after.phi).toBeGreaterThan(before.phi);
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
