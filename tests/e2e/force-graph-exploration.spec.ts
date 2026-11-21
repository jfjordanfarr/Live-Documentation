import { expect, test, type Page } from "@playwright/test";
import type { Scene } from "three";

import { compressSnapshot, DEFAULT_SNAPSHOT } from "../../packages/explorer/src/client/persistence/compressed-url-state";
import { spatialGraphOf } from "../../packages/explorer/src/client/views/forceGraphData";
import { observeGraph, renderedNodes } from "./force-graph-observation";
import { currentSnapshot } from "./search-bar";
import { loadGraph, localMapSettled } from "./still-picture";

test.use({ viewport: { width: 1440, height: 960 } });

async function settled(page: Page): Promise<void> {
  await expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "false", { timeout: 25_000 });
}

test("the visible hops control narrows a neighborhood without losing pins and survives sharing", async ({ page }) => {
  test.setTimeout(60_000);
  await observeGraph(page);
  await page.goto(`/samples/estate/?s=${compressSnapshot({ ...DEFAULT_SNAPSHOT, perspective: "3d", selectedNodeId: "Portal/Services/GatewayClient.cs", layout: { forceGraph: { hops: 2 } } })}`);
  await settled(page);
  const before = currentSnapshot(page);
  // Skin represents the omitted files with shells; narrowing applies to the explicit file neighborhood, not its body count.
  const files = new Set((await loadGraph(page, "/samples/estate/")).nodes.map(node => node.id));
  const shownFiles = async () => (await renderedNodes(page)).map(node => node.id).filter(id => files.has(id));
  const two = await shownFiles();
  const hops = page.getByRole("combobox", { name: "Hops shown", exact: true });
  await hops.selectOption("1");
  await settled(page);
  const one = await shownFiles();
  expect(one.length).toBeLessThan(two.length);
  expect(one.every(id => two.includes(id))).toBe(true);
  expect(currentSnapshot(page)).toMatchObject({ pinSet: before.pinSet, selectedNodeId: before.selectedNodeId, layout: { forceGraph: { hops: 1 } } });
  await expect(page.locator("#tuning-force-hops")).toHaveValue("1");
  await page.reload();
  await settled(page);
  await expect(hops).toHaveValue("1");
  expect((await shownFiles()).sort()).toEqual(one.sort());
});

/**
 * A file that stands alone, of no group: the C# Rosetta program's project file, which references no project and which
 * no solution names. The estate held one, Estate.sln, until its readers read a solution (2026-11-21): it now depends on
 * the five projects it names, so none of the estate's files stands alone.
 */
const LONE_SAMPLE = "/samples/rosetta/csharp/";
const LONE = "Rosetta.csproj";
const LONE_DIRECTORY = "src/Models";

test("whole overview finds isolated files and returns to the independent directory and pins", async ({ page }) => {
  test.setTimeout(90_000);
  await observeGraph(page);
  await page.goto(`${LONE_SAMPLE}?view=local&mode=3d&dir=${LONE_DIRECTORY}&layout=connections`);
  await settled(page);
  const before = await renderedNodes(page);
  const local = before.map(node => node.id).sort();
  // The lone file stands in the local picture as its own group's seed, dimmed beyond the frontier (2026-11-02).
  expect(before.find(node => node.id === LONE)?.opacity).toBeLessThan(0.5);
  const whole = page.getByRole("button", { name: "Whole", exact: true });
  await expect(whole).toHaveAttribute("aria-pressed", "false");
  await whole.click();
  await expect(whole).toHaveAttribute("aria-pressed", "true");
  await settled(page);
  const everything = await renderedNodes(page);
  expect(everything.find(node => node.id === LONE)?.opacity, "the whole picture shows the lone file in full").toBeGreaterThan(0.6);
  expect(currentSnapshot(page).openDirectories).toEqual(new Set([LONE_DIRECTORY, ""]));
  // A lone file is named at rest only when its sphere draws large enough (2026-11-02); hovering it names it at once.
  const sphere = everything.find(node => node.id === LONE)!;
  await page.mouse.move(sphere.x, sphere.y);
  const orphan = page.locator(`.force-graph-label[data-node-id="${LONE}"]`);
  await expect(orphan).toBeVisible();
  await orphan.click();
  await expect(orphan).toHaveAttribute("aria-pressed", "true");
  await whole.click();
  await expect(whole).toHaveAttribute("aria-pressed", "false");
  await settled(page);
  expect(currentSnapshot(page)).toMatchObject({ selectedNodeId: null, openDirectories: new Set([LONE_DIRECTORY]), pinSet: { entries: [{ nodeId: LONE, symbol: "*" }] } });
  // Back in the local picture the pinned lone file stands in full; the picture's members are the same, since its seed was already there.
  const returned = await renderedNodes(page);
  expect(returned.map(node => node.id).sort()).toEqual(local);
  expect(returned.find(node => node.id === LONE)?.opacity).toBeGreaterThan(0.6);
  // A portable pin set retains its independent directory and the newly discovered orphan after reload.
  await page.reload();
  await settled(page);
  expect(currentSnapshot(page).openDirectories).toEqual(new Set([LONE_DIRECTORY]));
  // The pinned file is named at rest; its name releases it as its sphere would.
  await expect(orphan).toBeVisible();
  await orphan.click();
  await settled(page);
  expect(currentSnapshot(page).pinSet.entries).toEqual([]);
  expect((await renderedNodes(page)).map(node => node.id).sort()).toEqual(local);
});

test("directory discovery survives a layout switch without opening or pinning its subtree, beside its reader", async ({ page }) => {
  test.setTimeout(60_000);
  await observeGraph(page);
  // Bare hubs discover; a Skin frontier cell instead opens its directory.
  await page.goto(`/samples/estate/?s=${compressSnapshot({ ...DEFAULT_SNAPSHOT, perspective: "3d", spatialLayout: "structure", layout: { forceGraph: { groupWrappers: "off", hops: 2 } } })}`);
  await settled(page);
  // A hub not asked about is named on approach or hover (2026-11-02): hovering it names it for the click.
  const hoverHub = async (id: string): Promise<void> => {
    const hub = (await renderedNodes(page)).find(node => node.id === id)!;
    await page.mouse.move(hub.x, hub.y);
    await page.locator(`.force-graph-label[data-node-id="${id}"]`).waitFor({ state: "visible" });
  };
  // The estate's databases: none of their files reaches the group of Estate.sln and the five projects it names (read
  // since 2026-11-21), whose seed it is as its most connected file. Portal no longer serves, since Portal.csproj is of
  // that group.
  await hoverHub("directory:Database");
  await page.locator('.force-graph-label[data-node-id="directory:Database"]').click();
  await settled(page);
  await page.getByRole("button", { name: "Connections", exact: true }).click();
  await settled(page);
  expect(currentSnapshot(page)).toMatchObject({ discovery: { kind: "directory", directory: "Database" }, openDirectories: new Set(), pinSet: { entries: [] }, selectedNodeId: null });
  const nodes = await renderedNodes(page);
  expect(nodes.map(node => node.id)).toContain("Database/SqlServer/dbo.usp_PostPayment.sql");
  // A group the directory does not reach is not discovered with it; its seed stands dimmed (2026-11-02).
  expect(nodes.find(node => node.id === "Estate.sln")?.opacity).toBeLessThan(0.5);
  const reader = (await page.locator("#detail-panel").boundingBox())!;
  const frame = (await page.locator("#graph-svg canvas").boundingBox())!;
  const controls = (await page.locator(".perspective-controls").boundingBox())!;
  for (const node of nodes) {
    expect(node.depth).toBeGreaterThan(-1); expect(node.depth).toBeLessThan(1);
    expect(node.x - node.screenRadius).toBeGreaterThan(frame.x);
    expect(node.x + node.screenRadius).toBeLessThan(reader.x);
    expect(node.y - node.screenRadius).toBeGreaterThan(frame.y);
    expect(node.y + node.screenRadius).toBeLessThan(controls.y);
  }
  await page.getByRole("button", { name: "Structure", exact: true }).click();
  await settled(page);
  await hoverHub("directory:Database");
  await page.locator('.force-graph-label[data-node-id="directory:Database"]').click();
  expect(currentSnapshot(page).discovery).toBeUndefined();
  expect(currentSnapshot(page).openDirectories.size).toBe(0);
  await expect(page.locator("#detail-panel")).not.toHaveClass(/visible/);
});

test("a lone file settles, small body jitter pins it, and a moving name releases the pressed identity", async ({ page }) => {
  test.setTimeout(60_000);
  await observeGraph(page);
  await page.goto(`${LONE_SAMPLE}?view=local&mode=3d&node=${LONE}`);
  await settled(page);
  // The lone file in full, and the other groups' seeds dimmed beside it, since 2026-11-02 no group is out of reach.
  const nodes = await renderedNodes(page);
  const only = nodes.find(node => node.id === LONE)!;
  expect(only.opacity).toBeGreaterThan(0.6);
  const seeds = nodes.filter(node => node.id !== LONE);
  // The program's other files are one group (twelve C# files), so one seed stands beside the lone file.
  expect(seeds.length, "one seed for each of the program's other groups").toBe(1);
  for (const seed of seeds) expect(seed.opacity, `${seed.id} stands dimmed`).toBeLessThan(0.5);
  await page.mouse.move(only.x, only.y);
  await page.mouse.down();
  await page.mouse.move(only.x + 3, only.y + 1, { steps: 3 });
  await page.mouse.up();
  expect(currentSnapshot(page).pinSet.entries).toEqual([{ nodeId: LONE, symbol: "*" }]);
  const name = page.locator(`.force-graph-focus[data-node-id="${LONE}"], .force-graph-label[data-node-id="${LONE}"]`);
  const box = (await name.boundingBox())!;
  const pressed = await name.elementHandle();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  // Reproduce a layout moving the name between the user's press and release, through real pointer capture.
  await pressed!.evaluate(element => { (element as HTMLElement).style.translate = "80px 0"; });
  await page.mouse.up();
  expect(currentSnapshot(page).pinSet.entries).toEqual([]);
  expect(currentSnapshot(page).selectedNodeId).toBeNull();
});

for (const scope of ["directory", "pins"] as const) {
  test(`${scope} without a selected subject keeps its identities through both perspective transitions`, async ({ page }) => {
    test.setTimeout(90_000);
    await observeGraph(page);
    const snapshot = { ...DEFAULT_SNAPSHOT, spatialLayout: "structure" as const,
      ...(scope === "directory" ? { openDirectories: new Set(["Portal"]), layout: { forceGraph: { groupWrappers: "off" as const, hops: 2 } } }
        : { pinSet: { entries: [{ nodeId: "Portal/Services/GatewayClient.cs", symbol: "*" }, { nodeId: "Estate.sln", symbol: "*" }] } }) };
    await page.goto(`/samples/estate/?s=${compressSnapshot(snapshot)}`);
    await localMapSettled(page);
    const before = currentSnapshot(page);
    const identities = await page.locator("#map-container .node-card, #map-container .local-directory-closed").evaluateAll(elements => elements.map(element => {
      const item = element as HTMLElement;
      return item.classList.contains("node-card") ? item.dataset.id! : `directory:${item.dataset.directory!}`;
    }));
    expect(identities.length).toBeGreaterThan(1);
    await page.getByRole("button", { name: "3D", exact: true }).click();
    const bridge = page.locator(".perspective-transition[data-graph-files]");
    await expect(bridge).toBeVisible();
    const presented = await renderedNodes(page);
    expect(presented.some(node => identities.includes(node.id))).toBe(true);
    // This bare-hub journey explicitly uses Off and two hops; Skin cells and single-file representatives need their own correspondence checks.
    if (scope === "directory") {
      const closed = identities.filter(id => id.startsWith("directory:Portal/"));
      expect(closed.length).toBeGreaterThan(0);
      for (const id of closed) expect(presented.map(node => node.id)).toContain(id);
    }
    await expect(bridge).toHaveCount(0);
    await settled(page);
    const heldId = scope === "pins" ? before.pinSet.entries.at(-1)!.nodeId : null;
    const held = heldId ? (await renderedNodes(page)).find(node => node.id === heldId)! : null;
    await page.getByRole("button", { name: "2D", exact: true }).click();
    await expect(bridge).toBeVisible();
    if (held) {
      const position = await page.locator(`.perspective-file-name[data-node-id="${held.id}"]`).evaluate(element => {
        const frame = element.parentElement!.getBoundingClientRect();
        return { x: frame.left + parseFloat((element as HTMLElement).style.left), y: frame.top + parseFloat((element as HTMLElement).style.top) };
      });
      expect(Math.abs(position.x - held.x)).toBeLessThan(2);
      // The animation's name sits below the sphere; its horizontal identity must not travel to an unrelated card.
    }
    await expect(bridge).toHaveCount(0);
    await localMapSettled(page);
    expect(currentSnapshot(page)).toMatchObject({ selectedNodeId: null, pinSet: before.pinSet, openDirectories: before.openDirectories });
    const after = await page.locator("#map-container .node-card, #map-container .local-directory-closed").evaluateAll(elements => elements.map(element => {
      const item = element as HTMLElement;
      return item.classList.contains("node-card") ? item.dataset.id! : `directory:${item.dataset.directory!}`;
    }));
    expect(after.sort()).toEqual(identities.sort());
  });
}

for (const groupWrappers of ["skin", "off"] as const) {
  test(`Whole in Structure with ${groupWrappers} shows every file and hub, then restores independent local retention`, async ({ page }) => {
    test.setTimeout(60_000);
    await observeGraph(page);
    const snapshot = { ...DEFAULT_SNAPSHOT, perspective: "3d" as const, spatialLayout: "structure" as const,
      openDirectories: new Set(["Portal"]), pinSet: { entries: [{ nodeId: "Estate.sln", symbol: "*" }] },
      layout: { forceGraph: { groupWrappers, hops: 1 } } };
    await page.goto(`/samples/estate/?s=${compressSnapshot(snapshot)}`);
    await settled(page);
    const local = (await renderedNodes(page)).map(node => node.id).sort();
    const before = currentSnapshot(page);
    const whole = page.getByRole("button", { name: "Whole", exact: true });
    await whole.click();
    await expect(whole).toHaveAttribute("aria-pressed", "true");
    await settled(page);
    const graph = await loadGraph(page, "/samples/estate/");
    const expected = spatialGraphOf(graph, node => (node.archetype || "").toLowerCase() !== "asset", [], "structure");
    expect((await renderedNodes(page)).map(node => node.id).sort(), "Whole includes every filtered file and its directory hubs")
      .toEqual(expected.nodes.map(node => node.id).sort());
    const files = expected.nodes.filter(node => node.directoryPath === undefined).length;
    await expect(page.locator("#stats-line")).toContainText(`${files} of ${files} files shown`);
    const wrapped = await page.evaluate(() => {
      const { scene } = (window as unknown as { renderedGraph: { scene: Scene } }).renderedGraph;
      let seeds: string[] = [];
      scene.traverse(object => { if (object.name === "Spatial wrappers") seeds = object.userData.spatialWrappers.seeds; });
      return seeds;
    });
    expect(wrapped, "no collapsed frontier bubble remains in the whole graph").toEqual([]);
    await whole.click();
    await expect(whole).toHaveAttribute("aria-pressed", "false");
    await settled(page);
    expect(currentSnapshot(page)).toMatchObject({ selectedNodeId: before.selectedNodeId, openDirectories: before.openDirectories, pinSet: before.pinSet });
    expect((await renderedNodes(page)).map(node => node.id).sort(), "local membership returns after withdrawing only the root opening").toEqual(local);
  });
}
