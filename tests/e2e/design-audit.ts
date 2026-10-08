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
  /** How many pixels of text the box cannot show. */
  hidden: number;
}

/**
 * The screen boxes of every visible text-bearing element the selectors name,
 * one per line box, so that an inline element that wraps is measured line by
 * line rather than by the bounding box that spans its lines.
 * Hidden elements and those faded below a fifth by their ancestors are left
 * out, since the fade is the design's way of putting them out of the way; the
 * fade of a whole view as it appears is not counted, so a spec must wait for
 * the view before it audits.
 */
export async function textBoxes(page: Page, selectors: string[]): Promise<TextBox[]> {
  return page.evaluate((list) => {
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
        for (const rect of node.getClientRects()) {
          if (rect.width < 1 || rect.height < 1) {
            continue;
          }
          boxes.push({ text: text.slice(0, 60), tag: `${node.tagName.toLowerCase()}${className ? `.${className}` : ""}`, x: rect.left, y: rect.top, w: rect.width, h: rect.height });
        }
      }
    }
    return boxes;
  }, selectors);
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
 * Visible elements the selectors name whose text runs past the box that clips
 * it, or under a sibling's text on the same line. The text itself is measured,
 * through a range over each text node, so a pin or a badge positioned outside
 * the box does not count as text.
 */
export async function truncations(page: Page, selectors: string[]): Promise<Truncation[]> {
  return page.evaluate((list) => {
    const result: Truncation[] = [];
    for (const selector of list) {
      for (const node of document.querySelectorAll<HTMLElement>(selector)) {
        const text = (node.textContent ?? "").trim();
        if (!text || node.offsetWidth === 0) {
          continue;
        }
        // Under a closed <details>, and not its summary: laid out but not shown (see textBoxes).
        let underClosedDetails = false;
        for (let child: Element = node, element = node.parentElement; element && element !== document.body; child = element, element = element.parentElement) {
          if (element instanceof HTMLDetailsElement && !element.open && child.tagName !== "SUMMARY") {
            underClosedDetails = true;
            break;
          }
        }
        if (underClosedDetails) {
          continue;
        }
        const style = getComputedStyle(node);
        const box = node.getBoundingClientRect();
        // The box is on screen, the padding is in CSS pixels: a view drawn under a transform scales one and not the other.
        const scale = box.width / node.offsetWidth;
        const left = box.left + (parseFloat(style.paddingLeft) + parseFloat(style.borderLeftWidth)) * scale;
        const right = box.right - (parseFloat(style.paddingRight) + parseFloat(style.borderRightWidth)) * scale;
        const rects: DOMRect[] = [];
        const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
        for (let textNode = walker.nextNode(); textNode; textNode = walker.nextNode()) {
          if (!(textNode.textContent ?? "").trim() || getComputedStyle(textNode.parentElement!).position === "absolute") {
            continue;
          }
          const range = document.createRange();
          range.selectNodeContents(textNode);
          const rect = range.getBoundingClientRect();
          if (rect.width > 0) {
            rects.push(rect);
          }
        }
        let hidden = 0;
        for (const rect of rects) {
          hidden = Math.max(hidden, rect.right - right, left - rect.left);
        }
        for (let i = 0; i < rects.length; i += 1) {
          for (let j = i + 1; j < rects.length; j += 1) {
            const a = rects[i];
            const b = rects[j];
            if (Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 4) {
              hidden = Math.max(hidden, Math.min(a.right, b.right) - Math.max(a.left, b.left));
            }
          }
        }
        if (hidden > 1) {
          const className = node.getAttribute("class")?.split(" ")[0];
          result.push({ text: text.slice(0, 60), tag: `${node.tagName.toLowerCase()}${className ? `.${className}` : ""}`, hidden: Math.round(hidden) });
        }
      }
    }
    return result;
  }, selectors);
}

/** The faults in words, for an assertion's message. */
export function describeFaults(overlaps: Overlap[], cut: Truncation[] = []): string {
  const lines = [
    ...overlaps.map((overlap) => `"${overlap.a.text}" (${overlap.a.tag}) collides with "${overlap.b.text}" (${overlap.b.tag}) over ${overlap.area} px²`),
    ...cut.map((item) => `"${item.text}" (${item.tag}) is cut off by ${item.hidden} px`)
  ];
  return lines.length ? lines.join("\n") : "no faults";
}
