/**
 * The signs at the frame's edges that the picture continues past them: a fade from the map's background at each edge
 * the picture crosses, none at the edges it does not. An honest indication of hidden content, not a control (the owner's
 * choice for a picture taller than the frame, 2026-10-30): the frame starts a tall picture at its top like a page, and
 * the fade at the bottom says there is more. The element stands over the map layer, untransformed, and takes no
 * pointer events; the stylesheet draws the fades from its `data-above`, `data-below`, `data-left` and `data-right`.
 *
 * @module edge-signs
 */

import { hiddenEdges, type Bounds, type Frame } from "./layout-measure";
import type { MapTransform } from "./types";

/** Where the frame stands inside the view, in the view's own pixels, and its size. */
export interface FramePlace extends Frame {
  left: number;
  top: number;
}

/** The signs' element and the one way to move them. */
export interface EdgeSigns {
  readonly element: HTMLElement;
  /** Places the signs over the frame and shows those for the edges the picture crosses at the camera given; no picture, no signs. */
  update(content: Bounds | null, transform: MapTransform, frame: FramePlace): void;
}

/** Makes the signs inside the view, after its layers so that they paint above the map. */
export function createEdgeSigns(view: HTMLElement): EdgeSigns {
  const element = document.createElement("div");
  element.className = "map-edges";
  element.setAttribute("aria-hidden", "true");
  for (const side of ["above", "below", "left", "right"]) {
    const sign = document.createElement("span");
    sign.className = `map-edge map-edge-${side}`;
    element.append(sign);
  }
  view.append(element);
  return {
    element,
    update(content, transform, frame) {
      Object.assign(element.style, { left: `${frame.left}px`, top: `${frame.top}px`, width: `${frame.width}px`, height: `${frame.height}px` });
      const edges = content ? hiddenEdges(content, transform, frame) : { above: false, below: false, left: false, right: false };
      element.dataset.above = String(edges.above);
      element.dataset.below = String(edges.below);
      element.dataset.left = String(edges.left);
      element.dataset.right = String(edges.right);
    }
  };
}
