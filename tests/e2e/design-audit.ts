/**
 * Design faults a screenshot would show: labels that collide, text cut off.
 *
 * The owner asked (2026-09-29) whether Playwright could catch "text overflows
 * or other immediate design fails". It can, for the ones geometry can name:
 * two pieces of visible text whose boxes intersect, and text wider than the
 * box that clips it. Specs collect the boxes of a view's text, in one state,
 * and expect no faults, and expect some boxes, since a view that has not
 * finished appearing has no faults either. What the audit cannot judge is
 * taste; it only says whether words landed on top of each other.
 */

import type { Page } from "@playwright/test";

export interface TextBox {
  text: string;
  tag: string;
  x: number;
  y: number;
  w: number;
  h: number;
  /** What the text belongs to, when the spec asked for an owner attribute and the text has one. */
  owner?: string;
}

/** A shape drawn on the page, its corners in screen pixels, and what it belongs to. */
export interface Outline {
  owner: string;
  points: Array<[number, number]>;
}

/** Text drawn across a shape: a piece's edge through a label, which a screenshot shows as struck-through words. */
export interface Strike {
  text: TextBox;
  outline: Outline;
  /** Whether the shape belongs to the same thing as the text. */
  own: boolean;
}

export interface Overlap {
  a: TextBox;
  b: TextBox;
  /** Overlapping area in square pixels, past the tolerance. */
  area: number;
}

export interface Truncation {
  text: string;
  tag: string;
  /** The greatest horizontal or vertical overrun in pixels. */
  hidden: number;
}

/**
 * The screen boxes of every visible text-bearing element the selectors name,
 * one per line box, so that an inline element that wraps is measured line by
 * line rather than by the bounding box that spans its lines.
 * Hidden elements and those faded below a fifth by their ancestors are left
 * out, since the fade is the design's way of putting them out of the way; the
 * fade of a whole view as it appears is not counted, so a spec must wait for
 * the view before it audits. Given an owner attribute, each box says what it
 * belongs to: the attribute's value on the text or its nearest ancestor that
 * carries it.
 */
export async function textBoxes(page: Page, selectors: string[], ownerAttribute?: string): Promise<TextBox[]> {
  return page.evaluate(({ list, ownerAttribute }) => {
    const boxes: TextBox[] = [];
    const seen = new Set<Element>();
    for (const selector of list) {
      for (const node of document.querySelectorAll(selector)) {
        if (seen.has(node)) {
          continue;
        }
        seen.add(node);
        const text = (node.textContent ?? "").replace(/\s+/gu, " ").trim();
        if (!text) {
          continue;
        }
        let opacity = 1;
        let hidden = false;
        // A closed <details> keeps its content laid out but unrendered (Chromium reports its boxes at their places), so
        // anything under one that is not its own summary is hidden, as display: none is (2026-10-08).
        let child: Element | null = null;
        for (let element: Element | null = node; element && element !== document.body; child = element, element = element.parentElement) {
          if (element.classList.contains("view-container")) {
            break;
          }
          if (element instanceof HTMLDetailsElement && !element.open && child !== null && !(child instanceof HTMLElement && child.tagName === "SUMMARY")) {
            hidden = true;
            break;
          }
          const style = getComputedStyle(element);
          if (style.display === "none" || style.visibility === "hidden") {
            hidden = true;
            break;
          }
          opacity *= Number(style.opacity || "1");
        }
        if (hidden || opacity < 0.2) {
          continue;
        }
        // An element's text occupies its line boxes: one for a block, one per line for an inline element that wraps, whose
        // bounding box would span every line and collide with whatever shares its last line (a membrane's name and the
        // count beside it, 2026-10-08).
        const className = node.getAttribute("class")?.split(" ")[0];
        const owner = ownerAttribute ? node.closest(`[${ownerAttribute}]`)?.getAttribute(ownerAttribute) ?? undefined : undefined;
        for (const rect of node.getClientRects()) {
          if (rect.width < 1 || rect.height < 1) {
            continue;
          }
          boxes.push({ text: text.slice(0, 60), tag: `${node.tagName.toLowerCase()}${className ? `.${className}` : ""}`, x: rect.left, y: rect.top, w: rect.width, h: rect.height, ...(owner === undefined ? {} : { owner }) });
        }
      }
    }
    return boxes;
  }, { list: selectors, ownerAttribute });
}

/**
 * The visible SVG polygons a selector names, each with its corners in screen pixels and the value of the owner
 * attribute on it or its nearest ancestor that carries it. Polygons faded below a fifth are left out, as text is.
 */
export async function outlines(page: Page, selector: string, ownerAttribute: string): Promise<Outline[]> {
  return page.evaluate(({ selector, ownerAttribute }) => {
    const result: Outline[] = [];
    for (const node of document.querySelectorAll<SVGPolygonElement>(selector)) {
      let opacity = 1;
      let hidden = false;
      for (let element: Element | null = node; element && element !== document.body; element = element.parentElement) {
        if (element.classList.contains("view-container")) {
          break;
        }
        const style = getComputedStyle(element);
        if (style.display === "none" || style.visibility === "hidden") {
          hidden = true;
          break;
        }
        opacity *= Number(style.opacity || "1");
      }
      const matrix = node.getScreenCTM();
      if (hidden || opacity < 0.2 || !matrix || !node.points) {
        continue;
      }
      const points: Array<[number, number]> = [];
      for (let i = 0; i < node.points.numberOfItems; i += 1) {
        const point = new DOMPoint(node.points.getItem(i).x, node.points.getItem(i).y).matrixTransform(matrix);
        points.push([point.x, point.y]);
      }
      if (points.length >= 3) {
        result.push({ owner: node.closest(`[${ownerAttribute}]`)?.getAttribute(ownerAttribute) ?? "", points });
      }
    }
    return result;
  }, { selector, ownerAttribute });
}

/**
 * Every text box that a shape crosses, holds or lies under, past the tolerance: the box is shrunk by it on each side,
 * then meets the polygon when one of the polygon's edges passes through it or it lies inside the polygon. One strike
 * for each text and each owner, however many of the owner's polygons meet it; a text's own shape is marked as such.
 */
export function textOverShapes(boxes: TextBox[], shapes: Outline[], tolerance = 1): Strike[] {
  const result: Strike[] = [];
  for (const text of boxes) {
    const left = text.x + tolerance;
    const top = text.y + tolerance;
    const right = text.x + text.w - tolerance;
    const bottom = text.y + text.h - tolerance;
    if (right <= left || bottom <= top) {
      continue;
    }
    const struck = new Set<string>();
    for (const outline of shapes) {
      if (struck.has(outline.owner) || !meets({ left, top, right, bottom }, outline.points)) {
        continue;
      }
      struck.add(outline.owner);
      result.push({ text, outline, own: text.owner !== undefined && text.owner === outline.owner });
    }
  }
  return result;
}

/** Whether a polygon and an axis-aligned box share any point: an edge clipped by the box, or the box inside the polygon. */
function meets(box: { left: number; top: number; right: number; bottom: number }, polygon: Array<[number, number]>): boolean {
  for (let i = 0; i < polygon.length; i += 1) {
    if (segmentMeetsBox(polygon[i], polygon[(i + 1) % polygon.length], box)) {
      return true;
    }
  }
  // No edge reaches the box, so the box is either wholly inside the polygon or wholly outside it: test one corner.
  let inside = false;
  const [x, y] = [box.left, box.top];
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

/** Whether a segment passes through a box (Liang and Barsky's clipping, keeping only the yes or no). */
function segmentMeetsBox(a: [number, number], b: [number, number], box: { left: number; top: number; right: number; bottom: number }): boolean {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  let t0 = 0;
  let t1 = 1;
  for (const [p, q] of [[-dx, a[0] - box.left], [dx, box.right - a[0]], [-dy, a[1] - box.top], [dy, box.bottom - a[1]]]) {
    if (p === 0) {
      if (q < 0) {
        return false;
      }
    } else {
      const t = q / p;
      if (p < 0) {
        t0 = Math.max(t0, t);
      } else {
        t1 = Math.min(t1, t);
      }
      if (t0 > t1) {
        return false;
      }
    }
  }
  return true;
}

/** Every pair of boxes that intersect by more than the tolerance on both axes. */
export function overlapsAmong(boxes: TextBox[], tolerance = 1): Overlap[] {
  const result: Overlap[] = [];
  for (let i = 0; i < boxes.length; i += 1) {
    for (let j = i + 1; j < boxes.length; j += 1) {
      const a = boxes[i];
      const b = boxes[j];
      const w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x) - tolerance;
      const h = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y) - tolerance;
      if (w > 0 && h > 0) {
        result.push({ a, b, area: Math.round(w * h) });
      }
    }
  }
  return result.sort((p, q) => q.area - p.area);
}

/**
 * Visible elements the selectors name whose text overruns its own content box, a non-scrollable clipping ancestor,
 * or a sibling's text on the same line. Text is measured in line fragments rather than by its containing element:
 * a wrapped line is valid, while one hidden below a fixed-height box is not. Scrollports and the view boundary are
 * navigation frames, so panning or scrolling content out of them does not turn that content into a design fault.
 */
export async function truncations(page: Page, selectors: string[]): Promise<Truncation[]> {
  return page.evaluate((list) => {
    const result: Truncation[] = [];
    const seen = new Set<HTMLElement>();
    type OverflowMode = "cut" | "scroll" | "none";
    const overflowMode = (value: string): OverflowMode =>
      value === "hidden" || value === "clip" ? "cut" : value === "auto" || value === "scroll" ? "scroll" : "none";
    const contentBox = (element: HTMLElement): { left: number; right: number; top: number; bottom: number } => {
      const rect = element.getBoundingClientRect();
      const xScale = element.offsetWidth ? rect.width / element.offsetWidth : 1;
      const yScale = element.offsetHeight ? rect.height / element.offsetHeight : 1;
      const style = getComputedStyle(element);
      const left = rect.left + (parseFloat(style.borderLeftWidth) + parseFloat(style.paddingLeft)) * xScale;
      const right = rect.right - (parseFloat(style.borderRightWidth) + parseFloat(style.paddingRight)) * xScale;
      const top = rect.top + (parseFloat(style.borderTopWidth) + parseFloat(style.paddingTop)) * yScale;
      const bottom = rect.bottom - (parseFloat(style.borderBottomWidth) + parseFloat(style.paddingBottom)) * yScale;
      return { left, right, top, bottom };
    };
    const paddingBox = (element: HTMLElement): { left: number; right: number; top: number; bottom: number } => {
      const rect = element.getBoundingClientRect();
      const xScale = element.offsetWidth ? rect.width / element.offsetWidth : 1;
      const yScale = element.offsetHeight ? rect.height / element.offsetHeight : 1;
      const left = rect.left + element.clientLeft * xScale;
      const top = rect.top + element.clientTop * yScale;
      return { left, right: left + element.clientWidth * xScale, top, bottom: top + element.clientHeight * yScale };
    };
    type Clip = ReturnType<typeof paddingBox> & { x: OverflowMode; y: OverflowMode };
    for (const selector of list) {
      for (const node of document.querySelectorAll<HTMLElement>(selector)) {
        if (seen.has(node)) continue;
        seen.add(node);
        const text = (node.textContent ?? "").trim();
        if (!text || node.offsetWidth === 0) {
          continue;
        }
        const ancestorClips: Clip[] = [];
        let hidden = false, opacity = 1;
        let child: Element | null = null;
        for (let element: Element | null = node; element && element !== document.body; child = element, element = element.parentElement) {
          // A view is the frame through which one pans a larger picture. Its off-frame content is not truncated text.
          if (element.classList.contains("view-container")) break;
          if (element instanceof HTMLDetailsElement && !element.open && child !== null && child.tagName !== "SUMMARY") {
            hidden = true;
            break;
          }
          const style = getComputedStyle(element);
          if (style.display === "none" || style.visibility === "hidden") { hidden = true; break; }
          opacity *= Number(style.opacity || "1");
          if (!(element instanceof HTMLElement)) continue;
          const x = overflowMode(style.overflowX), y = overflowMode(style.overflowY);
          if (x !== "none" || y !== "none") ancestorClips.push({ ...paddingBox(element), x, y });
        }
        if (hidden || opacity < 0.2) continue;
        const own = contentBox(node);
        const ownOverflowX = getComputedStyle(node).overflowX;
        const ownScrollsX = ownOverflowX === "auto" || ownOverflowX === "scroll";
        const rects: DOMRect[] = [];
        const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
        for (let textNode = walker.nextNode(); textNode; textNode = walker.nextNode()) {
          if (!(textNode.textContent ?? "").trim()) continue;
          let textHidden = false, textOpacity = opacity;
          let child: Element | null = null;
          for (let parent: Element | null = textNode.parentElement; parent; child = parent, parent = parent.parentElement) {
            // A selected container can hold a closed details body. Chromium still gives that body's text a range box.
            if (parent instanceof HTMLDetailsElement && !parent.open && child?.tagName !== "SUMMARY") {
              textHidden = true;
              break;
            }
            if (parent === node) break;
            const style = getComputedStyle(parent);
            if (style.display === "none" || style.visibility === "hidden" || style.position === "absolute") {
              textHidden = true;
              break;
            }
            textOpacity *= Number(style.opacity || "1");
            if (textOpacity < 0.2) { textHidden = true; break; }
          }
          if (textHidden) continue;
          const range = document.createRange();
          range.selectNodeContents(textNode);
          for (const rect of range.getClientRects()) if (rect.width > 0 && rect.height > 0) rects.push(rect);
        }
        if (!rects.length) continue;
        // Read ancestors from the text outward. A scrollport exposes only the portion of a fragment inside its
        // padding box on the scrolling axis: outer fixed clips judge that exposed portion, not off-scroll content.
        // An inner non-scrollable clip still reports the lost text, including a fragment hidden altogether.
        let overrun = 0;
        for (const rect of rects) {
          // Retain the existing own-width check, including text in padding, except where the element itself provides
          // horizontal scrolling to reach its contents.
          if (!ownScrollsX) overrun = Math.max(overrun, rect.right - own.right, own.left - rect.left);
          const visible = { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom };
          for (const clip of ancestorClips) {
            if (clip.x === "cut") overrun = Math.max(overrun, visible.right - clip.right, clip.left - visible.left);
            if (clip.y === "cut") overrun = Math.max(overrun, visible.bottom - clip.bottom, clip.top - visible.top);
            if (clip.x !== "none") {
              visible.left = Math.max(visible.left, clip.left);
              visible.right = Math.min(visible.right, clip.right);
            }
            if (clip.y !== "none") {
              visible.top = Math.max(visible.top, clip.top);
              visible.bottom = Math.min(visible.bottom, clip.bottom);
            }
            if (visible.left >= visible.right || visible.top >= visible.bottom) break;
          }
        }
        for (let i = 0; i < rects.length; i += 1) {
          for (let j = i + 1; j < rects.length; j += 1) {
            const a = rects[i];
            const b = rects[j];
            if (Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 4) {
              overrun = Math.max(overrun, Math.min(a.right, b.right) - Math.max(a.left, b.left));
            }
          }
        }
        if (overrun > 1) {
          const className = node.getAttribute("class")?.split(" ")[0];
          result.push({ text: text.slice(0, 60), tag: `${node.tagName.toLowerCase()}${className ? `.${className}` : ""}`, hidden: Math.round(overrun) });
        }
      }
    }
    return result;
  }, selectors);
}

/** The faults in words, for an assertion's message. */
export function describeFaults(overlaps: Overlap[], cut: Truncation[] = [], strikes: Strike[] = []): string {
  const lines = [
    ...overlaps.map((overlap) => `"${overlap.a.text}" (${overlap.a.tag}) collides with "${overlap.b.text}" (${overlap.b.tag}) over ${overlap.area} px²`),
    ...cut.map((item) => `"${item.text}" (${item.tag}) is cut off by ${item.hidden} px`),
    ...strikes.map((strike) => `"${strike.text.text}" (${strike.text.tag}) is drawn across ${strike.own ? "its own" : `${strike.outline.owner}'s`} outline`)
  ];
  return lines.length ? lines.join("\n") : "no faults";
}
