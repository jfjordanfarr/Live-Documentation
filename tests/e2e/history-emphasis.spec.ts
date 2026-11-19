import { expect, test, type Browser, type Page } from "@playwright/test";
import type { InstancedMesh, MeshLambertMaterial, Scene } from "three";

import { compressSnapshot, DEFAULT_SNAPSHOT } from "../../packages/explorer/src/client/persistence/compressed-url-state";
import type { SpatialDrawEntry } from "../../packages/explorer/src/client/views/forceGraphBatches";
import { observeGraph, renderedNodes } from "./force-graph-observation";

/**
 * While a moment of the history is shown, the files the step changed stand out in the 3D picture (the owner's ask of
 * 2026-10-31): glowing, their colour lifted toward white, or the rest dimmed, by Tuning's Changed Files; and the play's
 * speed is chosen beside play, the same setting as Tuning's Play Rate. Over the scripted history sample, at its step
 * "Retire the legacy helper", which removed main.ts's wire to the legacy file and unlinked its document: main.ts changed,
 * util.ts did not.
 */
test.use({ viewport: { width: 1400, height: 900 } });

interface Sequence { base: { commit: { id: string; subject: string } }; steps: Array<{ commit: { id: string; subject: string } }> }

/** The commit of the step with this subject, or of the step `after` steps on from it, read from the bundle's history file. */
async function commitWith(page: Page, subject: string, sample = "history", after = 0): Promise<string> {
  const data = await (await page.request.get(`/samples/${sample}/explorer-data.json`)).json() as { history: { file: string } };
  const sequence = await (await page.request.get(`/samples/${sample}/${data.history.file}`)).json() as Sequence;
  const at = sequence.steps.findIndex(entry => entry.commit.subject === subject);
  expect(at, `the sample has a step "${subject}"`).toBeGreaterThanOrEqual(0);
  expect(sequence.steps[at + after], `the sample has a step ${after} on from "${subject}"`).toBeDefined();
  return sequence.steps[at + after].commit.id;
}

/** The commit of the sample's last step. */
async function lastCommit(page: Page): Promise<string> {
  const data = await (await page.request.get("/samples/history/explorer-data.json")).json() as { history: { file: string } };
  const sequence = await (await page.request.get(`/samples/history/${data.history.file}`)).json() as Sequence;
  return sequence.steps[sequence.steps.length - 1].commit.id;
}

/** The sample in 3D at a step, or today with no commit. */
const entry = (commit: string | null): string => `/samples/history/?s=${compressSnapshot({
  ...DEFAULT_SNAPSHOT, perspective: "3d", spatialLayout: "connections", filters: { showTests: true, showAssets: false },
  openDirectories: new Set([""]), commit, layout: { forceGraph: { updateEnergy: 0 } }
})}`;

async function settled(page: Page): Promise<void> {
  // Zero-energy placement can be idle before the paced reveal has submitted every sphere. Read actual instances.
  await expect.poll(async () => {
    if (await page.locator("#graph-svg").getAttribute("aria-busy") !== "false") return false;
    const ids = new Set((await renderedNodes(page)).map(node => node.id));
    return ["src/app/main.ts", "src/engine/util.ts", "src/engine/model.ts"].every(id => ids.has(id));
  }, { timeout: 60_000, message: "the settled sample's measured spheres have actually been drawn" }).toBe(true);
}

type Colour = [number, number, number];

/**
 * The colour a sphere is drawn in, read from the instance buffer, and whether a marble is drawn on it: its veins'
 * fourth value, one for a marble and zero for none (`writeMarble` in forceGraphBatches.ts).
 */
async function drawnSphere(page: Page, id: string): Promise<{ colour: Colour; marble: boolean }> {
  return page.evaluate(id => {
    const { scene } = (window as unknown as { renderedGraph: { scene: Scene } }).renderedGraph;
    let found: { colour: [number, number, number]; marble: boolean } = { colour: [NaN, NaN, NaN], marble: false };
    scene.traverse(object => {
      const mesh = object as InstancedMesh;
      const batch = mesh.userData.spatialBatch as { kind: string; entries: SpatialDrawEntry<{ id: string }>[] } | undefined;
      if (batch?.kind !== "nodes") return;
      const entry = batch.entries.find(item => item.data.id === id);
      if (!entry) return;
      const colour = (mesh.material as MeshLambertMaterial).color.clone(); mesh.getColorAt(entry.slot, colour);
      const veins = mesh.geometry.getAttribute("spatialMarbleVeins");
      found = { colour: [colour.r, colour.g, colour.b], marble: veins ? veins.getW(entry.slot) === 1 : false };
    });
    return found;
  }, id);
}

/** The colour the sphere is drawn in. */
const drawnColour = async (page: Page, id: string): Promise<Colour> => (await drawnSphere(page, id)).colour;

/**
 * Each file's own colour at a moment, read by a second visitor at the same address with Changed Files at None, where
 * nothing stands out. A file's own colour is its own: a marble's is its kind's glass tinted by its own veins at that
 * moment (marbles are the default since 2026-11-18), so another file of its kind cannot stand for it.
 */
async function ownColours<T>(browser: Browser, address: string, ready: (page: Page) => Promise<void>, read: (page: Page) => Promise<T>): Promise<T> {
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  try {
    await emphasis("none")({ context });
    const page = await context.newPage();
    await observeGraph(page);
    await page.goto(address);
    await ready(page);
    return await read(page);
  } finally { await context.close(); }
}

/** Each named sphere's own colour at a moment of the plain sample. */
const ownSpheres = (browser: Browser, address: string, ids: readonly string[]): Promise<Record<string, Colour>> =>
  ownColours(browser, address, settled, async page => Object.fromEntries(await Promise.all(ids.map(async id => [id, await drawnColour(page, id)] as const))));

/**
 * A visitor with the given Changed Files choice, on the default look: the files drawn as marbles since 2026-11-18. Each
 * case reads a file's base colour as that file's own at the moment shown ({@link ownColours}); until then an unchanged
 * file of the same kind stood for it, which only plain spheres allow.
 */
const emphasis = (mode: string) => async ({ context }: { context: import("@playwright/test").BrowserContext }): Promise<void> => {
  await context.addInitScript(value => {
    window.localStorage.setItem("live-docs-explorer:ui:v2", JSON.stringify({ version: 2, tuning: { localMap: { searchStarts: 0 }, history: { changeEmphasis: value } } }));
  }, mode);
};

const WHITE: Colour = [1, 1, 1];

test("a commit's changed file is white immediately while the rest keep their base colour", async ({ page, context, browser }) => {
  await emphasis("glow")({ context });
  await observeGraph(page);
  const address = entry(await commitWith(page, "Retire the legacy helper"));
  const own = await ownSpheres(browser, address, ["src/engine/util.ts"]);
  await page.goto(address);
  await settled(page);
  const changed = await drawnSphere(page, "src/app/main.ts"), unchanged = await drawnSphere(page, "src/engine/util.ts");
  expect(unchanged.colour.every(Number.isFinite) && changed.colour.every(Number.isFinite)).toBe(true);
  expect(changed.colour).toEqual(WHITE);
  expect(unchanged.colour).not.toEqual(WHITE);
  expect(unchanged.colour, "the unchanged file keeps its own colour").toEqual(own["src/engine/util.ts"]);
  // White replaces the changed file's marble, as it replaces a plain sphere's colour; the rest keep theirs.
  expect(changed.marble, "the glowing file carries no marble").toBe(false);
  expect(unchanged.marble, "the unchanged file is a marble").toBe(true);
  const nodes = await renderedNodes(page);
  expect(nodes.find(node => node.id === "src/engine/util.ts")!.opacity, "under glow the rest are not dimmed").toBeCloseTo(0.75, 2);
  await expect(page.locator("#tuning-history-change-emphasis")).toHaveValue("glow");
});

for (const mode of ["glow", "dim"] as const) for (const rate of [1, 0.5]) {
  test(`${mode} holds colours and alpha through a commit at ${rate} step/s and changes them only at the next event`, async ({ page, context, browser }) => {
    test.setTimeout(90_000);
    await emphasis(mode)({ context });
    await observeGraph(page);
    const main = "src/app/main.ts", util = "src/engine/util.ts", model = "src/engine/model.ts";
    // Each file's own colour at the step shown, at the next, at the last and today: the colours to return to.
    const [at, next, last] = await Promise.all([commitWith(page, "Retire the legacy helper"), commitWith(page, "Retire the legacy helper", "history", 1), lastCommit(page)]);
    const own = {
      at: await ownSpheres(browser, entry(at), [main, util]), next: await ownSpheres(browser, entry(next), [main, util]),
      last: await ownSpheres(browser, entry(last), [model]), today: await ownSpheres(browser, entry(null), [model])
    };
    await page.goto(entry(at));
    await settled(page);
    const changedColour = (id: string, step: keyof typeof own): Colour => mode === "glow" ? WHITE : own[step][id];
    const backgroundAlpha = mode === "glow" ? 0.75 : 0.15;
    const appearance = async () => {
      const [mainSphere, utilSphere, nodes] = await Promise.all([drawnSphere(page, main), drawnSphere(page, util), renderedNodes(page)]);
      return { mainColour: mainSphere.colour, mainMarble: mainSphere.marble, utilColour: utilSphere.colour, utilMarble: utilSphere.marble,
        mainAlpha: nodes.find(node => node.id === main)!.opacity, utilAlpha: nodes.find(node => node.id === util)!.opacity };
    };
    const first = await appearance();
    expect(first.utilColour.every(Number.isFinite)).toBe(true);
    expect(first.utilColour).not.toEqual(WHITE);
    expect(first.mainColour).toEqual(changedColour(main, "at"));
    expect(first.utilColour, "the unchanged file keeps its own colour").toEqual(own.at[util]);
    // Glow's white replaces the changed file's marble; Dim keeps every marble.
    expect([first.mainMarble, first.utilMarble]).toEqual([mode !== "glow", true]);
    expect(first.mainAlpha).toBeCloseTo(0.75, 5);
    expect(first.utilAlpha).toBeCloseTo(backgroundAlpha, 5);
    await page.getByLabel("Playback speed").selectOption(String(rate));
    await page.getByRole("button", { name: "Play", exact: true }).click();
    const began = Date.now(), interval = 1000 / rate;
    for (const fraction of [0.1, 0.5, 0.85]) {
      await page.waitForTimeout(Math.max(0, interval * fraction - (Date.now() - began)));
      await expect(page.locator(".history-track")).toHaveAttribute("aria-valuenow", "4");
      await expect(page.locator(".history-play")).toHaveAttribute("aria-label", "Pause");
      expect(await appearance(), `no brightness ramp at ${fraction * 100}% of the interval`).toEqual(first);
    }
    await expect(page.locator(".history-track")).toHaveAttribute("aria-valuenow", "5");
    await page.getByRole("button", { name: "Pause", exact: true }).click();
    await expect.poll(() => drawnColour(page, main)).toEqual(own.next[main]);
    await expect.poll(() => drawnColour(page, util)).toEqual(changedColour(util, "next"));
    const stepped = await appearance();
    // The light moves with the step: main.ts has its marble again, and util.ts loses its own where it glows.
    expect([stepped.mainMarble, stepped.utilMarble]).toEqual([true, mode !== "glow"]);
    expect(stepped.mainAlpha).toBeCloseTo(backgroundAlpha, 5);
    expect(stepped.utilAlpha).toBeCloseTo(0.75, 5);
    // The final commit still has an event, although it uses today's graph. Closing history ends the emphasis.
    await page.locator(".history-track").press("End");
    await expect.poll(() => drawnColour(page, model)).toEqual(changedColour(model, "last"));
    await expect.poll(async () => (await renderedNodes(page)).find(node => node.id === model)!.opacity).toBeCloseTo(0.75, 5);
    await page.getByRole("button", { name: "History", exact: true }).click();
    await expect.poll(() => drawnColour(page, model)).toEqual(own.today[model]);
    expect((await drawnSphere(page, model)).marble, "today the file is a marble again").toBe(true);
    await expect.poll(async () => (await renderedNodes(page)).find(node => node.id === util)!.opacity).toBeCloseTo(0.75, 5);
  });
}

test("with the rest dimmed, the changed file keeps its alpha; closing history restores normal appearance", async ({ page, context, browser }) => {
  await emphasis("dim")({ context });
  await observeGraph(page);
  const address = entry(await commitWith(page, "Retire the legacy helper"));
  const own = await ownSpheres(browser, address, ["src/app/main.ts", "src/engine/util.ts"]);
  await page.goto(address);
  await settled(page);
  const nodes = await renderedNodes(page);
  const alpha = (id: string): number => nodes.find(node => node.id === id)!.opacity;
  expect(alpha("src/app/main.ts")).toBeCloseTo(0.75, 2);
  expect(alpha("src/engine/util.ts")).toBeCloseTo(0.15, 2);
  const changed = await drawnSphere(page, "src/app/main.ts"), unchanged = await drawnSphere(page, "src/engine/util.ts");
  expect(changed.colour, "under dim the changed file keeps its own colour").toEqual(own["src/app/main.ts"]);
  expect(unchanged.colour, "and the dimmed file its own").toEqual(own["src/engine/util.ts"]);
  expect([changed.marble, unchanged.marble], "under dim both keep their marbles").toEqual([true, true]);
  // Today, with the history closed, nothing is a step's change.
  await page.getByRole("button", { name: "History" }).click();
  await settled(page);
  expect((await renderedNodes(page)).every(node => Math.abs(node.opacity - 0.75) < 0.01 || Math.abs(node.opacity - 0.3) < 0.01), "today's picture has no emphasis").toBe(true);
});

/**
 * What was asked about is never dimmed by a step (2026-11-19, the owner: "temporal scrubbing wouldn't highlight the pinned
 * note (or wouldn't un-dim it)"). With util.ts pinned at "Retire the legacy helper", which changed main.ts and not util.ts,
 * the pinned file keeps its ordinary look under Dim and Both while the rest the step left dims; at the next step, which
 * changed util.ts, it is emphasised as any changed file is.
 */
for (const mode of ["dim", "both"] as const) {
  test(`under ${mode} a pinned file the step did not change keeps its ordinary look, and is emphasised when the step changes it`, async ({ page, context, browser }) => {
    test.setTimeout(60_000);
    await emphasis(mode)({ context });
    await observeGraph(page);
    const main = "src/app/main.ts", util = "src/engine/util.ts";
    const pinned = (commit: string): string => `/samples/history/?s=${compressSnapshot({
      ...DEFAULT_SNAPSHOT, perspective: "3d", spatialLayout: "connections", filters: { showTests: true, showAssets: false },
      pinSet: { entries: [{ nodeId: util, symbol: "*" }] }, commit, layout: { forceGraph: { updateEnergy: 0 } }
    })}`;
    const drawn = async (target: Page): Promise<void> => {
      await expect.poll(async () => {
        if (await target.locator("#graph-svg").getAttribute("aria-busy") !== "false") return false;
        const ids = new Set((await renderedNodes(target)).map(node => node.id));
        return ids.has(main) && ids.has(util);
      }, { timeout: 60_000, message: "the pinned file and the changed file are drawn" }).toBe(true);
    };
    const address = pinned(await commitWith(page, "Retire the legacy helper"));
    const own = await ownColours(browser, address, drawn, async plain => drawnColour(plain, util));
    await page.goto(address);
    await drawn(page);
    const nodes = await renderedNodes(page);
    const opacity = (id: string): number => nodes.find(node => node.id === id)!.opacity;
    expect(opacity(util), "the pinned file is not dimmed").toBeCloseTo(0.75, 5);
    expect(await drawnColour(page, util), "and keeps its own colour").toEqual(own);
    expect((await drawnSphere(page, util)).marble, "and its marble").toBe(true);
    const changedAlpha = opacity(main);
    expect(nodes.filter(node => node.id !== util && node.id !== main).some(node => node.opacity < 0.2), "the rest the step left is dimmed").toBe(true);
    // The next step changed util.ts and not main.ts: util.ts, under Both, glows white; main.ts dims to a fifth.
    await page.locator(".history-track").press("ArrowRight");
    if (mode === "both") await expect.poll(() => drawnColour(page, util)).toEqual(WHITE);
    // main.ts stands a hop from the pin, at the frontier, whose own alpha the step then takes to a fifth.
    await expect.poll(async () => (await renderedNodes(page)).find(node => node.id === main)?.opacity, "main.ts, unchanged now, dims").toBeLessThan(0.2);
    expect(changedAlpha, "and was brighter while the step had changed it").toBeGreaterThan(0.2);
    expect((await renderedNodes(page)).find(node => node.id === util)!.opacity).toBeCloseTo(0.75, 5);
  });
}

/**
 * Inside the wrappers (2026-11-11, the owner's "I don't see any of the nodes deep inside the bubbles lighting up when they
 * were affected by a commit"): a change is shown at the innermost thing the picture draws for it. Over the scripted
 * history sample in the Structure layout with nothing pinned, `src` is a bubble whose balloons `src/app` and `src/engine`
 * each hold two dots: at "Retire the legacy helper" main.ts changed and util.ts did not. `lib` is a bubble of its own two
 * files until that step: at "Rewrite the big helper as a huge one" lib/big.ts was deleted, its rewrite lib/huge.ts born,
 * and the deleted file, which has no dot, lights the innermost thing drawn for its directory, `lib`'s own skin. In the
 * Connections layout the sample is one island wrapped about its seed, main.ts. Read from the uploaded unit and skin buffers.
 */
const wrapped = (commit: string | null, spatialLayout: "structure" | "connections" = "structure"): string => `/samples/history/?s=${compressSnapshot({
  ...DEFAULT_SNAPSHOT, perspective: "3d", spatialLayout, filters: { showTests: true, showAssets: false },
  commit, layout: { forceGraph: { updateEnergy: 0 } }
} as Parameters<typeof compressSnapshot>[0])}`;

interface DrawnUnit { seed: string; id: string; color: [number, number, number]; alpha: number; lit: number; veiled: boolean; marble: boolean }
interface DrawnSkin { seed: string; lit: number; alpha: number }

/** What the skins show within them and the skins themselves, as uploaded: each unit's colour, opacity and light, each skin's light and opacity. */
async function drawnBubbles(page: Page): Promise<{ files: DrawnUnit[]; balloons: DrawnUnit[]; skins: DrawnSkin[] }> {
  return page.evaluate(() => {
    const { scene } = (window as unknown as { renderedGraph: { scene: Scene } }).renderedGraph;
    const read = (name: string): DrawnUnit[] => {
      const mesh = scene.getObjectByName(name) as InstancedMesh | undefined;
      if (!mesh?.visible) return [];
      const records = mesh.userData.spatialUnits as Array<{ seed: string; id: string; veiled: boolean }>;
      const opacity = mesh.geometry.getAttribute("spatialOpacity"), lit = mesh.geometry.getAttribute("spatialLit");
      // The dots carry a marble's veins, their fourth value one for a marble and zero for none; the balloons carry none.
      const veins = mesh.geometry.getAttribute("spatialMarbleVeins");
      return Array.from({ length: mesh.count }, (_, slot) => ({ seed: records[slot].seed, id: records[slot].id, veiled: records[slot].veiled,
        color: [mesh.instanceColor!.getX(slot), mesh.instanceColor!.getY(slot), mesh.instanceColor!.getZ(slot)] as [number, number, number],
        alpha: opacity.getX(slot), lit: lit ? lit.getX(slot) : NaN, marble: veins ? veins.getW(slot) === 1 : false }));
    };
    const wrappers = scene.getObjectByName("Spatial wrappers") as InstancedMesh;
    const ranges = (wrappers.userData.spatialWrappers as { ranges: Array<{ seed: string }> }).ranges;
    const groups = wrappers.geometry.getAttribute("wrapperGroup"), lit = wrappers.geometry.getAttribute("wrapperLit"), alpha = wrappers.geometry.getAttribute("wrapperAlpha");
    const skins = wrappers.visible ? ranges.map((range, group) => {
      let vertex = 0;
      while (vertex < groups.count && groups.getX(vertex) !== group) vertex++;
      return { seed: range.seed, lit: lit ? lit.getX(vertex) : NaN, alpha: alpha.getX(vertex) };
    }) : [];
    return { files: read("Spatial shell files"), balloons: read("Spatial shell balloons"), skins };
  });
}

const unit = (units: DrawnUnit[], id: string): DrawnUnit => {
  const found = units.find(item => item.id === id);
  expect(found, `${id} is drawn within a skin`).toBeDefined();
  return found!;
};
const skin = (skins: DrawnSkin[], seed: string): DrawnSkin => {
  const found = skins.find(item => item.seed === seed);
  expect(found, `${seed}'s skin is drawn`).toBeDefined();
  return found!;
};

/** The settled picture with these dots drawn within skins and these skins built. */
async function bubblesDrawn(page: Page, files: readonly string[], skins: readonly string[]): Promise<void> {
  await expect.poll(async () => {
    if (await page.locator("#graph-svg").getAttribute("aria-busy") !== "false") return false;
    const drawn = await drawnBubbles(page);
    return files.every(id => drawn.files.some(file => file.id === id)) && skins.every(seed => drawn.skins.some(item => item.seed === seed));
  }, { timeout: 60_000, message: "the sample's skins and the dots within them have been drawn" }).toBe(true);
}

const white = (drawn: DrawnUnit): boolean => drawn.color.every(channel => channel === 1);

test.describe("inside the wrappers", () => {
  test("a changed file's dot is white while the rest keep their own colour, and the next step moves the light", async ({ page, context, browser }) => {
    test.setTimeout(90_000);
    await emphasis("glow")({ context });
    await observeGraph(page);
    const dots = ["src/app/main.ts", "src/engine/util.ts"];
    const [at, next] = await Promise.all([commitWith(page, "Retire the legacy helper"), commitWith(page, "Retire the legacy helper", "history", 1)]);
    // Each dot's own colour at the step, at the next and today, read where nothing stands out.
    const ownDots = (address: string) => ownColours(browser, address, plain => bubblesDrawn(plain, dots, ["directory:src"]),
      async plain => { const drawn = await drawnBubbles(plain); return Object.fromEntries(dots.map(id => [id, unit(drawn.files, id).color])); });
    const own = { at: await ownDots(wrapped(at)), next: await ownDots(wrapped(next)), today: await ownDots(wrapped(null)) };
    await page.goto(wrapped(at));
    await bubblesDrawn(page, dots, ["directory:src"]);
    const first = await drawnBubbles(page);
    const main = unit(first.files, "src/app/main.ts"), util = unit(first.files, "src/engine/util.ts");
    expect(main.color).toEqual([1, 1, 1]);
    expect(util.color.every(Number.isFinite)).toBe(true);
    expect(white(util)).toBe(false);
    expect(util.color, "the unchanged dot keeps its own colour").toEqual(own.at["src/engine/util.ts"]);
    // White replaces the glowing dot's marble, as it does a sphere's; the rest keep theirs.
    expect([main.marble, util.marble]).toEqual([false, true]);
    // White and whole as a changed sphere is, at the spheres' alpha; under glow the rest are not dimmed.
    expect(main.alpha).toBeCloseTo(0.75, 5);
    expect(util.alpha).toBeCloseTo(0.75, 5);
    // The open balloon holding the lit dot is not lit itself, nor the skin around it: the dot says where.
    expect(unit(first.balloons, "src/app").lit).toBe(0);
    expect(unit(first.balloons, "src/engine").lit).toBe(0);
    expect(skin(first.skins, "directory:src")).toEqual({ seed: "directory:src", lit: 0, alpha: 1 });
    // Stepping on: util.ts changed and main.ts did not; main.ts returns to its own colour and its marble.
    await page.locator(".history-track").press("ArrowRight");
    await expect.poll(async () => unit((await drawnBubbles(page)).files, "src/engine/util.ts").color).toEqual([1, 1, 1]);
    const stepped = await drawnBubbles(page);
    expect(unit(stepped.files, "src/app/main.ts").color).toEqual(own.next["src/app/main.ts"]);
    expect([unit(stepped.files, "src/app/main.ts").marble, unit(stepped.files, "src/engine/util.ts").marble]).toEqual([true, false]);
    // Leaving the history restores every unit's own colour.
    await page.getByRole("button", { name: "History", exact: true }).click();
    await expect.poll(async () => unit((await drawnBubbles(page)).files, "src/engine/util.ts").color).toEqual(own.today["src/engine/util.ts"]);
    const today = await drawnBubbles(page);
    expect(unit(today.files, "src/app/main.ts").color).toEqual(own.today["src/app/main.ts"]);
    expect(today.files.some(white)).toBe(false);
    expect(today.files.every(file => file.marble), "today every dot is a marble").toBe(true);
    expect([...today.balloons, ...today.skins].every(item => item.lit === 0)).toBe(true);
  });

  test("a deleted file, which has no dot, lights the innermost thing drawn for its directory", async ({ page, context }) => {
    await emphasis("glow")({ context });
    await observeGraph(page);
    await page.goto(wrapped(await commitWith(page, "Rewrite the big helper as a huge one")));
    await bubblesDrawn(page, ["lib/huge.ts", "lib/legacy.ts"], ["directory:lib", "directory:src"]);
    const drawn = await drawnBubbles(page);
    // lib/big.ts is gone; lib holds no bubble of its own directory, so its skin is the innermost thing drawn for it.
    expect(drawn.files.some(file => file.id === "lib/big.ts")).toBe(false);
    expect(skin(drawn.skins, "directory:lib").lit).toBe(1);
    expect(white(unit(drawn.files, "lib/huge.ts")), "the rewrite born in its place is a changed dot").toBe(true);
    expect(white(unit(drawn.files, "lib/legacy.ts"))).toBe(false);
    expect(skin(drawn.skins, "directory:src").lit).toBe(0);
    // The step before deleted nothing in lib: its skin is not lit.
    await page.locator(".history-track").press("ArrowLeft");
    await expect.poll(async () => skin((await drawnBubbles(page)).skins, "directory:lib").lit).toBe(0);
  });

  test("with the rest dimmed, an unchanged dot and a bubble holding nothing lose alpha, while the change and what holds it keep theirs", async ({ page, context, browser }) => {
    await emphasis("dim")({ context });
    await observeGraph(page);
    const dots = ["src/app/main.ts", "src/engine/util.ts"], address = wrapped(await commitWith(page, "Retire the legacy helper"));
    const own = await ownColours(browser, address, plain => bubblesDrawn(plain, dots, ["directory:src"]),
      async plain => { const shown = await drawnBubbles(plain); return Object.fromEntries(dots.map(id => [id, unit(shown.files, id).color])); });
    await page.goto(address);
    await bubblesDrawn(page, dots, ["directory:src"]);
    const drawn = await drawnBubbles(page);
    const main = unit(drawn.files, "src/app/main.ts"), util = unit(drawn.files, "src/engine/util.ts");
    expect(main.alpha).toBeCloseTo(0.75, 5);
    expect(util.alpha).toBeCloseTo(0.15, 5);
    expect(main.color, "under dim the changed file keeps its own colour").toEqual(own["src/app/main.ts"]);
    expect(util.color, "and the dimmed file its own").toEqual(own["src/engine/util.ts"]);
    expect([main.marble, util.marble], "under dim every dot keeps its marble").toEqual([true, true]);
    expect(unit(drawn.balloons, "src/app").alpha).toBeCloseTo(1, 5);
    expect(unit(drawn.balloons, "src/engine").alpha).toBeCloseTo(0.2, 5);
    expect(skin(drawn.skins, "directory:src").alpha).toBeCloseTo(1, 5);
    expect([...drawn.balloons, ...drawn.skins].every(item => item.lit === 0), "dim lights nothing").toBe(true);
    await page.locator(".history-track").press("ArrowRight");
    await expect.poll(async () => unit((await drawnBubbles(page)).files, "src/app/main.ts").alpha).toBeCloseTo(0.15, 5);
    const next = await drawnBubbles(page);
    expect(unit(next.files, "src/engine/util.ts").alpha).toBeCloseTo(0.75, 5);
    expect(unit(next.balloons, "src/app").alpha).toBeCloseTo(0.2, 5);
    expect(unit(next.balloons, "src/engine").alpha).toBeCloseTo(1, 5);
    // A skin holding no change of the step dims with the unchanged: lib at "Call the view a screen", which renamed a file in src.
    await page.goto(wrapped(await commitWith(page, "Call the view a screen")));
    await bubblesDrawn(page, ["lib/big.ts", "lib/legacy.ts"], ["directory:lib", "directory:src"]);
    const renamed = await drawnBubbles(page);
    expect(skin(renamed.skins, "directory:lib").alpha).toBeCloseTo(0.2, 5);
    expect(unit(renamed.files, "lib/big.ts").alpha).toBeCloseTo(0.15, 5);
    expect(skin(renamed.skins, "directory:src").alpha).toBeCloseTo(1, 5);
  });

  test("with Changed Files at None, nothing within the skins is lit or dimmed", async ({ page, context }) => {
    await emphasis("none")({ context });
    await observeGraph(page);
    await page.goto(wrapped(await commitWith(page, "Rewrite the big helper as a huge one")));
    await bubblesDrawn(page, ["lib/huge.ts", "src/app/main.ts"], ["directory:lib", "directory:src"]);
    const drawn = await drawnBubbles(page);
    expect(drawn.files.length).toBe(6);
    expect(drawn.files.some(white)).toBe(false);
    expect(drawn.files.every(file => Math.abs(file.alpha - 0.75) < 1e-6)).toBe(true);
    expect(drawn.balloons.every(balloon => balloon.lit === 0 && Math.abs(balloon.alpha - 1) < 1e-6)).toBe(true);
    expect(drawn.skins.every(item => item.lit === 0 && Math.abs(item.alpha - 1) < 1e-6)).toBe(true);
  });

  test("in the Connections layout a changed file's dot inside an island's skin is white; the island's seed glows as a sphere", async ({ page, context }) => {
    await emphasis("glow")({ context });
    await observeGraph(page);
    await page.goto(wrapped(await commitWith(page, "Teach the engine to smooth"), "connections"));
    await bubblesDrawn(page, ["src/engine/util.ts", "src/engine/model.ts"], ["src/app/main.ts"]);
    const drawn = await drawnBubbles(page);
    expect(unit(drawn.files, "src/engine/util.ts").color).toEqual([1, 1, 1]);
    expect(white(unit(drawn.files, "src/engine/model.ts"))).toBe(false);
    expect(skin(drawn.skins, "src/app/main.ts").lit).toBe(0);
    // At the step that changed the seed alone among the island's files that stand, the seed's sphere glows and no dot does.
    await page.locator(".history-track").press("ArrowLeft");
    await expect.poll(async () => drawnColour(page, "src/app/main.ts")).toEqual([1, 1, 1]);
    const before = await drawnBubbles(page);
    expect(before.files.some(file => file.id === "src/app/main.ts"), "the seed is a sphere, never a dot").toBe(false);
    expect(white(unit(before.files, "src/engine/util.ts"))).toBe(false);
  });
});

/**
 * Inside veils (2026-11-11), over the veiling sample (`VEIL_SCRIPT`), whose 1,050-file `big` tree passes the 1,024 files a
 * picture draws within skins: while its small `wide` tree stands, `big` is veiled whole, one milky bubble; once `wide`
 * is gone, `big` is open and `big/d20/e2` to `e4` are veiled bubbles within it. A change the picture does not draw as a
 * dot lights the innermost bubble drawn that holds it, read from the balloons' uploaded `spatialLit`.
 */
const veiling = (commit: string): string => `/samples/history-veil/?s=${compressSnapshot({
  ...DEFAULT_SNAPSHOT, perspective: "3d", spatialLayout: "structure", commit, layout: { forceGraph: { updateEnergy: 0 } }
} as Parameters<typeof compressSnapshot>[0])}`;

/** The settled picture with these balloons drawn and the big tree's skin built. */
async function balloonsDrawn(page: Page, ids: readonly string[]): Promise<void> {
  await expect.poll(async () => {
    if (await page.locator("#graph-svg").getAttribute("aria-busy") !== "false") return false;
    const drawn = await drawnBubbles(page);
    return ids.every(id => drawn.balloons.some(balloon => balloon.id === id)) && drawn.skins.some(item => item.seed === "directory:big");
  }, { timeout: 150_000, intervals: [1000], message: "the veiling sample's balloons have been drawn" }).toBe(true);
}

test.describe("inside veils", () => {
  test.setTimeout(240_000);

  test("a change inside a veiled bubble lights that bubble and none of its veiled siblings", async ({ page, context }) => {
    await emphasis("glow")({ context });
    await observeGraph(page);
    await page.goto(veiling(await commitWith(page, "Retire the small tree and touch a veiled corner", "history-veil")));
    const corner = ["big/d20/e2", "big/d20/e3", "big/d20/e4"];
    await balloonsDrawn(page, corner);
    const drawn = await drawnBubbles(page);
    expect(corner.map(id => unit(drawn.balloons, id).veiled), "the three are veiled, their files not drawn").toEqual([true, true, true]);
    expect(drawn.files.some(file => file.id === "big/d20/e3/f04.ts")).toBe(false);
    expect(corner.map(id => unit(drawn.balloons, id).lit)).toEqual([0, 1, 0]);
    expect(drawn.balloons.filter(balloon => balloon.lit === 1).map(balloon => balloon.id)).toEqual(["big/d20/e3"]);
    // The open bubble around it holds the change and is not lit; nor is the skin.
    expect(unit(drawn.balloons, "big/d20").lit).toBe(0);
    expect(skin(drawn.skins, "directory:big").lit).toBe(0);
    expect(drawn.files.some(white)).toBe(false);
  });

  test("a body veiled whole lights for a change in it, and the body beside it does not", async ({ page, context }) => {
    await emphasis("glow")({ context });
    await observeGraph(page);
    await page.goto(veiling(await commitWith(page, "Touch a corner of the big tree", "history-veil")));
    await balloonsDrawn(page, ["directory:big"]);
    const drawn = await drawnBubbles(page);
    const veil = unit(drawn.balloons, "directory:big");
    expect(veil.veiled).toBe(true);
    expect(veil.lit).toBe(1);
    expect(drawn.balloons.filter(balloon => balloon.lit === 1).map(balloon => balloon.id)).toEqual(["directory:big"]);
    expect(drawn.files.filter(file => file.seed === "directory:wide").length).toBe(10);
    expect(drawn.files.some(white)).toBe(false);
    expect(drawn.skins.every(item => item.lit === 0)).toBe(true);
  });
});

test("the speed beside play is Tuning's Play Rate: choosing one sets the other, and the chosen rate is remembered", async ({ page }) => {
  await observeGraph(page);
  await page.goto(entry(await commitWith(page, "Retire the legacy helper")));
  await settled(page);
  const speed = page.getByLabel("Playback speed");
  await expect(speed).toHaveValue("2");
  await expect(page.locator("#tuning-history-play-rate")).toHaveValue("2");
  await speed.selectOption("4");
  await expect(page.locator("#tuning-history-play-rate")).toHaveValue("4");
  await expect(page.locator("#tuning-history-play-rate-value")).toHaveText("4");
  // The settings are written a moment after a change; the reload waits for the write.
  await expect.poll(() => page.evaluate(() => (JSON.parse(window.localStorage.getItem("live-docs-explorer:ui:v2") ?? "{}") as { tuning?: { history?: { playRate?: number } } }).tuning?.history?.playRate)).toBe(4);
  await page.reload();
  await settled(page);
  await expect(page.getByLabel("Playback speed")).toHaveValue("4");
  // A rate set in Tuning that the control does not offer is shown as its own option, so the control never lies.
  await page.getByRole("button", { name: /^Layout tuning/ }).click();
  const slider = page.locator("#tuning-history-play-rate");
  await expect(slider).toBeVisible();
  await slider.focus();
  await page.keyboard.press("ArrowRight");
  await expect(slider).toHaveValue("4.5");
  await expect(page.getByLabel("Playback speed")).toHaveValue("4.5");
  await expect(page.getByLabel("Playback speed").locator("option[data-foreign]")).toHaveText("4.5 steps/s");
});
