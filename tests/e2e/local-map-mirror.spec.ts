import { expect, test, type Page } from "@playwright/test";
import path from "node:path";

import { PERSISTED_UI_KEY } from "../../packages/explorer/src/client/persistence/local-storage";
import { readSettled, watchPage } from "./scenarios/instrument";
import { LAWS, routesForward, usesLeftOfferingsRight } from "./scenarios/judgments";
import { displayNames, loadGraph, localMapStill } from "./still-picture";

/**
 * The mirror (2026-11-22): the 2D Local Map's toolbar button draws the same picture the other way round, what uses on
 * the left, and the choice is the person's own. Read on this repository's map, the pathfinder in focus, which has
 * files on both sides of it; nothing remembered but the suite's stilled search.
 */
const SUBJECT = "packages/explorer/src/client/pathfind.ts";
const ADDRESS = `/?view=local&node=${SUBJECT}`;
const button = (page: Page) => page.getByRole("button", { name: "Mirror the map", exact: true });
const layer = (page: Page) => page.locator("#map-viewport");

test.use({ viewport: { width: 1280, height: 800 } });

/** Where each card's middle stands across the page, by its file. */
async function middles(page: Page): Promise<Record<string, { x: number; y: number }>> {
  return page.evaluate(() => Object.fromEntries([...document.querySelectorAll<HTMLElement>("#map-container .node-card[data-id]")].map(card => {
    const rect = card.getBoundingClientRect();
    return [card.dataset.id!, { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }];
  })));
}

test("a press mirrors the picture about the subject, which keeps its place, and the button and the key say so", async ({ page }) => {
  await page.goto(ADDRESS);
  await localMapStill(page);
  await expect(button(page)).toHaveAttribute("aria-pressed", "false");
  await expect(button(page)).toHaveAttribute("title", /^Mirror the map: /u);
  await expect(layer(page)).not.toHaveAttribute("data-reads", /.*/u);
  const key = page.locator("#local-legend .legend-row--roles");
  await expect(key).toHaveAttribute("title", /uses enters on the left and what it offers leaves on the right/u);
  const before = await middles(page);

  await button(page).click();
  await expect(button(page)).toHaveAttribute("aria-pressed", "true");
  await expect(button(page)).toHaveAttribute("title", /^Mirrored: /u);
  await expect(layer(page)).toHaveAttribute("data-reads", "usesFirst");
  await expect(key).toHaveAttribute("title", /uses enters on the right and what it offers leaves on the left/u);
  await expect(key).toHaveAttribute("aria-description", /uses enters on the right and what it offers leaves on the left/u);
  await localMapStill(page);
  const after = await middles(page);
  const others = Object.keys(before).filter(id => id !== SUBJECT);
  expect(others.length).toBeGreaterThan(1);
  expect(Math.abs(after[SUBJECT].x - before[SUBJECT].x)).toBeLessThan(1);
  for (const id of others) {
    // Every other card stands as far from the subject as it did, on the other side, at the same height.
    expect(Math.abs((after[id].x - after[SUBJECT].x) + (before[id].x - before[SUBJECT].x)), id).toBeLessThan(1);
    expect(Math.abs(after[id].y - before[id].y), id).toBeLessThan(1);
  }

  await button(page).click();
  await expect(button(page)).toHaveAttribute("aria-pressed", "false");
  await localMapStill(page);
  const back = await middles(page);
  for (const id of Object.keys(before)) expect(Math.abs(back[id].x - before[id].x), id).toBeLessThan(1);
});

test("the keyboard presses it, and its explanation is there for the pointer and the focus alike", async ({ page }) => {
  await page.goto(ADDRESS);
  await localMapStill(page);
  await button(page).focus();
  await expect(button(page)).toBeFocused();
  // The explanation is the button's title, which a pointer's rest shows, and its accessible name, which the focus reads.
  await expect(button(page)).toHaveAccessibleName("Mirror the map");
  await expect(button(page)).toHaveAttribute("title", /what uses on the left and what offers on the right/u);
  await page.keyboard.press("Enter");
  await expect(button(page)).toHaveAttribute("aria-pressed", "true");
  await expect(layer(page)).toHaveAttribute("data-reads", "usesFirst");
  await expect(button(page)).toBeFocused();
  await page.keyboard.press("Space");
  await expect(button(page)).toHaveAttribute("aria-pressed", "false");
  await expect(layer(page)).not.toHaveAttribute("data-reads", /.*/u);
});

test("the choice outlasts a reload, and no link carries it", async ({ page, browser, baseURL }) => {
  await page.goto(ADDRESS);
  await localMapStill(page);
  const address = page.url();
  await button(page).click();
  await expect(layer(page)).toHaveAttribute("data-reads", "usesFirst");
  await expect.poll(() => page.evaluate(key => localStorage.getItem(key) ?? "", PERSISTED_UI_KEY)).toContain('"reads":"usesFirst"');
  // The address a person would copy says nothing of it.
  expect(page.url()).toBe(address);

  await page.reload();
  await localMapStill(page);
  await expect(button(page)).toHaveAttribute("aria-pressed", "true");
  await expect(layer(page)).toHaveAttribute("data-reads", "usesFirst");

  // The same address in a browser that has never pressed the button shows the picture as laid out.
  const other = await browser.newContext({ baseURL });
  const fresh = await other.newPage();
  await fresh.goto(address);
  await localMapStill(fresh);
  await expect(button(fresh)).toHaveAttribute("aria-pressed", "false");
  await expect(layer(fresh)).not.toHaveAttribute("data-reads", /.*/u);
  await other.close();
});

test("a mirrored picture keeps every law of the picture, the sides exchanged", async ({ page, baseURL }, testInfo) => {
  const graph = await loadGraph(page, "/");
  const names = displayNames(graph, graph.nodes.map(node => node.id));
  const watch = watchPage(page, baseURL!);
  await page.goto(ADDRESS);
  const broken = (laws: ReturnType<(typeof LAWS)[number]>[]): string[] => laws.filter(verdict => verdict.outcome === "broken").map(verdict => `${verdict.judgment}: ${verdict.findings.join("; ")}`);
  const laidOut = await readSettled(page, { scenario: "the pathfinder as laid out", map: "/", watch, names, shotPath: path.join(testInfo.outputDir, "as-laid-out.png") });
  expect(laidOut.mirrored).toBeUndefined();
  expect(usesLeftOfferingsRight(laidOut)).toMatchObject({ judgment: "uses enter on the left and offerings leave on the right", outcome: "kept" });
  await button(page).click();
  const reading = await readSettled(page, { scenario: "the pathfinder mirrored", map: "/", watch, names, shotPath: path.join(testInfo.outputDir, "mirrored.png") });
  expect(reading.mirrored).toBe(true);
  expect(reading.wires.length).toBeGreaterThan(10);
  expect(usesLeftOfferingsRight(reading)).toMatchObject({ judgment: "uses enter on the right and offerings leave on the left", outcome: "kept" });
  expect(routesForward(reading)).toMatchObject({ outcome: "kept" });
  // Said to read the other way, the same picture breaks the law: it is the drawing that is judged, not the saying.
  expect(usesLeftOfferingsRight({ ...reading, mirrored: false }).outcome).toBe("broken");
  // Every other law of the table is kept or broken by the mirrored picture exactly as by the picture as laid out
  // (a tall subject at this window reaches below the frame either way), the law of the sides aside, whose name changes.
  const sides = (verdict: string): boolean => verdict.startsWith("uses enter on the");
  expect(broken(LAWS.map(law => law(reading))).filter(each => !sides(each))).toEqual(broken(LAWS.map(law => law(laidOut))).filter(each => !sides(each)));
});

test("the button is offered only where the picture has a left-to-right rule", async ({ page }) => {
  await page.goto(ADDRESS);
  await localMapStill(page);
  await expect(button(page)).toBeVisible();
  await page.getByRole("button", { name: "3D", exact: true }).click();
  await expect(page.locator("#view-graph")).toBeVisible();
  await expect(button(page)).toBeHidden();
  await page.goto("/?view=world");
  await expect(page.locator("#world-root")).toBeVisible();
  await expect(button(page)).toBeHidden();
});
