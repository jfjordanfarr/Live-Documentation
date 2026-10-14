/**
 * The search bar at the top of the Explorer: one field that finds directories, files and symbols, and, once anything
 * is pinned, a second field under a map marker for the end of a path from the newest pin. The bar also owns the
 * path's report in the Local Map: the status line, with the reverse question as a link when the files connect only
 * the other way, and the strip of the drawn path's hops.
 */

import type { SearchHit, SearchIndex } from "./graph-search";
import { createSearchField } from "./search-field";
import type { ExplorerNodePayload } from "../../shared/types";
import { requireElement } from "../dom";
import type { PathHop } from "../pathfind";

/** The words a field shows for a pinned thing or a destination: its name, and where it stands for the tooltip. */
export interface SearchWords {
  name: string;
  context: string;
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
  /** The first field shows the newest pin; the second appears once there is one and shows the destination asked. */
  sync(subject: SearchWords | null, destination: SearchWords | null): void;
  /** Draw the strip of a path's hops; an empty path hides it. */
  showPath(hops: readonly PathHop[]): void;
  /** Write the status line; `tone` colours it. Returns the element so that a link can be appended. */
  setStatus(text: string, tone: StatusTone): HTMLElement;
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
  const status = requireElement("pathfind-status");
  const strip = requireElement("pathfind-path");
  const localMap = requireElement("view-map");

  const subject = createSearchField({
    input: subjectInput, results: requireElement("search-subject-results"), index: options.index, onChoose: options.onChooseSubject
  });
  const destination = createSearchField({
    input: destinationInput, results: requireElement("search-destination-results"), index: options.index, onChoose: options.onChooseDestination
  });
  destinationClear.addEventListener("click", () => options.onClearDestination());

  // Ctrl+P, the Explorer's search shortcut since the dialog it replaced, goes to the first field.
  document.addEventListener("keydown", event => {
    if ((event.ctrlKey || event.metaKey) && event.key === "p") {
      event.preventDefault();
      subject.focus();
    }
  });

  return {
    sync(newest, asked): void {
      subject.show(newest?.name ?? "");
      subjectInput.title = newest ? `${newest.context}: the newest pin, where a path starts` : "";
      subjectInput.classList.toggle("has-selection", !!newest);
      destinationGroup.hidden = !newest;
      destination.show(asked?.name ?? "");
      destinationInput.title = asked ? asked.context : "";
      destinationInput.classList.toggle("has-selection", !!asked);
      destinationClear.hidden = !asked;
    },

    showPath(hops): void {
      strip.innerHTML = "";
      if (hops.length === 0) {
        strip.hidden = true;
        localMap.classList.remove("has-path");
        return;
      }
      hops.forEach((hop, index) => {
        if (index > 0) {
          const arrow = document.createElement("span");
          arrow.className = "pathfind-path-arrow";
          arrow.textContent = "→";
          strip.append(arrow);
        }
        const element = document.createElement("div");
        element.className = "pathfind-path-hop";
        if (index === 0 || index === hops.length - 1) element.classList.add("endpoint");
        const name = document.createElement("div");
        name.className = "pathfind-path-hop-name";
        name.textContent = hop.node.id.split("/").pop() || hop.node.id;
        name.title = hop.node.id;
        element.append(name);
        if (hop.symbol) {
          const symbol = document.createElement("div");
          symbol.className = "pathfind-path-hop-symbol";
          symbol.textContent = `→ ${hop.symbol}`;
          element.append(symbol);
        }
        element.addEventListener("click", () => options.onHopClick(hop.node));
        strip.append(element);
      });
      strip.hidden = false;
      localMap.classList.add("has-path");
    },

    setStatus(text, tone): HTMLElement {
      status.textContent = text;
      status.className = tone ? `pathfind-status ${tone}` : "pathfind-status";
      status.hidden = false;
      return status;
    },

    clearPath(): void {
      status.hidden = true;
      status.textContent = "";
      strip.innerHTML = "";
      strip.hidden = true;
      localMap.classList.remove("has-path");
    },

    focusSubject(): void {
      subject.focus();
    }
  };
}
