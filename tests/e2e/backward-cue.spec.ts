import { expect, test, type Page } from "@playwright/test";

import { AA_SMALL_TEXT, backdrop, contrastRatio, parseColour } from "./contrast";
import { localMapStill } from "./still-picture";
import { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } from "../../packages/explorer/src/client/persistence/local-storage";
import { backwardStrength } from "../../packages/explorer/src/client/views/localView/returning-connections";

/**
 * The 3D button's cue (2026-11-15): it lights while the 2D picture draws connections against its left-to-right order,
 * the returning references of a cycle above all, counted once each, as the cards' feet count them at either end; the
 * forward wire whose route doubles back counts too, and has its own case in `local-map-branches.spec.ts`. The owner had
 * pinned branch-renderer.ts, seen many connections leave the right of a card and travel leftward, and the button stayed
 * dark: the cue of November 2 counted only the doubling forward wire. Read in the default looks, nothing remembered but
 * the suite's stilled search.
 */
const renderer = "packages/explorer/src/client/views/localView/branch-renderer.ts";
const local = (node: string, site = "/"): string => `${site}?view=local&node=${node}`;
const button = (page: Page) => page.getByRole("button", { name: "3D", exact: true });

test.use({ viewport: { width: 1440, height: 900 } });

/** The picture at rest, its move and any look's fade ended. */
async function still(page: Page): Promise<void> {
  await localMapStill(page);
  await page.waitForFunction(() => document.getAnimations().every(animation => animation.playState !== "running"
    || !(animation.effect instanceof KeyframeEffect && animation.effect.target instanceof Element && animation.effect.target.closest("#map-container"))));
}

/** Seeds the remembered tuning before the page loads: the suite's stilled search, and whatever the case adds. */
async function tuning(page: Page, localMap: Record<string, unknown>): Promise<void> {
  await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
    key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning: { localMap: { searchStarts: 0, ...localMap } } })
  });
}

/** Counts the cue's pulses as they start, and any that would repeat. */
async function countPulses(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const pulses = { started: 0, repeated: 0 };
    (window as unknown as { cuePulses: typeof pulses }).cuePulses = pulses;
    document.addEventListener("animationstart", event => { if (event.animationName === "backward-rise") pulses.started += 1; }, true);
    document.addEventListener("animationiteration", event => { if (event.animationName === "backward-rise") pulses.repeated += 1; }, true);
  });
}
const pulses = (page: Page) => page.evaluate(() => (window as unknown as { cuePulses: { started: number; repeated: number } }).cuePulses);

/** What the picture draws against its order: the returning routes' references, the overlay's count and the cards' feet. */
const drawnAgainst = (page: Page) => page.evaluate(() => {
  const routes = [...document.querySelectorAll<SVGElement>("#map-connections path.back-route")];
  const feet = [...document.querySelectorAll<HTMLElement>(".node-card .local-back-references")]
    .map(note => Number(/^\d+/u.exec(note.textContent ?? "")?.[0] ?? Number.NaN));
  return {
    look: document.querySelector<HTMLElement>("#map-container")?.dataset.look,
    routes: routes.reduce((sum, route) => sum + Number(route.dataset.references ?? 1), 0),
    overlay: Number(document.querySelector<HTMLElement>("#map-connections")?.dataset.backwardConnections),
    feet: feet.reduce((sum, count) => sum + count, 0)
  };
});

/** A Zoom button pressed as a click that leaves the pointer where it stands over the map. */
async function zoomOut(page: Page, presses: number): Promise<void> {
  for (let i = 0; i < presses; i += 1) {
    await page.evaluate(() => document.querySelector<HTMLElement>('#controls [aria-label="Zoom Out"]')!.click());
    await still(page);
  }
}

test("branch-renderer.ts alone lights the 3D cue with the number of returning references it draws, counted once each", async ({ page }) => {
  await countPulses(page);
  await page.goto(local(renderer));
  await still(page);
  const drawn = await drawnAgainst(page);
  expect(drawn.routes, "the picture returns connections in a cycle").toBeGreaterThan(0);
  expect(drawn.overlay, "the picture's number is the returning references drawn").toBe(drawn.routes);
  expect(drawn.feet, "each card's foot counts the returns at it, so every return is told at both its ends").toBe(2 * drawn.routes);
  await expect(button(page)).toHaveClass(/has-backward-wires/);
  // The strength is the one the count's rule gives (its boundary has a unit case). On November 15, 2026 this picture drew
  // eight, among the most strained of 161 measured; the case does not hold the repository to staying that cyclic.
  await expect(button(page)).toHaveAttribute("data-backward", backwardStrength(drawn.routes));
  // The name stays what the toolbar's text buttons are named by, their label; the count is the description.
  await expect(button(page)).toHaveAccessibleName("3D");
  await expect(button(page)).toHaveAccessibleDescription(`${drawn.routes} ${drawn.routes === 1 ? "connection runs" : "connections run"} backward in 2D. Explore this scope in 3D.`);
  await expect(button(page)).toHaveText("3D");
  // Amber, not the pressed blue, and the label keeps its contrast on the toolbar.
  const look = await button(page).evaluate(element => {
    const layers: string[] = [];
    for (let layer: Element | null = element; layer; layer = layer.parentElement) layers.unshift(getComputedStyle(layer).backgroundColor);
    const style = getComputedStyle(element);
    return { colour: style.color, border: style.borderTopColor, glow: style.boxShadow, layers, pressed: getComputedStyle(element.parentElement!.querySelector('[aria-pressed="true"]')!).borderTopColor };
  });
  expect(look.border).toBe("rgb(233, 184, 109)");
  expect(look.border).not.toBe(look.pressed);
  expect(look.glow, "a soft glow stands around it").toMatch(/rgba\(233, 184, 109/u);
  expect(contrastRatio(parseColour(look.colour), backdrop(look.layers)), "the amber label stays legible").toBeGreaterThanOrEqual(AA_SMALL_TEXT);
  await expect.poll(() => pulses(page), { message: "one slow pulse as the cue lit, never a loop" }).toEqual({ started: 1, repeated: 0 });
});

test("the estate's ring of three files lights the cue, and a picture with no returning connection puts it out", async ({ page }) => {
  await page.goto(local("PaymentService/PaymentService.cs", "/samples/estate/"));
  await still(page);
  // PaymentService uses Hub uses Gateway uses PaymentService's contract: the ring is broken at one returning reference.
  expect(await drawnAgainst(page)).toMatchObject({ routes: 1, overlay: 1, feet: 2 });
  await expect(button(page)).toHaveClass(/has-backward-wires/);
  await expect(button(page)).toHaveAttribute("data-backward", "some");
  await expect(button(page)).toHaveAttribute("title", "1 connection runs backward in 2D. Explore this scope in 3D.");
  // GatewayClient.cs stands in no cycle: every wire of its picture runs left to right, and the cue goes out.
  await page.goto(local("Portal/Services/GatewayClient.cs", "/samples/estate/"));
  await still(page);
  expect(await drawnAgainst(page)).toMatchObject({ routes: 0, overlay: 0, feet: 0 });
  await expect(button(page)).not.toHaveClass(/has-backward-wires/);
  await expect(button(page)).not.toHaveAttribute("data-backward", /./u);
  await expect(button(page)).toHaveAttribute("title", "Local Map in 3D");
});

test("the number is the same at the reading, connections and overview looks", async ({ page }) => {
  test.setTimeout(90_000);
  await countPulses(page);
  await page.goto(local(renderer));
  await still(page);
  const reading = await drawnAgainst(page);
  expect(reading.look).toBe("reading");
  expect(reading.overlay).toBeGreaterThan(0);
  const title = await button(page).getAttribute("title");
  await zoomOut(page, 3);
  expect(await drawnAgainst(page)).toMatchObject({ look: "connections", overlay: reading.overlay });
  await expect(button(page)).toHaveAttribute("title", title!);
  await zoomOut(page, 4);
  const overview = await drawnAgainst(page);
  expect(overview).toMatchObject({ look: "overview", overlay: reading.overlay });
  // Gathered, the returning pairs carry the same references between them.
  expect(overview.routes).toBe(reading.routes);
  await expect(button(page)).toHaveAttribute("title", title!);
  expect(await pulses(page), "a change of look that keeps the number does not pulse again").toEqual({ started: 1, repeated: 0 });
});

test("with files only at the farthest zoom the cue keeps its number", async ({ page }) => {
  test.setTimeout(90_000);
  await tuning(page, { overviewFiles: "files" });
  await page.goto(local(renderer));
  await still(page);
  const reading = await drawnAgainst(page);
  expect(reading.overlay).toBeGreaterThan(0);
  await zoomOut(page, 7);
  await expect(page.locator("#map-container")).toHaveAttribute("data-overview-files", /.*/u);
  expect(await drawnAgainst(page)).toMatchObject({ look: "overview", overlay: reading.overlay });
  await expect(button(page)).toHaveClass(/has-backward-wires/);
});

test("the cue does not pulse under reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await countPulses(page);
  await page.goto(local(renderer));
  await still(page);
  await expect(button(page)).toHaveClass(/has-backward-wires/);
  await page.waitForTimeout(400);
  expect(await pulses(page)).toEqual({ started: 0, repeated: 0 });
});

test("in 3D the cue is off, and back in 2D it lights again", async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto(local("PaymentService/PaymentService.cs", "/samples/estate/"));
  await still(page);
  await expect(button(page)).toHaveClass(/has-backward-wires/);
  await button(page).click();
  await expect(button(page)).toHaveAttribute("aria-pressed", "true");
  await expect(button(page)).not.toHaveClass(/has-backward-wires/);
  await expect(button(page)).not.toHaveAttribute("data-backward", /./u);
  await expect(button(page)).toHaveAttribute("title", "Local Map in 3D");
  await page.getByRole("button", { name: "2D", exact: true }).click();
  await expect(button(page)).toHaveAttribute("aria-pressed", "false");
  await expect(button(page)).toHaveClass(/has-backward-wires/, { timeout: 15_000 });
});
