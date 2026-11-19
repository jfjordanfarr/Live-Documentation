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

/** Activates the given view tab and its container while deactivating siblings. */
export function setActiveView(view: ViewName, perspective: LocalMapPerspective): void {
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
    container.inert = !active;
    container.setAttribute("aria-hidden", String(!active));
    if (active) {
      container.classList.add("active");
    } else {
      container.classList.remove("active");
    }
  });

  const localSurface = document.getElementById(perspective === "3d" ? "view-graph" : "view-map");
  const toolbar = document.getElementById("pathfind-toolbar");
  if (localSurface && toolbar && toolbar.parentElement !== localSurface) localSurface.prepend(toolbar);

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
