import type { ViewName } from "./types";

/** Looks up an element by `id` and throws if not found. */
export function requireElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Expected element #${id}`);
  }
  return element as T;
}

/** Activates the given view tab and its container while deactivating siblings. */
export function setActiveView(view: ViewName): void {
  document.querySelectorAll<HTMLElement>(".nav-item").forEach(element => {
    if (element.dataset.view === view) {
      element.classList.add("active");
    } else {
      element.classList.remove("active");
    }
  });

  document.querySelectorAll<HTMLElement>(".view-container").forEach(container => {
    if (container.id === `view-${view}`) {
      container.classList.add("active");
    } else {
      container.classList.remove("active");
    }
  });

  // Toggle force-graph-active class on body for Force Graph-only UI elements
  if (view === "graph") {
    document.body.classList.add("force-graph-active");
  } else {
    document.body.classList.remove("force-graph-active");
  }

  // Toggle zoom-controls-active class for views that support our zoom buttons
  if (view === "circuit" || view === "map") {
    document.body.classList.add("zoom-controls-active");
  } else {
    document.body.classList.remove("zoom-controls-active");
  }
}
