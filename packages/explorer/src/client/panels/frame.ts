/**
 * What frames the map (a trial, 2026-11-19): the sidebar, today's page, or Bare. Under Bare the sidebar is not drawn and
 * what it held stands where it is used: the views and the places are a breadcrumb at the left of the top bar, with Back
 * and Forward beside it; the display filters and the legend are one key, opened from the bottom strip; Tuning is a sheet
 * opened from the strip's tuning button. Nothing is built twice: the frame moves the sidebar's own elements, with their
 * listeners and ids, into their Bare places and back again, so that every lever and filter keeps one implementation.
 * The crumbs are read from the page's state by `crumbsOf`, a pure function.
 *
 * @module frame
 */

import type { FrameChoice, ViewName } from "../types";
import { crumbsOf, outwardCrumb, type Crumb, type CrumbSubject } from "./frame-crumbs";
import { DIRECTORY_ICON, iconButton } from "./icon-button";

/** What the frame reads from the page and what its crumbs ask of it. */
export interface FrameConfig {
  /** Whether the bundle carries a World Map to go out to. */
  hasBoard: boolean;
  view: () => ViewName;
  subject: () => CrumbSubject | null;
  /** The counts the sidebar's footer says, which the first crumb says on a rested hover. */
  counts: () => string;
  onDirectory: (path: string) => void;
  onFile: (path: string) => void;
  /** The strip's buttons that open the key and the Tuning sheet. */
  keyButton: HTMLButtonElement;
  tuningButton: HTMLButtonElement;
}

export interface Frame {
  apply(choice: FrameChoice): void;
  bare(): boolean;
  /** Draws the crumbs again from the page's state; nothing while the sidebar frames the map. */
  sync(): void;
  toggleSheet(): void;
  toggleKey(): void;
}

const WORLD_ICON = '<path d="M12 3.5 20.5 12 12 20.5 3.5 12z"/>';
const SOURCES_ICON = '<path d="M6 3.5h9l4 4v13H6z"/><path d="M15 3.5v4h4M9 11h7M9 14.5h7M9 18h4"/>';
const KEY_ICON = '<rect x="4" y="5" width="4" height="4" rx="1"/><circle cx="6" cy="16" r="2"/><path d="M11 7h9M11 16h9"/>';
const OUT_ICON = '<path d="m14.5 6-6 6 6 6"/>';
const VIEWS_ICON = '<path d="m7 10 5 5 5-5"/>';

/** The key's drawing, for the strip's button. */
export const FRAME_KEY_ICON = KEY_ICON;

export function createFrame(config: FrameConfig): Frame {
  const main = document.getElementById("main")!;
  const sidebar = document.getElementById("sidebar")!;
  // Where each moved element stood in the sidebar, so that the Sidebar frame puts it back where it was.
  const homes = new Map<Element, { parent: Node; next: Node | null }>();
  const move = (element: Element | null, into: Element): void => {
    if (!element) return;
    if (!homes.has(element)) homes.set(element, { parent: element.parentNode!, next: element.nextSibling });
    into.append(element);
  };
  const restore = (): void => {
    // In reverse, so that each element's remembered next sibling is home again before it is put back before it.
    for (const [element, home] of [...homes].reverse()) home.parent.insertBefore(element, home.next && home.next.parentNode === home.parent ? home.next : null);
    homes.clear();
  };

  const nav = document.createElement("nav");
  nav.id = "frame-crumbs";
  nav.className = "frame-crumbs";
  nav.setAttribute("aria-label", "Places");
  nav.hidden = true;
  const arrows = document.createElement("span");
  arrows.className = "frame-arrows";
  const viewsButton = iconButton("Views", VIEWS_ICON);
  viewsButton.className = "frame-views-button";
  viewsButton.setAttribute("aria-expanded", "false");
  viewsButton.setAttribute("aria-controls", "frame-views");
  const views = document.createElement("div");
  views.id = "frame-views";
  views.className = "frame-views";
  views.hidden = true;
  const outButton = iconButton("Out", OUT_ICON);
  outButton.className = "frame-out";
  const list = document.createElement("ol");
  list.className = "frame-crumb-list";
  nav.append(arrows, outButton, list, viewsButton, views);
  main.prepend(nav);

  const popover = (id: string, label: string, className: string): HTMLElement => {
    const element = document.createElement("div");
    element.id = id;
    element.className = `frame-popover ${className}`;
    element.setAttribute("role", "dialog");
    element.setAttribute("aria-label", label);
    element.hidden = true;
    // Straight after the strip, so that Tab from the strip's buttons comes next to what they opened.
    const strip = config.keyButton.closest(".perspective-controls");
    if (strip) strip.after(element);
    else main.append(element);
    return element;
  };
  const key = popover("frame-key", "Key", "frame-key");
  const sheet = popover("frame-sheet", "Tuning", "frame-sheet");
  config.keyButton.setAttribute("aria-controls", key.id);
  config.tuningButton.setAttribute("aria-controls", sheet.id);

  let choice: FrameChoice = "sidebar";
  let shown: Crumb[] = [];
  let outward: Crumb | null = null;
  outButton.addEventListener("click", () => { if (outward) press(outward); });

  /**
   * The key and the sheet stand on the strip, wherever the strip stands (it rises over the history's scrubber, and on a
   * narrow window the map's bottom band), and reach no higher than the top bar, so that neither covers the button that
   * closes it nor the search.
   */
  const strip = config.keyButton.closest<HTMLElement>(".perspective-controls");
  const place = (element: HTMLElement): void => {
    if (element.hidden) return;
    const room = main.getBoundingClientRect();
    const top = Math.max(nav.getBoundingClientRect().bottom, document.getElementById("search-bar")?.getBoundingClientRect().bottom ?? room.top) + 8;
    const stripTop = strip && !strip.hidden ? strip.getBoundingClientRect().top : room.bottom;
    element.style.bottom = `${Math.round(room.bottom - stripTop + 8)}px`;
    element.style.maxHeight = `${Math.max(120, Math.round(stripTop - 8 - top))}px`;
  };
  window.addEventListener("resize", () => { place(key); place(sheet); });

  const setOpen = (element: HTMLElement, button: HTMLButtonElement, open: boolean, focusButton = false): void => {
    element.hidden = !open;
    button.setAttribute("aria-expanded", String(open));
    if (open && element !== views) place(element);
    if (!open && focusButton) button.focus();
  };
  const toggleViews = (open = views.hidden): void => setOpen(views, viewsButton, open);
  viewsButton.addEventListener("click", () => {
    toggleViews();
    if (!views.hidden) views.querySelector<HTMLElement>(".nav-item.active, .nav-item")?.focus();
  });
  // A view chosen from the menu closes it; a press anywhere else closes it too, as a menu does.
  views.addEventListener("click", event => { if ((event.target as Element).closest(".nav-item")) toggleViews(false); });
  document.addEventListener("pointerdown", event => {
    if (!views.hidden && !(event.target instanceof Node && (views.contains(event.target) || viewsButton.contains(event.target)))) toggleViews(false);
  });
  // Escape closes the innermost thing open, and focus goes back to the button that opened it.
  document.addEventListener("keydown", event => {
    if (event.key !== "Escape" || choice !== "bare") return;
    const target = event.target instanceof Node ? event.target : null;
    if (!views.hidden && (!target || views.contains(target) || viewsButton.contains(target))) { setOpen(views, viewsButton, false, true); event.stopPropagation(); return; }
    if (!sheet.hidden && target && sheet.contains(target)) { setOpen(sheet, config.tuningButton, false, true); event.stopPropagation(); return; }
    if (!key.hidden && target && key.contains(target)) { setOpen(key, config.keyButton, false, true); event.stopPropagation(); }
  }, true);

  const nameOf = (crumb: Crumb): string => crumb.kind === "view" ? (crumb.view === "world" ? "World Map" : "Knowledge Sources")
    : crumb.kind === "directory" && crumb.path === "" ? "Scan root" : crumb.name;
  const press = (crumb: Crumb): void => {
    if (crumb.kind === "view") document.querySelector<HTMLButtonElement>(`.nav-item[data-view="${crumb.view}"]`)?.click();
    else if (crumb.kind === "directory") config.onDirectory(crumb.path);
    else config.onFile(crumb.path);
  };
  const buttonOf = (crumb: Crumb, index: number): HTMLButtonElement => {
    const icon = crumb.kind === "view" ? (crumb.view === "world" ? WORLD_ICON : SOURCES_ICON) : crumb.kind === "directory" && crumb.path === "" ? DIRECTORY_ICON : null;
    const name = nameOf(crumb);
    let button: HTMLButtonElement;
    if (icon) button = iconButton(name, icon);
    else {
      button = document.createElement("button");
      button.type = "button";
      const words = document.createElement("span");
      words.className = "frame-crumb-name";
      words.textContent = name;
      button.append(words);
      if (crumb.kind !== "view") button.title = crumb.path;
    }
    button.className = "frame-crumb";
    if (index === 0) button.title = config.counts();
    if (crumb.current) button.setAttribute("aria-current", "location");
    button.addEventListener("click", () => press(crumb));
    return button;
  };

  const sync = (): void => {
    if (choice !== "bare") return;
    const crumbs = crumbsOf({ view: config.view(), hasBoard: config.hasBoard, subject: config.subject() });
    const signature = JSON.stringify(crumbs);
    if (signature !== JSON.stringify(shown)) {
      shown = crumbs;
      list.replaceChildren(...crumbs.map((crumb, index) => {
        const item = document.createElement("li");
        item.className = "frame-crumb-item";
        item.append(buttonOf(crumb, index));
        return item;
      }));
      outward = outwardCrumb(crumbs);
      outButton.hidden = !outward;
      if (outward) {
        const label = `Out to ${nameOf(outward)}`;
        outButton.title = label;
        outButton.setAttribute("aria-label", label);
      }
    }
    // The counts change with the picture while the crumbs stand still.
    const first = list.querySelector<HTMLButtonElement>(".frame-crumb");
    if (first) first.title = config.counts();
  };

  const apply = (next: FrameChoice): void => {
    choice = next;
    document.documentElement.dataset.frame = next;
    const bare = next === "bare";
    nav.hidden = !bare;
    config.keyButton.hidden = !bare;
    if (bare) {
      move(document.getElementById("history-back"), arrows);
      move(document.getElementById("history-forward"), arrows);
      for (const item of sidebar.querySelectorAll(".nav-item")) move(item, views);
      move(document.getElementById("filter-toggle-tests")?.closest(".sidebar-section") ?? null, key);
      move(document.getElementById("map-legend"), key);
      move(sidebar.querySelector(".tuning-content"), sheet);
      shown = [];
      sync();
    } else {
      restore();
      for (const [element, button] of [[views, viewsButton], [key, config.keyButton], [sheet, config.tuningButton]] as const) setOpen(element, button, false);
    }
  };

  return {
    apply,
    bare: () => choice === "bare",
    sync,
    // The key and the sheet stand in one place: opening one closes the other.
    toggleSheet: () => {
      setOpen(key, config.keyButton, false);
      setOpen(sheet, config.tuningButton, sheet.hidden);
      if (!sheet.hidden) sheet.querySelector<HTMLElement>("select, input, summary, button")?.focus();
    },
    toggleKey: () => {
      setOpen(sheet, config.tuningButton, false);
      setOpen(key, config.keyButton, key.hidden);
    }
  };
}
