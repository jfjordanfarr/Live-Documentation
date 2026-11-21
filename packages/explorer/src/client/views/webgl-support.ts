import type { LocalMapPerspective } from "../types";

/**
 * Whether this browser draws the 3D map, asked once before any view asks for it, and what a request for a perspective
 * becomes where it does not (2026-11-21).
 *
 * The 3D map is drawn by Three's `WebGLRenderer`, which asks its canvas for a WebGL 2 context and throws when the
 * browser refuses one: a policy, a driver on the browser's blocklist, or a machine with no graphics at all. Measured that
 * day with Chromium launched under `--disable-3d-apis`, a link to the 3D map was a dead page, "The Explorer stopped"
 * over an empty map, while the 2D map of the same subject worked
 * (`AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/weak-machine/README.md`, finding 3). The owner
 * means to show the tool on a VM whose graphics nobody knows: "We want this to be able to run on absolute garbage".
 *
 * So the page asks here, once, with the context attributes the renderer asks with, and lets the context go at once; a
 * browser that refuses is shown the 2D map wherever the 3D map was asked for, and its 3D control says why.
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

let answer: boolean | undefined;

/** Whether this browser draws the 3D map, asked of a fresh canvas the first time and remembered for the page's life. */
export function webglOffered(): boolean {
  answer ??= drawsWebgl(() => document.createElement("canvas"));
  return answer;
}

/** The perspective shown for one requested: the request, unless it is 3D and the browser cannot draw it. */
export function perspectiveShown(requested: LocalMapPerspective, offered: boolean): LocalMapPerspective {
  return offered ? requested : "2d";
}

/**
 * The perspective remembered for the next visit: the one shown where both can be drawn, and where 3D cannot, the one
 * remembered before, so that a person who chose 3D still arrives in it on a browser that draws it.
 */
export function perspectiveRemembered(shown: LocalMapPerspective, before: LocalMapPerspective | undefined, offered: boolean): LocalMapPerspective {
  return offered ? shown : before ?? shown;
}
