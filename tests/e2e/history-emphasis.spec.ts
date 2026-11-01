import { expect, test, type Page } from "@playwright/test";
import type { InstancedMesh, MeshLambertMaterial, Scene } from "three";

import { observeGraph, renderedNodes } from "./force-graph-observation";
import { compressSnapshot, DEFAULT_SNAPSHOT } from "../../packages/explorer/src/client/persistence/compressed-url-state";
import type { SpatialDrawEntry } from "../../packages/explorer/src/client/views/forceGraphBatches";

/**
 * While a moment of the history is shown, the files the step changed stand out in the 3D picture (the owner's ask of
 * 2026-10-31): glowing, their colour lifted toward white, or the rest dimmed, by Tuning's Changed Files; and the play's
 * speed is chosen beside play, the same setting as Tuning's Play Rate. Over the scripted history sample, at its step
 * "Retire the legacy helper", which removed main.ts's wire to the legacy file and unlinked its document: main.ts changed,
 * util.ts did not.
 */
test.use({ viewport: { width: 1400, height: 900 } });

interface Sequence { base: { commit: { id: string; subject: string } }; steps: Array<{ commit: { id: string; subject: string } }> }

/** The commit of the step with this subject, read from the bundle's history file. */
async function commitWith(page: Page, subject: string): Promise<string> {
  const data = await (await page.request.get("/samples/history/explorer-data.json")).json() as { history: { file: string } };
  const sequence = await (await page.request.get(`/samples/history/${data.history.file}`)).json() as Sequence;
  const step = sequence.steps.find(entry => entry.commit.subject === subject);
  expect(step, `the sample has a step "${subject}"`).toBeDefined();
  return step!.commit.id;
}

const entry = (commit: string): string => `/samples/history/?s=${compressSnapshot({
  ...DEFAULT_SNAPSHOT, perspective: "3d", spatialLayout: "connections", filters: { showTests: true, showAssets: false },
  openDirectories: new Set([""]), commit, layout: { forceGraph: { updateEnergy: 0 } }
})}`;

async function settled(page: Page): Promise<void> {
  await expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "false", { timeout: 60_000 });
}

/** The colour the sphere is drawn in, read from the instance buffer. */
async function drawnColour(page: Page, id: string): Promise<[number, number, number]> {
  return page.evaluate(id => {
    const { scene } = (window as unknown as { renderedGraph: { scene: Scene } }).renderedGraph;
    let found: [number, number, number] = [NaN, NaN, NaN];
    scene.traverse(object => {
      const mesh = object as InstancedMesh;
      const batch = mesh.userData.spatialBatch as { kind: string; entries: SpatialDrawEntry<{ id: string }>[] } | undefined;
      if (batch?.kind !== "nodes") return;
      const entry = batch.entries.find(item => item.data.id === id);
      if (!entry) return;
      const colour = (mesh.material as MeshLambertMaterial).color.clone(); mesh.getColorAt(entry.slot, colour);
      found = [colour.r, colour.g, colour.b];
    });
    return found;
  }, id);
}

const emphasis = (mode: string) => async ({ context }: { context: import("@playwright/test").BrowserContext }): Promise<void> => {
  await context.addInitScript(value => {
    window.localStorage.setItem("live-docs-explorer:ui:v2", JSON.stringify({ version: 2, tuning: { localMap: { searchStarts: 0 }, history: { changeEmphasis: value } } }));
  }, mode);
};

test("a step's changed file glows, its colour lifted toward white, while the rest keep theirs", async ({ page, context }) => {
  await emphasis("glow")({ context });
  await observeGraph(page);
  await page.goto(entry(await commitWith(page, "Retire the legacy helper")));
  await settled(page);
  const changed = await drawnColour(page, "src/app/main.ts"), unchanged = await drawnColour(page, "src/engine/util.ts");
  expect(unchanged.every(Number.isFinite) && changed.every(Number.isFinite)).toBe(true);
  // Both are implementation files, blue; the changed one is lifted toward white in every channel.
  expect(changed[0]).toBeGreaterThan(unchanged[0] + 0.3);
  expect(changed[1]).toBeGreaterThan(unchanged[1] + 0.2);
  expect(changed[2]).toBeGreaterThanOrEqual(unchanged[2]);
  const nodes = await renderedNodes(page);
  expect(nodes.find(node => node.id === "src/engine/util.ts")!.opacity, "under glow the rest are not dimmed").toBeCloseTo(0.75, 2);
  await expect(page.locator("#tuning-history-change-emphasis")).toHaveValue("glow");
});

test("with the rest dimmed, the changed file keeps its alpha and the others lose most of theirs; at today nothing is emphasized", async ({ page, context }) => {
  await emphasis("dim")({ context });
  await observeGraph(page);
  await page.goto(entry(await commitWith(page, "Retire the legacy helper")));
  await settled(page);
  const nodes = await renderedNodes(page);
  const alpha = (id: string): number => nodes.find(node => node.id === id)!.opacity;
  expect(alpha("src/app/main.ts")).toBeCloseTo(0.75, 2);
  expect(alpha("src/engine/util.ts")).toBeCloseTo(0.15, 2);
  const changed = await drawnColour(page, "src/app/main.ts"), unchanged = await drawnColour(page, "src/engine/util.ts");
  expect(changed, "under dim the changed file keeps its own colour").toEqual(unchanged);
  // Today, with the history closed, nothing is a step's change.
  await page.getByRole("button", { name: "History" }).click();
  await settled(page);
  expect((await renderedNodes(page)).every(node => Math.abs(node.opacity - 0.75) < 0.01 || Math.abs(node.opacity - 0.3) < 0.01), "today's picture has no emphasis").toBe(true);
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
