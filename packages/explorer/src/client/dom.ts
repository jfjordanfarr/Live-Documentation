import { chooseMarbles, choosePalette, customProperties, paletteNamed } from "./palette";
import type { LocalMapPerspective, MarbleChoice, ViewName } from "./types";
import { seamsOf } from "./views/localView/word-seams";

/** Looks up an element by `id` and throws if not found. */
export function requireElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Expected element #${id}`);
  }
  return element as T;
}

/**
 * Reflect whether the side detail drawer is open (visible and not a full reading dialog) on `#main`,
 * replacing `#main:has(#detail-panel.visible:not(.reading-dialog))` so DOM mutations inside `#main`
 * never trigger `:has()` descendant invalidation across the map and transition copies (2026-11-24).
 */
export function syncDetailDrawerState(): void {
  const main = document.getElementById("main");
  const panel = document.getElementById("detail-panel");
  if (!main || !panel) return;
  if (panel.classList.contains("visible") && !panel.classList.contains("reading-dialog")) {
    main.dataset.detailDrawer = "open";
  } else {
    delete main.dataset.detailDrawer;
  }
}

/**
 * Draws the page in a palette, by name (the default for a name no palette has): its colours become the custom properties
 * every stylesheet reads, set on the page's root over the build's, and then the palette the maps' scripts read, whose
 * views draw again in it at once where they drew a colour themselves (`whenPaletteChanges`), with nothing moving.
 */
export function applyPalette(name: unknown): void {
  const root = document.documentElement.style;
  for (const [property, value] of customProperties(paletteNamed(name))) root.setProperty(property, value);
  choosePalette(name);
}

/**
 * Draws files as marbles or not (the marble trial, 2026-11-17): the page's root says which, for the stylesheets that
 * tint the 2D map's cells, and the maps' scripts draw again as for a palette chosen, with nothing moving.
 */
export function applyMarbles(choice: MarbleChoice): void {
  document.documentElement.dataset.marbles = choice;
  chooseMarbles(choice === "on");
}

/** A view that is not the one shown: put away, or on its way there (fading out, or held for a change of perspective). */
const NOT_SHOWN = ".view-container:not(.active)";

/** Whether the page behind a modal reader is inert, the view shown with it; kept so that a fade's end does not undo it. */
let behindModal = false;
const watchedViews = new WeakSet<HTMLElement>();
let focusKept = false;

/**
 * Give each view the state its place calls for; the one way a view is put away, for every view, for the sidebar's
 * switch and for a change of perspective. A view no longer shown is hidden from assistive technology at once and takes
 * no pointer (shell.css), and is made inert only once the stylesheet has taken it out of drawing: when its fade is over
 * and no change of perspective holds it as the still picture (`perspective-held`). The order is the point. Making a
 * drawn view inert has the browser work out the style of every element in it again, 180 ms of each press of 3D on a
 * map of 14,810 elements, paid at the next read of a box; a view not drawn costs 3 ms (measured 2026-11-22). Until it
 * is inert, focus offered to it is given back ({@link keepFocusInTheViewShown}).
 *
 * @param modal whether a modal reader covers the page; left out, it stands as it was last given.
 */
export function settleViews(modal = behindModal): void {
  behindModal = modal;
  const views = [...document.querySelectorAll<HTMLElement>(".view-container")];
  for (const view of views) {
    if (watchedViews.has(view)) continue;
    watchedViews.add(view);
    // A fade's end is when the stylesheet stops drawing the view (its `content-visibility` flips last).
    const settle = (event: Event): void => { if (event.target === view) settleViews(); };
    view.addEventListener("transitionend", settle);
    view.addEventListener("transitioncancel", settle);
  }
  // Read, then write: each view's own style is asked before any view is made inert.
  const undrawn = modal ? [] : views.map(view => !view.classList.contains("active") && getComputedStyle(view).contentVisibility === "hidden");
  views.forEach((view, index) => {
    view.setAttribute("aria-hidden", String(!view.classList.contains("active")));
    view.inert = modal || undrawn[index] === true;
  });
}

/** Give focus to the first of these that takes it; a disabled control does not, nor one in a view not shown. */
export function giveFocus(...candidates: Array<Element | null | undefined>): void {
  for (const candidate of candidates) {
    if (!(candidate instanceof HTMLElement) || !candidate.isConnected || candidate.closest(NOT_SHOWN)) continue;
    candidate.focus({ preventScroll: true });
    if (document.activeElement === candidate) return;
  }
}

/**
 * A reader at the keyboard never has focus standing in a view that is not shown. A view put away is inert; one still
 * drawn on its way there is not (see {@link settleViews}), so focus offered to it, by Tab or by anything else, is given
 * back to where it came from.
 */
function keepFocusInTheViewShown(): void {
  if (focusKept) return;
  focusKept = true;
  document.addEventListener("focusin", event => {
    if (!(event.target instanceof Element) || !event.target.closest(NOT_SHOWN)) return;
    if (event.relatedTarget instanceof Element) giveFocus(event.relatedTarget);
  });
}

/**
 * Activates the given view tab and its container while deactivating siblings. Focus that stood in a view now leaving
 * goes to the sidebar's control of the view shown: a view on its way out is not inert and would keep it.
 */
export function setActiveView(view: ViewName, perspective: LocalMapPerspective): void {
  keepFocusInTheViewShown();
  document.querySelectorAll<HTMLElement>(".nav-item").forEach(element => {
    if (element.dataset.view === view) {
      element.classList.add("active");
      element.setAttribute("aria-current", "page");
    } else {
      element.classList.remove("active");
      element.removeAttribute("aria-current");
    }
  });

  document.querySelectorAll<HTMLElement>(".view-container").forEach(container => {
    const active = container.id === `view-${view === "map" && perspective === "3d" ? "graph" : view}`;
    if (active) {
      // The way back mirrors the way out: a view is made not inert while it is still not drawn, and only then drawn.
      if (!behindModal) container.inert = false;
      container.classList.add("active");
    } else {
      container.classList.remove("active");
    }
  });
  settleViews();

  const localSurface = document.getElementById(perspective === "3d" ? "view-graph" : "view-map");
  const toolbar = document.getElementById("pathfind-toolbar");
  if (localSurface && toolbar && toolbar.parentElement !== localSurface) localSurface.prepend(toolbar);
  if (document.activeElement?.closest(NOT_SHOWN)) giveFocus(document.querySelector(".nav-item.active"));

  // Toggle force-graph-active class on body for Force Graph-only UI elements
  if (view === "map" && perspective === "3d") {
    document.body.classList.add("force-graph-active");
  } else {
    document.body.classList.remove("force-graph-active");
  }

  document.body.classList.toggle("world-active", view === "world");
  document.body.classList.toggle("local-map-active", view === "map");

  // Toggle zoom-controls-active class for views that support our zoom buttons
  if (view === "map" && perspective === "2d") {
    document.body.classList.add("zoom-controls-active");
  } else {
    document.body.classList.remove("zoom-controls-active");
  }
}

/**
 * Write a name into an element with a soft break at each of its seams (`seamsOf`), so that a name wider than its box
 * wraps at a seam rather than at whatever letter the box ran out at; the element's text stays the name.
 */
export function setSeamedText(element: HTMLElement, text: string): void {
  element.replaceChildren(...seamsOf(text).flatMap((segment, index) => index ? [document.createElement("wbr"), segment] : [segment]));
}
