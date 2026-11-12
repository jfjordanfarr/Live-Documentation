import { test, expect, type Page } from "@playwright/test";

import { outlines, textOverShapes, type TextBox } from "./design-audit";
import { currentSnapshot } from "./search-bar";

/**
 * The World Map, over this repository's own board.
 *
 * The bundle under test is built with `npm run live-docs:visualize`, which
 * carries `.mdmd/layer-3/board.mdmd.md`. These specs drive the view through
 * the handle it leaves at `window.__worldMap`, so they test what is drawn and
 * what a person can do, not pixels.
 */

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
    await expect(page.locator("#view-world .world-crumbs")).not.toContainText("wanting");
  });

  test("draws an imagined thing hollow, with its kind under its name and no word for its state", async ({ page }) => {
    await openWorldMap(page);
    // The board imagines the package, the action, the panel, the three workflows, the site and the registry.
    await expect(page.locator("#view-world .w-piece.imagined")).toHaveCount(8);
    const faces = page.locator('#view-world .w-piece[data-piece="live-docs"] .w-face.imagined');
    expect(await faces.count()).toBeGreaterThan(0);
    await expect(faces.first()).toHaveAttribute("fill-opacity", "0.08");
    await expect(faces.first()).toHaveAttribute("stroke-dasharray", "5 4");
    await expect(page.locator('#view-world .w-piece[data-piece="engine"] .w-face.imagined')).toHaveCount(0);
    await expect(page.locator('#view-world .w-label[data-piece="live-docs"] text.w-sub')).toHaveText("package");
    await expect(page.locator('#view-world .w-label[data-piece="engine"] text.w-sub')).toHaveText(/^library · \d+ files$/u);
    await page.evaluate(() => window.__worldMap!.pin("piece", "live-docs"));
    await expect(page.locator("#view-world .world-evidence")).toContainText("imagined: no folder yet");
  });

  test("draws a door the board declares even when nothing on the board uses it, dashed with a stub, and says so when pinned", async ({ page }) => {
    await openWorldMap(page);
    const key = "offers:pages:https://jfjordanfarr.github.io/Live-Documentation/";
    expect(await page.evaluate(() => window.__worldMap!.doors())).toContain(key);
    // The site's address has no caller on the board; the registry's address has one, the publish workflow, so only the site's door is dashed.
    await expect(page.locator("#view-world .w-door.declared")).toHaveCount(1);
    await expect(page.locator("#view-world .w-stub.offers")).toHaveCount(1);
    await page.evaluate((id) => window.__worldMap!.pin("door", id), key);
    const evidence = page.locator("#view-world .world-evidence");
    await expect(evidence).toHaveClass(/pinned/);
    await expect(evidence).toContainText("a door declared");
    await expect(evidence).toContainText("nothing on the board uses");
    await expect(evidence).toContainText("address, declared");
  });

  test("entering an imagined thing pins it and says there is nothing inside, instead of staying silent", async ({ page }) => {
    await openWorldMap(page);
    await page.evaluate(() => window.__worldMap!.enter("pages"));
    expect(await page.evaluate(() => window.__worldMap!.state().pinned)).toEqual({ kind: "piece", id: "pages" });
    await expect(page.locator("#view-map.active")).toHaveCount(0);
    await expect(page.locator("#view-world .world-evidence")).toContainText("nothing inside to open");
  });

  test("counts what the join found wanting in the crumbs and lists it in the help, as the board command prints it", async ({ page }) => {
    // The bundle's board is sound; this test hands the page a copy with a connection to a door nothing serves.
    await page.route("**/explorer-data.json", async (route) => {
      const response = await route.fetch();
      const data = await response.json() as { board: { text: string } };
      data.board.text = data.board.text.replace("### Connections\n", "### Connections\n- `pages-workflow` to `pages.https://nowhere.example/` over `a mistake`\n");
      await route.fulfill({ response, json: data });
    });
    await openWorldMap(page);
    const crumbs = page.locator("#view-world .world-crumbs");
    await expect(crumbs).toContainText("1 wanting");
    await crumbs.locator(".w-wanting").click();
    const list = page.locator("#view-world .world-help .w-wanting-list");
    await expect(list).toBeVisible();
    await expect(list).toContainText("pages-workflow to pages.https://nowhere.example/: pages serves no such door");
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
    // The files are folded behind their count, last in the panel (2026-11-12); unfolded, each is a link.
    await evidence.locator("details.files summary").click();
    const link = evidence.locator("details.files a[data-file]").first();
    await expect(link).toHaveAttribute("href", /view=local&node=/);
    const file = await link.getAttribute("data-file");
    expect(file).toMatch(/^packages\/engine\//u);
    await link.click();
    await expect(page.locator("#view-map.active")).toHaveCount(1);
    await expect.poll(() => currentSnapshot(page).selectedNodeId).toBe(file);
  });

  // A newcomer clicked explorer and got 213 file names first, "called by" and "open explorer" ten panel-heights down,
  // the close button scrolled away, and the panel over the piece it explained (2026-11-12, the first visit's finding 7).
  test("a pinned piece's panel says what it is and who it talks to, then the way inside, with its files folded behind their count", async ({ page }) => {
    await openWorldMap(page);
    const [sx, sy] = await page.evaluate(() => window.__worldMap!.screenPointOf("explorer"));
    await page.mouse.click(sx, sy);
    const evidence = page.locator("#view-world .world-evidence");
    await expect(evidence).toHaveClass(/pinned/);
    const text = (await evidence.innerText()).replace(/\s+/gu, " ");
    const order = ["packages/explorer", "called by", "stands on", "open explorer", "files ·"].map((words) => text.indexOf(words));
    expect(order.every((at) => at >= 0), `the panel reads: ${text.slice(0, 300)}`).toBe(true);
    expect(order, "what it is, who it talks to, the way inside, then the files").toEqual([...order].sort((a, b) => a - b));
    await expect(evidence.locator("details.files")).not.toHaveAttribute("open", "");
    await expect(evidence.locator("details.files a[data-file]").first()).toBeHidden();
    // The way inside is in sight without scrolling.
    const open = (await evidence.locator("a[data-open='explorer']").boundingBox())!;
    const panel = (await evidence.boundingBox())!;
    expect(open.y + open.height).toBeLessThanOrEqual(panel.y + panel.height);
  });

  test("the pinned panel's close control stays in sight however far its files are scrolled", async ({ page }) => {
    await openWorldMap(page);
    await page.evaluate(() => window.__worldMap!.pin("piece", "explorer"));
    const evidence = page.locator("#view-world .world-evidence");
    await evidence.locator("details.files summary").click({ timeout: 5_000 });
    const scrolled = await evidence.evaluate((panel) => {
      panel.scrollTop = panel.scrollHeight;
      return panel.scrollTop;
    });
    expect(scrolled, "explorer's files are longer than the panel").toBeGreaterThan(100);
    const close = evidence.getByRole("button", { name: "Close", exact: true });
    await expect(close).toBeInViewport({ ratio: 1 });
    const closeBox = (await close.boundingBox())!;
    const panelBox = (await evidence.boundingBox())!;
    expect(closeBox.y).toBeGreaterThanOrEqual(panelBox.y);
    expect(closeBox.y + closeBox.height).toBeLessThanOrEqual(panelBox.y + 40);
    await close.click();
    expect(await page.evaluate(() => window.__worldMap!.state().pinned)).toBeNull();
  });

  test("the pinned panel stands beside its piece, never on it, and inside the view, folded and unfolded", async ({ page }) => {
    await openWorldMap(page);
    const [sx, sy] = await page.evaluate(() => window.__worldMap!.screenPointOf("explorer"));
    await page.mouse.click(sx, sy);
    const evidence = page.locator("#view-world .world-evidence");
    await expect(evidence).toHaveClass(/pinned/);
    const judge = async (state: string): Promise<void> => {
      const box = (await evidence.boundingBox())!;
      const view = (await page.locator("#view-world").boundingBox())!;
      const panel: TextBox = { text: "the pinned panel", tag: "div", x: box.x, y: box.y, w: box.width, h: box.height };
      const own = (await outlines(page, "#view-world .w-piece .w-face", "data-piece")).filter((outline) => outline.owner === "explorer");
      expect(own.length).toBeGreaterThan(0);
      expect(textOverShapes([panel], own), `${state}: the panel covers explorer`).toEqual([]);
      expect(box.x, `${state}: inside the view`).toBeGreaterThanOrEqual(view.x);
      expect(box.y).toBeGreaterThanOrEqual(view.y);
      expect(box.x + box.width).toBeLessThanOrEqual(view.x + view.width);
      expect(box.y + box.height).toBeLessThanOrEqual(view.y + view.height);
    };
    await judge("folded");
    await evidence.locator("details.files summary").click({ timeout: 5_000 });
    await judge("unfolded");
  });

  // The owner (2026-10-30): "everything is an icon and text only appears when it is user-authored"; a newcomer met nine
  // text buttons on the first screen (2026-11-12).
  test("the board's tools are icons, each named, with its key in its tooltip, the toggles saying whether they are on", async ({ page }) => {
    await openWorldMap(page);
    const tools = await page.locator("#view-world .world-tools button").evaluateAll((buttons) => buttons.map((button) => ({
      text: (button.textContent ?? "").trim(), name: button.getAttribute("aria-label"), title: button.getAttribute("title"),
      pressed: button.getAttribute("aria-pressed"), drawn: !!button.querySelector("svg")
    })));
    expect(tools).toHaveLength(9);
    for (const tool of tools) {
      expect(tool.text, `${tool.name} shows no words of ours`).toBe("");
      expect(tool.drawn).toBe(true);
      expect(tool.name).toBeTruthy();
    }
    expect(tools.filter((tool) => /\([A-Z]\)$/u.test(tool.title ?? "")).map((tool) => tool.title)).toEqual(
      ["Turn left (Q)", "Turn right (E)", "Look straight down (T)", "Built on (U)", "Snap to grid (G)", "Dark board (D)", "Fit (F)", "Reset layout (R)"]);
    const down = page.getByRole("button", { name: "Look straight down" });
    await expect(down).toHaveAttribute("aria-pressed", "false");
    await down.click();
    await expect(down).toHaveAttribute("aria-pressed", "true");
    await page.keyboard.press("d");
    await expect(page.getByRole("button", { name: "Dark board" })).toHaveAttribute("aria-pressed", "true");
  });

  // By keyboard a newcomer could rotate the first screen but not read or enter any piece on it (2026-11-12).
  test("each piece is a keyboard stop in the board's order; Enter pins it and takes the keyboard into its panel, Escape brings it back", async ({ page }) => {
    await openWorldMap(page);
    const order = await page.evaluate(() => window.__worldMap!.pieces());
    await page.locator("#search-subject").focus();
    const stops: string[] = [];
    for (let i = 0; i < 3; i += 1) {
      await page.keyboard.press("Tab");
      stops.push(await page.evaluate(() => document.activeElement?.getAttribute("aria-label") ?? document.activeElement?.tagName ?? ""));
    }
    expect(stops.map((stop) => stop.split(",")[0])).toEqual(order.slice(0, 3));
    expect(stops[0]).toMatch(/^[^,]+, [^,]+, \d+ files?$/u);
    const stop = page.locator(`#view-world [data-focus="${order[2]}"]`);
    await expect(stop).toBeFocused();
    expect(await stop.locator("polygon").evaluate((ring) => getComputedStyle(ring).stroke), "a visible ring").not.toBe("none");
    // A turn redraws the board; the keyboard stays on the piece.
    await page.keyboard.press("e");
    await expect(stop).toBeFocused();
    await page.keyboard.press("Enter");
    expect(await page.evaluate(() => window.__worldMap!.state().pinned)).toEqual({ kind: "piece", id: order[2] });
    expect(await page.evaluate(() => !!document.activeElement?.closest("#view-world .world-evidence"))).toBe(true);
    await page.keyboard.press("Tab");
    expect(await page.evaluate(() => document.activeElement?.tagName)).toBe("A");
    await page.keyboard.press("Escape");
    expect(await page.evaluate(() => window.__worldMap!.state().pinned)).toBeNull();
    await expect(stop).toBeFocused();
  });

  // The walkthrough's last step shows orbit, and "done" used to leave the board turned (2026-11-12).
  test("the walkthrough ends where it began", async ({ page }) => {
    await openWorldMap(page);
    const before = await page.evaluate(() => window.__worldMap!.state());
    await page.evaluate(() => window.__worldMap!.tour(4));
    const during = await page.evaluate(() => window.__worldMap!.state());
    expect(during.theta, "the last step turns the board").not.toBeCloseTo(before.theta, 3);
    await page.locator('#view-world .world-tour [data-tour="done"]').click();
    await expect.poll(() => page.evaluate(() => window.__worldMap!.state().theta)).toBeCloseTo(before.theta, 6);
    const after = await page.evaluate(() => window.__worldMap!.state());
    expect(after.phi).toBeCloseTo(before.phi, 6);
    expect(after.k).toBeCloseTo(before.k, 6);
    expect(after.under).toBe(before.under);
    expect(after.pinned).toBeNull();
  });

  // For the first half second the main area stood empty, the only sign an 11 px "Loading..." in the sidebar (2026-11-12).
  test("while the bundle loads, the main area shows a wordless sign, gone once the map is drawn", async ({ page }) => {
    await page.route("**/explorer-data.json", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1_500));
      await route.continue();
    });
    await page.goto("/?view=world");
    const sign = page.locator("#views > #explorer-loading");
    await expect(sign).toBeVisible();
    await expect(sign).toHaveAttribute("role", "status");
    await expect(sign).toHaveAccessibleName("Loading");
    expect((await sign.textContent())?.trim()).toBe("");
    await page.waitForFunction(() => window.__worldMap?.ready === true, null, { timeout: 20_000 });
    await expect(sign).toHaveCount(0);
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

  test("opens a thing from its pinned panel into the Local Map, focused on its folder, and navigation leads back to the board", async ({ page }) => {
    await openWorldMap(page);
    await page.evaluate(() => window.__worldMap!.pin("piece", "engine"));
    await page.locator("#view-world .world-evidence a[data-open='engine']").click();
    await expect(page.locator("#view-map.active")).toHaveCount(1);
    await expect(page.locator('.nav-item.active[data-view="map"]')).toHaveCount(1);
    await expect(page.locator('#view-map .local-directory-label[data-directory="packages/engine"]')).toHaveCount(1);
    await expect(page.locator(".pin-tray-toggle")).toHaveText("1 pin");
    await page.locator('.nav-item[data-view="world"]').click();
    await expect(page.locator("#view-world.active")).toHaveCount(1);
    expect(await page.evaluate(() => window.__worldMap!.state().pinned)).toBeNull();
  });

  test("wheeling into a thing opens it, and the board is ready for the next look when you come back", async ({ page }) => {
    await openWorldMap(page);
    const box0 = (await page.locator("#view-world svg.world-svg").boundingBox())!;
    const lid = await page.evaluate(() => window.__worldMap!.lidCorners("scripts"));
    const sx = box0.x + lid.reduce((sum, p) => sum + p[0], 0) / 4;
    const sy = box0.y + lid.reduce((sum, p) => sum + p[1], 0) / 4;
    await page.mouse.move(sx, sy);
    for (let i = 0; i < 30 && !(await page.locator("#view-map.active").count()); i += 1) {
      await page.mouse.wheel(0, -120);
    }
    await expect(page.locator("#view-map.active")).toHaveCount(1);
    await expect(page.locator('#view-map .local-directory-label[data-directory="scripts"]')).toContainText("scripts");
    await page.locator('.nav-item[data-view="world"]').click();
    await expect(page.locator("#view-world.active")).toHaveCount(1);
    const after = await page.evaluate(() => window.__worldMap!.lidCorners("scripts"));
    const xs = after.map((p) => p[0]);
    expect(Math.max(...xs) - Math.min(...xs)).toBeLessThan(box0.width * 0.5);
  });

  test("a double-click opens a thing too", async ({ page }) => {
    await openWorldMap(page);
    const [sx, sy] = await page.evaluate(() => window.__worldMap!.screenPointOf("generator"));
    await page.mouse.dblclick(sx, sy);
    await expect(page.locator("#view-map.active")).toHaveCount(1);
    await expect(page.locator('#view-map .local-directory-label[data-directory="packages/generator"]')).toContainText("generator");
  });

  test("drags a thing with the pointer", async ({ page }) => {
    await openWorldMap(page);
    const [sx, sy] = await page.evaluate(() => window.__worldMap!.screenPointOf("scripts"));
    const before = await page.evaluate(() => window.__worldMap!.state().positions.scripts);
    await page.mouse.move(sx, sy);
    await page.mouse.down();
    await page.mouse.move(sx + 60, sy + 30, { steps: 6 });
    await page.mouse.up();
    const after = await page.evaluate(() => window.__worldMap!.state().positions.scripts);
    expect(after).not.toEqual(before);
  });
});
