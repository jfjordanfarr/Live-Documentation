import { expect, test, type Page } from "@playwright/test";

import { compressSnapshot, decompressSnapshot, DEFAULT_SNAPSHOT } from "../../packages/explorer/src/client/persistence/compressed-url-state";
import { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } from "../../packages/explorer/src/client/persistence/local-storage";
import { describeFaults, overlapsAmong, textBoxes, truncations } from "./design-audit";
import { observeGraph, renderedLinks, renderedNodes } from "./force-graph-observation";
import { AT_READING_SIZE, LOCAL_MAP, localMapSettled } from "./still-picture";

test.use({ viewport: { width: 1280, height: 800 } });

const referenceWire = (link: { kind: string }): boolean =>
  link.kind !== "containment" && link.kind !== "related-doc" && link.kind !== "cited-by";

async function settled2D(page: Page): Promise<void> {
  await page.waitForSelector("#map-container .branch-mode", { timeout: 20_000 });
  await localMapSettled(page);
  await page.waitForTimeout(250);
}

async function settled3D(page: Page): Promise<void> {
  await expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "false", { timeout: 40_000 });
  await page.waitForTimeout(250);
}

async function renderedFrames(page: Page): Promise<void> {
  await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
}

async function seed2D(page: Page, overrides: Record<string, unknown>): Promise<void> {
  await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
    key: PERSISTED_UI_KEY,
    value: JSON.stringify({
      version: PERSISTED_UI_VERSION,
      tuning: { localMap: { ...AT_READING_SIZE, searchStarts: 0, moveMs: 0, ...overrides } }
    })
  });
}

async function layoutItems(page: Page): Promise<Map<string, { col: number; left: number; top: number }>> {
  const entries = await page.evaluate(() => {
    const root = document.querySelector<HTMLElement>("#map-container .local-placed");
    if (!root) return [];
    const rootRect = root.getBoundingClientRect();
    const scale = parseFloat(getComputedStyle(document.getElementById("map-container")!).transform.split("(")[1] ?? "1") || 1;
    return [...root.querySelectorAll<HTMLElement>(".local-column")].map(wrapper => {
      const child = wrapper.firstElementChild as HTMLElement | null;
      const id = child?.dataset.id ?? child?.dataset.directory ?? "";
      const rect = wrapper.getBoundingClientRect();
      return [id, {
        col: Number(wrapper.dataset.column ?? -1),
        left: (rect.left - rootRect.left) / scale,
        top: (rect.top - rootRect.top) / scale
      }] as const;
    }).filter(([id]) => Boolean(id));
  });
  return new Map(entries);
}

test("2D Connections/Structure toolbar toggle syncs with Tuning, stays calm in Structure, glows amber with exact count, and switches cleanly to Flow", async ({ page }) => {
  test.setTimeout(90_000);
  await seed2D(page, {});

  // 1. Directory with zero files/connections: switching to Structure keeps Connections unlit.
  await page.goto("/?view=local&dir=packages/engine/src");
  await settled2D(page);
  const connectionsBtn = page.getByRole("button", { name: "Connections", exact: true });
  const structureBtn = page.getByRole("button", { name: "Structure", exact: true });
  await expect(connectionsBtn).toBeVisible();
  await expect(structureBtn).toBeVisible();
  await expect(connectionsBtn).toHaveAttribute("aria-pressed", "true");
  await expect(structureBtn).toHaveAttribute("aria-pressed", "false");

  await structureBtn.click();
  await settled2D(page);
  await expect(structureBtn).toHaveAttribute("aria-pressed", "true");
  await expect(connectionsBtn).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator("#tuning-directory-layout")).toHaveValue("grid");
  expect(decompressSnapshot(new URL(page.url()).searchParams.get("s") ?? "").layout?.localMap?.directoryLayout).toBe("grid");
  await expect(page.locator("#map-connections")).toHaveAttribute("data-unshown-connections", "0");
  await expect(connectionsBtn).not.toHaveClass(/has-unshown-connections/);

  // 2. Estate root in 2D Structure: opening Portal stays calm (0 wires, 0 outside column shifts) and lights Connections amber with exact count (1).
  await page.goto(`/samples/estate/?s=${compressSnapshot({
    ...DEFAULT_SNAPSHOT,
    view: "map",
    perspective: "2d",
    openDirectories: new Set([""]),
    layout: { localMap: { directoryLayout: "grid" } }
  })}`);
  await settled2D(page);
  await expect(page.locator("#map-connections .connection-path")).toHaveCount(0);
  await expect(page.locator("#map-connections")).toHaveAttribute("data-unshown-connections", "0");
  await expect(connectionsBtn).not.toHaveClass(/has-unshown-connections/);

  const beforePortal = await layoutItems(page);
  await page.locator('#map-container .local-directory-closed[data-directory="Portal"] .local-directory-open').click();
  await settled2D(page);
  const afterPortal = await layoutItems(page);

  await expect(page.locator("#map-connections .connection-path")).toHaveCount(0);
  for (const [id, before] of beforePortal) {
    if (id === "Portal" || id === "Estate.sln") continue;
    const after = afterPortal.get(id);
    expect(after, `surviving root box ${id}`).toBeDefined();
    expect(after!.col, `${id} keeps its column in calm Structure grid`).toBe(before.col);
  }
  // Portal vacated the last cell of row 1 (col 2), so Estate.sln slides into col 2 without collapsing the 3-col grid.
  expect(afterPortal.get("Estate.sln")?.col).toBe(2);
  expect(Math.max(...[...afterPortal.values()].map(v => v.col)) + 1, "3-column grid stays 3 columns").toBe(3);
  await expect(page.locator("#map-connections")).toHaveAttribute("data-unshown-connections", "1");
  await expect(connectionsBtn).toHaveClass(/has-unshown-connections/);
  await expect(connectionsBtn).toHaveAttribute("title", "1 connection among shown files. Switch to Connections to arrange by them.");

  // 3. Connected folder (`scripts`) in 2D Structure glows amber with exact pair count and switches cleanly to Flow on press.
  await page.goto(`/?s=${compressSnapshot({
    ...DEFAULT_SNAPSHOT,
    view: "map",
    perspective: "2d",
    openDirectories: new Set(["scripts"]),
    layout: { localMap: { directoryLayout: "grid" } }
  })}`);
  await settled2D(page);
  await expect(page.locator("#map-connections .connection-path")).toHaveCount(0);
  const countAttr = await page.locator("#map-connections").getAttribute("data-unshown-connections");
  const count = Number(countAttr);
  expect(count).toBeGreaterThan(3);
  await expect(connectionsBtn).toHaveClass(/has-unshown-connections/);
  await expect(connectionsBtn).toHaveAttribute("title", `${count} connections among shown files. Switch to Connections to arrange by them.`);

  await connectionsBtn.click();
  await settled2D(page);
  await expect(connectionsBtn).toHaveAttribute("aria-pressed", "true");
  await expect(connectionsBtn).not.toHaveClass(/has-unshown-connections/);
  await expect(page.locator("#tuning-directory-layout")).toHaveValue("flow");
  expect(await page.locator("#map-connections path.connection-path.gathered").count()).toBe(count);
});

test("2D Structure card hover highlights connected partner cards and fades unrelated cards without drawing pair lines", async ({ page }) => {
  test.setTimeout(60_000);
  await seed2D(page, {});
  await page.goto(`/?s=${compressSnapshot({
    ...DEFAULT_SNAPSHOT,
    view: "map",
    perspective: "2d",
    openDirectories: new Set(["packages/explorer/src/client"]),
    layout: { localMap: { directoryLayout: "grid" } }
  })}`);
  await settled2D(page);
  await page.getByRole("button", { name: "Fit current scope", exact: true }).click();
  await page.waitForTimeout(350);
  await expect(page.locator("#map-connections .connection-path")).toHaveCount(0);
  expect(Number(await page.locator("#map-connections").getAttribute("data-unshown-connections"))).toBeGreaterThan(20);

  // Pick a card with both connected partners on screen and unrelated cards on screen (`palette.ts` is used by multiple client modules).
  const targetId = "packages/explorer/src/client/palette.ts";
  const card = page.locator(`#map-container .node-card[data-id="${targetId}"]`);
  await expect(card).toBeVisible();
  await card.locator(".node-title").hover();
  await expect(page.locator("#map-container")).toHaveClass(/flow-hover/);
  await page.waitForTimeout(220);

  const hoverState = await page.evaluate((subjectId) => {
    const cards = [...document.querySelectorAll<HTMLElement>("#map-container .node-card")].map(el => ({
      id: el.dataset.id ?? "",
      lit: el.classList.contains("flow-lit"),
      testBacked: el.classList.contains("test-backed"),
      opacity: Number(getComputedStyle(el).opacity),
      haloOpacity: el.classList.contains("test-backed") ? Number(getComputedStyle(el, "::before").opacity) : null
    }));
    const boxes = [...document.querySelectorAll<HTMLElement>("#map-container .local-directory-closed")].map(el => Number(getComputedStyle(el).opacity));
    const paths = document.querySelectorAll("#map-connections .connection-path").length;
    return {
      subject: cards.find(c => c.id === subjectId),
      litPartners: cards.filter(c => c.id !== subjectId && c.lit),
      dimmedCards: cards.filter(c => !c.lit),
      boxes,
      paths
    };
  }, targetId);

  expect(hoverState.paths, "zero pair lines drawn in 2D Structure").toBe(0);
  expect(hoverState.subject?.lit).toBe(true);
  expect(hoverState.subject?.opacity).toBe(1);
  expect(hoverState.litPartners.length, "connected partner cards remain lit").toBeGreaterThan(0);
  for (const partner of hoverState.litPartners) expect(partner.opacity, partner.id).toBe(1);
  expect(hoverState.dimmedCards.length, "unrelated cards fade").toBeGreaterThan(0);
  for (const dimmed of hoverState.dimmedCards) {
    expect(dimmed.opacity, dimmed.id).toBeLessThan(0.8);
    if (dimmed.testBacked) expect(dimmed.haloOpacity, `${dimmed.id} suppresses purple test-backed halo while dimmed`).toBe(0);
  }
  expect(hoverState.dimmedCards.some(card => card.testBacked), "at least one dimmed card is test-backed to exercise halo suppression").toBe(true);
  for (const boxOpacity of hoverState.boxes) expect(boxOpacity).toBeLessThan(0.8);

  await page.mouse.move(0, 0);
  await expect(page.locator("#map-container")).not.toHaveClass(/flow-hover/);
});

test("2D Flow Ancestors = local cuts outside-item displacement on opening client with zero design-audit faults", async ({ page }) => {
  test.setTimeout(90_000);
  await seed2D(page, {});

  const measureOpenClient = async (ancestors: "whole-tree" | "local"): Promise<{ colChanged: number; maxDx: number; eslintDx: number; pkgJsonDx: number; totalCols: number }> => {
    await page.goto(`/?s=${compressSnapshot({
      ...DEFAULT_SNAPSHOT,
      view: "map",
      perspective: "2d",
      openDirectories: new Set(["", "packages", "packages/explorer", "packages/explorer/src"]),
      layout: { localMap: { directoryLayout: "flow", ...(ancestors === "local" ? { flowAncestors: "local" } : {}) } }
    })}`);
    await settled2D(page);
    const before = await layoutItems(page);

    await page.goto(`/?s=${compressSnapshot({
      ...DEFAULT_SNAPSHOT,
      view: "map",
      perspective: "2d",
      openDirectories: new Set(["", "packages", "packages/explorer", "packages/explorer/src", "packages/explorer/src/client"]),
      layout: { localMap: { directoryLayout: "flow", ...(ancestors === "local" ? { flowAncestors: "local" } : {}) } }
    })}`);
    await settled2D(page);
    const after = await layoutItems(page);

    let colChanged = 0;
    let maxDx = 0;
    for (const [id, b] of before) {
      if (id === "packages/explorer/src/client" || id.startsWith("packages/explorer/src/client/")) continue;
      const a = after.get(id);
      if (!a) continue;
      if (a.col !== b.col) colChanged++;
      maxDx = Math.max(maxDx, Math.abs(a.left - b.left));
    }
    const dxOf = (id: string): number => {
      const b = before.get(id), a = after.get(id);
      return b && a ? Math.abs(a.left - b.left) : -1;
    };
    const totalCols = Math.max(0, ...[...after.values()].map(v => v.col)) + 1;
    if (ancestors === "local") {
      const boxes = await textBoxes(page, LOCAL_MAP.text);
      expect(boxes.length).toBeGreaterThan(20);
      const overlaps = overlapsAmong(boxes);
      const cut = await truncations(page, LOCAL_MAP.text);
      expect(overlaps.length + cut.length, describeFaults(overlaps, cut)).toBe(0);
    }
    return {
      colChanged,
      maxDx,
      eslintDx: dxOf("eslint.config.js"),
      pkgJsonDx: dxOf("packages/explorer/package.json"),
      totalCols
    };
  };

  const wholeTree = await measureOpenClient("whole-tree");
  const local = await measureOpenClient("local");
  expect(wholeTree.eslintDx, "whole-tree flings unrelated root loose file thousands of pixels right").toBeGreaterThan(2500);
  expect(wholeTree.pkgJsonDx, "whole-tree flings ancestor package.json thousands of pixels right").toBeGreaterThan(2500);
  expect(local.colChanged, "local changes fewer outside columns than whole-tree").toBeLessThan(wholeTree.colChanged);
  expect(local.totalCols, "local uses fewer total columns than whole-tree").toBeLessThan(wholeTree.totalCols);
  expect(local.eslintDx, "local keeps unrelated root loose file from flying rightward").toBeLessThan(500);
  expect(local.pkgJsonDx, "local keeps ancestor package.json from flying rightward").toBeLessThan(500);
});

test("3D Structure bug fixes: hub hover submits zero ghost reference wires and legend omits References at rest", async ({ page }) => {
  test.setTimeout(90_000);
  await observeGraph(page);
  await page.goto("/samples/estate/?view=local&mode=3d&dir=&layout=structure");
  await settled3D(page);
  await page.mouse.move(5, 5);

  const restLinks = await renderedLinks(page);
  const restRefs = restLinks.filter(referenceWire);
  expect(restRefs.length).toBeGreaterThan(30);
  expect(restRefs.filter(link => link.visible)).toHaveLength(0);
  await expect(page.locator("#spatial-legend")).not.toContainText("References");

  const connectionsBtn = page.getByRole("button", { name: "Connections", exact: true });
  await expect(connectionsBtn).toHaveClass(/has-unshown-connections/);
  await expect(connectionsBtn).toHaveAttribute("title", `${restRefs.length} references among shown files. Switch to Connections to arrange by them.`);

  // Hover directory hub `directory:Database` and wait past pointer rest (350 ms).
  const nodes = await renderedNodes(page);
  const hub = nodes.find(node => node.directory === "Database");
  expect(hub, "Database hub visible in Estate Whole").toBeDefined();
  await page.mouse.move(hub!.x, hub!.y);
  await expect(page.locator(".force-graph-actions")).toBeVisible({ timeout: 5_000 });
  await expect(page.locator(".force-graph-actions")).toHaveAttribute("data-node-id", hub!.id);
  await renderedFrames(page);

  const hoverLinks = (await renderedLinks(page)).filter(referenceWire);
  expect(hoverLinks.filter(link => link.visible), "Case 2 hub hover submits zero GPU reference wires").toHaveLength(0);
  await expect(page.locator("#spatial-legend")).not.toContainText("References");
});

test("3D Structure Lines trial (hover-file and none) suppresses pinned spiderweb, path zig-zags, and hover lasers while lighting partners and Connections", async ({ page }) => {
  test.setTimeout(120_000);
  await observeGraph(page);

  const pins = {
    entries: [
      { nodeId: "PaymentService/PaymentService.cs", symbol: "*" },
      { nodeId: "PaymentService/Data/PaymentsContext.cs", symbol: "*" },
      { nodeId: "Hub/PaymentHub.cs", symbol: "*" }
    ]
  };
  await page.goto(`/samples/estate/?s=${compressSnapshot({
    ...DEFAULT_SNAPSHOT,
    view: "map",
    perspective: "3d",
    spatialLayout: "structure",
    openDirectories: new Set([""]),
    pinSet: pins
  })}`);
  await settled3D(page);
  await page.mouse.move(5, 5);

  const connectionsBtn = page.getByRole("button", { name: "Connections", exact: true });
  await page.getByRole("button", { name: /^Layout tuning/ }).click();
  await expect(page.locator(".sidebar-details")).toHaveAttribute("open", "");
  const select = page.locator("#tuning-force-structure-lines");
  await expect(select).toHaveValue("on-demand");

  // Default on-demand draws Case 3 pinned references and shows References in legend.
  const onDemandVisible = (await renderedLinks(page)).filter(link => referenceWire(link) && link.visible);
  expect(onDemandVisible.length).toBeGreaterThan(10);
  await expect(page.locator("#spatial-legend")).toContainText("References");

  // Switch to hover-file: Case 3 pinned spiderweb vanishes (0 visible refs), legend drops References, Connections glows amber.
  await select.selectOption("hover-file");
  await page.waitForTimeout(200);
  const hoverFileRefs = (await renderedLinks(page)).filter(referenceWire);
  expect(hoverFileRefs.filter(link => link.visible)).toHaveLength(0);
  await expect(page.locator("#spatial-legend")).not.toContainText("References");
  await expect(connectionsBtn).toHaveClass(/has-unshown-connections/);
  await expect(connectionsBtn).toHaveAttribute("title", `${hoverFileRefs.length} references among shown files. Switch to Connections to arrange by them.`);

  // Hovering a single file sphere under hover-file DOES draw its incident wires.
  const targetFile = "Contracts/IPaymentHub.cs";
  const sphere = (await renderedNodes(page)).find(node => node.id === targetFile)!;
  expect(sphere).toBeDefined();
  await page.mouse.move(sphere.x, sphere.y);
  await expect(page.locator(".force-graph-actions")).toBeVisible({ timeout: 5_000 });
  await expect(page.locator(".force-graph-actions")).toHaveAttribute("data-node-id", targetFile);
  await renderedFrames(page);
  const hoverFileActive = (await renderedLinks(page)).filter(link => referenceWire(link) && link.visible);
  expect(hoverFileActive.length).toBeGreaterThan(0);
  await expect(page.locator("#spatial-legend")).toContainText("References");

  // Switch to none (Pure Tree) while hovering / after re-hovering: 0 reference wires, direct partners stay lit, unrelated spheres dim.
  await page.mouse.move(5, 5);
  await expect(page.locator(".force-graph-actions")).toBeHidden({ timeout: 5_000 });
  await select.selectOption("none");
  await renderedFrames(page);
  expect((await renderedLinks(page)).filter(link => referenceWire(link) && link.visible)).toHaveLength(0);
  await expect(page.locator("#spatial-legend")).not.toContainText("References");

  const sphereInNone = (await renderedNodes(page)).find(node => node.id === targetFile)!;
  await page.mouse.move(sphereInNone.x, sphereInNone.y);
  await expect(page.locator(".force-graph-actions")).toBeVisible({ timeout: 5_000 });
  await expect(page.locator(".force-graph-actions")).toHaveAttribute("data-node-id", targetFile);
  await renderedFrames(page);
  const noneHoverLinks = await renderedLinks(page);
  expect(noneHoverLinks.filter(link => referenceWire(link) && link.visible), "Case 1 hover in Pure Tree draws 0 reference lines").toHaveLength(0);
  await expect(page.locator("#spatial-legend")).not.toContainText("References");

  const directPartners = new Set<string>([targetFile]);
  for (const link of noneHoverLinks) {
    if (!referenceWire(link)) continue;
    if (link.source === targetFile) directPartners.add(link.target);
    if (link.target === targetFile) directPartners.add(link.source);
  }
  expect(directPartners.size).toBeGreaterThan(2);
  const nodesDuringHover = await renderedNodes(page);
  for (const partnerId of directPartners) {
    const node = nodesDuringHover.find(n => n.id === partnerId);
    expect(node?.opacity, `partner ${partnerId} stays lit in Pure Tree hover`).toBeGreaterThan(0.7);
  }
  const dimmedOthers = nodesDuringHover.filter(n => !directPartners.has(n.id) && n.directory === undefined && n.opacity < 0.35);
  expect(dimmedOthers.length, "unrelated file spheres dim in Pure Tree hover").toBeGreaterThan(5);

  // Case 4: Estate 12-file path in 3D Structure under none & hover-file draws 0 reference wires while keeping path spheres lit.
  await page.goto(`/samples/estate/?s=${compressSnapshot({
    ...DEFAULT_SNAPSHOT,
    view: "map",
    perspective: "3d",
    spatialLayout: "structure",
    selectedNodeId: "Portal/Pages/Default.aspx",
    pinSet: { entries: [{ nodeId: "Portal/Pages/Default.aspx", symbol: "*" }] },
    destination: { kind: "file", nodeId: "Database/SqlServer/dbo.Payment.sql" },
    layout: { forceGraph: { structureLines: "none" } }
  })}`);
  await settled3D(page);
  await page.mouse.move(5, 5);
  const pathLinksNone = await renderedLinks(page);
  const pathRefsNone = pathLinksNone.filter(referenceWire);
  expect(pathRefsNone.length).toBeGreaterThan(5);
  expect(pathRefsNone.filter(link => link.visible), "Case 4 path under none draws 0 reference wires").toHaveLength(0);
  await expect(page.locator("#spatial-legend")).not.toContainText("References");
  await expect(connectionsBtn).toHaveClass(/has-unshown-connections/);
  const pathNodes = await renderedNodes(page);
  const originNode = pathNodes.find(n => n.id === "Portal/Pages/Default.aspx");
  const destNode = pathNodes.find(n => n.id === "Database/SqlServer/dbo.Payment.sql");
  expect(originNode?.opacity).toBeGreaterThan(0.7);
  expect(destNode?.opacity).toBeGreaterThan(0.7);

  await page.getByRole("button", { name: /^Layout tuning/ }).click();
  await expect(page.locator(".sidebar-details")).toHaveAttribute("open", "");
  await select.selectOption("hover-file");
  await page.waitForTimeout(200);
  expect((await renderedLinks(page)).filter(link => referenceWire(link) && link.visible), "Case 4 path under hover-file draws 0 reference wires at rest").toHaveLength(0);
});
