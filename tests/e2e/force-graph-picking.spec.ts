import { expect, test, type Page } from "@playwright/test";

import { observeGraph, rayAt, renderedNodes, type RayReading } from "./force-graph-observation";
import { currentSnapshot } from "./search-bar";

/**
 * What a press and a hover take where a translucent skin stands before a sphere in the 3D map (the root's ruling of
 * 2026-11-23, "what is seen is what is pressed"): the sphere, drawn as itself and seen through the skin; the skin's own
 * node only where the ray meets no sphere. Measured before the rule changed in
 * AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-23/Probes/picking/README.md: a shell's skin swept in front of a
 * sphere a person had just pressed took its actions and faded it under the still pointer.
 */
test.use({ viewport: { width: 1280, height: 800 } });

const ESTATE = "/samples/estate/";
const SUBJECT = "PaymentService/PaymentService.cs";

/**
 * Open the estate's 3D map on its subject, let the picture come to rest, and place the camera on the line from the
 * subject's sphere through the largest directory shell's centre, beyond the shell, so that the shell stands between the
 * eye and the sphere. The camera keeps looking at its target, the subject, as the trackball does, so the subject stays
 * near the frame's centre. Returns the shell's seed.
 */
async function subjectBehindShell(page: Page): Promise<string> {
  await page.goto(`${ESTATE}?view=local&mode=3d&node=${encodeURIComponent(SUBJECT)}`);
  await expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "false", { timeout: 25_000 });
  const subject = (await renderedNodes(page)).find(node => node.id === SUBJECT)!;
  const shell = await page.evaluate(({ at }) => {
    const observed = (window as unknown as { renderedGraph: { scene: { getObjectByName(name: string): { userData: { spatialWrappers: { ranges: Array<{ seed: string; x: number; y: number; z: number; radius: number }> } } } };
      camera: { position: { x: number; y: number; z: number; set(x: number, y: number, z: number): void } } } }).renderedGraph;
    const shells = observed.scene.getObjectByName("Spatial wrappers")!.userData.spatialWrappers.ranges.filter(range => range.seed.startsWith("shell:"));
    if (!shells.length) return null;
    const chosen = shells.reduce((a, b) => (b.radius > a.radius ? b : a));
    const dx = chosen.x - at.x, dy = chosen.y - at.y, dz = chosen.z - at.z, apart = Math.hypot(dx, dy, dz);
    const eye = observed.camera.position, now = Math.hypot(eye.x - at.x, eye.y - at.y, eye.z - at.z);
    const reach = Math.max(now, apart + 1.5 * chosen.radius);
    eye.set(at.x + dx / apart * reach, at.y + dy / apart * reach, at.z + dz / apart * reach);
    return chosen.seed;
  }, { at: subject.world });
  expect(shell, "the estate's picture draws a directory shell").not.toBeNull();
  // The camera stands still once two readings a quarter second apart agree.
  const eye = (): Promise<number[]> => page.evaluate(() => (window as unknown as { renderedGraph: { camera: { matrixWorld: { elements: number[] } } } }).renderedGraph.camera.matrixWorld.elements.slice());
  await expect.poll(async () => { const a = await eye(); await page.waitForTimeout(250); const b = await eye(); return a.every((value, i) => value === b[i]); },
    { message: "the camera comes to stand still where it was placed" }).toBe(true);
  return shell!;
}

/** Points over a sphere's disc and a shell's, every 4 px, with what the ray meets at each. */
async function readings(page: Page, id: string, reach: number): Promise<Array<RayReading & { x: number; y: number }>> {
  const sphere = (await renderedNodes(page)).find(node => node.id === id)!;
  const points: Array<{ x: number; y: number }> = [];
  for (let dy = -reach; dy <= reach; dy += 4) for (let dx = -reach; dx <= reach; dx += 4) points.push({ x: sphere.x + dx, y: sphere.y + dy });
  return (await rayAt(page, points)).map((reading, i) => ({ ...reading, ...points[i] }));
}

/** The ray meets the shell's skin first and then the sphere, with nothing else before the sphere. */
const skinBeforeSphere = (reading: RayReading, shell: string, id: string): boolean => reading.canvas && reading.spheres[0]?.id === id
  && reading.skins.some(skin => skin.seed === shell && skin.enter < reading.spheres[0].enter) && reading.skins.every(skin => skin.seed === shell);

/**
 * A point on the skin of the shell whose ray meets that skin and no sphere, nearest the shell's own centre on the screen,
 * or undefined when none: where a press must still take the shell.
 */
async function bareSkin(page: Page, shell: string): Promise<(RayReading & { x: number; y: number }) | undefined> {
  const centre = await page.evaluate(seed => {
    const observed = (window as unknown as { renderedGraph: { scene: { getObjectByName(name: string): { userData: { spatialWrappers: { ranges: Array<{ seed: string; x: number; y: number; z: number; radius: number }> } } } };
      camera: { position: { clone(): { set(x: number, y: number, z: number): { project(camera: unknown): { x: number; y: number } } } } } } }).renderedGraph;
    const range = observed.scene.getObjectByName("Spatial wrappers")!.userData.spatialWrappers.ranges.find(each => each.seed === seed);
    if (!range) return null;
    const rect = document.querySelector("#graph-svg canvas")!.getBoundingClientRect();
    const at = observed.camera.position.clone().set(range.x, range.y, range.z).project(observed.camera);
    return { x: rect.left + (at.x + 1) * rect.width / 2, y: rect.top + (1 - at.y) * rect.height / 2 };
  }, shell);
  if (!centre) return undefined;
  const points: Array<{ x: number; y: number }> = [];
  for (let dy = -120; dy <= 120; dy += 8) for (let dx = -120; dx <= 120; dx += 8) points.push({ x: centre.x + dx, y: centre.y + dy });
  const found = (await rayAt(page, points)).map((reading, i) => ({ ...reading, ...points[i] }))
    .filter(reading => reading.canvas && !reading.spheres.length && reading.skins[0]?.seed === shell);
  return found.sort((a, b) => Math.hypot(a.x - centre.x, a.y - centre.y) - Math.hypot(b.x - centre.x, b.y - centre.y))[0];
}

/**
 * The made situation, at rest and with no race: the estate's subject seen through the largest shell's skin, the camera
 * placed so. Before the rule changed, a shell's skin swept before a file a person had just pressed took the file's
 * actions under the still pointer and faded the file to 0.15 (the record named above).
 */
test("where a shell's skin stands before a file's sphere, a rest and a press take the sphere; elsewhere on the skin, the shell", async ({ page }) => {
  await observeGraph(page);
  const shell = await subjectBehindShell(page);
  const subject = (await renderedNodes(page)).find(node => node.id === SUBJECT)!;
  const seen = (await readings(page, SUBJECT, Math.ceil(subject.screenRadius))).filter(reading => skinBeforeSphere(reading, shell, SUBJECT))
    .sort((a, b) => Math.hypot(a.x - subject.x, a.y - subject.y) - Math.hypot(b.x - subject.x, b.y - subject.y))[0];
  expect(seen, `a point of the canvas where the ray meets the skin of ${shell} and then ${SUBJECT}, with nothing else before it`).toBeDefined();
  const bare = await bareSkin(page, shell);
  expect(bare, `a point of the canvas where the ray meets the skin of ${shell} and no sphere`).toBeDefined();

  // Where the skin stands before the sphere, the picker gives the sphere, seen through the skin; where it stands before
  // no sphere, the shell.
  expect(seen!.pick, `a press at (${seen!.x.toFixed(1)}, ${seen!.y.toFixed(1)}), where ${shell}'s skin is met at ${seen!.skins[0].enter.toFixed(1)} and ${SUBJECT} at ${seen!.spheres[0].enter.toFixed(1)}, takes`).toBe(SUBJECT);
  expect(bare!.pick, `a press at (${bare!.x.toFixed(1)}, ${bare!.y.toFixed(1)}) on ${shell}'s skin, with no sphere behind it, takes`).toBe(shell);

  // A rest there offers the sphere's actions and leaves the sphere as bright as it stood.
  const actions = page.locator(".force-graph-actions");
  await page.mouse.move(seen!.x, seen!.y);
  await expect(actions).toHaveAttribute("data-node-id", SUBJECT);
  await expect(actions).toBeVisible();
  const rested = (await renderedNodes(page)).find(node => node.id === SUBJECT)!;
  expect(rested.opacity, `${SUBJECT} under the resting pointer is drawn at least as bright as it stood before (${subject.opacity})`).toBeGreaterThanOrEqual(subject.opacity);
  // A press there pins the sphere.
  await page.mouse.click(seen!.x, seen!.y);
  await expect.poll(() => currentSnapshot(page).pinSet.entries, { message: `the press pins ${SUBJECT}` }).toContainEqual({ nodeId: SUBJECT, symbol: "*" });

  // On the bare skin, a rest offers the shell's actions and a press pops it.
  const again = await bareSkin(page, shell);
  expect(again, `the bare point of ${shell}'s skin is still there after the pin`).toBeDefined();
  await page.mouse.move(again!.x, again!.y);
  await expect(actions).toHaveAttribute("data-node-id", shell);
  await page.mouse.click(again!.x, again!.y);
  await expect.poll(() => page.evaluate(seed => (window as unknown as { renderedGraph: { scene: { getObjectByName(name: string): { userData: { spatialWrappers: { seeds: string[] } } } } } })
    .renderedGraph.scene.getObjectByName("Spatial wrappers")!.userData.spatialWrappers.seeds.includes(seed), shell), { message: `the press pops ${shell}: its skin is no longer drawn whole` }).toBe(false);
});
