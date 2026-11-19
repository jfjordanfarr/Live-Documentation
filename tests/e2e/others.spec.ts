import { expect, test, type Locator, type Page } from "@playwright/test";

import { compressSnapshot, decompressSnapshot, DEFAULT_SNAPSHOT, type UrlStateSnapshot } from "../../packages/explorer/src/client/persistence/compressed-url-state";
import { retainedKey } from "../../packages/explorer/src/client/views/retained-state";
import { observeGraph } from "./force-graph-observation";
import { localMapSettled, panIntoView } from "./still-picture";

/**
 * Fold others away and Unpin others (the owner's ask of 2026-11-19, "release everything _except_ what I'm interacting
 * with now", and their approval the same night of one gesture at two strengths): items in the menu of the thing kept, a
 * card's, a symbol row's, a sphere's and a tray entry's. The fold closes what is open elsewhere and keeps every pin; Unpin
 * others also releases every other pin. Each is one step of the page's history, said once in the page's status region,
 * and leaves the keyboard's focus on the control it was chosen from. In 3D a sphere inside a popped group can wrap it
 * again from the same menu.
 */

const ROOT = "tests/integration/programs/typescript/rosetta";
const SRC = `${ROOT}/src`;
const MAIN = `${SRC}/main.ts`;
const PROCESSOR = `${SRC}/processor.ts`;
const HELPERS = `${SRC}/helpers.ts`;

test.use({ viewport: { width: 1600, height: 1000 } });

const current = (page: Page): UrlStateSnapshot => decompressSnapshot(new URL(page.url()).searchParams.get("s")!);
const sharedUrl = (state: Partial<UrlStateSnapshot>, base = "/"): string => `${base}?s=${compressSnapshot({ ...DEFAULT_SNAPSHOT, ...state })}`;
const status = (page: Page): Locator => page.locator("#page-status");

/** Three files pinned, one narrowed to two symbols, and the rosetta root opened: what the person has gathered. */
const gathered: Partial<UrlStateSnapshot> = {
  selectedNodeId: MAIN,
  pinSet: { entries: [{ nodeId: MAIN, symbol: "*" }, { nodeId: PROCESSOR, symbol: "run" }, { nodeId: PROCESSOR, symbol: "summarize" }, { nodeId: HELPERS, symbol: "*" }] },
  openDirectories: new Set([ROOT]),
  retentionOrder: [
    retainedKey({ kind: "pin", pin: { nodeId: MAIN, symbol: "*" } }),
    retainedKey({ kind: "directory", directory: ROOT }),
    retainedKey({ kind: "pin", pin: { nodeId: PROCESSOR, symbol: "run" } }),
    retainedKey({ kind: "pin", pin: { nodeId: PROCESSOR, symbol: "summarize" } }),
    retainedKey({ kind: "pin", pin: { nodeId: HELPERS, symbol: "*" } })
  ]
};

/** Open a control's menu from the keyboard and return its item names, in order. */
async function openMenu(page: Page, opener: Locator): Promise<string[]> {
  await panIntoView(page, opener);
  await opener.focus();
  await page.keyboard.press("Enter");
  const menu = page.getByRole("menu", { name: "Item actions" });
  await expect(menu).toBeVisible();
  return menu.getByRole("menuitem").evaluateAll(items => items.map(item => item.firstChild?.textContent ?? ""));
}

/** Choose a menu item by the keyboard, so that the focus returns as it does for a person using one. */
async function choose(page: Page, name: string): Promise<void> {
  await page.getByRole("menuitem", { name, exact: true }).focus();
  await page.keyboard.press("Enter");
}

test("a card's Unpin others keeps its pins alone, is one step Back takes back, and keeps the focus on the card", async ({ page }) => {
  await page.goto(sharedUrl(gathered));
  await localMapSettled(page);
  const more = page.locator(`.node-card[data-id="${PROCESSOR}"] .local-file-more`);
  const items = await openMenu(page, more);
  // Beside the thing's own Pin, the fold first and Unpin others after it.
  expect(items.slice(2, 4)).toEqual(["Fold others away", "Unpin others"]);
  const title = page.locator(`.node-card[data-id="${PROCESSOR}"] .node-title`);
  const before = (await title.boundingBox())!;
  await choose(page, "Unpin others");
  await localMapSettled(page);
  expect(current(page).pinSet.entries).toEqual([{ nodeId: PROCESSOR, symbol: "run" }, { nodeId: PROCESSOR, symbol: "summarize" }]);
  expect([...current(page).openDirectories]).toEqual([]);
  expect(current(page).selectedNodeId, "the subject's pin went, so the thing kept is the subject").toBe(PROCESSOR);
  await expect(status(page)).toHaveText("Unpinned 2 others, folded 1 directory away");
  await expect(page.locator(".node-card[data-id] .local-file-close")).toHaveCount(1);
  await expect(page.locator(`.node-card[data-id="${PROCESSOR}"] .local-file-more`)).toBeFocused();
  const after = (await title.boundingBox())!;
  expect(Math.hypot(after.x - before.x, after.y - before.y), "the card kept stays under the hand").toBeLessThan(2);

  await page.goBack();
  await localMapSettled(page);
  expect(current(page).pinSet).toEqual(gathered.pinSet);
  expect(current(page).retentionOrder).toEqual(gathered.retentionOrder);
  expect(current(page).openDirectories).toEqual(gathered.openDirectories);
  expect(current(page).selectedNodeId).toBe(MAIN);
  await page.goForward();
  await localMapSettled(page);
  expect(current(page).pinSet.entries).toEqual([{ nodeId: PROCESSOR, symbol: "run" }, { nodeId: PROCESSOR, symbol: "summarize" }]);
});

test("a symbol row's Unpin others keeps exactly that symbol, its file's other symbols released", async ({ page }) => {
  await page.goto(sharedUrl(gathered));
  await localMapSettled(page);
  const more = page.locator(`.symbol-row[data-node-id="${PROCESSOR}"][data-symbol="summarize"] .local-symbol-more`);
  const items = await openMenu(page, more);
  expect(items).toContain("Unpin others");
  await choose(page, "Unpin others");
  await localMapSettled(page);
  expect(current(page).pinSet.entries).toEqual([{ nodeId: PROCESSOR, symbol: "summarize" }]);
  await expect(status(page)).toHaveText("Unpinned 3 others, folded 1 directory away");
  await expect(page.locator(`.symbol-row[data-node-id="${PROCESSOR}"][data-symbol="summarize"] .local-symbol-more`)).toBeFocused();
});

test("Fold others away closes what is open elsewhere and keeps every pin, and Back opens it again", async ({ page }) => {
  await page.goto(sharedUrl(gathered));
  await localMapSettled(page);
  await openMenu(page, page.locator(`.node-card[data-id="${HELPERS}"] .local-file-more`));
  await choose(page, "Fold others away");
  await localMapSettled(page);
  expect(current(page).pinSet).toEqual(gathered.pinSet);
  expect([...current(page).openDirectories]).toEqual([]);
  expect(current(page).selectedNodeId, "a fold moves no subject").toBe(MAIN);
  await expect(status(page)).toHaveText("Folded 1 directory away");
  await expect(page.locator(`.node-card[data-id="${HELPERS}"] .local-file-more`)).toBeFocused();
  // Nothing is open elsewhere now: the fold is gone from the menu, Unpin others stays.
  const items = await openMenu(page, page.locator(`.node-card[data-id="${HELPERS}"] .local-file-more`));
  expect(items).not.toContain("Fold others away");
  expect(items).toContain("Unpin others");
  await page.keyboard.press("Escape");
  await page.goBack();
  await localMapSettled(page);
  expect(current(page).openDirectories).toEqual(gathered.openDirectories);
});

test("with no other pin and nothing open the menu offers neither, and a neighbour's Unpin others pins it alone", async ({ page }) => {
  await page.goto(sharedUrl({ selectedNodeId: PROCESSOR, pinSet: { entries: [{ nodeId: PROCESSOR, symbol: "run" }] } }));
  await localMapSettled(page);
  const own = await openMenu(page, page.locator(`.node-card[data-id="${PROCESSOR}"] .local-file-more`));
  expect(own).not.toContain("Unpin others");
  expect(own).not.toContain("Fold others away");
  await page.keyboard.press("Escape");
  // main.ts stands here only because processor's run is pinned and main uses it.
  const neighbour = await openMenu(page, page.locator(`.node-card[data-id="${MAIN}"] .local-file-more`));
  expect(neighbour).toContain("Unpin others");
  expect(neighbour).not.toContain("Fold others away");
  await choose(page, "Unpin others");
  await localMapSettled(page);
  expect(current(page).pinSet.entries).toEqual([{ nodeId: MAIN, symbol: "*" }]);
  await expect(status(page)).toHaveText("Unpinned 1 other");
  await expect(page.locator(`.node-card[data-id="${MAIN}"] .local-file-more`)).toBeFocused();
});

test("a tray entry's More offers the same, and the focus stays on that entry", async ({ page }) => {
  await page.goto(sharedUrl(gathered));
  await localMapSettled(page);
  await page.getByRole("button", { name: "Show pins", exact: true }).click();
  const more = page.getByRole("button", { name: `More actions for ${HELPERS}`, exact: true });
  const items = await openMenu(page, more);
  expect(items).toEqual(["Fold others away", "Unpin others"]);
  await choose(page, "Unpin others");
  await localMapSettled(page);
  expect(current(page).pinSet.entries).toEqual([{ nodeId: HELPERS, symbol: "*" }]);
  await expect(page.locator(".pin-tray-row")).toHaveCount(1);
  // Nothing else is left to release, so the entry's More is gone and the entry itself holds the focus.
  await expect(more).toBeHidden();
  await expect(page.getByRole("button", { name: `Show ${HELPERS}`, exact: true })).toBeFocused();
  await page.goBack();
  await localMapSettled(page);
  await expect(page.locator(".pin-tray-row")).toHaveCount(5);
});

const ESTATE = "/samples/estate/";
const GATEWAY = "Portal/Services/GatewayClient.cs";
const PAYMENT = "PaymentService/PaymentService.cs";
const RESULT = "Portal/Models/PaymentResultModel.cs";

test("a sphere's Unpin others keeps its file alone in 3D and the focus on the name it was chosen from", async ({ page }) => {
  test.setTimeout(90_000);
  await observeGraph(page);
  await page.goto(sharedUrl({ perspective: "3d", selectedNodeId: GATEWAY,
    pinSet: { entries: [{ nodeId: GATEWAY, symbol: "*" }, { nodeId: PAYMENT, symbol: "*" }, { nodeId: RESULT, symbol: "*" }] } }, ESTATE));
  await expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "false", { timeout: 25_000 });
  // The subject's name always stands; a name may give way to another, so the case opens the subject's menu.
  const label = page.locator(`#view-graph .force-graph-focus[data-node-id="${GATEWAY}"]`);
  await expect(label).toBeVisible();
  await label.focus();
  await page.keyboard.press("Shift+F10");
  const menu = page.getByRole("menu", { name: "Item actions" });
  await expect(menu).toBeVisible();
  await expect(menu.getByRole("menuitem", { name: "Unpin others", exact: true })).toBeVisible();
  await choose(page, "Unpin others");
  expect(current(page).pinSet.entries).toEqual([{ nodeId: GATEWAY, symbol: "*" }]);
  await expect(status(page)).toHaveText("Unpinned 2 others");
  await expect.poll(() => page.evaluate(() => (document.activeElement as HTMLElement | null)?.dataset.nodeId ?? null)).toBe(GATEWAY);
  await page.goBack();
  expect(current(page).pinSet.entries.map(pin => pin.nodeId)).toEqual([GATEWAY, PAYMENT, RESULT]);
});

test("a sphere inside a popped group can wrap that group again from its own menu", async ({ page }) => {
  test.setTimeout(90_000);
  await observeGraph(page);
  await page.goto(sharedUrl({ perspective: "3d", spatialLayout: "connections", filters: { showTests: true, showAssets: false },
    pinSet: { entries: [{ nodeId: PAYMENT, symbol: "*" }] } }, ESTATE));
  await expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "false", { timeout: 25_000 });
  // Pop the first shell the picture names, by the keyboard on its name.
  const shell = page.locator('#view-graph .force-graph-label[data-node-id^="shell:"]:not([hidden])').first();
  await expect(shell).toHaveCount(1);
  const directory = (await shell.getAttribute("data-node-id"))!.slice("shell:".length);
  await shell.focus();
  await page.keyboard.press("Enter");
  const chip = page.locator(`#view-graph .force-graph-label[data-kind="popped"][data-directory="${directory}"]`);
  await expect(chip).toHaveCount(1);
  // A file the pop released, named in the picture, offers the wrap in its menu.
  const inside = page.locator(`#view-graph .force-graph-label[data-node-id^="${directory}/"]:not([hidden])`).first();
  await expect(inside).toHaveCount(1, { timeout: 10_000 });
  await inside.focus();
  await page.keyboard.press("Shift+F10");
  await choose(page, "Wrap this group again");
  await expect(chip).toHaveCount(0);
  await expect(page.locator(`#view-graph .force-graph-label[data-node-id="shell:${directory}"]`)).toHaveCount(1);
  await expect(status(page)).toHaveText(`Wrapped ${directory} again`);
});
