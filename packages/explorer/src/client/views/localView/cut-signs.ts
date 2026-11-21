/**
 * The cut said at the edges (Tuning → 2D Layout → Cut Counted, a trial of 2026-11-21, the root's brief after blind
 * testers answered from a view that cut what a step had opened): at each edge of the frame past which what the last
 * step opened goes on, a small control with an arrow and the count of its cards that lie there. It is a focus stop, its
 * accessible name and tooltip say what it counts, and a press brings the nearest of those cards wholly into view. No sentence
 * of ours stands on the map: an icon and a number. Gone where nothing of it is cut. The arithmetic is camera-intent.ts's
 * `cutByEdge` and `cutPan`; this module draws the controls over the frame, as edge-signs.ts draws its fades.
 *
 * @module cut-signs
 */

import { cutByEdge, VIEW_EDGES, type ViewEdge } from "./camera-intent";
import type { FramePlace } from "./edge-signs";
import type { Bounds } from "./layout-measure";
import type { MapTransform } from "./types";

/** One thing the last step opened, by its key (a file's id, a directory's path), in the picture's own units. */
export interface CutCard {
  key: string;
  bounds: Bounds;
}

/** The controls' element and the one way to move them. */
export interface CutSigns {
  readonly element: HTMLElement;
  /** Places the controls over the frame and shows one at each edge past which any of `cards` goes on; none for null. */
  update(cards: readonly CutCard[] | null, transform: MapTransform, frame: FramePlace): void;
}

/** Where each edge's arrow points, as an SVG path in a 16 by 16 box. */
const ARROWS: Record<ViewEdge, string> = {
  left: "M10 3 5 8l5 5", right: "M6 3l5 5-5 5", top: "M3 10l5-5 5 5", bottom: "M3 6l5 5 5-5"
};

/** The words a control carries for a screen reader and a resting pointer: what it counts, and where it takes the view. */
export function cutSignName(count: number, edge: ViewEdge): string {
  const where = edge === "top" ? "above the view" : edge === "bottom" ? "below the view" : `past the view's ${edge} edge`;
  return `${count} ${count === 1 ? "card" : "cards"} of what you opened ${where}: show ${count === 1 ? "it" : "the nearest"}`;
}

/** Makes the controls inside the view, after its layers so that they paint above the map; a press calls `onPress`. */
export function createCutSigns(view: HTMLElement, onPress: (edge: ViewEdge, cards: readonly Bounds[]) => void): CutSigns {
  const element = document.createElement("div");
  element.className = "map-cut-signs";
  const cut = new Map<ViewEdge, readonly Bounds[]>();
  const buttons = new Map<ViewEdge, { button: HTMLButtonElement; count: HTMLSpanElement }>();
  for (const edge of VIEW_EDGES) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "map-cut-sign";
    button.dataset.edge = edge;
    button.hidden = true;
    button.innerHTML = `<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${ARROWS[edge]}"/></svg>`;
    const count = document.createElement("span");
    count.className = "map-cut-sign__count";
    count.setAttribute("aria-hidden", "true");
    button.append(count);
    button.addEventListener("click", () => { const cards = cut.get(edge); if (cards?.length) onPress(edge, cards); });
    buttons.set(edge, { button, count });
    element.append(button);
  }
  view.append(element);
  return {
    element,
    update(cards, transform, frame) {
      Object.assign(element.style, { left: `${frame.left}px`, top: `${frame.top}px`, width: `${frame.width}px`, height: `${frame.height}px` });
      const byEdge = cards ? cutByEdge(cards, transform, frame) : {};
      cut.clear();
      for (const edge of VIEW_EDGES) {
        const keys = byEdge[edge] ?? [];
        const { button, count } = buttons.get(edge)!;
        if (!keys.length) {
          // A focused control that goes gives the focus back to the map rather than to nothing.
          if (!button.hidden && document.activeElement === button) (view.querySelector<HTMLElement>("#map-container") ?? view).focus?.();
          button.hidden = true;
          continue;
        }
        const wanted = new Set(keys);
        cut.set(edge, cards!.filter(card => wanted.has(card.key)).map(card => card.bounds));
        const name = cutSignName(keys.length, edge);
        if (count.textContent !== String(keys.length)) count.textContent = String(keys.length);
        if (button.getAttribute("aria-label") !== name) { button.setAttribute("aria-label", name); button.title = name; }
        button.hidden = false;
      }
    }
  };
}
