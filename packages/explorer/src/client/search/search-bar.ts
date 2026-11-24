/**
 * The search bar at the top of the Explorer: one field that finds directories, files and symbols, and, once anything
 * is pinned, a second field under a map marker for the end of a path from the newest pin. The second field offers
 * only what a path from the newest pin can reach, each row saying how far, and folds the files the words match but
 * no path connects. The bar also owns the path's report in the Local Map: the status line, and the strip of the
 * path's hops, told from the end asked from to the end asked for (until 2026-11-22 the status carried the reverse
 * question as a link when the files connected only against the drawing; such a path is now answered).
 * While the 3D Local Map shows a moment of the history, a chosen thing that does not stand there is said so, faded,
 * beside its field, in the pin tray's words, and the report names the commit its path was asked at (2026-10-30).
 */

import type { ExplorerNodePayload } from "../../shared/types";
import { requireElement } from "../dom";
import type { PathHop, Reach } from "../pathfind";
import { destinationScope, type SearchHit, type SearchIndex, type SearchScope } from "./graph-search";
import { disambiguateHopContexts } from "./path-hops";
import { createSearchField } from "./search-field";

/** The words a field shows for a pinned thing or a destination: its name, and where it stands for the tooltip. */
export interface SearchWords {
  name: string;
  context: string;
  /** Why the thing does not stand at the moment the picture shows, and the moment, for the tooltip; absent when it stands. */
  absence?: { words: string; moment: string };
}

/**
 *
 */
export type StatusTone = "" | "success" | "error";

/**
 *
 */
export interface SearchBarOptions {
  index: SearchIndex;
  /** A thing chosen in the first field: pinned, and the path's start. */
  onChooseSubject: (hit: SearchHit) => void;
  /** A thing chosen in the second field: the path's end, asked at once. */
  onChooseDestination: (hit: SearchHit) => void;
  onClearDestination: () => void;
  /** A hop of the strip clicked. */
  onHopClick: (node: ExplorerNodePayload) => void;
}

/**
 *
 */
export interface SearchBar {
  /** Replace the available subjects with the graph at the moment being viewed. */
  setIndex(index: SearchIndex): void;
  /**
   * The first field shows the newest pin; the second appears once there is one, shows the destination asked, and
   * offers what the reach from the newest pin holds.
   */
  sync(subject: SearchWords | null, destination: SearchWords | null, reach: Reach | null, localMapShown: boolean, named?: SearchScope["named"]): void;
  /**
   * A line in the report's place while no path is asked, or none: what a way down from the World Map could not pin
   * (Tuning's Way Down, a trial of 2026-11-22). A path's own status takes the line while one is asked.
   */
  setNote(text: string | null): void;
  /**
   * Draw the strip of a path's hops, in the order given, which is from the end asked from to the end asked for; an
   * empty path hides it. `told` says what joins each hop to the next, and the hops are parted by it in words:
   * "used-by", the drawing's own order, "is used by"; or "uses", a path told against the drawing (2026-11-22).
   */
  showPath(hops: readonly PathHop[], told?: "used-by" | "uses"): void;
  /** Write the status line; `tone` colours it, and `at` names the commit it was asked at when that is not today. Returns the element so that a link can be appended. */
  setStatus(text: string, tone: StatusTone, at?: string | null): HTMLElement;
  /** Hide the status and the strip. */
  clearPath(): void;
  focusSubject(): void;
}

/**
 *
 */
export function createSearchBar(options: SearchBarOptions): SearchBar {
  const subjectInput = requireElement<HTMLInputElement>("search-subject");
  const destinationGroup = requireElement("search-destination-field");
  const destinationInput = requireElement<HTMLInputElement>("search-destination");
  const destinationClear = requireElement<HTMLButtonElement>("search-destination-clear");
  const subjectAbsence = requireElement("search-subject-absence");
  const destinationAbsence = requireElement("search-destination-absence");
  const report = requireElement("path-report");
  const status = requireElement("pathfind-status");
  const strip = requireElement("pathfind-path");
  const localMap = requireElement("view-map");
  const askWords = destinationInput.placeholder;

  const syncStripFade = (): void => {
    const start = !strip.hidden && strip.scrollLeft > 2;
    const end = !strip.hidden && strip.scrollLeft + strip.clientWidth < strip.scrollWidth - 2;
    strip.dataset.scrollStart = String(start);
    strip.dataset.scrollEnd = String(end);
  };
  strip.addEventListener("scroll", syncStripFade, { passive: true });
  if (typeof ResizeObserver === "function") new ResizeObserver(syncStripFade).observe(strip);

  let everything: SearchScope = { index: options.index };
  let reachShown: Reach | null = null;
  let destinationScopeShown: SearchScope = everything;
  // Things the second field offers by a name of their own, above what it finds (a World Map thing by its board name).
  let namedShown: SearchScope["named"];
  let note: string | null = null;

  const subject = createSearchField({
    input: subjectInput, results: requireElement("search-subject-results"), scope: () => everything, onChoose: options.onChooseSubject
  });
  const destination = createSearchField({
    input: destinationInput, results: requireElement("search-destination-results"),
    scope: () => namedShown?.length ? { ...destinationScopeShown, named: namedShown } : destinationScopeShown, onChoose: options.onChooseDestination
  });
  destinationClear.addEventListener("click", event => {
    options.onClearDestination();
    // Clear removes its own button; keyboard use continues in the destination field.
    if (event.detail === 0) destination.focus();
  });

  // Ctrl+P, the Explorer's search shortcut since the dialog it replaced, goes to the first field; on a Mac, ⌘P. The hint
  // and the field's `aria-keyshortcuts` name the platform's key, though either key works everywhere.
  const mac = isApple();
  subjectInput.setAttribute("aria-keyshortcuts", mac ? "Meta+P" : "Control+P");
  const hint = subjectInput.parentElement?.querySelector(".search-shortcut");
  if (hint && mac) hint.textContent = "⌘P";
  document.addEventListener("keydown", event => {
    // Compared without regard to case: with Caps Lock on the key is "P", and the browser's Print took it (2026-11-19).
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "p") {
      event.preventDefault();
      subject.focus();
    }
  });

  return {
    setIndex(index): void {
      if (everything.index === index) return;
      everything = { index };
      destinationScopeShown = reachShown ? destinationScope(index, reachShown) : everything;
    },
    setNote(text): void {
      if (text === note) return;
      note = text;
      // The note has the status line only while no path's status stands there; a path asked writes over it.
      if (text) {
        status.replaceChildren(text);
        status.removeAttribute("title");
        status.className = "pathfind-status";
        status.hidden = false;
      } else if (strip.hidden) {
        status.hidden = true;
        status.textContent = "";
      }
    },

    sync(newest, asked, reach, localMapShown, named): void {
      namedShown = named;
      report.hidden = !localMapShown || !(asked || note);
      subject.show(newest?.name ?? "");
      subjectInput.title = newest ? `${newest.context}: the newest pin, where a path starts` : "";
      subjectInput.classList.toggle("has-selection", !!newest);
      destinationGroup.hidden = !newest;
      if (reach !== reachShown) {
        reachShown = reach;
        destinationScopeShown = reach ? destinationScope(everything.index, reach) : everything;
      }
      const connects = !reach || reach.forward.size + reach.reverse.size > 0;
      destinationInput.placeholder = connects || !newest ? askWords : `Nothing connects to ${newest.name}`;
      destination.show(asked?.name ?? "");
      destinationInput.title = asked ? asked.context : "";
      destinationInput.classList.toggle("has-selection", !!asked);
      destinationClear.hidden = !asked;
      sayAbsence(subjectInput, subjectAbsence, newest);
      sayAbsence(destinationInput, destinationAbsence, asked);
    },

    showPath(hops, told = "used-by"): void {
      strip.innerHTML = "";
      if (hops.length === 0) {
        strip.hidden = true;
        localMap.classList.remove("has-path");
        return;
      }
      strip.setAttribute("aria-label", told === "uses" ? "Path files, each uses the next" : "Path files, each is used by the next");
      const contexts = disambiguateHopContexts(hops.map(hop => hop.node.id));
      hops.forEach((hop, index) => {
        const item = document.createElement("li");
        item.className = "pathfind-path-item";
        if (index > 0) {
          // The hops are parted by the relation in words, the product's two phrases for it and the command line's
          // ("each file uses the next", "each file is used by the next"), read with the names. Until 2026-11-22 a bare
          // arrow stood here, which in the one order then told meant "is used by" and now would mean either.
          const relation = document.createElement("span");
          relation.className = "pathfind-path-relation";
          relation.textContent = told === "uses" ? "uses" : "is used by";
          item.append(relation);
        }
        const element = document.createElement("button");
        element.type = "button";
        element.className = "pathfind-path-hop";
        element.setAttribute("aria-label", `Inspect path file ${index + 1} of ${hops.length}: ${hop.node.id}`);
        element.title = hop.node.id;
        if (index === 0 || index === hops.length - 1) element.classList.add("endpoint");
        const name = document.createElement("span");
        name.className = "pathfind-path-hop-name";
        name.textContent = hop.node.id.split("/").pop() || hop.node.id;
        name.title = hop.node.id;
        element.append(name);
        const context = contexts.get(hop.node.id);
        if (context) {
          const qualifier = document.createElement("span");
          qualifier.className = "pathfind-path-hop-context";
          qualifier.textContent = context;
          element.append(qualifier);
        }
        if (hop.symbol) {
          const symbol = document.createElement("span");
          symbol.className = "pathfind-path-hop-symbol";
          symbol.textContent = `→ ${hop.symbol}`;
          element.append(symbol);
        }
        // Native Tab may leave a partly visible button clipped. Reveal the complete hop without moving the map.
        element.addEventListener("focus", () => element.scrollIntoView({ block: "nearest", inline: "nearest" }));
        element.addEventListener("click", () => options.onHopClick(hop.node));
        item.append(element);
        strip.append(item);
      });
      strip.hidden = false;
      localMap.classList.add("has-path");
      syncStripFade();
    },

    setStatus(text, tone, at = null): HTMLElement {
      status.replaceChildren();
      status.removeAttribute("title");
      if (at) {
        const moment = document.createElement("span");
        moment.className = "pathfind-at";
        moment.textContent = at;
        status.append(moment, " ");
      }
      status.append(text);
      status.className = tone ? `pathfind-status ${tone}` : "pathfind-status";
      status.hidden = false;
      return status;
    },

    clearPath(): void {
      status.hidden = true;
      status.textContent = "";
      status.removeAttribute("title");
      note = null;
      strip.innerHTML = "";
      strip.hidden = true;
      strip.dataset.scrollStart = "false";
      strip.dataset.scrollEnd = "false";
      localMap.classList.remove("has-path");
    },

    focusSubject(): void {
      subject.focus();
    }
  };
}

/** Whether the browser runs on Apple's systems, where the command key, ⌘, does what Ctrl does elsewhere. */
function isApple(): boolean {
  const platform = (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform || navigator.platform || "";
  return /mac|iphone|ipad|ipod/iu.test(platform);
}

/** Say beside a field, faded, that its thing does not stand at the moment shown, the moment on hover and to a screen reader. */
function sayAbsence(input: HTMLInputElement, element: HTMLElement, words: SearchWords | null): void {
  const absence = words?.absence;
  element.hidden = !absence;
  element.textContent = absence?.words ?? "";
  element.title = absence?.moment ?? "";
  if (absence) input.setAttribute("aria-describedby", element.id);
  else input.removeAttribute("aria-describedby");
}
