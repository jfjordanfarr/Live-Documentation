import { expect, test, type Page } from "@playwright/test";

import { AA_NON_TEXT, AA_SMALL_TEXT, backdrop, contrastRatio, parseColour } from "./contrast";
import { pathAddress } from "./search-bar";

/**
 * The page's frame as a person meets it without a mouse or without sight (the design system's audit, 2026-11-18): the
 * words the shell draws stand at WCAG's contrast, a fatal fault can be reached and is announced, what happens is said
 * in one polite status region, the page has its landmarks and a skip link, a control's name holds the words it shows,
 * a small target still has 24 by 24 px to press, and a heading in the reader is never smaller than what it heads.
 */
test.use({ viewport: { width: 1280, height: 800 } });

const DEPENDENT = "packages/explorer/src/client/errors.ts";
const DEPENDENCY = "packages/explorer/src/client/dom.ts";

async function started(page: Page): Promise<void> {
  await expect(page.locator("#stats-line")).not.toHaveText(/^Loading/u);
  await expect(page.locator("#stats-line")).not.toHaveText(/^Error/u);
}

/** A text's colour and what stands behind it, outermost first, read as the browser computes them. */
async function tone(page: Page, selector: string, pseudo?: string): Promise<{ colour: string; layers: string[] }> {
  return page.evaluate(({ selector, pseudo }) => {
    const element = document.querySelector<HTMLElement>(selector)!;
    const layers: string[] = [];
    for (let layer: Element | null = element; layer; layer = layer.parentElement) layers.unshift(getComputedStyle(layer).backgroundColor);
    const style = getComputedStyle(element, pseudo);
    // A colour drawn at an opacity is that colour laid over what is behind it at that opacity.
    const opacity = Number(getComputedStyle(element).opacity);
    const colour = style.color.replace(/^rgba?\(([^)]*)\)$/u, (_, inner: string) => {
      const [r, g, b, a = "1"] = inner.split(",").map(part => part.trim());
      return `rgba(${r}, ${g}, ${b}, ${Number(a) * opacity})`;
    });
    return { colour, layers };
  }, { selector, pseudo });
}

const ratioOf = (read: { colour: string; layers: string[] }): number => contrastRatio(parseColour(read.colour), backdrop(read.layers));

test("the words the sidebar and the search draw stand at 4.5 to 1, and the clear's glyph at 3 to 1", async ({ page }) => {
  await page.goto(pathAddress("/", DEPENDENT, { kind: "file", nodeId: DEPENDENCY }));
  await started(page);
  await expect(page.locator("#search-destination-clear")).toBeVisible();
  const ratios: Record<string, number> = {
    "a sidebar section's label": ratioOf(await tone(page, "#sidebar .section-label")),
    "the destination's placeholder": ratioOf(await tone(page, "#search-destination", "::placeholder")),
    "the clear's glyph": ratioOf(await tone(page, "#search-destination-clear"))
  };
  // The shortcut's hint stands only while the first field is empty and unfocused.
  await page.goto("/");
  await started(page);
  await expect(page.locator(".search-shortcut")).toBeVisible();
  ratios["the search's placeholder"] = ratioOf(await tone(page, "#search-subject", "::placeholder"));
  ratios["the shortcut's hint"] = ratioOf(await tone(page, ".search-shortcut"));
  await page.click("#search-subject");
  await page.keyboard.type("qqqzzzxxx");
  await expect(page.locator("#search-subject-results .search-empty")).toBeVisible();
  ratios["Nothing found"] = ratioOf(await tone(page, "#search-subject-results .search-empty"));
  test.info().annotations.push({ type: "contrast", description: JSON.stringify(Object.fromEntries(Object.entries(ratios).map(([k, v]) => [k, v.toFixed(2)]))) });
  for (const [name, ratio] of Object.entries(ratios)) expect(ratio, name).toBeGreaterThanOrEqual(name === "the clear's glyph" ? AA_NON_TEXT : AA_SMALL_TEXT);
});

test("a fatal fault is shown in a reader a keyboard can reach, under a heading that says so, and is announced", async ({ page }) => {
  await page.goto("/");
  await started(page);
  await page.evaluate(() => window.dispatchEvent(new ErrorEvent("error", { error: new Error("The graph could not be read") })));
  const panel = page.locator("#detail-panel");
  await expect(panel).toHaveClass(/visible/u);
  expect(await panel.evaluate(element => (element as HTMLElement).inert), "the panel is not inert").toBe(false);
  await expect(panel).not.toHaveAttribute("aria-hidden", "true");
  await expect(page.getByRole("heading", { name: "The Explorer stopped", exact: true })).toBeVisible();
  await expect(page.getByRole("alert")).toContainText("The graph could not be read");
  await page.locator("#detail-close").focus();
  await expect(page.locator("#detail-close")).toBeFocused();
});

test("the page says what happens in one polite status region: a search that finds nothing", async ({ page }) => {
  await page.goto("/");
  await started(page);
  const region = page.locator("#page-status");
  await expect(region).toHaveAttribute("role", "status");
  await expect(region).toHaveAttribute("aria-live", "polite");
  await page.click("#search-subject");
  await page.keyboard.type("qqqzzzxxx");
  await expect(region).toHaveText("Nothing found");
  // Words found again leave the region with nothing to repeat.
  await page.keyboard.press("Control+A");
  await page.keyboard.type("errors");
  await expect(page.locator("#search-subject-results .search-row").first()).toBeVisible();
  await expect(region).toHaveText("");
});

test("the page has its landmarks, and a skip link that appears on focus and takes the keyboard to the map", async ({ page }) => {
  await page.goto("/");
  await started(page);
  await expect(page.getByRole("main")).toHaveCount(1);
  const views = page.getByRole("navigation", { name: "Views", exact: true });
  await expect(views.getByRole("button", { name: "Local Map" })).toBeVisible();
  const skip = page.getByRole("link", { name: "Skip to the map", exact: true });
  await expect(skip).not.toBeInViewport();
  await page.keyboard.press("Tab");
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport({ ratio: 1 });
  await page.keyboard.press("Enter");
  await expect(page.locator("#views")).toBeFocused();
  expect(new URL(page.url()).hash, "the address keeps no fragment").toBe("");
});

test("a small control keeps 24 by 24 px to press, and a name holds the words a person sees", async ({ page }) => {
  await page.goto(pathAddress("/", DEPENDENT, { kind: "file", nodeId: DEPENDENCY }));
  await started(page);
  const clear = await page.locator("#search-destination-clear").boundingBox();
  expect(clear!.width, "the clear's width").toBeGreaterThanOrEqual(24);
  expect(clear!.height, "the clear's height").toBeGreaterThanOrEqual(24);
  await page.locator(".pin-tray-toggle").click();
  const all = page.locator(".pin-tray-header button");
  await expect(all).toHaveText("Clear all");
  expect((await all.getAttribute("aria-label")) ?? "").toContain("Clear all");
  // Every zoom button explains itself on hover as well as by name.
  for (const button of await page.locator("#controls .control-btn").all()) expect(await button.getAttribute("title"), await button.getAttribute("aria-label") ?? "").toBeTruthy();
});

test("no heading in the reading dialog is smaller than the prose it heads", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await started(page);
  // Each level laid in the dialog's prose, measured as the dialog's rules draw it.
  const sizes = await page.evaluate(() => {
    const panel = document.getElementById("detail-panel")!;
    panel.classList.add("reading-dialog");
    const prose = document.createElement("div");
    prose.className = "reader-prose";
    prose.innerHTML = "<h1>a</h1><h2>a</h2><h3>a</h3><h4>a</h4><h5>a</h5><h6>a</h6><p>a</p>";
    document.getElementById("detail-body")!.append(prose);
    const size = (element: Element): number => parseFloat(getComputedStyle(element).fontSize);
    return { body: size(prose.querySelector("p")!), headings: [...prose.querySelectorAll("h1, h2, h3, h4, h5, h6")].map(size) };
  });
  for (const [level, size] of sizes.headings.entries()) expect(size, `h${level + 1} against ${sizes.body} px prose`).toBeGreaterThanOrEqual(sizes.body);
  for (let level = 1; level < sizes.headings.length; level++) expect(sizes.headings[level], `h${level + 1} is no larger than h${level}`).toBeLessThanOrEqual(sizes.headings[level - 1]);
});

test("the shortcut's hint names the platform's key, and the field says its shortcut", async ({ page }) => {
  await page.goto("/");
  await started(page);
  await expect(page.locator(".search-shortcut")).toHaveText("Ctrl+P");
  await expect(page.locator("#search-subject")).toHaveAttribute("aria-keyshortcuts", "Control+P");
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "platform", { get: () => "MacIntel" });
    Object.defineProperty(navigator, "userAgentData", { get: () => undefined });
  });
  await page.goto("/");
  await started(page);
  await expect(page.locator(".search-shortcut")).toHaveText("⌘P");
  await expect(page.locator("#search-subject")).toHaveAttribute("aria-keyshortcuts", "Meta+P");
  await page.keyboard.press("Meta+p");
  await expect(page.locator("#search-subject")).toBeFocused();
});

test("the sidebar's loading line ends in an ellipsis, the character the product uses elsewhere", async ({ page }) => {
  await page.route("**/static/index.js", route => route.abort());
  await page.goto("/");
  await expect(page.locator("#stats-line")).toHaveText("Loading…");
});
