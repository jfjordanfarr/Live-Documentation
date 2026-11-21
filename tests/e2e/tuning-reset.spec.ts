import { expect, test, type Page } from "@playwright/test";

import { layoutSettingsOf } from "../../packages/explorer/src/client/layout-presets";
import { compressSnapshot, decompressSnapshot, DEFAULT_SNAPSHOT } from "../../packages/explorer/src/client/persistence/compressed-url-state";
import { getDefaultTuning, PERSISTED_UI_KEY, PERSISTED_UI_VERSION } from "../../packages/explorer/src/client/persistence/local-storage";

/**
 * Reset to defaults (the owner, 2026-11-19: "a way for me to quickly reset my visual tuning preferences to their default
 * values so that the links you send me are perceived by both of us in the same way"). The count beside Tuning's heading
 * says, with the section folded, how many settings differ from the defaults; a dot marks each changed lever and the
 * heading of each group that holds one; the reset puts every setting back and, pressed again before a lever moves, puts
 * them back as they were, as the World Map's Reset layout does.
 */
test.use({ viewport: { width: 1440, height: 900 } });

const PAGE = "/?view=local&node=packages/generator/src/generator.ts";

/** Four settings moved from their defaults: the suite's own search off, and three levers in three groups. */
const MOVED = { localMap: { searchStarts: 0, columnGap: 140 }, bezier: { stubMin: 20 }, appearance: { marbles: "on" } };

/** Every page this test opens starts from `tuning` as the viewer's saved settings, in place of the suite's. */
async function saved(page: Page, tuning: object): Promise<void> {
  await page.addInitScript(({ key, value }) => {
    // Once per tab, so that what the page itself saves is what a reload reads.
    if (sessionStorage.getItem("seeded")) return;
    sessionStorage.setItem("seeded", "1");
    localStorage.setItem(key, value);
  }, { key: PERSISTED_UI_KEY, value: JSON.stringify({ version: PERSISTED_UI_VERSION, tuning }) });
}

async function opened(page: Page, address = PAGE): Promise<void> {
  await page.goto(address);
  await page.locator(".local-placed").first().waitFor({ timeout: 20_000 });
}

const heading = (page: Page) => page.locator(".sidebar-details > summary");
const reset = (page: Page) => page.getByRole("button", { name: "Reset to defaults", exact: true });
const marked = (page: Page) => page.locator("[data-tuning-changed]").evaluateAll(elements => elements.map(element =>
  (element.matches("summary") ? element.textContent : element.querySelector("span")?.textContent)?.trim()));
/** What the browser keeps of the tuning, or null when it keeps none. */
const storedTuning = (page: Page) => page.evaluate(key => {
  const raw = localStorage.getItem(key);
  return raw ? (JSON.parse(raw) as { tuning?: unknown }).tuning ?? null : null;
}, PERSISTED_UI_KEY);
const pageStatus = (page: Page) => page.locator("#page-status");

test("the count beside Tuning says how many settings differ, a dot marks each changed lever and its groups, and Reset to defaults puts them all back", async ({ page }) => {
  await saved(page, MOVED);
  await opened(page);
  // Folded, the heading says it: a numeral to the eye, the sentence to a screen reader.
  await expect(page.locator(".sidebar-details")).not.toHaveAttribute("open", "");
  await expect(page.locator("#tuning-changed")).toBeVisible();
  await expect(page.locator("#tuning-changed-count")).toHaveText("4");
  await expect(heading(page)).toHaveAccessibleName(/^Tuning\s*4 settings changed from their defaults$/);

  await heading(page).click();
  await expect(reset(page)).toBeEnabled();
  await expect(reset(page)).toHaveAttribute("aria-pressed", "false");
  // Search Starts, which the suite turns off, is the fourth, in the 2D layout group beside Column Gap.
  expect((await marked(page)).sort()).toEqual(["2D Layout", "2D Wires", "Colour", "Column Gap", "Marbles", "Search Starts", "Stub Min"].sort());
  // The dot is read where a person sees it: Stub Min stands in the 2D wires' group, folded by default, and the box of
  // something inside a folded group is not drawn, so its reading is whatever the browser last laid out. Read folded,
  // it gave 5px on 2026-11-20 and 0px on 2026-11-21, with the same code and the same browser; opened, the group's levers
  // are drawn and the dot's box is the one on the screen.
  await page.locator(".sidebar-details summary", { hasText: "2D Wires" }).click();
  await expect(page.locator("#tuning-stub-min")).toBeVisible();
  const dot = await page.locator("#tuning-stub-min").evaluate(input => {
    const style = getComputedStyle(input.closest(".tuning-slider")!.querySelector("span")!, "::after");
    return { content: style.content, width: style.width, colour: style.backgroundColor, text: getComputedStyle(document.body).color };
  });
  expect(dot, "a dot in the text's own tone after the lever's name").toEqual({ content: '""', width: "5px", colour: dot.text, text: dot.text });
  const unchanged = await page.locator("#tuning-stub-factor").evaluate(input => getComputedStyle(input.closest(".tuning-slider")!.querySelector("span")!, "::after").content);
  expect(unchanged).toBe("none");

  await reset(page).click();
  await expect(page.locator("#tuning-changed")).toBeHidden();
  expect(await marked(page)).toEqual([]);
  await expect(page.locator("#tuning-column-gap")).toHaveValue("100");
  await expect(page.locator("#tuning-column-gap-value")).toHaveText("100");
  await expect(page.locator("#tuning-stub-min")).toHaveValue("8");
  await expect(page.locator("#tuning-marbles")).toHaveValue("off");
  await expect(page.locator("#tuning-search-starts")).toHaveValue("32");
  // The pictures take it as from a lever: the page wears no marbles again and the Local Map's columns their default gap.
  await expect(page.locator("html")).toHaveAttribute("data-marbles", "off");
  expect(await page.evaluate(() => document.documentElement.style.getPropertyValue("--local-column-gap"))).toBe("100px");
  await expect.poll(() => storedTuning(page), "nothing of tuning is kept").toBeNull();
  await expect(pageStatus(page)).toHaveText("Tuning reset to defaults");
  // The reset stands, and the same button offers to take it back.
  await expect(reset(page)).toBeEnabled();
  await expect(reset(page)).toHaveAttribute("aria-pressed", "true");
  await expect(reset(page)).toHaveAttribute("title", "Put your settings back as you had them");

  await reset(page).press("Enter");
  await expect(page.locator("#tuning-changed-count")).toHaveText("4");
  await expect(page.locator("#tuning-column-gap")).toHaveValue("140");
  await expect(page.locator("#tuning-stub-min")).toHaveValue("20");
  await expect(page.locator("#tuning-marbles")).toHaveValue("on");
  await expect(page.locator("html")).toHaveAttribute("data-marbles", "on");
  await expect.poll(() => storedTuning(page)).toEqual(MOVED);
  await expect(pageStatus(page)).toHaveText("Tuning put back as you had it");
  await expect(reset(page)).toHaveAttribute("aria-pressed", "false");
  await expect(reset(page)).toBeFocused();

  // A lever moved after a reset lets go of what the reset kept: the next press resets again. Card Gap stands in the
  // 2D layout group, open in 2D; the 2D wires' group is folded.
  await reset(page).click();
  await expect(reset(page)).toHaveAttribute("aria-pressed", "true");
  await page.locator("#tuning-item-gap").fill("40");
  await expect(page.locator("#tuning-changed-count")).toHaveText("1");
  await expect(reset(page)).toHaveAttribute("aria-pressed", "false");
  await reset(page).click();
  await expect(page.locator("#tuning-item-gap")).toHaveValue("24");
  await reset(page).click();
  await expect(page.locator("#tuning-item-gap"), "taken back to the lever as it was moved, not to before the first reset").toHaveValue("40");
  await expect(page.locator("#tuning-column-gap")).toHaveValue("100");
});

test("at the defaults Reset is disabled in the disabled tone and nothing is counted; a lever moved enables it", async ({ page }) => {
  await saved(page, {});
  await opened(page);
  await expect(page.locator("#tuning-changed")).toBeHidden();
  await expect(heading(page)).toHaveAccessibleName("Tuning");
  await heading(page).click();
  await expect(reset(page)).toBeDisabled();
  const tones = await reset(page).evaluate(button => ({ drawn: getComputedStyle(button).color, disabled: (() => {
    const probe = document.createElement("span"); probe.style.color = "var(--text-disabled)"; document.body.append(probe);
    const colour = getComputedStyle(probe).color; probe.remove(); return colour;
  })() }));
  expect(tones.drawn).toBe(tones.disabled);
  expect(await marked(page)).toEqual([]);
  await page.locator("#tuning-column-gap").fill("120");
  await expect(page.locator("#tuning-changed-count")).toHaveText("1");
  await expect(heading(page)).toHaveAccessibleName(/1 setting changed from its default$/);
  await expect(reset(page)).toBeEnabled();
  const box = await reset(page).boundingBox();
  expect(box!.width).toBeGreaterThanOrEqual(24);
  expect(box!.height).toBeGreaterThanOrEqual(24);
});

test("after a reset a reload shows the defaults, with nothing of tuning kept or in the address, and a link's own choice still opens in it", async ({ page }) => {
  await saved(page, MOVED);
  await opened(page);
  await heading(page).click();
  await reset(page).click();
  await expect.poll(() => storedTuning(page)).toBeNull();
  await page.reload();
  await page.locator(".local-placed").first().waitFor({ timeout: 20_000 });
  await expect(page.locator("#tuning-changed")).toBeHidden();
  await expect(page.locator("#tuning-column-gap")).toHaveValue("100");
  expect(await storedTuning(page)).toBeNull();
  // The address carries the layout's settings, as every link does, and they are the defaults.
  const carried = new URL(page.url()).searchParams.get("s");
  expect(carried).not.toBeNull();
  expect(decompressSnapshot(carried!).layout).toEqual(layoutSettingsOf(getDefaultTuning()));

  // A link that names a choice opens in it: the link's settings are shown, and counted, without becoming the viewer's.
  await opened(page, `/?s=${compressSnapshot({ ...DEFAULT_SNAPSHOT, view: "map", perspective: "2d", selectedNodeId: "packages/generator/src/generator.ts", layout: { localMap: { directoryLayout: "grid" } } })}`);
  await expect(page.locator("#tuning-directory-layout")).toHaveValue("grid");
  await expect(page.locator("#tuning-changed-count")).toHaveText("1");
  expect(await storedTuning(page)).toBeNull();
});
