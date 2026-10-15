import { test, expect, type Page } from "@playwright/test";
import { compressToEncodedURIComponent } from "lz-string";

import { pathAddress } from "./search-bar";
import { PERSISTED_NAV_KEY } from "../../packages/explorer/src/client/persistence/local-storage";

const SUBJECT = "packages/explorer/src/client/index.ts";
const PROVIDER = "packages/explorer/src/shared/graph.ts";
const ready = async (page: Page, mode: "2d" | "3d"): Promise<void> => {
  await expect(page.locator(mode === "3d" ? "#view-graph.active canvas" : "#view-map.active .local-placed")).toBeVisible();
  await expect(page.getByRole("button", { name: mode.toUpperCase(), exact: true })).toHaveAttribute("aria-pressed", "true");
};

test("three navigable views, with a board as the fresh landing", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#view-world.active")).toBeVisible();
  expect((await page.locator(".nav-item").allTextContents()).map(text => text.trim())).toEqual(["Knowledge Sources", "World Map", "Local Map"]);
  await expect(page.locator("#view-circuit, #view-membrane")).toHaveCount(0);
  await page.getByRole("button", { name: "Local Map", exact: true }).click();
  await ready(page, "2d");
  expect(new URL(page.url()).searchParams.get("view")).toBe("local");
});

test("3D survives navigation, reload, a fresh shared-link recipient and a return without a URL", async ({ page, browser }) => {
  await page.goto(pathAddress("/", PROVIDER, { kind: "file", nodeId: SUBJECT }, SUBJECT));
  await ready(page, "2d");
  await page.getByRole("button", { name: "3D", exact: true }).click();
  await ready(page, "3d");
  await expect(page.getByRole("button", { name: "3D", exact: true })).toBeEnabled();
  await expect(page.locator('.nav-item[aria-current="page"]')).toHaveAttribute("data-view", "map");
  const shared = page.url();
  expect(new URL(shared).searchParams.get("view")).toBe("local");
  expect(new URL(shared).searchParams.get("mode")).toBe("3d");
  await page.reload();
  await ready(page, "3d");
  await expect(page.locator("#pathfind-status")).toContainText("Path found: 2 files");
  await page.getByRole("button", { name: "Knowledge Sources", exact: true }).click();
  await expect.poll(() => page.evaluate(key => JSON.parse(localStorage.getItem(key)!).perspective, PERSISTED_NAV_KEY)).toBe("3d");
  await page.reload();
  await expect(page.locator("#view-sources.active")).toBeVisible();
  await page.goto("/");
  await expect(page.locator("#view-sources.active")).toBeVisible();
  await page.getByRole("button", { name: "Local Map", exact: true }).click();
  await ready(page, "3d");

  const context = await browser.newContext();
  try {
    const recipient = await context.newPage();
    await recipient.goto(shared);
    await ready(recipient, "3d");
    await expect(recipient.locator("#pathfind-status")).toContainText("Path found: 2 files");
    await recipient.getByRole("button", { name: "2D", exact: true }).click();
    await ready(recipient, "2d");
    await expect(recipient.locator("#map-container .node-card")).toHaveCount(2);
    const twoD = recipient.url();
    await recipient.getByRole("button", { name: "3D", exact: true }).click();
    await ready(recipient, "3d");
    await recipient.goto(twoD);
    await ready(recipient, "2d");
  } finally { await context.close(); }
});

test("old view links migrate, including compressed folders, pins and stale identities", async ({ page }) => {
  for (const view of ["membrane", "circuit", "force"]) {
    await page.goto(`/?view=${view}&node=${SUBJECT}`);
    await ready(page, view === "force" ? "3d" : "2d");
    await expect(page.locator(".nav-item.active")).toHaveAttribute("data-view", "map");
  }
  const s = compressToEncodedURIComponent(JSON.stringify({ v: 1, w: "membrane", n: "gone.ts", e: ["packages", "packages/explorer", "packages/explorer/src/client/persistence", "gone"], p: [{ n: PROVIDER, s: "explorerGraphOf" }, { n: "gone.ts", s: "x" }], f: [1, 0] }));
  await page.goto(`/?s=${s}`);
  await ready(page, "2d");
  await expect(page.locator('#map-container .local-directory-label[data-directory="packages/explorer/src/client/persistence"]')).toHaveCount(1);
  await expect(page.locator(`#map-container .node-card[data-id="${PROVIDER}"]`)).toHaveCount(1);
  await expect(page.locator(".pin-tray-toggle")).toHaveText("2 pins");
  await page.getByRole("button", { name: "Show pins", exact: true }).click();
  await expect(page.getByRole("button", { name: `Release explorerGraphOf in ${PROVIDER}`, exact: true })).toBeVisible();
});

test("World Map folder entry retains 3D, and its shared link restores the folder without a selected file", async ({ page, browser }) => {
  await page.goto(`/?view=world&mode=3d`);
  await page.waitForFunction(() => window.__worldMap?.ready);
  await page.evaluate(() => window.__worldMap!.pin("piece", "engine"));
  await page.locator("#view-world .world-evidence a[data-open=engine]").click();
  await ready(page, "3d");
  await expect(page.locator("#graph-svg")).toHaveAttribute("data-directory-scope", JSON.stringify(["packages/engine"]));
  const shared = page.url();
  await page.goBack();
  await expect(page.locator("#view-world.active")).toBeVisible();
  await page.goForward();
  await ready(page, "3d");
  const context = await browser.newContext();
  try {
    const recipient = await context.newPage();
    await recipient.goto(shared);
    await ready(recipient, "3d");
    await expect(recipient.locator("#graph-svg")).toHaveAttribute("data-directory-scope", JSON.stringify(["packages/engine"]));
    await expect(recipient.locator("#context-name")).toHaveText("packages/engine");
    await recipient.getByRole("button", { name: "2D", exact: true }).click();
    await ready(recipient, "2d");
    await expect(recipient.locator('.local-directory-label[data-directory="packages/engine"]')).toHaveCount(1);
    await expect(recipient.locator("#map-container .node-card.selected")).toHaveCount(0);
  } finally { await context.close(); }
});

test("this repository lands on the root with nothing pinned, since its docs declare several entry points", async ({ page }) => {
  // The landing rule of 2026-10-15: one program, command, module or declared entry outside the sample roots lands on it;
  // several land on the root; the file-name guess remains only for docs that declare no entry at all.
  const data = await (await page.request.get("/explorer-data.json")).json() as { graph: { files: Record<string, { codePath: string; entries: { reason: string }[] }> } };
  const landing = Object.values(data.graph.files).filter(file => file.entries.some(entry => ["program", "command", "module", "declared"].includes(entry.reason)) && !file.codePath.startsWith("tests/integration/programs/"));
  expect(landing.length).toBeGreaterThan(1);
  await page.goto("/?view=local");
  await ready(page, "2d");
  await expect(page.locator(".pin-tray-toggle")).toHaveText("0 pins");
  await expect(page.locator("#map-container .node-card.selected")).toHaveCount(0);
  await expect(page.locator(".local-directory-closed").first()).toBeVisible();
  await expect(page.locator("#context-name")).not.toHaveText(/rosetta/u);
});

test("a bundle whose docs declare one entry point lands on it", async ({ page }) => {
  await page.route("**/explorer-data.json", async route => {
    const response = await route.fetch();
    const bundle = await response.json() as { graph: { files: Record<string, { entries: { reason: string }[] }> }; board?: unknown };
    delete bundle.board;
    for (const file of Object.values(bundle.graph.files)) file.entries = [];
    bundle.graph.files["packages/engine/src/live-docs/graph.ts"].entries = [{ reason: "command", command: "graph", declarer: { label: "package.json", link: "../../../../package.json.mdmd.md" } } as { reason: string }];
    await route.fulfill({ response, json: bundle });
  });
  await page.goto("/");
  await ready(page, "2d");
  await expect(page.locator("#context-name")).toHaveText("packages/engine/src/live-docs/graph.ts");
});

test("a bundle without a board lands on the Local Map", async ({ page }) => {
  await page.route("**/explorer-data.json", async route => {
    const response = await route.fetch();
    const bundle = await response.json();
    delete bundle.board;
    await route.fulfill({ response, json: bundle });
  });
  await page.goto("/");
  await ready(page, "2d");
});
