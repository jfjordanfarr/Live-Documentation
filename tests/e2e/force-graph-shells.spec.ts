import { expect, test, type Page } from "@playwright/test";

import { observeGraph } from "./force-graph-observation";
import { loadGraph } from "./still-picture";
import { compressSnapshot, DEFAULT_SNAPSHOT } from "../../packages/explorer/src/client/persistence/compressed-url-state";
import { getDefaultTuning, PERSISTED_UI_KEY, PERSISTED_UI_VERSION } from "../../packages/explorer/src/client/persistence/local-storage";
import type { GroupWrappers } from "../../packages/explorer/src/client/types";
import { spatialGraphOf } from "../../packages/explorer/src/client/views/forceGraphData";
import { linkPulls, spatialNodeRadius } from "../../packages/explorer/src/client/views/forceGraphLayout";
import { connectedNeighbours, spatialScope } from "../../packages/explorer/src/client/views/forceGraphScope";
import { shellPicture, type ShellPicture } from "../../packages/explorer/src/client/views/forceGraphShells";

/**
 * Directory shells, experiment 2 of the shrink-wrap work behind the Group Wrappers choice (2026-11-05; the owner's
 * correction of [Turn 11 of the November 5 record](../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-11)):
 * with the choice Off, the default, no shell is drawn; with Skin, the files a pinned picture leaves out of the group it
 * shows in part stand as one body per directory at the Shell Depth, each wired to what its files reference; a click pops
 * a shell into its own files and its subdirectories' shells, and its directory's name wraps it again. The shells drawn
 * are read from the page's own buffers and the shells expected are computed from the bundle by the pure functions the
 * page runs.
 */
test.use({ viewport: { width: 1280, height: 800 } });

const REPO_PIN = "packages/explorer/src/client/views/forceGraphView.ts";
const ESTATE_PIN = "PaymentService/PaymentService.cs";
const entry = (base: string, pin: string): string => `${base}?s=${compressSnapshot({ ...DEFAULT_SNAPSHOT, perspective: "3d", spatialLayout: "connections",
  filters: { showTests: true, showAssets: false }, pinSet: { entries: [{ nodeId: pin, symbol: "*" }] } })}`;

/** Choose the wrappers and the shells' depth before the page starts, as saved Tuning choices, keeping the suite's still Local Map search. */
async function choose(page: Page, look: GroupWrappers, shellDepth = getDefaultTuning().forceGraph.shellDepth): Promise<void> {
  await page.addInitScript(([key, version, wrappers, depth]) => {
    localStorage.setItem(key, JSON.stringify({ version, tuning: { localMap: { searchStarts: 0 }, forceGraph: { groupWrappers: wrappers, shellDepth: depth } } }));
  }, [PERSISTED_UI_KEY, PERSISTED_UI_VERSION, look, shellDepth] as const);
}

/** The shells a pinned picture holds, by the page's own pure functions over the bundle, with some directories popped. */
async function expectedShells(page: Page, base: string, pin: string, depth: number, popped: readonly string[] = []): Promise<ShellPicture> {
  const graph = await loadGraph(page, base);
  const data = spatialGraphOf(graph, node => (node.archetype || "").toLowerCase() !== "asset", [], "connections");
  const pulls = (link: { kind?: string }): boolean => linkPulls(link, "connections");
  const scope = spatialScope(data.nodes, data.links, new Set([pin]), getDefaultTuning().forceGraph.hops, pulls);
  return shellPicture({ nodes: data.nodes, links: data.links, shown: new Set(scope.hops.keys()), hidden: scope.hidden, depth, popped: new Set(popped),
    beside: connectedNeighbours(data.nodes, data.links, pulls), bundles: link => pulls(link) && link.kind !== "related-doc" && link.kind !== "cited-by" });
}

/** What the page draws: its nodes, the shells among them with their wires, and the wrappers' mesh. */
async function drawnShells(page: Page): Promise<{ nodes: string[]; shells: string[]; shellWires: number; wrapped: string[]; popping: string[] }> {
  return page.evaluate(() => {
    type Entry = { data: { id: string; shellFiles?: number; source: string | { id: string }; target: string | { id: string } } };
    const observed = (window as unknown as { renderedGraph?: { scene: { traverse(visit: (object: { name: string; userData: Record<string, unknown> }) => void): void } } }).renderedGraph;
    const found = { nodes: [] as string[], shells: [] as string[], shellWires: 0, wrapped: [] as string[], popping: [] as string[] };
    let links: Entry[] = [];
    observed?.scene.traverse(object => {
      const batch = object.userData.spatialBatch as { kind: string; entries: Entry[] } | undefined;
      if (batch?.kind === "nodes") for (const { data } of batch.entries) (data.shellFiles === undefined ? found.nodes : found.shells).push(data.id);
      if (batch?.kind === "links") links = batch.entries;
      if (object.name === "Spatial wrappers") {
        const info = object.userData.spatialWrappers as { seeds: string[]; popping: string[] };
        found.wrapped = info.seeds; found.popping = info.popping;
      }
    });
    const shells = new Set(found.shells);
    for (const { data } of links) {
      const a = typeof data.source === "string" ? data.source : data.source.id, b = typeof data.target === "string" ? data.target : data.target.id;
      if (shells.has(a) || shells.has(b)) found.shellWires++;
    }
    found.nodes.sort(); found.shells.sort();
    return found;
  });
}

/** Where a node stands on screen, and how large its body draws there. */
async function screenOf(page: Page, id: string, radius: number): Promise<{ x: number; y: number; r: number } | null> {
  return page.evaluate(([wanted, size]) => {
    type Datum = { id: string; x: number; y: number; z: number };
    type Projector = { project(camera: unknown): { x: number; y: number }; clone(): Projector; set(x: number, y: number, z: number): Projector };
    const observed = (window as unknown as { renderedGraph: { camera: { position: Projector; matrixWorld: { elements: number[] } };
      scene: { traverse(visit: (object: { userData: Record<string, unknown> }) => void): void } } }).renderedGraph;
    const rect = document.querySelector("#graph-svg canvas")!.getBoundingClientRect();
    let found: { x: number; y: number; r: number } | null = null;
    observed.scene.traverse(object => {
      const batch = object.userData.spatialBatch as { kind: string; entries: Array<{ data: Datum }> } | undefined;
      if (batch?.kind !== "nodes") return;
      for (const { data } of batch.entries) if (data.id === wanted) {
        const right = observed.camera.matrixWorld.elements;
        const at = observed.camera.position.clone().set(data.x, data.y, data.z).project(observed.camera);
        const rim = observed.camera.position.clone().set(data.x + right[0] * size, data.y + right[1] * size, data.z + right[2] * size).project(observed.camera);
        found = { x: rect.left + (at.x + 1) * rect.width / 2, y: rect.top + (1 - at.y) * rect.height / 2, r: Math.abs(rim.x - at.x) * rect.width / 2 };
      }
    });
    return found;
  }, [id, radius] as const);
}

/**
 * A shell's skin as the page draws it, read from the wrappers' mesh alone: its centre, the shell's place among the drawn
 * spheres' data; the skin, the group of the mesh's vertices that stands nearest it; its drawn radius, the farthest of
 * those vertices from the centre; and its opacity.
 */
async function skinOf(page: Page, id: string): Promise<{ centre: { x: number; y: number; z: number }; radius: number; alpha: number } | null> {
  return page.evaluate(wanted => {
    type Attribute = { count: number; getX(i: number): number; getY(i: number): number; getZ(i: number): number };
    type Object3D = { name: string; visible: boolean; userData: Record<string, unknown>; geometry?: { getAttribute(name: string): Attribute | undefined } };
    const observed = (window as unknown as { renderedGraph: { scene: { traverse(visit: (object: Object3D) => void): void } } }).renderedGraph;
    let centre: { x: number; y: number; z: number } | null = null, mesh: Object3D | null = null;
    observed.scene.traverse(object => {
      const batch = object.userData.spatialBatch as { kind: string; entries: Array<{ data: { id: string; x: number; y: number; z: number } }> } | undefined;
      if (batch?.kind === "nodes") for (const { data } of batch.entries) if (data.id === wanted) centre = { x: data.x, y: data.y, z: data.z };
      if (object.name === "Spatial wrappers") mesh = object;
    });
    const at = centre as { x: number; y: number; z: number } | null, skin = mesh as Object3D | null;
    if (!at || !skin?.visible) return null;
    const position = skin.geometry!.getAttribute("position")!, group = skin.geometry!.getAttribute("wrapperGroup")!, alpha = skin.geometry!.getAttribute("wrapperAlpha")!;
    const sums = new Map<number, { x: number; y: number; z: number; n: number; first: number }>();
    for (let i = 0; i < position.count; i++) {
      const g = group.getX(i), sum = sums.get(g) ?? sums.set(g, { x: 0, y: 0, z: 0, n: 0, first: i }).get(g)!;
      sum.x += position.getX(i); sum.y += position.getY(i); sum.z += position.getZ(i); sum.n++;
    }
    let nearest = -1, best = Infinity;
    for (const [g, sum] of sums) {
      const d = Math.hypot(sum.x / sum.n - at.x, sum.y / sum.n - at.y, sum.z / sum.n - at.z);
      if (d < best) { best = d; nearest = g; }
    }
    if (nearest < 0) return null;
    let radius = 0;
    for (let i = 0; i < position.count; i++) if (group.getX(i) === nearest) radius = Math.max(radius, Math.hypot(position.getX(i) - at.x, position.getY(i) - at.y, position.getZ(i) - at.z));
    return { centre: at, radius, alpha: alpha.getX(sums.get(nearest)!.first) };
  }, id);
}

/** Every drawn node's place and body, by id, for what a pop releases. */
async function drawnBodies(page: Page): Promise<Map<string, { x: number; y: number; z: number; radius: number }>> {
  const tuning = getDefaultTuning().forceGraph;
  const nodes = await page.evaluate(() => {
    const found: Array<{ id: string; x: number; y: number; z: number; publicSymbols: string[]; shellFiles?: number; shellBody?: number }> = [];
    (window as unknown as { renderedGraph: { scene: { traverse(visit: (object: { userData: Record<string, unknown> }) => void): void } } }).renderedGraph.scene.traverse(object => {
      const batch = object.userData.spatialBatch as { kind: string; entries: Array<{ data: (typeof found)[number] }> } | undefined;
      if (batch?.kind === "nodes") for (const { data } of batch.entries) found.push({ id: data.id, x: data.x, y: data.y, z: data.z, publicSymbols: data.publicSymbols, shellFiles: data.shellFiles, shellBody: data.shellBody });
    });
    return found;
  });
  return new Map(nodes.map(node => [node.id, { x: node.x, y: node.y, z: node.z, radius: spatialNodeRadius(node, tuning) }]));
}

/** What the shells' skins show within them, as the page draws it: each unit's shell, place, body and kind. */
async function shownUnits(page: Page): Promise<Array<{ seed: string; id: string; kind: string; x: number; y: number; z: number; radius: number; depth?: number; parent?: string; veiled?: boolean }>> {
  return page.evaluate(() => {
    const found: Array<{ seed: string; id: string; kind: string; x: number; y: number; z: number; radius: number; depth?: number; parent?: string; veiled?: boolean }> = [];
    (window as unknown as { renderedGraph: { scene: { traverse(visit: (object: { name: string; visible: boolean; userData: Record<string, unknown> }) => void): void } } }).renderedGraph.scene.traverse(object => {
      if ((object.name === "Spatial shell files" || object.name === "Spatial shell balloons") && object.visible) found.push(...object.userData.spatialUnits as typeof found);
    });
    return found;
  });
}

const legendRow = (page: Page, label: RegExp) => page.locator("#spatial-legend .legend-row").filter({ hasText: label });
const SHELL_ROW = /^Shell: N files of a directory; click to open it$/;

test("off, the default, draws no shell: the pinned picture is its hops alone", async ({ page }) => {
  await observeGraph(page);
  await page.goto(entry("/samples/estate/", ESTATE_PIN));
  await expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "false", { timeout: 25_000 });
  expect(await page.locator("#tuning-force-group-wrappers").inputValue()).toBe("off");
  const expected = await expectedShells(page, "/samples/estate/", ESTATE_PIN, 2);
  expect(expected.shells.length, "the estate's pinned picture would have shells to draw").toBeGreaterThan(0);
  const drawn = await drawnShells(page);
  expect(drawn.shells).toEqual([]);
  expect(drawn.wrapped).toEqual([]);
  await expect(legendRow(page, SHELL_ROW)).toHaveCount(0);
});

test("the skin holds this repository's hidden files in a shell per directory two deep, each wired by its bundled references", async ({ page }) => {
  await observeGraph(page);
  await choose(page, "skin");
  await page.goto(entry("/", REPO_PIN));
  const expected = await expectedShells(page, "/", REPO_PIN, 2);
  // Measured on November 5: 328 hidden files in 10 shells, 134 bundled wires, no file loose.
  expect(expected.shells.length, "this repository's pinned picture has several shells").toBeGreaterThan(4);
  const ids = expected.shells.map(shell => shell.id).sort();
  // The shells enter with their hop of the reveal and are wrapped as their hulls are built, a few a frame.
  await expect.poll(async () => (await drawnShells(page)).shells, { timeout: 20_000 }).toEqual(ids);
  await expect.poll(async () => (await drawnShells(page)).wrapped.filter(id => id.startsWith("shell:")).sort(), { timeout: 10_000 }).toEqual(ids);
  expect((await drawnShells(page)).shellWires, "one wire for each pair of ends the members' references join").toBe(expected.wires.length);
  for (const shell of expected.shells) expect(expected.wires.some(wire => wire.source === shell.id || wire.target === shell.id), shell.directory).toBe(true);
  await expect(legendRow(page, SHELL_ROW)).toBeVisible();
});

test("a click pops a shell into its own files and a shell of a subdirectory, and its directory's name wraps it again", async ({ page }) => {
  await observeGraph(page);
  await choose(page, "skin", 1);
  await page.goto(entry("/samples/estate/", ESTATE_PIN));
  const before = await expectedShells(page, "/samples/estate/", ESTATE_PIN, 1);
  const portal = before.shells.find(shell => shell.directory === "Portal")!;
  expect(portal, "the estate's portal stands as one shell one directory deep").toBeDefined();
  const after = await expectedShells(page, "/samples/estate/", ESTATE_PIN, 1, ["Portal"]);
  const subShells = after.shells.filter(shell => shell.directory.startsWith("Portal/")).map(shell => shell.id);
  expect(after.released.length, "the pop releases files").toBeGreaterThan(0);
  expect(subShells.length, "the pop leaves a subdirectory's shell").toBeGreaterThan(0);
  await expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "false", { timeout: 25_000 });
  await expect.poll(async () => (await drawnShells(page)).wrapped).toContain(portal.id);
  // Aim at the shell where the pointer names it: its centre, or a point within its body when a sphere stands in front.
  const radius = (await drawnBodies(page)).get(portal.id)!.radius;
  const at = (await screenOf(page, portal.id, radius))!;
  const named = page.locator(`.force-graph-label[data-node-id="${portal.id}"]:not([hidden])`);
  let aimed: { x: number; y: number } | null = null;
  for (const [dx, dy] of [[0, 0], [0.5, 0], [-0.5, 0], [0, 0.5], [0, -0.5]]) {
    const point = { x: at.x + dx * at.r, y: at.y + dy * at.r };
    await page.mouse.move(point.x, point.y);
    if (await named.isVisible().catch(() => false) && await named.getAttribute("data-priority").catch(() => null) === "1") { aimed = point; break; }
  }
  expect(aimed, "the pointer names the shell somewhere within its body").not.toBeNull();
  await expect(named).toHaveAttribute("title", new RegExp(`^Portal · ${portal.files.length} files · Open this shell$`));
  await page.mouse.click(aimed!.x, aimed!.y);
  // Nothing was pinned: the pop is the view's own, the shell is gone, its files and its subdirectory's shell are drawn.
  await expect(page.locator(".pin-tray-toggle")).toHaveText("1 pin");
  await expect.poll(async () => (await drawnShells(page)).shells, { timeout: 5_000 }).toEqual(after.shells.map(shell => shell.id).sort());
  const opened = await drawnShells(page);
  for (const id of after.released) expect(opened.nodes, id).toContain(id);
  // Wrapping again: the directory keeps a dimmed name where its files stand, a click on which brings the shell back.
  const chip = page.locator('.force-graph-label[data-kind="popped"][data-directory="Portal"]');
  await expect(chip).toBeVisible();
  await expect(chip).toHaveAttribute("data-context", "true");
  // The name follows its files while they settle, some 15 s on this picture: the keyboard acts on it where it stands.
  await chip.focus();
  await page.keyboard.press("Enter");
  await expect.poll(async () => (await drawnShells(page)).shells, { timeout: 5_000 }).toEqual(before.shells.map(shell => shell.id).sort());
  const wrapped = await drawnShells(page);
  for (const id of after.released) expect(wrapped.nodes, id).not.toContain(id);
  await expect(chip).toHaveCount(0);
});

/**
 * A shell as a true stand-in for what it holds (2026-11-06, the owner on November 6: "a computed mesh which is a stand-in
 * for many many many nodes underneath it", [Turn 3 of the November 6 record](../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-06.1.record.md#turn-3)):
 * in the foreground, as large as what it holds, showing within its skin what a pop releases, and leaving it standing
 * there at the frame of the pop. On the estate one directory deep, whose portal holds its own files and two
 * subdirectories' shells.
 */
async function portalShell(page: Page): Promise<{ portal: ShellPicture["shells"][number]; releases: string[]; files: string[]; balloons: number }> {
  await observeGraph(page);
  await choose(page, "skin", 1);
  await page.goto(entry("/samples/estate/", ESTATE_PIN));
  const before = await expectedShells(page, "/samples/estate/", ESTATE_PIN, 1);
  const after = await expectedShells(page, "/samples/estate/", ESTATE_PIN, 1, ["Portal"]);
  const portal = before.shells.find(shell => shell.directory === "Portal")!;
  // What its pop releases: its files that enter the picture, and its subdirectories' shells.
  const files = after.released.filter(id => portal.files.includes(id)), shells = after.shells.filter(shell => shell.directory.startsWith("Portal/")).map(shell => shell.id);
  expect(files.length && shells.length, "the portal's pop releases files and shells").toBeTruthy();
  await expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "false", { timeout: 25_000 });
  await expect.poll(async () => (await drawnShells(page)).wrapped).toContain(portal.id);
  return { portal, releases: [...files, ...shells], files, balloons: shells.length };
}

test("a shell is as bright as a shown file, and its skin shows within it every file it holds, in its bubbles, apart", async ({ page }) => {
  const { portal, balloons } = await portalShell(page);
  // Nothing has the attention: the skin is as opaque as a shown sphere, not dimmed as a hop beyond, and so is its name.
  const skin = (await skinOf(page, portal.id))!;
  expect(skin.alpha).toBe(1);
  const label = page.locator(`.force-graph-label[data-node-id="${portal.id}"]`);
  await expect(label).toHaveAttribute("data-context", "false");
  expect(await label.evaluate(element => getComputedStyle(element).opacity)).toBe("1");
  await expect(label).toHaveText(`Portal · ${portal.files.length}`);
  // From the leaves (2026-11-06, second round): as many spheres within the skin as its name counts, every one of its files,
  // each subdirectory's bubble one level in, and the bubbles inside the skin and apart from each other.
  const units = (await shownUnits(page)).filter(unit => unit.seed === portal.id);
  expect(units.filter(unit => unit.kind === "file").map(unit => unit.id).sort()).toEqual([...portal.files].sort());
  const bubbles = units.filter(unit => unit.kind === "directory");
  expect(bubbles.filter(unit => unit.depth === 0)).toHaveLength(balloons);
  for (const unit of units) {
    expect(Math.hypot(unit.x - skin.centre.x, unit.y - skin.centre.y, unit.z - skin.centre.z) + unit.radius, unit.id).toBeLessThanOrEqual(skin.radius + 1e-3);
    const parent = bubbles.find(bubble => bubble.id === unit.parent);
    if (parent) expect(Math.hypot(unit.x - parent.x, unit.y - parent.y, unit.z - parent.z) + unit.radius, `${unit.id} within ${parent.id}`).toBeLessThanOrEqual(parent.radius + 1e-3);
  }
  const gap = getDefaultTuning().forceGraph.collisionGap;
  for (const [i, a] of bubbles.entries()) for (const b of bubbles.slice(i + 1)) {
    if (a.parent === b.parent) expect(Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z), `${a.id} apart from ${b.id}`).toBeGreaterThanOrEqual(a.radius + b.radius + gap - gap / 100);
  }
});

test("a pop leaves standing at its frame what the skin showed: every unit it releases inside the skin, its bubbles as shells of their size", async ({ page }) => {
  await page.clock.install();
  const { portal, releases } = await portalShell(page);
  const skin = (await skinOf(page, portal.id))!;
  const shown = (await shownUnits(page)).filter(unit => unit.seed === portal.id && (unit.depth ?? 0) === 0);
  // The page's clock stops at the pop and goes one frame on: the frame of the pop is the page's own first after it.
  await page.clock.pauseAt(await page.evaluate(() => Date.now()) + 1000);
  await page.locator(`.force-graph-label[data-node-id="${portal.id}"]`).evaluate(element => (element as HTMLElement).click());
  await page.clock.runFor(20);
  const bodies = await drawnBodies(page);
  // Born where the skin showed it, each unit has had the frame's one tick of motion, which may carry it a little.
  const tick = getDefaultTuning().forceGraph.collisionGap;
  const reaches = releases.map(id => {
    const body = bodies.get(id);
    expect(body, `${id} stands at the frame of the pop`).toBeDefined();
    // A file is shown by its id, a subdirectory's shell as the bubble of its directory.
    const unit = shown.find(item => item.id === id || `shell:${item.id}` === id);
    expect(unit, `${id} was shown within the skin`).toBeDefined();
    expect(Math.hypot(body!.x - unit!.x, body!.y - unit!.y, body!.z - unit!.z), `${id} stands where it was shown`).toBeLessThan(tick);
    if (unit!.kind === "directory") expect(body!.radius, `${id} is a shell as large as its bubble was`).toBeCloseTo(unit!.radius, 6);
    const reach = Math.hypot(body!.x - skin.centre.x, body!.y - skin.centre.y, body!.z - skin.centre.z) + body!.radius;
    expect(reach, `${id} stands inside the skin`).toBeLessThanOrEqual(skin.radius + tick);
    return reach;
  });
  // The skin was drawn as large as what it held: what it releases reaches out to it.
  expect(Math.max(...reaches)).toBeGreaterThan(0.8 * skin.radius);
  await page.clock.resume();
});

/**
 * A chain of directories holding one subdirectory each collapses into what it holds (2026-11-06, second round): in this
 * repository pinned on the rosetta manifest at one hop, four directories deep, the Java program's shell holds its
 * `pom.xml` and the bubble of `src/com/rosetta`, four bubbles and a lone file inside it, so that its pop leaves two things, never one shell
 * named `src` holding all.
 */
test("a shell over a chain shows every file it holds, and its pop leaves more than one thing: the chain's bubble as a shell of its size", async ({ page }) => {
  test.setTimeout(240_000);
  const pin = "tests/integration/programs/rosetta-manifest.json", java = "tests/integration/programs/java/rosetta";
  await observeGraph(page);
  await page.addInitScript(([key, version]) => {
    localStorage.setItem(key, JSON.stringify({ version, tuning: { localMap: { searchStarts: 0 }, forceGraph: { groupWrappers: "skin", shellDepth: 4, hops: 1 } } }));
  }, [PERSISTED_UI_KEY, PERSISTED_UI_VERSION] as const);
  await page.clock.install();
  await page.goto(entry("/", pin));
  await expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "false", { timeout: 200_000 });
  const id = `shell:${java}`;
  await expect.poll(async () => (await shownUnits(page)).filter(unit => unit.seed === id && unit.kind === "file").length, { timeout: 10_000 }).toBe(12);
  const units = (await shownUnits(page)).filter(unit => unit.seed === id);
  const chain = units.find(unit => unit.kind === "directory" && unit.depth === 0)!;
  expect(chain.id).toBe(`${java}/src/com/rosetta`);
  // Its five subdirectories: four bubbles, and `app`, whose one file is that file.
  expect(units.filter(unit => unit.kind === "directory" && unit.parent === chain.id)).toHaveLength(4);
  expect(units.filter(unit => unit.kind === "file" && unit.parent === chain.id).map(unit => unit.id)).toEqual([`${java}/src/com/rosetta/app/PipelineTest.java`]);
  await expect(page.locator(`.force-graph-label[data-node-id="${id}"]`)).toHaveText(/ · 12$/);
  await page.clock.pauseAt(await page.evaluate(() => Date.now()) + 1000);
  await page.locator(`.force-graph-label[data-node-id="${id}"]`).evaluate(element => (element as HTMLElement).click());
  await page.clock.runFor(20);
  const bodies = await drawnBodies(page);
  expect(bodies.has(`${java}/pom.xml`), "the pom stands").toBe(true);
  expect(bodies.get(`shell:${chain.id}`)?.radius, "the chain's bubble stands as a shell of its size").toBeCloseTo(chain.radius, 6);
  expect(bodies.has(`shell:${java}/src`), "no shell named src holds all").toBe(false);
  await page.clock.resume();
});
