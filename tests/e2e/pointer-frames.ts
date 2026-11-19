import type { Page } from "@playwright/test";

/**
 * What each frame of the page showed under the pointer, read by the page itself at every animation frame, so that a
 * case can say that no frame of a sweep showed words, not merely the frame it happened to look at (2026-11-19, the
 * pointer's rest). Only what is drawn as words or as a fade is read, and the sign that a thing can be pressed.
 */
export interface PointerFrame {
  /** The page's clock at the frame. */
  t: number;
  /** The 3D map: whether its actions show, and for which node; whether a wire's words show; the pressable sign. */
  actions: boolean;
  actionsFor: string | null;
  wire: boolean;
  pressable: boolean;
  /** The World Map: whether a peek or pinned panel shows, how many things are faded, how many door names show. */
  peek: boolean;
  dimmed: number;
  doorWords: number;
  /** The 3D map's faintest sphere, where `observeGraph` watches it: the hover's fade takes spheres to 0.2. */
  leastOpacity: number | null;
}

type FramesWindow = Window & { __pointerFrames?: PointerFrame[] };

/** Start reading every frame, for the life of the page. */
export async function recordFrames(page: Page): Promise<void> {
  await page.evaluate(() => {
    const target = window as FramesWindow;
    if (target.__pointerFrames) return;
    const frames: PointerFrame[] = [];
    target.__pointerFrames = frames;
    // The 3D map's faintest sphere as uploaded, where `observeGraph` watches the renderer; null elsewhere.
    type Observed = { renderedGraph?: { scene: { traverse(visit: (object: unknown) => void): void } };
      drawnInstance?: (mesh: unknown, entry: unknown) => { opacity: number; visible: boolean } };
    const leastOpacity = (): number | null => {
      const observed = window as unknown as Observed;
      if (!observed.renderedGraph || !observed.drawnInstance) return null;
      let least: number | null = null;
      observed.renderedGraph.scene.traverse((object) => {
        const batch = (object as { userData?: { spatialBatch?: { kind: string; entries: Array<{ enabled: boolean }> } } }).userData?.spatialBatch;
        if (batch?.kind !== "nodes") return;
        for (const entry of batch.entries) {
          if (!entry.enabled) continue;
          const { opacity } = observed.drawnInstance!(object, entry);
          least = least === null ? opacity : Math.min(least, opacity);
        }
      });
      return least;
    };
    const read = (t: number): void => {
      const actions = document.querySelector<HTMLElement>(".force-graph-actions");
      const wire = document.querySelector<HTMLElement>(".spatial-wire-tooltip");
      const evidence = document.querySelector<HTMLElement>("#view-world .world-evidence");
      frames.push({
        t,
        actions: !!actions && !actions.hidden,
        actionsFor: actions && !actions.hidden ? actions.dataset.nodeId ?? null : null,
        wire: !!wire && !wire.hidden,
        pressable: document.querySelector<HTMLElement>("#graph-svg")?.dataset.hoveredNode === "true",
        peek: !!evidence && evidence.style.display === "block",
        dimmed: document.querySelectorAll("#view-world .dim, #view-world .dim-soft").length,
        doorWords: [...document.querySelectorAll<SVGElement>("#view-world text.w-doorlabel")].filter((label) => label.style.display === "inline").length,
        leastOpacity: leastOpacity()
      });
      if (frames.length > 20_000) frames.splice(0, 10_000);
      requestAnimationFrame(read);
    };
    requestAnimationFrame(read);
  });
}

/** The frames drawn from just before `act` until two frames after it. */
export async function framesDuring(page: Page, act: () => Promise<void>): Promise<PointerFrame[]> {
  const start = await page.evaluate(() => performance.now());
  await act();
  return page.evaluate(async (from) => {
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    return (window as FramesWindow).__pointerFrames!.filter((frame) => frame.t >= from);
  }, start);
}

/**
 * Whether the pointer, held where it is, comes to rest on the 3D map's node `id`: the pointing hand says at once that
 * something is under it, and the node's actions show once the pointer has rested (2026-11-19). False when nothing is
 * under the pointer, or another node's actions show instead, within `timeout`.
 */
export async function restsOn(page: Page, id: string, timeout = 2_000): Promise<boolean> {
  if (await page.locator("#graph-svg").getAttribute("data-hovered-node") !== "true") return false;
  return page.waitForFunction((target) => {
    const strip = document.querySelector<HTMLElement>(".force-graph-actions");
    return !!strip && !strip.hidden && strip.dataset.nodeId === target;
  }, id, { timeout }).then(() => true, () => false);
}

/**
 * Sweep the pointer through some points at an ordinary pace without stopping: `pixels` a step and one step a frame,
 * paced by the page's own frames, about a thousand pixels a second at sixteen pixels and sixty frames a second.
 */
export async function sweepThrough(page: Page, points: Array<{ x: number; y: number }>, pixels = 16): Promise<void> {
  for (let i = 1; i < points.length; i += 1) {
    const from = points[i - 1], to = points[i];
    const steps = Math.max(1, Math.round(Math.hypot(to.x - from.x, to.y - from.y) / pixels));
    for (let step = 1; step <= steps; step += 1) {
      await page.mouse.move(from.x + ((to.x - from.x) * step) / steps, from.y + ((to.y - from.y) * step) / steps);
      await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(resolve)));
    }
  }
}
