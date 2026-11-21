import type { LocalMapPerspective } from "../types";

/**
 * Whether this browser draws the 3D map, asked once and only when it matters, and what a request for a perspective
 * becomes where it does not (2026-11-21).
 *
 * The 3D map is drawn by Three's `WebGLRenderer`, which asks its canvas for a WebGL 2 context and throws when the
 * browser refuses one: a policy, a driver on the browser's blocklist, or a machine with no graphics at all. Measured that
 * day with Chromium launched under `--disable-3d-apis`, a link to the 3D map was a dead page, "The Explorer stopped"
 * over an empty map, while the 2D map of the same subject worked
 * (`AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/weak-machine/README.md`, finding 3). The owner
 * means to show the tool on a VM whose graphics nobody knows: "We want this to be able to run on absolute garbage".
 *
 * So the page asks here, with the context attributes the renderer asks with, and lets the context go at once; a browser
 * that refuses is shown the 2D map wherever the 3D map was asked for, and its 3D control says why. Asking delayed a 2D
 * arrival's first picture by about 90 ms on a graphics card (measured 2026-11-21), so a page that arrives in 2D asks
 * only once it is idle after its first picture, or at a press of 3D before then (the root's ruling, the same day).
 */

/**
 * Why 3D is not offered, said by the 3D control and by Tuning's 3D layout as their tooltip and accessible description.
 * "Does not offer" rather than "has turned off": a browser may refuse WebGL by a policy, a driver on its blocklist or a
 * machine with no graphics at all, and the sentence should not blame it for the last (the root's correction, 2026-11-21).
 */
export const WEBGL_REFUSED = "3D needs WebGL, which this browser does not offer";

/** The WebGL 2 context's attributes `SpatialRenderer` asks for; Three adds only its defaults beside them. */
const RENDERER_CONTEXT: WebGLContextAttributes = { antialias: true, alpha: true };

/** Something that hands out a canvas, so that the question can be asked of a stand-in. */
export type CanvasSource = () => Pick<HTMLCanvasElement, "getContext">;

/** Whether a canvas from this source gives the 3D map's context; a refusal, by null or by a throw, is a no. */
export function drawsWebgl(canvas: CanvasSource): boolean {
  try {
    const context = canvas().getContext("webgl2", RENDERER_CONTEXT);
    if (!context) return false;
    // The browser holds only a few contexts at once: this one is let go, not left for the collector.
    context.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

/** The answer, once asked: the one place it is held for the page's life. */
let answer: boolean | undefined;

/** Whether this browser draws the 3D map, asked of a fresh canvas the first time and remembered for the page's life. */
export function webglOffered(): boolean {
  answer ??= drawsWebgl(() => document.createElement("canvas"));
  return answer;
}

/** The answer if the browser has been asked, else undefined; asks nothing. */
export function webglKnown(): boolean | undefined {
  return answer;
}

/**
 * The perspective shown for one requested: the request, unless it is 3D and the browser cannot draw it. The browser is
 * asked only for a request of 3D, so that a 2D request costs nothing.
 */
export function perspectiveShown(requested: LocalMapPerspective, offered: () => boolean): LocalMapPerspective {
  return requested === "3d" && !offered() ? "2d" : requested;
}

/**
 * The perspective remembered for the next visit: the one shown where both can be drawn; where 3D cannot, the one
 * remembered before, so that a person who chose 3D still arrives in it on a browser that draws it; and before the
 * browser has been asked, the one remembered before as well, since a remembered 3D may only be put aside once the
 * browser is known to draw it.
 */
export function perspectiveRemembered(shown: LocalMapPerspective, before: LocalMapPerspective | undefined, offered: boolean | undefined): LocalMapPerspective {
  return offered === true ? shown : before ?? shown;
}

/** Runs `then` once the page is idle, or after `most` ms whatever happens; by a timer where the browser has no idle callback. */
export function whenIdle(then: () => void, most: number): void {
  if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(() => then(), { timeout: most });
  else window.setTimeout(then, 0);
}
