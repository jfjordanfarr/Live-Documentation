import { expect, test, type Page } from "@playwright/test";

import { describeFaults, overlapsAmong, textBoxes, truncations } from "./design-audit";
import { localMapSettled } from "./still-picture";
import { compressSnapshot, decompressSnapshot, DEFAULT_SNAPSHOT, type UrlStateSnapshot } from "../../packages/explorer/src/client/persistence/compressed-url-state";
import { retainedKey } from "../../packages/explorer/src/client/views/retained-state";

const ROOT = "tests/integration/programs/typescript/rosetta";
const SRC = `${ROOT}/src`;
const MAIN = `${SRC}/main.ts`;
const PROCESSOR = `${SRC}/processor.ts`;

test.use({ viewport: { width: 1600, height: 1000 } });

const current = (page: Page) => decompressSnapshot(new URL(page.url()).searchParams.get("s")!);
const sharedUrl = (state: Partial<UrlStateSnapshot>) => `/?s=${compressSnapshot({ ...DEFAULT_SNAPSHOT, ...state })}`;

async function openTray(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Show pins", exact: true }).click();
}

const state: Partial<UrlStateSnapshot> = {
  selectedNodeId: PROCESSOR,
  pinSet: { entries: [{ nodeId: MAIN, symbol: "*" }, { nodeId: PROCESSOR, symbol: "run" }] },
  openDirectories: new Set([ROOT, SRC]),
  retentionOrder: [
    retainedKey({ kind: "directory", directory: ROOT }),
    retainedKey({ kind: "pin", pin: { nodeId: MAIN, symbol: "*" } }),
    retainedKey({ kind: "directory", directory: SRC }),
    retainedKey({ kind: "pin", pin: { nodeId: PROCESSOR, symbol: "run" } })
  ]
};

test("the newest-first tray releases a parent independently, survives sharing, and clears to an unpinned root", async ({ page }) => {
  await page.goto(sharedUrl(state));
  await localMapSettled(page);
  await openTray(page);
  const keys = () => page.locator(".pin-tray-row").evaluateAll(rows => rows.map(row => (row as HTMLElement).dataset.retainedKey));
  expect(await keys()).toEqual([...state.retentionOrder!].reverse());
  const symbolRow = page.locator(".pin-tray-row").first();
  const identity = await symbolRow.evaluate(element => {
    element.setAttribute("data-identity-check", "kept");
    return element.getAttribute("data-retained-key");
  });
  await page.getByRole("button", { name: `Release directory ${ROOT}`, exact: true }).click();
  await localMapSettled(page);
  expect(current(page).openDirectories).toEqual(new Set([SRC]));
  expect(current(page).pinSet).toEqual(state.pinSet);
  await expect(page.locator('[data-identity-check="kept"]')).toHaveAttribute("data-retained-key", identity!);
  const remaining = await keys();
  await page.reload();
  await localMapSettled(page);
  await openTray(page);
  expect(await keys()).toEqual(remaining);
  await page.getByRole("button", { name: "Clear exploration pins", exact: true }).click();
  await localMapSettled(page);
  await expect(page.locator(".pin-tray-toggle")).toHaveText("0 pins");
  expect(current(page).openDirectories.size).toBe(0);
  expect(current(page).selectedNodeId).toBeNull();
  await expect(page.locator("#map-connections .connection-path")).toHaveCount(0);
  const directories = await page.locator(".local-directory-closed").count();
  expect(directories).toBeGreaterThan(0);
  await expect(page.locator(".node-card .local-file-close")).toHaveCount(0);
  await page.reload();
  await localMapSettled(page);
  await expect(page.locator(".local-directory-closed")).toHaveCount(directories);
  await expect(page.locator(".pin-tray-toggle")).toHaveText("0 pins");
});

test("directory bulk clearing preserves an outside pin and the inside file its reference still needs", async ({ page }) => {
  const directory = "packages/engine/src/live-docs";
  const inside = `${directory}/document.ts`;
  const outside = "packages/explorer/src/shared/staticBuilder.ts";
  await page.goto(sharedUrl({ selectedNodeId: outside,
    pinSet: { entries: [{ nodeId: inside, symbol: "*" }, { nodeId: outside, symbol: "*" }] },
    openDirectories: new Set([directory, `${directory}/adapters`])
  }));
  await localMapSettled(page);
  await openTray(page);
  await page.getByRole("button", { name: `Clear pins inside ${directory}`, exact: true }).click();
  await localMapSettled(page);
  expect(current(page).pinSet.entries).toEqual([{ nodeId: outside, symbol: "*" }]);
  expect(current(page).openDirectories.size).toBe(0);
  await expect(page.locator(`.node-card[data-id="${inside}"]`)).toHaveCount(1);
  await expect(page.locator(`.node-card[data-id="${inside}"] .local-file-close`)).toHaveCount(0);
  expect(await page.locator(`.connection-path[data-source-id="${outside}"][data-target-id="${inside}"]`).count()).toBeGreaterThan(0);
  await expect(page.locator(".pin-tray-row")).toHaveCount(1);
});

test("releasing a directory preserves the direct-file neighborhood that was already being inspected", async ({ page }) => {
  await page.goto(`/?view=local&node=${MAIN}`);
  await localMapSettled(page);
  await page.getByRole("button", { name: `Open ${SRC}`, exact: true }).click();
  await localMapSettled(page);
  await openTray(page);
  await page.getByRole("button", { name: `Release directory ${SRC}`, exact: true }).click();
  await localMapSettled(page);
  expect(current(page).selectedNodeId).toBe(MAIN);
  expect(current(page).pinSet.entries).toEqual([]);
  expect(current(page).openDirectories.size).toBe(0);
  await expect(page.locator(`.node-card[data-id="${MAIN}"]`)).toHaveCount(1);
  expect(await page.locator(".connection-path[data-source-id]").count()).toBeGreaterThan(0);
});

test("closing a neighbor's symbol disclosure preserves the direct-file inspection", async ({ page }) => {
  await page.goto(`/?view=local&node=${MAIN}`);
  await localMapSettled(page);
  const neighbor = page.locator(`.node-card[data-id="${SRC}/models.ts"]`);
  await expect(neighbor.locator(".local-file-close")).toHaveCount(0);
  // models.ts offers four symbols; two are wired to main.ts and shown, two are folded. The reveal counts public
  // symbols only since 2026-10-16; it had read "+3" while it counted the Internals row too.
  await neighbor.getByRole("button", { name: "+2 symbols", exact: true }).click();
  await localMapSettled(page);
  await neighbor.getByRole("button", { name: "Close models.ts", exact: true }).click();
  await localMapSettled(page);
  expect(current(page).selectedNodeId).toBe(MAIN);
  expect(current(page).pinSet.entries).toEqual([]);
  await expect(neighbor.locator(".local-file-close")).toHaveCount(0);
  await expect(neighbor.getByRole("button", { name: "+2 symbols", exact: true })).toBeVisible();
});

test("releasing the last pinned symbol on a card leaves the file pinned whole, the subject in place; the tray releases it", async ({ page }) => {
  await page.goto(sharedUrl({ ...state, openDirectories: new Set() }));
  await localMapSettled(page);
  await page.getByRole("button", { name: "Pin run in processor.ts", exact: true }).click();
  await localMapSettled(page);
  // The owner's rule of 2026-10-15: a card leaves the picture only by its close or the tray, never by its rows
  expect(current(page).selectedNodeId).toBe(PROCESSOR);
  expect(current(page).pinSet.entries).toEqual([{ nodeId: MAIN, symbol: "*" }, { nodeId: PROCESSOR, symbol: "*" }]);
  await expect(page.locator(`.node-card[data-id="${PROCESSOR}"] .local-file-close`)).toHaveCount(1);
  await openTray(page);
  await page.getByRole("button", { name: `Release ${PROCESSOR}`, exact: true }).click();
  await localMapSettled(page);
  expect(current(page).pinSet.entries).toEqual([{ nodeId: MAIN, symbol: "*" }]);
  expect(current(page).selectedNodeId, "the subject released goes to the newest pinned file").toBe(MAIN);
});

test("ancestor disclosure stays readable after zooming and opens an ancestor without changing file pins", async ({ page }) => {
  await page.goto(sharedUrl(state));
  await localMapSettled(page);
  await openTray(page);
  for (let i = 0; i < 3; i++) await page.getByRole("button", { name: "Zoom Out", exact: true }).click();
  await page.getByRole("button", { name: `Show directory ${SRC}`, exact: true }).click();
  await page.getByRole("button", { name: `Ancestors of ${SRC}`, exact: true }).click();
  const disclosure = page.getByRole("dialog", { name: `Ancestors of ${SRC}`, exact: true });
  await expect(disclosure).toBeVisible();
  const button = disclosure.getByRole("button", { name: "Open ancestor Scan root", exact: true });
  expect((await button.boundingBox())!.height).toBeGreaterThanOrEqual(30);
  expect(await button.evaluate(element => getComputedStyle(element).fontSize)).toBe(
    await page.locator(".pin-tray-toggle").evaluate(element => getComputedStyle(element).fontSize)
  );
  const labels = [".directory-ancestor", ".directory-ancestry strong", ".pin-tray-name", ".pin-tray-context", ".pin-tray-header strong", ".pin-tray-header button"];
  const boxes = await textBoxes(page, labels);
  const overlaps = overlapsAmong(boxes);
  const cut = await truncations(page, labels);
  expect(overlaps.length + cut.length, describeFaults(overlaps, cut)).toBe(0);
  const parent = "tests/integration/programs/typescript";
  await disclosure.getByRole("button", { name: `Open ancestor ${parent}`, exact: true }).click();
  await localMapSettled(page);
  expect(current(page).openDirectories.has(parent)).toBe(true);
  expect(current(page).pinSet).toEqual(state.pinSet);
  await expect(disclosure).toHaveCount(0);
});
